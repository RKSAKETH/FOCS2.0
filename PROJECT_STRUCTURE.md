# 🏗️ Complete Project Structure

## 📂 Directory Tree

```
FOCS Project 2.0/
│
├── 📄 .gitignore                          # Git ignore file
├── 📄 README.md                           # Main documentation
├── 📄 QUICKSTART.md                       # Quick setup guide
├── 📄 PROJECT_SUMMARY.md                  # Security components explained (FOR VIVA)
├── 📄 CHECKLIST.md                        # Pre-viva checklist
├── 📄 setup.ps1                           # Automated setup script
│
├── 📁 backend/                            # Node.js + Express Backend
│   ├── 📄 .env.example                    # Environment variables template
│   ├── 📄 package.json                    # Backend dependencies
│   ├── 📄 server.js                       # Main Express server
│   │
│   ├── 📁 config/
│   │   └── database.js                    # MongoDB connection
│   │
│   ├── 📁 models/                         # MongoDB Schemas
│   │   ├── User.js                        # ✅ Component 4A: Bcrypt hashing
│   │   ├── Report.js                      # Report schema with encrypted fields
│   │   └── AuditLog.js                    # Audit trail schema
│   │
│   ├── 📁 controllers/                    # Business Logic
│   │   ├── authController.js              # ✅ Component 1A & 1B: Auth + OTP
│   │   ├── reportController.js            # ✅ Components 3, 4B, 5: Encryption, Signature, Encoding
│   │   └── auditController.js             # Audit log queries
│   │
│   ├── 📁 middleware/
│   │   └── auth.js                        # ✅ Component 2: Access Control Matrix
│   │
│   ├── 📁 routes/                         # API Endpoints
│   │   ├── authRoutes.js                  # /api/auth/*
│   │   ├── reportRoutes.js                # /api/reports/*
│   │   └── auditRoutes.js                 # /api/audit/*
│   │
│   └── 📁 utils/                          # Security Services
│       ├── encryption.js                  # ✅ Component 3: PBKDF2 + AES-256
│       ├── digitalSignature.js            # ✅ Component 4B: RSA signatures
│       ├── emailService.js                # ✅ Component 1B: OTP emails
│       └── encoding.js                    # ✅ Component 5: Base64 + security analysis
│
└── 📁 frontend/                           # React + Vite + Tailwind Frontend
    ├── 📄 .env.example                    # Frontend environment variables
    ├── 📄 package.json                    # Frontend dependencies
    ├── 📄 index.html                      # HTML entry point
    ├── 📄 vite.config.js                  # Vite configuration
    ├── 📄 tailwind.config.js              # Tailwind CSS config
    ├── 📄 postcss.config.js               # PostCSS config
    │
    └── 📁 src/
        ├── 📄 main.jsx                    # React entry point
        ├── 📄 App.jsx                     # Main app with routing
        ├── 📄 index.css                   # Global styles (Tailwind + custom)
        │
        ├── 📁 context/
        │   └── AuthContext.jsx            # Global authentication state
        │
        ├── 📁 utils/
        │   └── api.js                     # Axios API configuration
        │
        └── 📁 pages/                      # React Pages
            ├── LandingPage.jsx            # Home page
            ├── Login.jsx                  # ✅ Component 1A UI
            ├── Register.jsx               # User registration
            ├── Dashboard.jsx              # User dashboard with permissions
            ├── Reports.jsx                # Reports list
            ├── CreateReport.jsx           # ✅ Component 5 UI: Base64 encoding
            ├── ReportDetails.jsx          # ✅ Component 1B & 4B UI: OTP + Signature
            └── AuditLogs.jsx              # ✅ Component 2 UI: Audit logs (Directors only)
```

---

## 🔐 Security Components Mapping

### Component 1: Authentication (3 marks)

#### 1A: Single-Factor Authentication (1.5 marks)
**Files**:
- **Backend**: `controllers/authController.js` → `login()` function
- **Backend**: `models/User.js` → Bcrypt password hashing
- **Frontend**: `pages/Login.jsx` → Login form

**Endpoints**:
- `POST /api/auth/login` - Username/password login
- Returns JWT token

**Evidence**:
- Username/password form
- JWT token in response
- Hashed passwords in MongoDB

---

#### 1B: Multi-Factor Authentication (1.5 marks)
**Files**:
- **Backend**: `utils/emailService.js` → OTP generation & email
- **Backend**: `controllers/authController.js` → `requestOTP()`, `verifyOTP()`
- **Frontend**: `pages/ReportDetails.jsx` → OTP modal

**Endpoints**:
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP

**Evidence**:
- OTP email screenshot
- 6-digit code entry
- 5-minute expiration

---

### Component 2: Authorization - Access Control (3 marks)

#### 2A: Access Control Matrix (1.5 marks)
**Files**:
- **Backend**: `middleware/auth.js` → `ACCESS_CONTROL_MATRIX` constant
- **Frontend**: `pages/Dashboard.jsx` → Display permissions

**Matrix**:
```javascript
{
  technician: { draft_results: ['read','write'], final_report: ['read'], user_audit_logs: [] },
  director: { draft_results: ['read','write'], final_report: ['read','approve','sign'], user_audit_logs: ['read'] },
  police: { draft_results: [], final_report: ['read'], user_audit_logs: [] }
}
```

**Evidence**:
- 403 errors when accessing unauthorized resources
- Dashboard showing role-specific permissions

---

#### 2B: Policy Implementation (1.5 marks)
**Files**:
- **Backend**: `middleware/auth.js` → `authorize()` middleware
- **Backend**: `routes/reportRoutes.js` → Applied to routes

**Justifications**:
- **Technician**: Write drafts (data entry), cannot approve (separation of duties)
- **Director**: Approve/sign (highest authority), cannot modify logs (accountability)
- **Police**: Read-only (prevent evidence tampering)

**Evidence**:
- Middleware code showing policy enforcement
- Documentation of justifications

---

### Component 3: Encryption (3 marks)

#### 3A: Key Exchange - PBKDF2 (1.5 marks)
**Files**:
- **Backend**: `utils/encryption.js` → `generateKey()` function

**Implementation**:
```javascript
generateKey(caseId) {
  return crypto.pbkdf2Sync(masterSecret, caseId, 100000, 32, 'sha256');
}
```

**Evidence**:
- PBKDF2 code visible
- Case ID used as salt
- 100,000 iterations configured

---

#### 3B: AES-256 Encryption (1.5 marks)
**Files**:
- **Backend**: `utils/encryption.js` → `encrypt()`, `decrypt()`
- **Backend**: `controllers/reportController.js` → Auto-encrypt on create

**Encrypted Fields**:
- `bloodAlcoholContent`
- `drugType`

**Evidence**:
- MongoDB showing "U2FsdGVkX1..." ciphertext
- Decrypted data displaying correctly in UI

---

### Component 4: Hashing & Digital Signature (3 marks)

#### 4A: Hashing with Salt (1.5 marks)
**Files**:
- **Backend**: `models/User.js` → Mongoose pre-save middleware

**Implementation**:
```javascript
userSchema.pre('save', async function(next) {
  this.salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, this.salt);
});
```

**Evidence**:
- MongoDB Users collection showing hashed passwords
- Each user has unique salt
- Same password → different hashes

---

#### 4B: Digital Signature (1.5 marks)
**Files**:
- **Backend**: `utils/digitalSignature.js` → RSA signing & verification
- **Backend**: `controllers/reportController.js` → `finalizeReport()`
- **Frontend**: `pages/ReportDetails.jsx` → Verification display

**Process**:
1. SHA-256 hash of report
2. RSA-2048 encrypt hash with private key
3. Store signature + hash + public key
4. Verify using public key

**Evidence**:
- Green checkmark for valid signatures
- Red X for tampered reports
- Hash visible in report details

---

### Component 5: Encoding Techniques (3 marks)

#### 5A: Base64 Implementation (1 mark)
**Files**:
- **Backend**: `utils/encoding.js` → `encodeToBase64()`, `decodeFromBase64()`
- **Frontend**: `pages/CreateReport.jsx` → Image upload with Base64

**Use Case**: Chromatogram images

**Evidence**:
- Image file upload
- Base64 string in MongoDB
- Image displays in report details

---

#### 5B: Security Levels (Theory) (1 mark)
**File**: `utils/encoding.js` → `getSecurityInfo()`

**Key Points**:
- Security Level: LOW
- Confidentiality: NONE
- NOT encryption
- Easily reversible

**Evidence**:
- Documentation in code
- Can explain verbally

---

#### 5C: Possible Attacks (Theory) (1 mark)
**File**: `utils/encoding.js` → `getSecurityInfo().possibleAttacks`

**Attacks**:
1. Base64 Injection / Data Bloat (DoS)
2. XSS via Base64
3. MIME Confusion

**Evidence**:
- 50MB file size limit implemented
- Attack descriptions in code
- Mitigations documented

---

## 🎯 API Endpoints Reference

### Authentication Endpoints
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login (Component 1A)
POST   /api/auth/request-otp        # Request OTP (Component 1B)
POST   /api/auth/verify-otp         # Verify OTP (Component 1B)
GET    /api/auth/profile            # Get user profile
```

### Report Endpoints
```
POST   /api/reports                 # Create report (Component 3)
GET    /api/reports                 # Get all reports (filtered by role)
GET    /api/reports/:id             # Get single report
POST   /api/reports/:id/finalize    # Finalize & sign (Component 4B)
GET    /api/reports/:id/verify      # Verify signature
GET    /api/reports/info/encoding   # Get Base64 security info (Component 5)
```

### Audit Endpoints
```
GET    /api/audit                   # Get audit logs (Directors only)
GET    /api/audit/stats             # Get statistics
```

---

## 🖥️ Frontend Pages Reference

| Page | Route | Purpose | Components Demonstrated |
|------|-------|---------|------------------------|
| **LandingPage** | `/` | Home page | Security features overview |
| **Login** | `/login` | User login | Component 1A |
| **Register** | `/register` | User registration | Component 4A (password hashing) |
| **Dashboard** | `/dashboard` | Main dashboard | Component 2 (Access Control Matrix) |
| **Reports** | `/reports` | List reports | Authorization filtering |
| **CreateReport** | `/reports/create` | Create new report | Component 3 (Encryption), Component 5A (Base64) |
| **ReportDetails** | `/reports/:id` | View report details | Component 1B (OTP), Component 4B (Signature) |
| **AuditLogs** | `/audit` | View audit logs | Component 2 (Directors only) |

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Bcryptjs
- **Encryption**: Crypto (built-in), CryptoJS
- **Digital Signatures**: NodeRSA
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Notifications**: React Toastify

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (bcrypt hash),
  salt: String (unique per user),
  role: Enum ['technician', 'director', 'police'],
  fullName: String,
  publicKey: String (RSA, for directors),
  privateKey: String (RSA, for directors),
  otp: { code: String, expiresAt: Date },
  createdAt: Date
}
```

### Reports Collection
```javascript
{
  _id: ObjectId,
  caseId: String (unique),
  suspectName: String,
  suspectId: String,
  bloodAlcoholContent: String (AES-256 encrypted),
  drugType: String (AES-256 encrypted),
  sampleCollectionDate: Date,
  testDate: Date,
  testMethod: String,
  chromatogramImage: String (Base64),
  status: Enum ['draft', 'finalized'],
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),
  digitalSignature: {
    signature: String (RSA encrypted hash),
    hash: String (SHA-256),
    signedAt: Date,
    signerPublicKey: String
  },
  createdAt: Date,
  finalizedAt: Date
}
```

### AuditLogs Collection
```javascript
{
  _id: ObjectId,
  action: Enum ['create', 'read', 'update', 'delete', 'approve', 'login'],
  resource: Enum ['draft_results', 'final_report', 'user_account'],
  userId: ObjectId (ref: User),
  userRole: String,
  resourceId: String,
  details: String,
  ipAddress: String,
  timestamp: Date
}
```

---

## 📝 Quick Command Reference

### Setup
```powershell
# Run setup script
powershell -ExecutionPolicy Bypass -File setup.ps1

# Or manual setup:
cd backend && npm install
cd ../frontend && npm install
```

### Development
```powershell
# Terminal 1: Backend
cd "c:\Users\krish\Downloads\FOCS Project 2.0\backend"
npm run dev

# Terminal 2: Frontend
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
npm run dev
```

### Access
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API Docs: `http://localhost:5000/api/health`

---

## ✅ Files Created

**Total Files**: 30+

**Documentation**: 5
- README.md
- QUICKSTART.md
- PROJECT_SUMMARY.md  
- CHECKLIST.md
- PROJECT_STRUCTURE.md (this file)

**Backend**: 15
- Main: server.js, package.json, .env.example
- Config: database.js
- Models: User.js, Report.js, AuditLog.js
- Controllers: authController.js, reportController.js, auditController.js
- Middleware: auth.js
- Routes: authRoutes.js, reportRoutes.js, auditRoutes.js
- Utils: encryption.js, digitalSignature.js, emailService.js, encoding.js

**Frontend**: 15+
- Main: index.html, vite.config.js, package.json, tailwind.config.js
- Source: main.jsx, App.jsx, index.css
- Context: AuthContext.jsx
- Utils: api.js
- Pages: LandingPage.jsx, Login.jsx, Register.jsx, Dashboard.jsx, Reports.jsx, CreateReport.jsx, ReportDetails.jsx, AuditLogs.jsx

**Scripts**: 1
- setup.ps1

---

**This is a complete, production-ready MERN stack application with comprehensive security features! 🚀**
