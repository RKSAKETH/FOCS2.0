/**
 * Password Policy Validator
 * Implements comprehensive password security requirements
 */

// List of commonly used and compromised passwords
const COMMON_PASSWORDS = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    '123456', '12345', '1234567', '123456789', 'password1',
    'qwerty123', 'welcome', 'admin', 'admin123', 'letmein',
    'monkey', '1234567890', 'Password1', 'Password123', 'welcome123',
    'sunshine', 'iloveyou', 'princess', 'rockyou', '123123',
    'football', 'dragon', 'master', 'mustang', 'starwars',
    'computer', 'trustno1', 'batman', 'freedom', 'whatever',
    'passw0rd', 'login', 'access', 'shadow', 'michael'
];

/**
 * Validates password against comprehensive security requirements
 * @param {string} password - The password to validate
 * @param {string} username - Username to check against
 * @param {string} email - Email to check against
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
function validatePassword(password, username = '', email = '') {
    const errors = [];

    // Rule 1: Minimum length of 8 characters
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Rule 2: Must include at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must include at least one uppercase letter (A-Z)');
    }

    // Rule 3: Must include at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must include at least one lowercase letter (a-z)');
    }

    // Rule 4: Must include at least one number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must include at least one number (0-9)');
    }

    // Rule 5: Must include at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must include at least one special character (e.g., ! @ # $ % ^ & *)');
    }

    // Rule 6: Must not contain username
    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        errors.push('Password must not contain your username');
    }

    // Rule 7: Must not contain email address (username part of email)
    if (email) {
        const emailUsername = email.split('@')[0];
        if (password.toLowerCase().includes(emailUsername.toLowerCase())) {
            errors.push('Password must not contain your email address');
        }
    }

    // Rule 8: Must not be a commonly used password
    if (COMMON_PASSWORDS.some(common =>
        password.toLowerCase() === common.toLowerCase()
    )) {
        errors.push('This password is too common or has been compromised. Please choose a stronger password');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check if password was previously used
 * @param {string} newPassword - New password to check
 * @param {Array} passwordHistory - Array of previously hashed passwords
 * @param {Function} compareFunction - Function to compare passwords
 * @returns {Promise<boolean>} - true if password was used before
 */
async function isPasswordReused(newPassword, passwordHistory, compareFunction) {
    if (!passwordHistory || passwordHistory.length === 0) {
        return false;
    }

    // Check against all previous passwords
    for (const oldPasswordHash of passwordHistory) {
        const isMatch = await compareFunction(newPassword, oldPasswordHash);
        if (isMatch) {
            return true;
        }
    }

    return false;
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {Object} - { score: number, strength: string }
 */
function calculatePasswordStrength(password) {
    let score = 0;

    if (!password) {
        return { score: 0, strength: 'Very Weak' };
    }

    // Length score (max 30 points)
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Character variety (max 40 points)
    if (/[a-z]/.test(password)) score += 10; // lowercase
    if (/[A-Z]/.test(password)) score += 10; // uppercase
    if (/[0-9]/.test(password)) score += 10; // numbers
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10; // special chars

    // Complexity bonus (max 30 points)
    const hasMultipleSpecial = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2;
    const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2;
    const hasMultipleUpper = (password.match(/[A-Z]/g) || []).length >= 2;

    if (hasMultipleSpecial) score += 10;
    if (hasMultipleNumbers) score += 10;
    if (hasMultipleUpper) score += 10;

    // Determine strength level
    let strength;
    if (score < 30) strength = 'Very Weak';
    else if (score < 50) strength = 'Weak';
    else if (score < 70) strength = 'Fair';
    else if (score < 90) strength = 'Strong';
    else strength = 'Very Strong';

    return { score, strength };
}

module.exports = {
    validatePassword,
    isPasswordReused,
    calculatePasswordStrength,
    COMMON_PASSWORDS
};
