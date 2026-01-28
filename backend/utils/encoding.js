/**
 * Component 5: Encoding Techniques
 * A. Encoding & Decoding Implementation (1 mark) - Base64
 * B. Security Levels & Risks (Theory) - Documented
 * C. Possible Attacks (Theory) - Documented
 */

class EncodingService {
    /**
     * Encode binary data (image) to Base64
     * @param {Buffer} buffer - Binary data
     * @returns {string} Base64 encoded string
     */
    encodeToBase64(buffer) {
        return buffer.toString('base64');
    }

    /**
     * Decode Base64 string to binary data
     * @param {string} base64String - Base64 encoded string
     * @returns {Buffer} Binary data
     */
    decodeFromBase64(base64String) {
        return Buffer.from(base64String, 'base64');
    }

    /**
     * Create Data URI for image
     * @param {Buffer} buffer - Image buffer
     * @param {string} mimeType - MIME type (e.g., 'image/png')
     * @returns {string} Data URI
     */
    createDataURI(buffer, mimeType = 'image/png') {
        const base64 = this.encodeToBase64(buffer);
        return `data:${mimeType};base64,${base64}`;
    }

    /**
     * Validate Base64 string format
     * @param {string} str - String to validate
     * @returns {boolean}
     */
    isValidBase64(str) {
        try {
            return Buffer.from(str, 'base64').toString('base64') === str;
        } catch (error) {
            return false;
        }
    }

    /**
     * Security analysis of Base64 encoding
     * @returns {Object} Security information
     */
    getSecurityInfo() {
        return {
            encoding: 'Base64',
            securityLevel: 'LOW',
            purpose: 'Data representation, NOT encryption',
            confidentiality: 'NONE - Anyone can decode Base64',
            integrity: 'NONE - Can be modified and re-encoded',
            authentication: 'NONE - No proof of origin',

            risks: [
                'Base64 is NOT encryption - provides zero confidentiality',
                'Decoded easily using standard tools (base64 -d, online decoders)',
                'Can be modified by attackers and re-encoded',
                'Increases data size by ~33%',
                'No built-in integrity checking'
            ],

            possibleAttacks: [
                {
                    name: 'Base64 Injection / Data Bloat',
                    description: 'Attackers upload massive files encoded in Base64 to exhaust server memory (DoS)',
                    mitigation: 'Implement file size limits and validate decoded content size'
                },
                {
                    name: 'XSS via Base64',
                    description: 'If browser renders Base64 as executable content without sanitization, can inject malicious scripts',
                    mitigation: 'Set proper Content-Type headers, use Content-Security-Policy, sanitize output'
                },
                {
                    name: 'Data Exfiltration',
                    description: 'Sensitive data encoded in Base64 can be easily exfiltrated and decoded externally',
                    mitigation: 'Encrypt sensitive data before encoding, use access controls'
                },
                {
                    name: 'MIME Confusion',
                    description: 'Attacker changes MIME type in data URI to trick browser into executing malicious content',
                    mitigation: 'Validate file signatures (magic bytes), not just extensions'
                }
            ],

            properUseCases: [
                'Embedding small images in HTML/CSS/JSON (chromatograms)',
                'Encoding binary data for text-based protocols (email attachments)',
                'API responses containing binary data',
                'Storing binary data in JSON/XML'
            ],

            shouldNotUse: [
                'Hiding sensitive information (use encryption instead)',
                'Authentication tokens (use cryptographic signatures)',
                'Password storage (use bcrypt/scrypt with salt)',
                'Large files (use direct binary transfer)'
            ]
        };
    }
}

module.exports = new EncodingService();
