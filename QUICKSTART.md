# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed (`node --version`)
- ✅ MongoDB installed and running
- ✅ Gmail account with App Password configured

## Step-by-Step Setup

### 1. Backend Setup (5 minutes)

```powershell
# Navigate to backend
cd "c:\Users\krish\Downloads\FOCS Project 2.0\backend"

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env

# Edit .env file with your settings:
# - MONGODB_URI (keep default for local: mongodb://localhost:27017/toxicology_portal)
# - JWT_SECRET (any random string)
# - MASTER_SECRET (any random string)
# - EMAIL_USER (your Gmail address)
# - EMAIL_PASS (Gmail App Password - see instructions below)

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:5000`

### 2. Frontend Setup (3 minutes)

Open a NEW terminal:

```powershell
# Navigate to frontend
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend should now be running on `http://localhost:3000`

### 3. MongoDB Setup

**Option A: Local MongoDB**
1. Download MongoDB Community Server from mongodb.com
2. Install with default settings
3. MongoDB should auto-start as a service
4. Verify: Open MongoDB Compass (included) and connect to `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Go to mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update `MONGODB_URI` in backend `.env` with your connection string

### 4. Gmail App Password Setup (for OTP emails)

1. **Enable 2FA on Google Account**:
   - Visit: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Generate App Password**:
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password

3. **Add to .env**:
   ```
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop  (replace with your app password)
   ```

## Test the Application

### Create Test Users

Visit `http://localhost:3000` and register these users:

1. **Lab Technician**:
   - Username: `tech1`
   - Email: `tech@example.com` (can be fake for drafts)
   - Password: `password123`
   - Role: Lab Technician

2. **Lab Director**:
   - Username: `director1`
   - Email: `YOUR_REAL_EMAIL@gmail.com` (MUST BE REAL for OTP)
   - Password: `password123`
   - Role: Lab Director

3. **Police**:
   - Username: `police1`
   - Email: `police@example.com`
   - Password: `password123`
   - Role: Police / District Attorney

### Complete Workflow Test

1. **Login as Technician** (tech1):
   - Click "Create Report"
   - Fill in all fields
   - Upload a sample image (any PNG/JPG)
   - Submit
   - Note: Sensitive data is encrypted with AES-256

2. **Logout and Login as Director** (director1):
   - Go to "Reports"
   - Click on the report created by technician
   - Click "Finalize & Sign"
   - **Check your email for 6-digit OTP**
   - Enter OTP
   - Report is now digitally signed with RSA-2048

3. **Logout and Login as Police** (police1):
   - Go to "Reports"
   - View the finalized report (read-only)
   - See the verification status (green checkmark)

4. **Login as Director again**:
   - Go to "Audit Logs"
   - See complete activity history

## Common Issues & Solutions

### Issue: Backend won't start
- **Solution**: Make sure MongoDB is running
- **Check**: In terminal run `mongod --version` or check Windows Services for "MongoDB Server"

### Issue: "Port 5000 already in use"
- **Solution**: Change PORT in backend `.env` to 5001, and update `VITE_API_URL` in frontend

### Issue: OTP email not received
- **Solution**: Double-check Gmail App Password is correctly set in `.env`
- **Alternative**: Check spam folder
- **Debug**: Look at backend terminal logs for email sending errors

### Issue: "Cannot connect to database"
- **Solution**: Start MongoDB service or update MONGODB_URI in `.env`

### Issue: Frontend can't connect to backend
- **Solution**: Make sure backend is running on port 5000. Check CORS settings.

## Project Structure Quick Reference

```
backend/
├── models/          # User, Report, AuditLog schemas
├── controllers/     # Business logic
├── middleware/      # Authentication & Authorization
├── routes/          # API endpoints
└── utils/           # Encryption, Signatures, Email, Encoding

frontend/
├── pages/           # React pages (Login, Dashboard, Reports, etc.)
├── components/      # Reusable UI components
├── context/         # Global state (Auth)
└── utils/           # API configuration
```

## API Endpoints Quick Reference

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/request-otp` - Request OTP for MFA
- `POST /api/auth/verify-otp` - Verify OTP

### Reports
- `POST /api/reports` - Create report
- `GET /api/reports` - Get all reports (filtered by role)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports/:id/finalize` - Finalize & sign (Directors only)
- `GET /api/reports/:id/verify` - Verify integrity

### Audit
- `GET /api/audit` - Get logs (Directors only)
- `GET /api/audit/stats` - Get statistics

## Security Components Checklist

Before your viva, verify all components are working:

- ✅ **Authentication**: Can login with username/password
- ✅ **Multi-Factor Auth**: OTP email received when finalizing report
- ✅ **Access Control**: Different permissions for each role
- ✅ **Encryption**: Blood alcohol content shows encrypted in DB
- ✅ **Hashing**: Passwords are hashed (check MongoDB)
- ✅ **Digital Signature**: Finalized reports show signature hash
- ✅ **Base64 Encoding**: Images display correctly
- ✅ **Audit Logs**: All actions are logged

## For Your Viva

### Be prepared to explain:

1. **Authentication Flow**:
   - How bcrypt + salt works
   - When and why OTP is required

2. **Authorization**:
   - Access Control Matrix (3x3 table)
   - Why each role has specific permissions

3. **Encryption**:
   - Difference between encryption and encoding
   - How PBKDF2 generates keys
   - Why Case ID is used as salt

4. **Digital Signature**:
   - How hash ensures integrity
   - How RSA signature proves authenticity
   - What happens if report is tampered

5. **Base64 Encoding**:
   - Why it's NOT encryption
   - Security risks (XSS, DoS)
   - Proper use cases

### Demo Sequence:

1. Show the landing page (security features)
2. Register a Director account
3. Create a report (show encryption happening)
4. Finalize report (show OTP email on screen)
5. Verify report integrity (show green checkmark)
6. Show audit logs
7. Explain Access Control Matrix

## Need Help?

Check the main README.md for detailed documentation.

---

**You're all set! 🎉**

Open `http://localhost:3000` in your browser and start testing!
