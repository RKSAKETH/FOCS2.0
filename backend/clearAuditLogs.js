const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const AuditLog = require('./models/AuditLog');

async function clearAuditLogs() {
    try {
        console.log('🗑️  Clearing all audit logs...');

        const result = await AuditLog.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} audit logs`);
        console.log('📝 Fresh start! New audit logs will be created from now on.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing audit logs:', error);
        process.exit(1);
    }
}

clearAuditLogs();
