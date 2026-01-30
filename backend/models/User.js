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
    // Password History (stores last 5 hashed passwords)
    passwordHistory: [{
        type: String
    }],
    // Password Reset OTP
    resetPasswordOTP: {
        code: String,
        expiresAt: Date
    },
    // Password Reset Token (for forgot password flow)
    resetPasswordToken: {
        token: String,
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
        // Store current password in history before changing it
        // Only store if it's not a new user and password is being changed
        if (!this.isNew && this.password) {
            // Initialize password history if it doesn't exist
            if (!this.passwordHistory) {
                this.passwordHistory = [];
            }

            // Add current password to history (it's already hashed from previous save)
            // We get the old password from the database
            const oldUser = await this.constructor.findById(this._id);
            if (oldUser && oldUser.password) {
                this.passwordHistory.unshift(oldUser.password);

                // Keep only last 5 passwords
                if (this.passwordHistory.length > 5) {
                    this.passwordHistory = this.passwordHistory.slice(0, 5);
                }
            }
        }

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

// Method to check if password was previously used
userSchema.methods.checkPasswordReuse = async function (newPassword) {
    if (!this.passwordHistory || this.passwordHistory.length === 0) {
        return false;
    }

    // Check against all previous passwords
    for (const oldPasswordHash of this.passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, oldPasswordHash);
        if (isMatch) {
            return true;
        }
    }

    return false;
};

module.exports = mongoose.model('User', userSchema);
