require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware - CORS Configuration
// Allow multiple origins: localhost for development + deployed frontend
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app', // Vercel deployment (old)
    'https://focs-2-0-evlt0fol0-rksakeths-projects.vercel.app', // Vercel deployment (new)
    process.env.FRONTEND_URL // Additional from env variable
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        // Check exact match in allowed origins
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        // Allow all Vercel preview deployments (matches *.vercel.app)
        else if (origin && origin.includes('vercel.app')) {
            console.log(`✅ Allowing Vercel deployment: ${origin}`);
            callback(null, true);
        }
        else {
            console.log(`❌ CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // For Base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Secure Crime Lab Toxicology Portal API is running',
        timestamp: new Date(),
        components: {
            authentication: 'Single-Factor + Multi-Factor (OTP)',
            authorization: 'Access Control Matrix',
            encryption: 'AES-256 with PBKDF2',
            hashing: 'Bcrypt with Salt',
            digitalSignature: 'RSA-2048',
            encoding: 'Base64'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔬 Secure Crime Lab Toxicology Report Portal                ║
║                                                                ║
║   Server running on port ${PORT}                               ║
║   Environment: ${process.env.NODE_ENV || 'development'}        ║
║                                                                ║
║   Security Features:                                           ║
║   ✓ Single-Factor Authentication (Username/Password)          ║
║   ✓ Multi-Factor Authentication (OTP via Email)               ║
║   ✓ Access Control Matrix (3 Roles × 3 Resources)             ║
║   ✓ AES-256 Encryption with PBKDF2 Key Derivation             ║
║   ✓ Bcrypt Password Hashing with Salt                         ║
║   ✓ RSA-2048 Digital Signatures                               ║
║   ✓ Base64 Encoding for Images                                ║
║   ✓ Comprehensive Audit Logging                               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
