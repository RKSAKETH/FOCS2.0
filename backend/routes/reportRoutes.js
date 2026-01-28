const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create report - Technicians and Directors
router.post(
    '/',
    authorize('draft_results', 'write'),
    reportController.createReport
);

// Get all reports - Role-based access
router.get(
    '/',
    reportController.getAllReports
);

// Get single report
router.get(
    '/:id',
    reportController.getReportById
);

// Finalize report - Directors only
router.post(
    '/:id/finalize',
    requireRole('director'),
    authorize('final_report', 'sign'),
    reportController.finalizeReport
);

// Verify report integrity
router.get(
    '/:id/verify',
    reportController.verifyReport
);

// Get encoding security info
router.get(
    '/info/encoding',
    reportController.getEncodingInfo
);

// Delete report - Directors only
router.delete(
    '/:id',
    requireRole('director'),
    reportController.deleteReport
);

module.exports = router;
