# 🚨 EMAIL OTP FIX - Environment Variables Missing on Render

## Problem:
Your backend is deployed but the email environment variables aren't configured on Render, causing the "Failed to send OTP" 500 error.

**Error:** `Email service not configured. Please configure EMAIL_USER and EMAIL_PASS in .env file`

## Solution: Add Email Environment Variables to Render

### Step-by-Step Instructions:

---

### 1. Go to Render Dashboard
URL: https://dashboard.render.com/

---

### 2. Select Your Backend Service
Click on your service: **focs2-0**

---

### 3. Navigate to Environment Tab
In the left sidebar, click **"Environment"**

---

### 4. Add These Environment Variables

Click **"Add Environment Variable"** and add each of these:

#### **Variable 1: EMAIL_HOST**
```
Key:   EMAIL_HOST
Value: smtp.gmail.com
```

#### **Variable 2: EMAIL_PORT**
```
Key:   EMAIL_PORT
Value: 465
```

#### **Variable 3: EMAIL_USER**
```
Key:   EMAIL_USER
Value: forensic.lab.portal@gmail.com
```

#### **Variable 4: EMAIL_PASS**
```
Key:   EMAIL_PASS
Value: ebuu zmvc ydnd egrd
```

#### **Variable 5: JWT_SECRET**
```
Key:   JWT_SECRET
Value: focs_toxicology_jwt_secret_2026_secure_key
```

#### **Variable 6: MASTER_SECRET**
```
Key:   MASTER_SECRET
Value: focs_aes_master_encryption_secret_2026_very_secure
```

#### **Variable 7: MONGODB_URI**
```
Key:   MONGODB_URI
Value: mongodb+srv://saketh:saketh@focscluster.ucesz7x.mongodb.net/?appName=FOCSCluster
```

#### **Variable 8: NODE_ENV**
```
Key:   NODE_ENV
Value: production
```

#### **Variable 9: FRONTEND_URL** (Update this!)
```
Key:   FRONTEND_URL
Value: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app
```

---

### 5. Save Changes
Click **"Save Changes"** at the bottom

Render will automatically redeploy your backend with these environment variables.

---

### 6. Wait for Redeployment
- Go to the **"Events"** tab
- Watch for "Deploy live" message
- Usually takes 1-2 minutes

---

### 7. Test Your Application
After deployment completes:

1. Go to: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app
2. Try to register a new user
3. OTP email should be sent successfully! ✅
4. Check your email inbox
5. Complete registration with OTP
6. Test login

---

## Quick Copy-Paste Format for Render

Here's a formatted list you can reference while adding variables:

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 465
EMAIL_USER = forensic.lab.portal@gmail.com
EMAIL_PASS = ebuu zmvc ydnd egrd
JWT_SECRET = focs_toxicology_jwt_secret_2026_secure_key
MASTER_SECRET = focs_aes_master_encryption_secret_2026_very_secure
MONGODB_URI = mongodb+srv://saketh:saketh@focscluster.ucesz7x.mongodb.net/?appName=FOCSCluster
NODE_ENV = production
FRONTEND_URL = https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app
```

---

## Why This Happens

**Local Development:**
- Your `.env` file is loaded automatically
- All environment variables work

**Production (Render):**
- `.env` file is NOT deployed (it's in `.gitignore`)
- You must manually set environment variables in Render dashboard
- This is a security best practice!

---

## Verification After Adding Variables

### Test Email Service:
Try registering a user and check:
1. No 500 errors in browser console
2. Email is sent to the registered email address
3. OTP is received in inbox (check spam if not in inbox)
4. OTP verification works

### Check Render Logs:
1. Go to Render dashboard
2. Select `focs2-0` service
3. Click "Logs" tab
4. Look for: `✅ OTP sent to [email] for register`
5. Should NOT see: `❌ Email sending failed`

---

## Security Notes

### ⚠️ Gmail App Password
The value `ebuu zmvc ydnd egrd` is a Gmail App Password. 

**Important:**
- This is NOT your regular Gmail password
- It's an app-specific password for SMTP
- Keep it secure - don't share publicly
- If compromised, revoke it in your Google Account settings

### 🔒 For Production
Consider using a dedicated email service like:
- SendGrid
- AWS SES
- Mailgun
- Postmark

These are more reliable for production than Gmail SMTP.

---

## Troubleshooting

### If OTP email still doesn't send:

#### 1. Check Render Logs
```
Render Dashboard → focs2-0 → Logs
```
Look for email-related errors

#### 2. Verify Environment Variables
```
Render Dashboard → focs2-0 → Environment
```
Make sure all 9 variables are set correctly

#### 3. Test Backend Health
```powershell
Invoke-RestMethod https://focs2-0.onrender.com/api/health
```

#### 4. Check Gmail Account
- Ensure "Less secure app access" is enabled (if using regular Gmail)
- Or use an App Password (recommended)
- Check if Google hasn't blocked the login

#### 5. Check Email User/Pass
- Make sure EMAIL_USER is the full email: `forensic.lab.portal@gmail.com`
- Make sure EMAIL_PASS is the app password (with spaces): `ebuu zmvc ydnd egrd`

---

## Testing Checklist

After adding environment variables and redeployment:

- [ ] Backend redeployed successfully
- [ ] Can access backend health endpoint
- [ ] Registration form submits without 500 error
- [ ] OTP email is received
- [ ] OTP verification works
- [ ] Login works
- [ ] Can create reports
- [ ] Can view reports

---

## Estimated Time
- Adding variables: 5 minutes
- Render redeploy: 1-2 minutes
- Testing: 2 minutes
**Total: ~10 minutes**

---

## Next Steps After Fix

Once OTP emails are working:
1. Test all user flows (register, login, reports)
2. Update production secrets (JWT_SECRET, MASTER_SECRET) to be different from dev
3. Consider using a production email service
4. Set up monitoring/logging

---

**Bottom Line:**
Add all 9 environment variables to Render, wait for redeploy, and test. Your OTP emails should work!

**Quick Link:** https://dashboard.render.com/ → focs2-0 → Environment
