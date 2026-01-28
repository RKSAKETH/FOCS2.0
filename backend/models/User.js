const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    role: {
        type: String,
        enum: ['technician', 'director', 'police'],
        default: 'technician'
    },
    fullName: {
        type: String,
        required: true
    },
    // RSA Key Pair for Digital Signatures (only for directors)
    publicKey: {
        type: String,
        default: null
    },
    privateKey: {
        type: String,
        default: null
    },
    // OTP for Multi-Factor Authentication
    otp: {
        code: String,
        expiresAt: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password with salt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt
        this.salt = await bcrypt.genSalt(10);
        // Hash password with salt
        this.password = await bcrypt.hash(this.password, this.salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
