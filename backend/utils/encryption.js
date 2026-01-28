const crypto = require('crypto');
const CryptoJS = require('crypto-js');

/**
 * Component 3: Encryption
 * A. Key Exchange Mechanism (1.5 marks) - PBKDF2 for key generation
 * B. Encryption & Decryption (1.5 marks) - AES-256
 */

class EncryptionService {
    constructor() {
        this.masterSecret = process.env.MASTER_SECRET || 'default-master-secret-change-this';
        this.algorithm = 'aes-256-cbc';
    }

    /**
     * Generate AES key using PBKDF2
     * @param {string} caseId - Unique case ID used as salt
     * @returns {Buffer} Derived key
     */
    generateKey(caseId) {
        const iterations = 100000;
        const keyLength = 32; // 256 bits
        const digest = 'sha256';

        return crypto.pbkdf2Sync(
            this.masterSecret,
            caseId,
            iterations,
            keyLength,
            digest
        );
    }

    /**
     * Encrypt data using AES-256
     * @param {string} plaintext - Data to encrypt
     * @param {string} caseId - Case ID for key generation
     * @returns {string} Encrypted data
     */
    encrypt(plaintext, caseId) {
        try {
            const key = this.generateKey(caseId).toString('base64');
            const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Encryption failed');
        }
    }

    /**
     * Decrypt data using AES-256
     * @param {string} ciphertext - Encrypted data
     * @param {string} caseId - Case ID for key generation
     * @returns {string} Decrypted data
     */
    decrypt(ciphertext, caseId) {
        try {
            const key = this.generateKey(caseId).toString('base64');
            const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Decryption failed');
        }
    }
}

module.exports = new EncryptionService();
