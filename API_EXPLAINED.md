# 🌐 What is https://focs2-0.onrender.com/api?

## Simple Answer:
**This is your backend API's base URL** - it's where your deployed frontend sends all requests to interact with your database, authentication, reports, etc.

---

## 🏗️ Your Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                         │
└─────────────────────────────────────────────────────────────┘

Frontend (Vercel)                        Backend (Render)
─────────────────                        ────────────────
🌐 User's Browser                        ☁️ Server
└─> React App                            └─> Node.js/Express
    └─> Makes requests to ────────────> API Endpoints
                                         └─> MongoDB Database

URL:                                     URL:
https://focs-2-0-                       https://focs2-0
fv44b3rj5-...vercel.app                .onrender.com/api
```

---

## 📍 Breaking Down the URL

```
https://focs2-0.onrender.com/api
│      │        │            │
│      │        │            └─> API path prefix
│      │        └─> Render's domain
│      └─> Your service name on Render
└─> Secure HTTPS protocol
```

**What it means:**
- **focs2-0** = Your backend service name on Render
- **onrender.com** = Render's hosting platform
- **/api** = All your API routes start with this prefix

---

## 🔌 Available API Endpoints

Your backend exposes these endpoints:

### **Health Check**
```
GET https://focs2-0.onrender.com/api/health
```
Returns server status and security features info

### **Authentication**
```
POST https://focs2-0.onrender.com/api/auth/register
POST https://focs2-0.onrender.com/api/auth/login
POST https://focs2-0.onrender.com/api/auth/request-otp
POST https://focs2-0.onrender.com/api/auth/verify-otp
```

### **Reports**
```
GET    https://focs2-0.onrender.com/api/reports
POST   https://focs2-0.onrender.com/api/reports
GET    https://focs2-0.onrender.com/api/reports/:id
DELETE https://focs2-0.onrender.com/api/reports/:id
```

### **Audit Logs**
```
GET https://focs2-0.onrender.com/api/audit
```

---

## 🔗 How Frontend Uses This

In your frontend code (`frontend/src/utils/api.js`):

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
//                                                 ↑ Local dev fallback

const api = axios.create({
    baseURL: API_URL,  // Uses: https://focs2-0.onrender.com/api
    headers: {
        'Content-Type': 'application/json'
    }
});
```

**When you make requests:**
```javascript
// In your React components:
api.post('/auth/login', { username, password })
// Actually calls: https://focs2-0.onrender.com/api/auth/login

api.get('/reports')
// Actually calls: https://focs2-0.onrender.com/api/reports
```

---

## 🧪 Test Your API

### **Method 1: Browser**
Open in browser: https://focs2-0.onrender.com/api/health

You'll see JSON response like:
```json
{
  "success": true,
  "message": "Secure Crime Lab Toxicology Portal API is running",
  "timestamp": "2026-01-29T00:14:00.000Z",
  "components": {
    "authentication": "Single-Factor + Multi-Factor (OTP)",
    "authorization": "Access Control Matrix",
    "encryption": "AES-256 with PBKDF2",
    ...
  }
}
```

### **Method 2: PowerShell**
```powershell
Invoke-RestMethod https://focs2-0.onrender.com/api/health
```

### **Method 3: curl**
```bash
curl https://focs2-0.onrender.com/api/health
```

---

## 📊 Environment Variables

Your frontend needs to know this URL!

### **Local Development (.env)**
```
VITE_API_URL=https://focs2-0.onrender.com/api
```

### **Vercel Deployment**
Set in Vercel dashboard:
```
VITE_API_URL = https://focs2-0.onrender.com/api
```

---

## 🔄 Request Flow Example

When a user logs in:

```
1. User enters credentials in browser
   ↓
2. React sends POST request to /api/auth/login
   ↓
3. Frontend uses VITE_API_URL
   → https://focs2-0.onrender.com/api/auth/login
   ↓
4. Render backend receives request
   ↓
5. Checks database, validates credentials
   ↓
6. Sends OTP email
   ↓
7. Returns response to frontend
   ↓
8. Frontend shows OTP input screen
```

---

## 🎯 Why Two Separate Deployments?

### **Frontend (Vercel)**
- Static files (HTML, CSS, JS)
- Fast global CDN
- Client-side React app
- Free for personal projects

### **Backend (Render)**
- Node.js server
- Database connections
- API logic
- Email sending
- Authentication

**They communicate via HTTP requests!**

---

## 🔍 Current Configuration

### **Your Setup:**
```
Frontend:  https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app
           └─> Sends requests to ─┐
                                   │
Backend:   https://focs2-0.onrender.com/api
           └─> Receives requests  <─┘
```

---

## ⚙️ Where This URL Appears

### **1. Frontend .env file**
```
frontend/.env
frontend/.env.production
```

### **2. API configuration**
```
frontend/src/utils/api.js
```

### **3. Vercel environment variables**
```
Vercel Dashboard → Environment Variables
```

### **4. Backend CORS config**
```javascript
// backend/server.js
const allowedOrigins = [
    'https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app',
    // Frontend must be in allowed list!
];
```

---

## 🚨 Common Issues

### **Issue: Cannot connect to API**
**Solution:** Check VITE_API_URL is set correctly

### **Issue: CORS errors**
**Solution:** Update FRONTEND_URL on Render to match your Vercel URL

### **Issue: 500 errors**
**Solution:** Check environment variables on Render (EMAIL_*, JWT_*, etc.)

---

## ✅ Verify Everything is Connected

Run this test:

```powershell
# Test backend is alive
Invoke-RestMethod https://focs2-0.onrender.com/api/health

# Check frontend env
Get-Content "c:\Users\krish\Downloads\FOCS Project 2.0\frontend\.env"
```

Should show:
```
VITE_API_URL=https://focs2-0.onrender.com/api
```

---

## 📚 Summary

**What it is:**
- Your backend API base URL

**What it does:**
- Handles all authentication, database operations, email sending

**Who uses it:**
- Your frontend sends all requests to this URL

**Where it's configured:**
- frontend/.env
- frontend/src/utils/api.js
- Vercel environment variables

**Status:**
✅ Online and running
✅ Accessible from your Vercel frontend
✅ Ready to handle requests

---

## 🎯 Bottom Line

`https://focs2-0.onrender.com/api` is the **brain** of your application:
- Frontend = Face (what users see)
- Backend = Brain (where logic happens)
- They talk via this URL!

**Test it now:** Visit https://focs2-0.onrender.com/api/health in your browser!
