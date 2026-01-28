# ✅ FOCS Project Implementation Checklist

## Before Submission / Viva

### 📦 Installation & Setup
- [ ] Node.js installed (v16+)
- [ ] MongoDB installed and running (or Atlas configured)
- [ ] Backend `.env` configured with:
  - [ ] `JWT_SECRET` set
  - [ ] `MASTER_SECRET` set
  - [ ] `EMAIL_USER` (Gmail) set
  - [ ] `EMAIL_PASS` (Gmail App Password) set
  - [ ] `MONGODB_URI` set
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend runs successfully (`npm run dev`)
- [ ] Frontend runs successfully (`npm run dev`)

### 🧪 Testing All Components

#### Component 1: Authentication (3 marks)
- [ ] **1A: Single-Factor Auth (1.5 marks)**
  - [ ] Can register new user
  - [ ] Can login with username/password
  - [ ] Password is hashed in MongoDB (check with Compass)
  - [ ] JWT token generated on login
  - [ ] Invalid credentials rejected

- [ ] **1B: Multi-Factor Auth (1.5 marks)**
  - [ ] OTP email sends when Director finalizes report
  - [ ] OTP is 6-digit code
  - [ ] OTP expires after 5 minutes
  - [ ] Can verify OTP successfully
  - [ ] Invalid OTP rejected

#### Component 2: Authorization (3 marks)
- [ ] **2A: Access Control Matrix (1.5 marks)**
  - [ ] Technician can create drafts
  - [ ] Technician CANNOT finalize reports (403 error)
  - [ ] Technician CANNOT view audit logs (403 error)
  - [ ] Director can finalize reports
  - [ ] Director can view audit logs
  - [ ] Police can ONLY view finalized reports
  - [ ] Police CANNOT create reports (403 error)
  - [ ] Police CANNOT view audit logs (403 error)

- [ ] **2B: Policy Implementation (1.5 marks)**
  - [ ] Access Control Matrix visible in code (`backend/middleware/auth.js`)
  - [ ] Can explain justification for each role's permissions
  - [ ] Dashboard shows user's specific permissions

#### Component 3: Encryption (3 marks)
- [ ] **3A: Key Exchange - PBKDF2 (1.5 marks)**
  - [ ] PBKDF2 implementation visible in `backend/utils/encryption.js`
  - [ ] Uses Case ID as salt
  - [ ] 100,000 iterations configured
  - [ ] Can explain why PBKDF2 is used

- [ ] **3B: AES-256 Encryption (1.5 marks)**
  - [ ] Blood Alcohol Content field is encrypted in MongoDB
  - [ ] Drug Type field is encrypted in MongoDB
  - [ ] Encrypted data looks like: "U2FsdGVkX1..."
  - [ ] Data decrypts correctly when viewing report
  - [ ] Different case IDs generate different ciphertexts

#### Component 4: Hashing & Digital Signature (3 marks)
- [ ] **4A: Hashing with Salt (1.5 marks)**
  - [ ] Passwords stored as hashes in MongoDB
  - [ ] Each user has unique salt
  - [ ] Same password produces different hashes for different users
  - [ ] Can explain how bcrypt prevents rainbow tables

- [ ] **4B: Digital Signature (1.5 marks)**
  - [ ] Director generates RSA key pair on registration
  - [ ] Finalized reports have digital signature field
  - [ ] Signature includes hash and encrypted signature
  - [ ] Verification shows green checkmark for valid reports
  - [ ] Tampering with report fails verification (red X)
  - [ ] Can explain RSA signing process

#### Component 5: Encoding (3 marks)
- [ ] **5A: Base64 Implementation (1 mark)**
  - [ ] Can upload image when creating report
  - [ ] Image is Base64 encoded in frontend
  - [ ] Image stored as Base64 string in MongoDB
  - [ ] Image displays correctly in report details

- [ ] **5B: Security Levels (Theory) (1 mark)**
  - [ ] Can explain that Base64 is NOT encryption
  - [ ] Can state confidentiality level is NONE
  - [ ] Can explain difference between encoding and encryption

- [ ] **5C: Possible Attacks (Theory) (1 mark)**
  - [ ] Can describe Base64 Injection/Data Bloat attack
  - [ ] Can explain XSS via Base64 attack
  - [ ] Can explain MIME Confusion attack
  - [ ] Can explain mitigations for each attack
  - [ ] File size limit is implemented (50MB)

#### Bonus: Audit Logging
- [ ] All actions are logged
- [ ] Logs include: action, user, role, resource, timestamp
- [ ] Only Directors can view logs
- [ ] Can view audit statistics

### 📁 Code Quality Checklist
- [ ] All files have proper comments
- [ ] No hardcoded passwords or secrets in code
- [ ] `.env.example` files provided (not `.env` with real credentials)
- [ ] `.gitignore` excludes `node_modules/` and `.env`
- [ ] Code follows clean architecture (models, controllers, routes)
- [ ] Error handling implemented
- [ ] Input validation in place

### 📚 Documentation Checklist
- [ ] `README.md` complete with setup instructions
- [ ] `QUICKSTART.md` provides step-by-step guide
- [ ] `PROJECT_SUMMARY.md` explains all components
- [ ] Comments in code explain security implementations
- [ ] Access Control Matrix documented
- [ ] API endpoints documented

### 🎤 Viva Preparation Checklist

#### Must Know Concepts
- [ ] Difference between encryption and encoding
- [ ] Difference between hashing and encryption
- [ ] How bcrypt + salt works
- [ ] How digital signatures provide integrity and authenticity
- [ ] How AES-256 encryption works
- [ ] Why PBKDF2 is used for key derivation
- [ ] Purpose of Access Control Matrix
- [ ] Separation of Duties principle
- [ ] Least Privilege principle
- [ ] Why Base64 is not secure

#### Demo Preparation
- [ ] Backend can start without errors
- [ ] Frontend can start without errors
- [ ] MongoDB is running
- [ ] Have test accounts ready (technician, director, police)
- [ ] Have real email configured for OTP demo
- [ ] Can show complete workflow in 5-7 minutes
- [ ] Can show encrypted data in MongoDB Compass
- [ ] Can show OTP email on screen
- [ ] Can demonstrate tamper detection

#### Questions You Should Be Able to Answer
- [ ] "Explain your Access Control Matrix"
- [ ] "Why use salt with bcrypt?"
- [ ] "How does digital signature work?"
- [ ] "What's the difference between encryption and encoding?"
- [ ] "Why use PBKDF2 instead of using master secret directly?"
- [ ] "What happens if someone tampers with a signed report?"
- [ ] "Explain possible attacks on Base64"
- [ ] "Why can't technicians approve their own reports?"
- [ ] "How does OTP provide multi-factor authentication?"
- [ ] "Walk me through the complete security workflow"

### 🚀 Final Pre-Viva Checklist

24 Hours Before:
- [ ] Run complete test of all features
- [ ] Verify email OTP is working
- [ ] Prepare MongoDB with sample data
- [ ] Review PROJECT_SUMMARY.md
- [ ] Practice demo timing (7 minutes max)
- [ ] Test on fresh browser (clear cache)

1 Hour Before:
- [ ] Start MongoDB service
- [ ] Start backend (`npm run dev`)
- [ ] Start frontend (`npm run dev`)
- [ ] Open MongoDB Compass
- [ ] Open email account for OTP
- [ ] Have code editor open to show implementations
- [ ] Test one complete workflow
- [ ] Clear browser history/cache for clean demo

During Demo:
- [ ] Show landing page (30 sec)
- [ ] Register Director with real email (30 sec)
- [ ] Create report with encryption (90 sec)
- [ ] Finalize with OTP - SHOW EMAIL (2 min)
- [ ] Show verification status (60 sec)
- [ ] Show audit logs (30 sec)
- [ ] Explain Access Control Matrix (60 sec)
- [ ] Show code for one component (60 sec)

### 📊 Expected Questions Map

| Topic | Your Evidence |
|-------|---------------|
| Authentication | Login page + JWT token in Network tab |
| Multi-Factor | OTP email on screen |
| Access Control | Dashboard showing permissions |
| Encryption | MongoDB showing "U2FsdGVkX1..." |
| Hashing | MongoDB showing different hashes for same password |
| Digital Signature | Green checkmark + hash display |
| Base64 | Image in chromatogram field |
| Audit Logs | Logs page with activity history |

### 🎯 Marks Claim Checklist

Before claiming marks for each component, ensure:

**Component 1A (1.5 marks)**:
- [ ] Login works with username/password
- [ ] Password is hashed with bcrypt + salt
- [ ] Code visible in `authController.js`

**Component 1B (1.5 marks)**:
- [ ] OTP sends to email
- [ ] OTP verification works
- [ ] Code visible in `emailService.js`

**Component 2A (1.5 marks)**:
- [ ] Access Control Matrix implemented
- [ ] 3 roles, 3 resources
- [ ] Code visible in `auth.js` middleware

**Component 2B (1.5 marks)**:
- [ ] Can justify each permission
- [ ] Middleware enforces policies
- [ ] Returns 403 for unauthorized access

**Component 3A (1.5 marks)**:
- [ ] PBKDF2 implementation visible
- [ ] Uses case ID as salt
- [ ] Code in `encryption.js`

**Component 3B (1.5 marks)**:
- [ ] AES-256 encrypts sensitive fields
- [ ] Data decrypts correctly
- [ ] Code in `encryption.js`

**Component 4A (1.5 marks)**:
- [ ] Bcrypt hashing implemented
- [ ] Unique salt per user
- [ ] Code in `User.js` model

**Component 4B (1.5 marks)**:
- [ ] RSA-2048 signatures work
- [ ] SHA-256 hash created
- [ ] Code in `digitalSignature.js`

**Component 5A (1 mark)**:
- [ ] Base64 encoding works
- [ ] Images display correctly
- [ ] Code in `encoding.js`

**Component 5B (1 mark)**:
- [ ] Can explain security levels
- [ ] Document in code or docs
- [ ] Understand limitations

**Component 5C (1 mark)**:
- [ ] Can explain 3+ attacks
- [ ] Can explain mitigations
- [ ] Documentation exists

### 🏆 Success Criteria

You're ready for viva when:
- [ ] All checkboxes above are ticked
- [ ] Can demo complete workflow in under 7 minutes
- [ ] Can answer all viva questions confidently
- [ ] Can show code for any component on demand
- [ ] Email OTP works reliably
- [ ] No errors in console logs
- [ ] All security components are visible and working

---

## 🎓 Final Confidence Check

Rate your confidence (1-5) for each:

- [ ] I can explain the entire system architecture: __/5
- [ ] I can demo all security features: __/5
- [ ] I can answer viva questions: __/5
- [ ] I can show relevant code quickly: __/5
- [ ] I can explain Access Control Matrix: __/5
- [ ] I can explain encryption vs encoding: __/5
- [ ] I can explain digital signatures: __/5
- [ ] I understand all attacks and mitigations: __/5

**Target: All above 4/5**

If any below 4: Review PROJECT_SUMMARY.md section for that topic

---

## 📞 Quick Reference Commands

**Start Backend**:
```powershell
cd "c:\Users\krish\Downloads\FOCS Project 2.0\backend"
npm run dev
```

**Start Frontend**:
```powershell
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
npm run dev
```

**View MongoDB Data**:
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- Database: `toxicology_portal`
- Collections: `users`, `reports`, `auditlogs`

**Open Application**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

---

**Good luck! You've got this! 🚀**
