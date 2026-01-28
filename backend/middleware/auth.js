const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Component 1A: Single-Factor Authentication
 * Middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password -salt -privateKey');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Component 2: Authorization - Access Control
 * Middleware to check user permissions based on Access Control Matrix
 */

// Access Control Matrix
const ACCESS_CONTROL_MATRIX = {
    technician: {
        draft_results: ['read', 'write'],
        final_report: ['read'],
        user_audit_logs: []
    },
    director: {
        draft_results: ['read', 'write'],
        final_report: ['read', 'approve', 'sign'],
        user_audit_logs: ['read']
    },
    police: {
        draft_results: [],
        final_report: ['read'],
        user_audit_logs: []
    }
};

/**
 * Check if user has permission for specific action on resource
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 */
const authorize = (resource, action) => {
    return async (req, res, next) => {
        try {
            const userRole = req.userRole;
            const allowedActions = ACCESS_CONTROL_MATRIX[userRole]?.[resource] || [];

            if (!allowedActions.includes(action)) {
                // Log unauthorized access attempt
                await AuditLog.create({
                    action: 'unauthorized_attempt',
                    resource,
                    userId: req.userId,
                    userRole,
                    details: `Attempted ${action} on ${resource} - DENIED`,
                    ipAddress: req.ip
                });

                return res.status(403).json({
                    success: false,
                    message: `Access Denied: ${userRole} role cannot perform '${action}' on '${resource}'`,
                    policy: {
                        yourRole: userRole,
                        allowedActions,
                        attemptedAction: action
                    }
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

/**
 * Role-based middleware
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied: Requires one of these roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = {
    authenticate,
    authorize,
    requireRole
};
