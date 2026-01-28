const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get audit logs - Directors only (read only)
router.get(
    '/',
    authorize('user_audit_logs', 'read'),
    auditController.getAuditLogs
);

// Get audit statistics
router.get(
    '/stats',
    authorize('user_audit_logs', 'read'),
    auditController.getAuditStats
);

module.exports = router;
