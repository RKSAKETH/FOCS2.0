const AuditLog = require('../models/AuditLog');

/**
 * Get audit logs
 * Only accessible by Directors (Read Only)
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { startDate, endDate, action, resource, userId } = req.query;

        let query = {};

        // Filter by date range
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Filter by action
        if (action) query.action = action;

        // Filter by resource
        if (resource) query.resource = resource;

        // Filter by user
        if (userId) query.userId = userId;

        const logs = await AuditLog.find(query)
            .populate('userId', 'username fullName role')
            .sort({ timestamp: -1 })
            .limit(100); // Limit to last 100 logs

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
};

/**
 * Get audit statistics
 */
exports.getAuditStats = async (req, res) => {
    try {
        const totalLogs = await AuditLog.countDocuments();

        const actionStats = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const resourceStats = await AuditLog.aggregate([
            { $group: { _id: '$resource', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const userStats = await AuditLog.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details
        await AuditLog.populate(userStats, {
            path: '_id',
            select: 'username fullName role'
        });

        res.json({
            success: true,
            stats: {
                total: totalLogs,
                byAction: actionStats,
                byResource: resourceStats,
                topUsers: userStats
            }
        });
    } catch (error) {
        console.error('Get audit stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit statistics',
            error: error.message
        });
    }
};
