const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { instrument } = require('@socket.io/admin-ui');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['https://admin.socket.io'],
        credentials: true
    }
});

// Admin UI'yi entegre etme
instrument(io, {
    auth: false // Gereksinimlerinize göre auth ayarlarý
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const sessionStore = MongoStore.create({
    mongoUrl: 'mongodb+srv://alperkaplan30:<password>@applicationform.xse8ext.mongodb.net/?retryWrites=true&w=majority&appName=applicationform',
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60
});

app.use(session({
    secret: 'session_secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false } // HTTPS kullanýyorsan true yap
}));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.use('/', require('./routes/index.js'));

io.on('connection', (socket) => {
    console.log(`A user connected with socket id: ${socket.id}`);

    socket.on('formSubmit', (data) => {
        socket.broadcast.emit('formUpdate', {
            fullname: data.fullname,
            message: data.message
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected with socket id: ${socket.id}`);
    });
});


mongoose.connect('mongodb+srv://alperkaplan30:<password>@applicationform.xse8ext.mongodb.net/?retryWrites=true&w=majority&appName=applicationform', {
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('MongoDB Connected');
        const conn = mongoose.connection;
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Multer ayarlarý
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
            cb('Error: Only .pdf files are allowed!');
        }
    }
});

// Sunucuyu baþlatma
httpServer.listen(3000, () => {
    console.log('Sunucu 3000 portunda dinliyor');
});

module.exports = app;
