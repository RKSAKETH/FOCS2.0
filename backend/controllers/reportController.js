const Report = require('../models/Report');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const encryptionService = require('../utils/encryption');
const digitalSignature = require('../utils/digitalSignature');
const encodingService = require('../utils/encoding');

/**
 * Create new report (Draft)
 * Accessible by: Technicians, Directors
 */
exports.createReport = async (req, res) => {
    try {
        const {
            caseId,
            suspectName,
            suspectId,
            bloodAlcoholContent,
            drugType,
            sampleCollectionDate,
            testMethod,
            chromatogramImage
        } = req.body;

        // Validate required fields
        if (!caseId || !suspectName || !suspectId || !bloodAlcoholContent || !drugType) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Check if case ID already exists
        const existingReport = await Report.findOne({ caseId });
        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'Case ID already exists'
            });
        }

        // Component 3: Encrypt sensitive data using AES-256
        const encryptedBAC = encryptionService.encrypt(bloodAlcoholContent, caseId);
        const encryptedDrugType = encryptionService.encrypt(drugType, caseId);

        // Create report
        const report = new Report({
            caseId,
            suspectName,
            suspectId,
            bloodAlcoholContent: encryptedBAC,
            drugType: encryptedDrugType,
            sampleCollectionDate,
            testDate: new Date(),
            testMethod,
            chromatogramImage, // Already Base64 encoded from frontend
            status: 'draft',
            createdBy: req.userId
        });

        await report.save();

        // Log action
        await AuditLog.create({
            action: 'create',
            resource: 'draft_results',
            userId: req.userId,
            userRole: req.userRole,
            resourceId: report._id.toString(),
            details: `Created draft report for case ${caseId}`,
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            report: {
                id: report._id,
                caseId: report.caseId,
                status: report.status,
                createdAt: report.createdAt
            }
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create report',
            error: error.message
        });
    }
};

/**
 * Get all reports
 * Access controlled based on role
 */
exports.getAllReports = async (req, res) => {
    try {
        const { status } = req.query;
        const userRole = req.userRole;

        let query = {};

        // Police can only see finalized reports
        if (userRole === 'police') {
            query.status = 'finalized';
        }

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        const reports = await Report.find(query)
            .populate('createdBy', 'fullName username role')
            .populate('approvedBy', 'fullName username role')
            .sort({ createdAt: -1 });

        // Decrypt sensitive data for authorized users
        const decryptedReports = reports.map(report => {
            const reportObj = report.toObject();

            try {
                // Only decrypt for technicians and directors
                if (userRole !== 'police') {
                    reportObj.bloodAlcoholContent = encryptionService.decrypt(
                        report.bloodAlcoholContent,
                        report.caseId
                    );
                    reportObj.drugType = encryptionService.decrypt(
                        report.drugType,
                        report.caseId
                    );
                } else {
                    // Police see encrypted data (for demo purposes, we'll show decrypted for final reports)
                    if (report.status === 'finalized') {
                        reportObj.bloodAlcoholContent = encryptionService.decrypt(
                            report.bloodAlcoholContent,
                            report.caseId
                        );
                        reportObj.drugType = encryptionService.decrypt(
                            report.drugType,
                            report.caseId
                        );
                    }
                }
            } catch (error) {
                console.error('Decryption error:', error);
            }

            return reportObj;
        });

        // Log access
        await AuditLog.create({
            action: 'read',
            resource: query.status === 'finalized' ? 'final_report' : 'draft_results',
            userId: req.userId,
            userRole: req.userRole,
            details: `Viewed ${reports.length} reports`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            count: decryptedReports.length,
            reports: decryptedReports
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
};

/**
 * Get single report by ID
 */
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id)
            .populate('createdBy', 'fullName username role email')
            .populate('approvedBy', 'fullName username role email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Decrypt sensitive data
        const reportObj = report.toObject();
        reportObj.bloodAlcoholContent = encryptionService.decrypt(
            report.bloodAlcoholContent,
            report.caseId
        );
        reportObj.drugType = encryptionService.decrypt(
            report.drugType,
            report.caseId
        );

        // Log access
        await AuditLog.create({
            action: 'read',
            resource: report.status === 'finalized' ? 'final_report' : 'draft_results',
            userId: req.userId,
            userRole: req.userRole,
            resourceId: report._id.toString(),
            details: `Viewed report ${report.caseId}`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            report: reportObj
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report',
            error: error.message
        });
    }
};

/**
 * Component 4B: Finalize and Sign Report (Digital Signature)
 * Only Directors can do this
 * Requires OTP verification (Multi-Factor Authentication)
 */
exports.finalizeReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.status === 'finalized') {
            return res.status(400).json({
                success: false,
                message: 'Report is already finalized'
            });
        }

        // Get director's keys
        const director = await User.findById(userId);
        if (!director.privateKey) {
            return res.status(500).json({
                success: false,
                message: 'Director keys not found'
            });
        }

        // Prepare report data for signing
        const reportData = {
            caseId: report.caseId,
            suspectName: report.suspectName,
            suspectId: report.suspectId,
            testDate: report.testDate,
            bloodAlcoholContent: report.bloodAlcoholContent,
            drugType: report.drugType
        };

        // Create digital signature
        const signature = digitalSignature.signReport(
            reportData,
            director.privateKey,
            director.publicKey
        );

        // Update report
        report.status = 'finalized';
        report.approvedBy = userId;
        report.finalizedAt = new Date();
        report.digitalSignature = signature;

        await report.save();

        // Log action
        await AuditLog.create({
            action: 'approve',
            resource: 'final_report',
            userId: req.userId,
            userRole: req.userRole,
            resourceId: report._id.toString(),
            details: `Finalized and signed report ${report.caseId}`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: 'Report finalized and digitally signed successfully',
            report: {
                id: report._id,
                caseId: report.caseId,
                status: report.status,
                finalizedAt: report.finalizedAt,
                digitalSignature: {
                    signedAt: signature.signedAt,
                    hash: signature.hash
                }
            }
        });
    } catch (error) {
        console.error('Finalize report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to finalize report',
            error: error.message
        });
    }
};

/**
 * Verify report integrity
 */
exports.verifyReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.status !== 'finalized') {
            return res.status(400).json({
                success: false,
                message: 'Report is not finalized'
            });
        }

        // Prepare current report data
        const reportData = {
            caseId: report.caseId,
            suspectName: report.suspectName,
            suspectId: report.suspectId,
            testDate: report.testDate,
            bloodAlcoholContent: report.bloodAlcoholContent,
            drugType: report.drugType
        };

        // Verify signature
        const verification = digitalSignature.verifyReport(
            reportData,
            report.digitalSignature
        );

        res.json({
            success: true,
            verification
        });
    } catch (error) {
        console.error('Verify report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify report',
            error: error.message
        });
    }
};

/**
 * Delete report
 * Only Directors can delete reports
 */
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Store case ID for audit log before deletion
        const caseId = report.caseId;
        const status = report.status;

        // Delete the report
        await Report.findByIdAndDelete(id);

        // Log action
        await AuditLog.create({
            action: 'delete',
            resource: status === 'finalized' ? 'final_report' : 'draft_results',
            userId: req.userId,
            userRole: req.userRole,
            resourceId: id,
            details: `Deleted report ${caseId} (status: ${status})`,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            message: `Report ${caseId} deleted successfully`
        });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete report',
            error: error.message
        });
    }
};

/**
 * Component 5: Get encoding security info
 */
exports.getEncodingInfo = async (req, res) => {
    try {
        const securityInfo = encodingService.getSecurityInfo();

        res.json({
            success: true,
            securityInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch encoding info'
        });
    }
};
