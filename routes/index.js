const express = require('express');
const path = require('path');
const multer = require('multer');
const { User, AuthUser } = require('../models/users');
const router = express.Router();
const bcrypt = require('bcrypt');


const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .pdf files are allowed'), false);
        }
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    } else {
        res.redirect('/login');
    }
}



router.get('/', (req, res) => {
    res.render(path.join(__dirname, '../views', 'home.pug'));
});

router.get('/resetpassword', (req, res) => {
    res.render(path.join(__dirname, '../views', 'resetpassword.pug'));
});

router.post('/resetpassword', async (req, res) => {
    const { username, newPassword, newconfirmPassword } = req.body;

    if (newPassword !== newconfirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try {
        const user = await AuthUser.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid username' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

});

router.get('/login', (req, res) => {
    res.render(path.join(__dirname, '../views', 'login.pug'));
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await AuthUser.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        req.session.username = username;
        res.json({ success: true, token: 'dummy-token' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/profile', isAuthenticated, (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login');
    }
    res.render(path.join(__dirname, '../views', 'profile.pug'));
});

router.post('/submit-profile', isAuthenticated, (req, res, next) => {
    upload.single('cv')(req, res, function (err) {
        if (err) {
            // Dosya yükleme hatasý varsa yakala ve yanýtla
            return res.status(400).json({ success: false, message: err.message });
        }

        const { address, fullname, country, gender, email, phone, verifyPassword } = req.body;
        const file = req.file;

        // Devam eden iþlem
        (async () => {
            try {
                const authUser = await AuthUser.findOne({ username: req.session.username });
                if (!authUser || !(await authUser.comparePassword(verifyPassword))) {
                    return res.status(400).json({ success: false, message: 'Password verification failed' });
                }

                const user = await User.findOne({ username: req.session.username });
                if (user) {
                    return res.status(400).json({ success: false, message: 'You have already submitted the form!' });
                }

                if (!file) {
                    return res.status(400).json({ success: false, message: 'No file uploaded' });
                }

                const uploadStream = gridfsBucket.openUploadStream(file.originalname, {
                    contentType: file.mimetype
                });

                uploadStream.write(file.buffer);
                uploadStream.end();

                uploadStream.on('finish', async () => {
                    const newUser = new User({
                        username: req.session.username,
                        address: address,
                        fullname: fullname,
                        country: country,
                        gender: gender,
                        email: email,
                        phone: phone,
                        cv: uploadStream.id,
                    });

                    await newUser.save();
                    res.json({ success: true });
                });
            } catch (err) {
                console.error('Error during profile submission:', err);
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
        })();
    });
});

router.get('/register', (req, res) => {
    res.render(path.join(__dirname, '../views', 'register.pug'));
});

router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    try {
        const existingUser = await AuthUser.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const newUser = new AuthUser({
            username: username,
            password: password
        }); 

        await newUser.save();
        res.json({ success: true });
    } catch (err) { 
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/download-cv/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user || !user.cv) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
            
        const downloadStream = gridfsBucket.openDownloadStream(user.cv);

        res.set('Content-Type', 'application/pdf');
        downloadStream.pipe(res);
    } catch (err) {
        console.error('Error during file download:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile');
        }
        res.clearCookie('connect.sid', { path: '/'});
        res.redirect('/login');
    });
});

module.exports = router;
