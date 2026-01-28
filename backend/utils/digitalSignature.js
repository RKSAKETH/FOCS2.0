const crypto = require('crypto');
const NodeRSA = require('node-rsa');

/**
 * Component 4B: Digital Signature using Hash (1.5 marks)
 * - Hash the report content
 * - Sign the hash with Director's private key
 * - Verify using Director's public key
 */

class DigitalSignatureService {
    /**
     * Generate RSA key pair for a user (Director)
     * @returns {Object} { publicKey, privateKey }
     */
    generateKeyPair() {
        const key = new NodeRSA({ b: 2048 });

        return {
            publicKey: key.exportKey('public'),
            privateKey: key.exportKey('private')
        };
    }

    /**
     * Create hash of report content using SHA-256
     * @param {Object} reportData - Report data to hash
     * @returns {string} Hash in hex format
     */
    createHash(reportData) {
        const content = JSON.stringify({
            caseId: reportData.caseId,
            suspectName: reportData.suspectName,
            suspectId: reportData.suspectId,
            testDate: reportData.testDate,
            bloodAlcoholContent: reportData.bloodAlcoholContent,
            drugType: reportData.drugType
        });

        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Sign the hash with Director's private key
     * @param {string} hash - Hash to sign
     * @param {string} privateKey - Director's private key
     * @returns {string} Digital signature
     */
    signHash(hash, privateKey) {
        try {
            const key = new NodeRSA(privateKey);
            const signature = key.sign(hash, 'base64');
            return signature;
        } catch (error) {
            console.error('Signature creation error:', error);
            throw new Error('Failed to create digital signature');
        }
    }

    /**
     * Verify digital signature
     * @param {string} hash - Current hash of the document
     * @param {string} signature - Digital signature to verify
     * @param {string} publicKey - Director's public key
     * @returns {boolean} True if signature is valid
     */
    verifySignature(hash, signature, publicKey) {
        try {
            const key = new NodeRSA(publicKey);
            return key.verify(hash, signature, 'utf8', 'base64');
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    /**
     * Complete signing process for a report
     * @param {Object} reportData - Report data
     * @param {string} privateKey - Director's private key
     * @param {string} publicKey - Director's public key
     * @returns {Object} { hash, signature, publicKey }
     */
    signReport(reportData, privateKey, publicKey) {
        const hash = this.createHash(reportData);
        const signature = this.signHash(hash, privateKey);

        return {
            hash,
            signature,
            signerPublicKey: publicKey,
            signedAt: new Date()
        };
    }

    /**
     * Verify report integrity
     * @param {Object} reportData - Current report data
     * @param {Object} digitalSignature - Stored signature object
     * @returns {Object} { isValid, message }
     */
    verifyReport(reportData, digitalSignature) {
        const currentHash = this.createHash(reportData);

        // Check if hash matches
        if (currentHash !== digitalSignature.hash) {
            return {
                isValid: false,
                message: 'Report has been tampered with! Hash mismatch.'
            };
        }

        // Verify signature
        const isValid = this.verifySignature(
            currentHash,
            digitalSignature.signature,
            digitalSignature.signerPublicKey
        );

        return {
            isValid,
            message: isValid
                ? 'Report is authentic and has not been tampered with.'
                : 'Invalid digital signature! Report may have been forged.'
        };
    }
}

module.exports = new DigitalSignatureService();
