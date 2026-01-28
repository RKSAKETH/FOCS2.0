# 🎯 FOCS Project Summary - Security Components Implementation

## Project: Secure Crime Lab Toxicology Report Portal

**Total Marks: 20**  
**Tech Stack: MERN (MongoDB, Express.js, React.js, Node.js) + Tailwind CSS**

---

## ✅ Components Implemented (15/15 Technical Marks)

### 1️⃣ Authentication (3 Marks) ✅

#### A. Single-Factor Authentication (1.5 marks)
**Location**: `backend/controllers/authController.js`

**Implementation**:
- Username/Password login system
- JWT token generation for session management
- Secure password storage using bcrypt with salt

**Code**:
```javascript
// Login endpoint
POST /api/auth/login
// Password verification uses bcrypt.compare()
const isValid = await user.comparePassword(password);
```

**Files**:
- `backend/controllers/authController.js` - Login logic
- `backend/models/User.js` - Password hashing pre-save middleware
- `frontend/src/pages/Login.jsx` - Login UI

---

#### B. Multi-Factor Authentication (1.5 marks)
**Location**: `backend/utils/emailService.js`

**Implementation**:
- Email OTP (One-Time Password) system
- Triggered when Lab Director finalizes reports
- 6-digit code valid for 5 minutes
- Uses Nodemailer with Gmail SMTP

**Code**:
```javascript
// Request OTP
POST /api/auth/request-otp
// Verify OTP
POST /api/auth/verify-otp { "otp": "123456" }
```

**Files**:
- `backend/utils/emailService.js` - OTP generation and email sending
- `backend/controllers/authController.js` - OTP request/verify endpoints
- `frontend/src/pages/ReportDetails.jsx` - OTP modal UI

---

### 2️⃣ Authorization - Access Control (3 Marks) ✅

#### A. Access Control Matrix (1.5 marks)
**Location**: `backend/middleware/auth.js`

**Implementation**:

| Subject (Role) | Object 1: Draft Results | Object 2: Final Reports | Object 3: Audit Logs |
|----------------|-------------------------|-------------------------|---------------------|
| **Lab Technician** | Read, Write | Read Only | No Access |
| **Lab Director** | Read, Write | Read, Approve, Sign | Read Only |
| **Police/DA** | No Access | Read Only | No Access |

**Code**:
```javascript
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
```

**Files**:
- `backend/middleware/auth.js` - Authorization middleware with Access Control Matrix

---

#### B. Policy Definition & Justification (1.5 marks)

**Policies**:

1. **Lab Technician (Write Drafts)**:
   - **Access**: Can create and edit draft reports
   - **Justification**: Needs write access to input raw data from testing equipment
   - **Restriction**: Cannot approve own work (Separation of Duties principle) to prevent fraud

2. **Lab Director (Approve/Sign)**:
   - **Access**: Can approve and digitally sign reports
   - **Justification**: Has highest authority to validate scientific accuracy
   - **Restriction**: Cannot modify audit logs to ensure accountability

3. **Police/DA (Read Only)**:
   - **Access**: Can only view finalized reports
   - **Justification**: Consumers of evidence for court proceedings
   - **Restriction**: No write access to prevent "evidence planting" or altering BAC numbers

**Implementation**: Enforced via Express middleware that checks `req.userRole` before allowing API access

---

### 3️⃣ Encryption (3 Marks) ✅

#### A. Key Exchange Mechanism (1.5 marks)
**Location**: `backend/utils/encryption.js`

**Implementation**:
- **PBKDF2** (Password-Based Key Derivation Function 2)
- Generates AES encryption key from master secret + case ID (as salt)
- 100,000 iterations for computational difficulty
- SHA-256 hash function

**Code**:
```javascript
generateKey(caseId) {
  return crypto.pbkdf2Sync(
    this.masterSecret,     // Master password
    caseId,                // Unique salt per case
    100000,                // Iterations
    32,                    // Key length (256 bits)
    'sha256'              // Hash algorithm
  );
}
```

**Why PBKDF2?**:
- Deterministic: Same input always generates same key (needed for decryption)
- Slow computation prevents brute-force attacks
- Uses Case ID as salt = each case has unique encryption key

---

#### B. Encryption & Decryption (1.5 marks)
**Location**: `backend/utils/encryption.js`

**Implementation**:
- **AES-256** (Advanced Encryption Standard)
- Encrypts sensitive fields: `bloodAlcoholContent`, `drugType`
- Uses CryptoJS library
- Data stored as base64-encoded ciphertext

**Code**:
```javascript
// Encrypt
encrypt(plaintext, caseId) {
  const key = this.generateKey(caseId).toString('base64');
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

// Decrypt
decrypt(ciphertext, caseId) {
  const key = this.generateKey(caseId).toString('base64');
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
```

**Use Case**:
- **Write**: Frontend sends "0.08%" → Backend encrypts → Saves "U2FsdGVkX1..." to MongoDB
- **Read**: Backend fetches "U2FsdGVkX1..." → Decrypts with case ID → Returns "0.08%" to authorized user

**Files**:
- `backend/utils/encryption.js` - Encryption service
- `backend/controllers/reportController.js` - Auto-encrypt on create, decrypt on read

---

### 4️⃣ Hashing & Digital Signature (3 Marks) ✅

#### A. Hashing with Salt (1.5 marks)
**Location**: `backend/models/User.js`

**Implementation**:
- **Bcrypt** with unique salt per user
- 10 salt rounds
- Automatic hashing via Mongoose pre-save middleware
- Never stores plain text passwords

**Code**:
```javascript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.salt = await bcrypt.genSalt(10);         // Generate unique salt
  this.password = await bcrypt.hash(this.password, this.salt);  // Hash with salt
  next();
});
```

**Security Benefits**:
- **Rainbow table prevention**: Same password → different hashes for different users
- **Brute-force resistance**: Bcrypt is intentionally slow
- **No reversibility**: One-way function, cannot decrypt hash

---

#### B. Digital Signature using Hash (1.5 marks)
**Location**: `backend/utils/digitalSignature.js`

**Implementation**:
- **SHA-256** hash of report content
- **RSA-2048** encryption of hash with Director's private key
- Signature stored with report in database
- Verification uses Director's public key

**Process**:

**Signing (Director approves report)**:
```javascript
1. Create hash: SHA256(caseId + suspectName + testDate + results)
2. Sign hash: RSA.encrypt(hash, directorPrivateKey)
3. Store: { hash, signature, publicKey, timestamp }
```

**Verification (Police/Court checks report)**:
```javascript
1. Compute current hash: SHA256(current report data)
2. Decrypt signature: RSA.decrypt(signature, directorPublicKey)
3. Compare: currentHash === decryptedSignature
   ✅ Match = Report is authentic and unaltered
   ❌ Mismatch = Report has been tampered with
```

**Code**:
```javascript
// Sign report
signReport(reportData, privateKey, publicKey) {
  const hash = this.createHash(reportData);  // SHA-256
  const signature = this.signHash(hash, privateKey);  // RSA encrypt
  return { hash, signature, signerPublicKey: publicKey };
}

// Verify report
verifyReport(reportData, digitalSignature) {
  const currentHash = this.createHash(reportData);
  if (currentHash !== digitalSignature.hash) {
    return { isValid: false, message: 'Report tampered!' };
  }
  const isValid = this.verifySignature(currentHash, digitalSignature.signature, digitalSignature.signerPublicKey);
  return { isValid, message: isValid ? 'Authentic' : 'Forged' };
}
```

**Files**:
- `backend/utils/digitalSignature.js` - RSA signature service
- `backend/controllers/reportController.js` - Sign on finalize, verify endpoint
- `frontend/src/pages/ReportDetails.jsx` - Display verification status

---

### 5️⃣ Encoding Techniques (3 Marks) ✅

#### A. Encoding & Decoding Implementation (1 mark)
**Location**: `backend/utils/encoding.js`

**Implementation**:
- **Base64 Encoding** for chromatogram images
- Converts binary image data to ASCII string
- Stored in MongoDB as string
- Rendered as Data URI in frontend

**Code**:
```javascript
// Encode
encodeToBase64(buffer) {
  return buffer.toString('base64');
}

// Decode
decodeFromBase64(base64String) {
  return Buffer.from(base64String, 'base64');
}

// Create Data URI for image display
createDataURI(buffer, mimeType = 'image/png') {
  const base64 = this.encodeToBase64(buffer);
  return `data:${mimeType};base64,${base64}`;
}
```

**Use Case**:
1. User uploads image file (PNG/JPG)
2. Frontend reads file as binary
3. Convert to Base64: `btoa(binaryData)`
4. Send to backend as string in JSON
5. Store in MongoDB Report schema
6. Display: `<img src="data:image/png;base64,{base64String}" />`

**Files**:
- `backend/utils/encoding.js` - Encoding service
- `frontend/src/pages/CreateReport.jsx` - Image upload with Base64 conversion

---

#### B. Security Levels & Risks (Theory) (1 mark)

**Analysis**:

**Security Level**: **LOW ⚠️**

| Property | Level | Explanation |
|----------|-------|-------------|
| **Confidentiality** | NONE | Anyone can decode Base64 using standard tools |
| **Integrity** | NONE | Can be modified and re-encoded easily |
| **Authentication** | NONE | No proof of who encoded the data |
| **Non-repudiation** | NONE | No way to prove origin |

**Key Points**:
- Base64 is **NOT encryption** - it's just data representation
- Easily decoded: `echo "SGVsbG8=" \| base64 -d` → "Hello"
- Increases data size by ~33% (4 chars for every 3 bytes)
- No cryptographic security whatsoever

**Proper Use Cases**:
- ✅ Embedding images in HTML/CSS
- ✅ Encoding binary data for JSON/XML
- ✅ Email attachments (MIME)
- ❌ Hiding passwords (use encryption)
- ❌ Storing sensitive data (use AES)

---

#### C. Possible Attacks (Theory) (1 mark)

**Attack Vectors**:

1. **Base64 Injection / Data Bloat (DoS)**:
   - **Attack**: Upload massive file (100MB image) → Encode to Base64 (133MB string) → Exhaust server memory
   - **Mitigation**: File size limits (implemented: 50MB limit in Express)
   ```javascript
   app.use(express.json({ limit: '50mb' }));
   ```

2. **XSS (Cross-Site Scripting) via Base64**:
   - **Attack**: Encode JavaScript in Base64 → Decode and execute in browser
   - **Example**: `data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=`
   - **Mitigation**: Content-Security-Policy headers, sanitize output

3. **MIME Confusion Attack**:
   - **Attack**: Upload malicious EXE → Change MIME to image/png → Browser executes
   - **Mitigation**: Validate file magic bytes (signature), not just extension

4. **Data Exfiltration**:
   - **Attack**: Base64-encode sensitive data → Exfiltrate via image URL
   - **Mitigation**: Encrypt before encoding, monitor outbound traffic

**Implementation in Project**:
```javascript
getSecurityInfo() {
  return {
    encoding: 'Base64',
    securityLevel: 'LOW',
    risks: [
      'Not encryption - zero confidentiality',
      'Easily decoded',
      'Can be modified and re-encoded',
      'Increases data size by ~33%'
    ],
    possibleAttacks: [
      { name: 'Base64 Injection / Data Bloat', mitigation: 'File size limits' },
      { name: 'XSS via Base64', mitigation: 'CSP headers, sanitization' },
      { name: 'MIME Confusion', mitigation: 'Validate magic bytes' }
    ]
  };
}
```

**Files**:
- `backend/utils/encoding.js` - Complete security analysis in code
- API endpoint: `GET /api/reports/info/encoding` - Returns security info

---

### 6️⃣ Bonus: Audit Logging (Implemented) ✅

**Location**: `backend/models/AuditLog.js`

**Implementation**:
- Logs all actions: create, read, update, delete, approve, login
- Stores: user, role, resource, timestamp, IP address
- Only Directors can view logs
- Complete chain of custody for forensic evidence

**Schema**:
```javascript
{
  action: 'approve',
  resource: 'final_report',
  userId: ObjectId,
  userRole: 'director',
  resourceId: 'CASE-2026-001',
  details: 'Finalized and signed report',
  ipAddress: '192.168.1.100',
  timestamp: Date
}
```

**Files**:
- `backend/models/AuditLog.js` - Schema
- `backend/controllers/auditController.js` - Query logs
- `frontend/src/pages/AuditLogs.jsx` - Display logs (Directors only)

---

## 📊 Marks Distribution Summary

| Component | Sub-Component | Marks | Status |
|-----------|---------------|-------|--------|
| 1. Authentication | Single-Factor (Username/Password) | 1.5 | ✅ |
| 1. Authentication | Multi-Factor (OTP) | 1.5 | ✅ |
| 2. Authorization | Access Control Matrix | 1.5 | ✅ |
| 2. Authorization | Policy Implementation | 1.5 | ✅ |
| 3. Encryption | Key Exchange (PBKDF2) | 1.5 | ✅ |
| 3. Encryption | AES-256 Encrypt/Decrypt | 1.5 | ✅ |
| 4. Hashing | Password Hashing with Salt | 1.5 | ✅ |
| 4. Digital Signature | RSA Signature | 1.5 | ✅ |
| 5. Encoding | Base64 Implementation | 1.0 | ✅ |
| 5. Encoding | Security Levels (Theory) | 1.0 | ✅ |
| 5. Encoding | Possible Attacks (Theory) | 1.0 | ✅ |
| **TOTAL** | | **15** | ✅ |
| **Viva + Participation** | | **5** | 📝 |
| **GRAND TOTAL** | | **20** | |

---

## 🎤 Viva Preparation Answers

### Q1: Explain the difference between encryption and encoding

**Answer**:
- **Encryption**: Provides confidentiality using a secret key. Cannot be reversed without the key. Example: AES-256 encrypts "0.08%" → "U2FsdGVkX1..."
- **Encoding**: Represents data in different format, easily reversible. No keys needed. Example: Base64 encodes "Hello" → "SGVsbG8="
- **In our project**: Encryption (AES) protects BAC data; Encoding (Base64) stores images

### Q2: How does bcrypt with salt prevent rainbow table attacks?

**Answer**:
- **Rainbow Tables**: Pre-computed hash lookup tables (password → hash)
- **Salt**: Random data added to password before hashing
- **Bcrypt**: Generates unique salt per user
- **Result**: Same password "password123" produces different hashes for User A and User B
- **Attacker needs**: Separate rainbow table for each unique salt → computationally infeasible
- **In our project**: `userSchema.pre('save')` auto-generates salt via `bcrypt.genSalt(10)`

### Q3: Explain the digital signature verification process

**Answer**:
**Signing (Director)**:
1. Create SHA-256 hash of report data (case ID, suspect info, test results)
2. Encrypt hash with Director's RSA private key
3. Result = Digital Signature (proves Director signed this exact data)

**Verification (Police/Court)**:
1. Compute current SHA-256 hash of report
2. Decrypt stored signature using Director's public key (anyone can do this)
3. Compare: Current hash vs Decrypted signature
   - **Match** → Report is authentic and unchanged
   - **Mismatch** → Report was tampered with after signing

**Why it works**: Only Director has private key to create valid signature. Changing even 1 byte of report changes the hash, breaking signature verification.

### Q4: Why use PBKDF2 instead of directly using the master secret as AES key?

**Answer**:
- **Problem**: Master secret is same for all reports
- **PBKDF2 Benefits**:
  1. **Unique keys per case**: Uses Case ID as salt → Each report has different encryption key
  2. **Compromising one report doesn't endanger others**: Attacker who breaks CASE-001's key still can't decrypt CASE-002
  3. **Key stretching**: 100,000 iterations make brute-force attacks slower
  4. **Deterministic**: Same Case ID always generates same key (needed for decryption)

### Q5: What are the three main pillars of the Access Control Matrix and why?

**Answer**:
1. **Separation of Duties**: Technicians cannot approve their own work. Prevents fraud and ensures peer review.

2. **Least Privilege**: Each role gets minimum permissions needed. Police can only read finalized reports, not drafts or logs. Prevents evidence tampering.

3. **Accountability**: Directors can view audit logs but cannot modify them. Ensures traceability and prevents covering tracks.

**Implementation**: Express middleware checks `req.userRole` against `ACCESS_CONTROL_MATRIX` before granting access.

### Q6: Explain possible attacks on Base64 and mitigations

**Answer**:
**Attack 1 - Data Bloat (DoS)**:
- Attacker uploads 100MB image → 133MB Base64 string → Server memory exhausted
- **Mitigation**: `app.use(express.json({ limit: '50mb' }))`

**Attack 2 - XSS via Base64**:
- Attacker encodes JavaScript → Browser executes if unsanitized
- **Mitigation**: Content-Security-Policy headers, validate MIME types

**Attack 3 - MIME Confusion**:
- Upload .exe with MIME type image/png → Browser executes malicious file
- **Mitigation**: Check file magic bytes (PNG starts with `89 50 4E 47`), not just extension

---

## 🗂️ File Structure Reference

```
FOCS Project 2.0/
│
├── backend/
│   ├── config/
│   │   └── database.js                     ✅ MongoDB connection
│   ├── controllers/
│   │   ├── authController.js               ✅ Components 1A, 1B (Auth)
│   │   ├── reportController.js             ✅ Components 3, 4B, 5 (Encryption, Signature, Encoding)
│   │   └── auditController.js              ✅ Audit logs
│   ├── middleware/
│   │   └── auth.js                         ✅ Component 2 (Access Control Matrix)
│   ├── models/
│   │   ├── User.js                         ✅ Component 4A (Password hashing)
│   │   ├── Report.js                       ✅ Report schema
│   │   └── AuditLog.js                     ✅ Audit schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   └── auditRoutes.js
│   ├── utils/
│   │   ├── encryption.js                   ✅ Component 3 (PBKDF2 + AES-256)
│   │   ├── digitalSignature.js             ✅ Component 4B (RSA signatures)
│   │   ├── emailService.js                 ✅ Component 1B (OTP emails)
│   │   └── encoding.js                     ✅ Component 5 (Base64 + security analysis)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx             ✅ Global auth state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx                   ✅ Component 1A UI
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx               ✅ Shows Access Control Matrix
│   │   │   ├── Reports.jsx
│   │   │   ├── CreateReport.jsx            ✅ Base64 encoding demo
│   │   │   ├── ReportDetails.jsx           ✅ OTP modal, signature verification
│   │   │   └── AuditLogs.jsx               ✅ Audit UI (Directors only)
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                               ✅ Full documentation
├── QUICKSTART.md                           ✅ Setup guide
└── PROJECT_SUMMARY.md                      ✅ This file
```

---

## 🚀 Quick Demo Script for Viva

**Duration: 5-7 minutes**

1. **Start (30 sec)**: Open landing page, explain 6 security components

2. **Authentication (1 min)**:
   - Register Director account with real email
   - Login (show JWT token in Network tab)

3. **Authorization (1 min)**:
   - Show Dashboard Access Control Matrix
   - Try accessing /audit as technician → 403 Forbidden

4. **Create Report (1.5 min)**:
   - Fill form, upload image (show Base64 in console)
   - Submit → Show encrypted data in MongoDB Compass

5. **Digital Signature (2 min)**:
   - Review report as Director
   - Click "Finalize & Sign"
   - **Screen share email with OTP**
   - Enter OTP
   - Show hash and signature in report details

6. **Verification (1 min)**:
   - Login as Police
   - View finalized report
   - Show green verification checkmark

7. **Audit Logs (30 sec)**:
   - Login as Director
   - Show complete activity history

8. **Tamper Detection (1 min)**:
   - Manually change report data in MongoDB
   - Reload report → Red verification failed

---

## ✨ Unique Selling Points

1. **Real-world application**: Solves actual forensic evidence tampering problem
2. **All 5 components**: Complete implementation, not just basic examples
3. **Production-ready**: Error handling, validation, security best practices
4. **Beautiful UI**: Glassmorphism design, smooth animations, dark mode
5. **Comprehensive docs**: README, Quickstart, API docs, viva preparation

---

## 📌 Remember for Viva

- **Don't say**: "Base64 is secure encryption"
  **Say**: "Base64 is encoding for representation, NOT encryption. It provides zero confidentiality."

- **Don't say**: "Hashing and encryption are the same"
  **Say**: "Hashing is one-way (bcrypt for passwords), encryption is two-way (AES for data)"

- **Don't say**: "We use OTP for every login"
  **Say**: "Single-factor for login (fast), OTP only for critical operations like signing reports"

- **Emphasize**: "Chain of custody", "Separation of duties", "Defense in depth"

---

**Good luck with your viva! You've got this! 🎉**
