const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    address: { type: String },
    fullname: { type: String },
    country: { type: String },
    gender: { type: String },
    phone: { type: String },
    email: { type: String },
    cv: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }
});

const authSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Þifreyi hash'leme
authSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    } else {
        return next();
    }
});

authSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
const AuthUser = mongoose.model('AuthUser', authSchema);

module.exports = { User, AuthUser };


