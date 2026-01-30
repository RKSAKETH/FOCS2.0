const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const digitalSignature = require('../utils/digitalSignature');
const { validatePassword, calculatePasswordStrength } = require('../utils/passwordPolicy');

/**
 * Register new user
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password, role, fullName } = req.body;

        // Validate input
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Validate password against security policy
        const passwordValidation = validatePassword(password, username, email);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password, // Will be hashed by pre-save middleware
            role: role || 'technician',
            fullName
        });

        // Generate RSA key pair for directors
        if (user.role === 'director') {
            const keyPair = digitalSignature.generateKeyPair();
            user.publicKey = keyPair.publicKey;
            user.privateKey = keyPair.privateKey;
        }

        await user.save();

        // Log registration
        await AuditLog.create({
            action: 'create',
            resource: 'user_account',
            userId: user._id,
            userRole: user.role,
            details: `New ${user.role} account created`,
            ipAddress: req.ip
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                publicKey: user.publicKey
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

/**
 * Component 1A: Single-Factor Authentication - Login
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password (Component 4A: Hashing with Salt)
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Log successful login
        await AuditLog.create({
            action: 'login',
            resource: 'user_account',
            userId: user._id,
            userRole: user.role,
            details: 'Successful login',
            ipAddress: req.ip
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                publicKey: user.publicKey
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

/**
 * Component 1B: Multi-Factor Authentication - Request OTP
 */
exports.requestOTP = async (req, res) => {
    try {
        const userId = req.userId;
        const purpose = req.query.purpose || req.body.purpose || 'verification'; // login, register, or finalize
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate OTP
        const otp = emailService.generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to user
        user.otp = { code: otp, expiresAt };
        await user.save();

        // Send OTP via email with purpose
        await emailService.sendOTP(user.email, otp, user.fullName, purpose);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            expiresIn: '5 minutes'
        });
    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error.message
        });
    }
};

/**
 * Component 1B: Multi-Factor Authentication - Verify OTP
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.userId;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists
        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: 'No OTP requested'
            });
        }

        // Check if OTP expired
        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP
        if (user.otp.code !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Clear OTP after successful verification
        user.otp = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'OTP verified successfully',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed',
            error: error.message
        });
    }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password -salt -privateKey');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Forgot Password - Step 1: Request Password Reset OTP
 * Public endpoint - doesn't require authentication
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset OTP has been sent'
            });
        }

        // Generate OTP
        const otp = emailService.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        user.resetPasswordOTP = { code: otp, expiresAt };
        await user.save();

        // Send OTP via email
        await emailService.sendOTP(user.email, otp, user.fullName, 'password_reset');

        // Log password reset request
        await AuditLog.create({
            action: 'password_reset_requested',
            resource: 'user_account',
            userId: user._id,
            userRole: user.role,
            details: 'Password reset OTP requested',
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset OTP has been sent',
            expiresIn: '10 minutes'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error.message
        });
    }
};

/**
 * Forgot Password - Step 2: Verify Password Reset OTP
 * Public endpoint
 */
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists
        if (!user.resetPasswordOTP || !user.resetPasswordOTP.code) {
            return res.status(400).json({
                success: false,
                message: 'No password reset OTP requested. Please request a new one.'
            });
        }

        // Check if OTP expired
        if (new Date() > user.resetPasswordOTP.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Verify OTP
        if (user.resetPasswordOTP.code !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Generate a temporary reset token (valid for 15 minutes)
        const resetToken = jwt.sign(
            { userId: user._id, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Store reset token
        user.resetPasswordToken = {
            token: resetToken,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        };

        // Clear the OTP after successful verification
        user.resetPasswordOTP = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.',
            resetToken,
            expiresIn: '15 minutes'
        });
    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

/**
 * Forgot Password - Step 3: Reset Password
 * Public endpoint, but requires reset token from OTP verification
 */
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword, email } = req.body;

        if (!resetToken || !newPassword || !email) {
            return res.status(400).json({
                success: false,
                message: 'Reset token, email, and new password are required'
            });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
            if (decoded.purpose !== 'password_reset') {
                throw new Error('Invalid token purpose');
            }
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        const user = await User.findOne({
            _id: decoded.userId,
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify reset token is still valid in database
        if (!user.resetPasswordToken ||
            user.resetPasswordToken.token !== resetToken ||
            new Date() > user.resetPasswordToken.expiresAt) {
            return res.status(401).json({
                success: false,
                message: 'Reset token is invalid or has expired'
            });
        }

        // Validate new password against security policy
        const passwordValidation = validatePassword(newPassword, user.username, user.email);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'New password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if password was previously used
        const isReused = await user.checkPasswordReuse(newPassword);
        if (isReused) {
            return res.status(400).json({
                success: false,
                message: 'You cannot reuse a previously used password. Please choose a different password.'
            });
        }

        // Check if new password is same as current password
        const isSameAsCurrent = await user.comparePassword(newPassword);
        if (isSameAsCurrent) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from your current password'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        user.resetPasswordToken = undefined; // Clear reset token
        user.resetPasswordOTP = undefined; // Clear any remaining OTP
        await user.save();

        // Log password reset
        await AuditLog.create({
            action: 'password_reset',
            resource: 'user_account',
            userId: user._id,
            userRole: user.role,
            details: 'Password successfully reset',
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error.message
        });
    }
};

/**
 * Change Password (for authenticated users)
 * Requires current password and validates new password
 */
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Validate new password against security policy
        const passwordValidation = validatePassword(newPassword, user.username, user.email);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'New password does not meet security requirements',
                errors: passwordValidation.errors
            });
        }

        // Check if password was previously used
        const isReused = await user.checkPasswordReuse(newPassword);
        if (isReused) {
            return res.status(400).json({
                success: false,
                message: 'You cannot reuse a previously used password. Please choose a different password.'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Log password change
        await AuditLog.create({
            action: 'password_changed',
            resource: 'user_account',
            userId: user._id,
            userRole: user.role,
            details: 'Password changed successfully',
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

