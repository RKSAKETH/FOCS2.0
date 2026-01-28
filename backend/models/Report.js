const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    caseId: {
        type: String,
        required: true,
        unique: true
    },
    suspectName: {
        type: String,
        required: true
    },
    suspectId: {
        type: String,
        required: true
    },
    // Encrypted sensitive data
    bloodAlcoholContent: {
        type: String, // Encrypted AES string
        required: true
    },
    drugType: {
        type: String, // Encrypted AES string
        required: true
    },
    // Other report data (not encrypted)
    sampleCollectionDate: {
        type: Date,
        required: true
    },
    testDate: {
        type: Date,
        default: Date.now
    },
    testMethod: {
        type: String,
        required: true
    },
    // Base64 encoded chromatogram image
    chromatogramImage: {
        type: String, // Base64 encoded image
        default: null
    },
    // Report status
    status: {
        type: String,
        enum: ['draft', 'finalized'],
        default: 'draft'
    },
    // Technician who created the report
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Director who approved (if finalized)
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Digital Signature
    digitalSignature: {
        signature: String, // Encrypted hash with Director's private key
        hash: String, // Original hash of the report
        signedAt: Date,
        signerPublicKey: String // Director's public key for verification
    },
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    finalizedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Report', reportSchema);
