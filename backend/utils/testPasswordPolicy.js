/**
 * Password Security Test Suite
 * Run this file to test password validation logic
 */

const { validatePassword, calculatePasswordStrength } = require('./passwordPolicy');

console.log('='.repeat(70));
console.log('PASSWORD SECURITY TEST SUITE');
console.log('='.repeat(70));

// Test cases
const testCases = [
    {
        name: 'Valid Strong Password',
        password: 'SecurePass123!',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: true
    },
    {
        name: 'Too Short',
        password: 'Pass1!',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'No Uppercase',
        password: 'password123!',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'No Lowercase',
        password: 'PASSWORD123!',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'No Number',
        password: 'PasswordTest!',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'No Special Character',
        password: 'Password123',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'Contains Username',
        password: 'testuser123!A',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'Contains Email Username',
        password: 'test123!ABC',
        username: 'johndoe',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'Common Password',
        password: 'password123',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'Another Common Password',
        password: 'Welcome123',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: false
    },
    {
        name: 'Very Strong Password',
        password: 'MyS3cur3P@ssw0rd!2024',
        username: 'testuser',
        email: 'test@example.com',
        shouldPass: true
    }
];

console.log('\nRunning Password Validation Tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = validatePassword(testCase.password, testCase.username, testCase.email);
    const strength = calculatePasswordStrength(testCase.password);

    const testPassed = result.isValid === testCase.shouldPass;

    if (testPassed) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${testCase.name}`);
    }

    console.log(`   Password: "${testCase.password}"`);
    console.log(`   Valid: ${result.isValid} (Expected: ${testCase.shouldPass})`);
    console.log(`   Strength: ${strength.strength} (Score: ${strength.score}/100)`);

    if (result.errors && result.errors.length > 0) {
        console.log(`   Errors:`);
        result.errors.forEach(error => {
            console.log(`     - ${error}`);
        });
    }

    console.log('');
});

console.log('='.repeat(70));
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
console.log('='.repeat(70));

// Test password strength calculator
console.log('\nPassword Strength Examples:\n');

const strengthExamples = [
    'weak',
    'Password1',
    'Password1!',
    'SecurePass123!',
    'MyV3ry$tr0ng&C0mpl3xP@ssw0rd!'
];

strengthExamples.forEach((password, index) => {
    const strength = calculatePasswordStrength(password);
    const bar = '█'.repeat(Math.floor(strength.score / 5)) + '░'.repeat(20 - Math.floor(strength.score / 5));
    console.log(`${index + 1}. "${password}"`);
    console.log(`   [${bar}] ${strength.score}/100 - ${strength.strength}`);
    console.log('');
});

console.log('='.repeat(70));
console.log('Test suite completed!');
console.log('='.repeat(70));
