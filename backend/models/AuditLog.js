const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            // Report actions
            'create', 'read', 'update', 'delete', 'approve',
            // Authentication actions
            'login', 'logout', 'register', 'login_attempt', 'login_failed', 'login_success', 'email_verified',
            // Password actions
            'password_reset_requested', 'password_reset', 'password_changed'
        ]
    },
    resource: {
        type: String,
        required: true,
        enum: ['draft_results', 'final_report', 'user_account']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    resourceId: {
        type: String,
        default: null
    },
    details: {
        type: String,
        default: ''
    },
    ipAddress: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
