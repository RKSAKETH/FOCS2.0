const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const emailService = require('../utils/emailService');
const digitalSignature = require('../utils/digitalSignature');

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

        // Send OTP via email
        await emailService.sendOTP(user.email, otp, user.fullName);

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
