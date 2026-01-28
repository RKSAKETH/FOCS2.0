# 🔬 Secure Crime Lab Toxicology Report Portal

A tamper-proof system for managing forensic blood and drug test results with comprehensive security features including authentication, encryption, digital signatures, and audit logging.

## 📋 Project Overview

This MERN stack application ensures that once a Lab Director signs a report, it cannot be altered by police or hackers without detection, preserving the "Chain of Custody" for court evidence.

### Security Components Implemented (20 Marks Total)

#### 1. Authentication (3 Marks) ✅
- **Single-Factor Authentication (1.5 marks)**: Username/Password login with bcrypt hashing
- **Multi-Factor Authentication (1.5 marks)**: Email OTP for report finalization

#### 2. Authorization - Access Control (3 Marks) ✅
- **Access Control Matrix** with 3 subjects and 3 objects:
  - **Lab Technician**: Write drafts, read final reports
  - **Lab Director**: Approve/sign reports, read audit logs
  - **Police/DA**: Read-only access to finalized reports
- **Policy enforcement** via Express middleware

#### 3. Encryption (3 Marks) ✅
- **Key Exchange**: PBKDF2 for AES key derivation
- **AES-256 Encryption**: Sensitive fields (blood_alcohol_content, drug_type)

#### 4. Hashing & Digital Signature (3 Marks) ✅
- **Bcrypt with Salt**: Password storage
- **RSA-2048 Digital Signatures**: Report integrity verification

#### 5. Encoding Techniques (3 Marks) ✅
- **Base64 Encoding**: Chromatogram images
- **Security Analysis**: Comprehensive documentation of risks and attacks

#### 6. Audit Logging ✅
- Complete activity tracking for compliance

## 🚀 Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Security Libraries**: bcryptjs, jsonwebtoken, crypto-js, node-rsa, nodemailer

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Gmail account (for OTP emails)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# - Set MONGODB_URI (local: mongodb://localhost:27017/toxicology_portal)
# - Set EMAIL_USER and EMAIL_PASS (Gmail app password)
# - Set JWT_SECRET and MASTER_SECRET (random strings)

# Start MongoDB (if using local instance)
# Windows: Start MongoDB service from Services
# Mac/Linux: sudo systemctl start mongodb

# Run backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:5000/api

# Run frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Email Configuration (for OTP)

To enable email OTP functionality:

1. **Use Gmail** (recommended for testing)
2. **Enable 2-Factor Authentication** on your Google account
3. **Generate App Password**:
   - Go to Google Account → Security
   - Select "2-Step Verification" → "App passwords"
   - Generate password for "Mail" on "Windows Computer"
4. **Add to `.env`**:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

## 👥 User Roles & Test Accounts

After starting the application, register users with different roles:

### Lab Technician
- Can create draft reports
- Can view finalized reports
- Cannot approve reports

### Lab Director
- Can create and approve reports
- Can digitally sign reports (requires OTP)
- Can view audit logs
- Automatically gets RSA key pair on registration

### Police/DA
- Read-only access to finalized reports
- Cannot modify any data

### Creating Test Users

```javascript
// Register via API or frontend
POST /api/auth/register
{
  "username": "tech1",
  "email": "tech@example.com",
  "password": "password123",
  "fullName": "John Technician",
  "role": "technician"
}

// Director
{
  "username": "director1",
  "email": "director@example.com",
  "password": "password123",
  "fullName": "Dr. Jane Director",
  "role": "director"
}

// Police
{
  "username": "police1",
  "email": "police@example.com",
  "password": "password123",
  "fullName": "Officer Mike",
  "role": "police"
}
```

## 📊 Access Control Matrix

| Role | Draft Results | Final Reports | Audit Logs |
|------|---------------|---------------|------------|
| **Technician** | Read, Write | Read Only | No Access |
| **Director** | Read, Write | Read, Approve, Sign | Read Only |
| **Police** | No Access | Read Only | No Access |

## 🔄 Workflow Example

### 1. Technician Creates Report

```javascript
POST /api/reports
{
  "caseId": "CASE-2026-001",
  "suspectName": "John Doe",
  "suspectId": "ID-12345",
  "bloodAlcoholContent": "0.08%",
  "drugType": "Cocaine",
  "sampleCollectionDate": "2026-01-27",
  "testMethod": "Gas Chromatography-Mass Spectrometry",
  "chromatogramImage": "data:image/png;base64,..."
}
```

- Sensitive data is automatically encrypted with AES-256
- Report status: `draft`

### 2. Director Reviews and Approves

```javascript
// Step 1: Request OTP
POST /api/auth/request-otp
// OTP sent to director's email

// Step 2: Verify OTP
POST /api/auth/verify-otp
{ "otp": "123456" }

// Step 3: Finalize report
POST /api/reports/:id/finalize
```

- Creates SHA-256 hash of report data
- Signs hash with Director's RSA private key
- Report status changes to `finalized`
- Report becomes tamper-proof

### 3. Police Views Finalized Report

```javascript
GET /api/reports/:id
// Returns decrypted data for finalized reports
// Includes digital signature for verification
```

### 4. Verify Report Integrity

```javascript
GET /api/reports/:id/verify
// Returns:
{
  "isValid": true,
  "message": "Report is authentic and has not been tampered with."
}
```

## 🛡️ Security Features Demonstration

### Password Hashing (Component 4A)
```javascript
// Automatic on user registration
// bcrypt with unique salt per user
// Stored: { salt: "random_salt", password: "hashed_password" }
```

### AES-256 Encryption (Component 3)
```javascript
// Encrypt sensitive data
const encrypted = encryptionService.encrypt("0.08%", caseId);
// Result: "U2FsdGVkX1+..."

// Decrypt when authorized
const decrypted = encryptionService.decrypt(encrypted, caseId);
// Result: "0.08%"
```

### Digital Signature (Component 4B)
```javascript
// Sign report
const hash = SHA256(reportData);
const signature = RSA.encrypt(hash, privateKey);

// Verify later
const isValid = RSA.decrypt(signature, publicKey) === currentHash;
```

### Base64 Encoding (Component 5)
```javascript
// Upload chromatogram image
const base64 = btoa(binaryData);
// Store in database
// Display: <img src={data:image/png;base64,${base64}} />
```

## 📚  API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (Single-Factor)
- `POST /api/auth/request-otp` - Request OTP (Multi-Factor)
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile

### Report Endpoints

- `POST /api/reports` - Create new report
- `GET /api/reports` - Get all reports (filtered by role)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports/:id/finalize` - Finalize and sign report (Directors only)
- `GET /api/reports/:id/verify` - Verify report integrity

### Audit Endpoints

- `GET /api/audit` - Get audit logs (Directors only)
- `GET /api/audit/stats` - Get audit statistics

## 🎨 Frontend Pages

1. **Landing Page** - Project introduction
2. **Login/Register** - Authentication forms
3. **Dashboard** - Overview with role-specific features
4. **Reports List** - View all reports
5. **Create Report** - Form with image upload
6. **Report Details** - View with verification status
7. **Audit Logs** - Activity tracking (Directors only)

## 🧪 Testing the Application

### Test Scenario 1: Complete Workflow

1. Register as Technician
2. Create a draft report with test data
3. Register as Director  
4. Login as Director
5. View the draft report
6. Click "Finalize & Sign"
7. Enter OTP from email
8. Report is now signed and tamper-proof
9. Logout and login as Police
10. View finalized report (read-only)
11. Verify report integrity

### Test Scenario 2: Tamper Detection

1. Manually modify encrypted data in MongoDB
2. Try to verify report
3. System detects tampering (hash mismatch)

### Test Scenario 3: Access Control

1. Login as Technician
2. Try to access `/api/audit` (should get 403 Forbidden)
3. Try to finalize a report (should get 403 Forbidden)

## 📖 Theory Components

### Component 5B: Security Levels & Risks

**Base64 Encoding:**
- **Security Level**: LOW
- **Confidentiality**: NONE (easily decoded)
- **Integrity**: NONE (can be modified)
- **Purpose**: Data representation, NOT encryption

### Component 5C: Possible Attacks

1. **Base64 Injection / Data Bloat**
   - Attack: Upload massive Base64 files to crash server
   - Mitigation: File size limits (implemented: 50MB limit)

2. **XSS via Base64**
   - Attack: Inject scripts in Base64 data
   - Mitigation: Proper Content-Type headers

3. **MIME Confusion**
   - Attack: Change MIME type to execute malicious content
   - Mitigation: Validate file signatures

## 🏗️ Project Structure

```
FOCS Project 2.0/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── reportController.js
│   │   └── auditController.js
│   ├── middleware/
│   │   └── auth.js (Access Control Matrix)
│   ├── models/
│   │   ├── User.js
│   │   ├── Report.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── reportRoutes.js
│   │   └── auditRoutes.js
│   ├── utils/
│   │   ├── encryption.js (AES-256 + PBKDF2)
│   │   ├── digitalSignature.js (RSA)
│   │   ├── emailService.js (OTP)
│   │   └── encoding.js (Base64)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🎯 Marks Breakdown Achievement

- ✅ **Authentication (3 marks)**: Single + Multi-Factor
- ✅ **Authorization (3 marks)**: Access Control Matrix + Policy
- ✅ **Encryption (3 marks)**: PBKDF2 + AES-256
- ✅ **Hashing & Signature (3 marks)**: Bcrypt + RSA
- ✅ **Encoding (3 marks)**: Base64 + Theory
- ✅ **Audit Logging**: Complete tracking system

**Total**: 15/15 technical marks + Viva preparation

## 🎤 Viva Preparation

### Key Concepts to Explain:

1. **Why use salt with bcrypt?**
   - Prevents rainbow table attacks
   - Each user has unique salt
   - Same password = different hashes

2. **Difference between encryption and encoding?**
   - Encryption: Confidentiality, requires key
   - Encoding: Representation, easily reversible
   - Base64 is NOT secure

3. **How does digital signature work?**
   - Hash document (SHA-256)
   - Encrypt hash with private key = signature
   - Anyone can verify with public key
   - Proves authenticity and integrity

4. **Why PBKDF2 for key derivation?**
   - Deterministic (same input = same key)
   - Computationally expensive (prevents brute force)
   - Uses salt (case ID) for uniqueness

5. **Access Control Matrix justification?**
   - Separation of Duties: Technicians can't approve own work
   - Least Privilege: Police can only read, not modify
   - Accountability: Directors can't modify logs

## 🚨 Important Notes

1. **Do NOT use in production** without proper security audit
2. **Email OTP**: Configure Gmail app password for demo
3. **MongoDB**: Make sure it's running before starting backend
4. **CORS**: Frontend and backend must match configured URLs
5. **File upload**: 50MB limit for Base64 images

## 📝 License

This is an academic project for FOCS demonstration purposes.

## 👨‍💻 Author

Created for FOCS Project - Secure Crime Lab Toxicology Portal

---

**Happy Coding! 🚀🔐**
