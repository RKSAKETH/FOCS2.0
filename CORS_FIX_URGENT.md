# 🚨 URGENT FIX FOR LOGIN/REGISTRATION ERRORS

## Problem Identified:
Your backend CORS is configured for `http://localhost:3000` but your frontend is deployed at:
`focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app`

This causes CORS errors preventing login/registration.

## Solution: Update Backend Environment Variable on Render

### Step-by-Step Instructions:

1. **Go to Render Dashboard**
   URL: https://dashboard.render.com/

2. **Select your backend service**
   - Click on `focs2-0` (your backend service)

3. **Navigate to Environment**
   - In the left sidebar, click "Environment"

4. **Update FRONTEND_URL variable**
   
   **Option A: Use the full Vercel URL**
   - Find the `FRONTEND_URL` variable
   - Change from: `http://localhost:3000`
   - Change to: `https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app`
   
   **Option B: Set your production Vercel domain (if you have one)**
   - If you have a production domain on Vercel (not preview), use that instead

5. **Save Changes**
   - Click "Save Changes" button
   - Render will automatically redeploy your backend (takes 1-2 minutes)

6. **Wait for Redeployment**
   - Watch the "Events" tab to see when deployment completes
   - You'll see "Deploy live" when done

7. **Test Again**
   - Go to your frontend: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app
   - Try registering or logging in
   - Should work now! ✅

---

## Alternative: Allow Multiple Domains (Recommended)

If you want to allow both localhost (for development) AND your Vercel deployment, you need to modify the backend code:

### Update backend/server.js:

Find this section (around line 18):
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

Replace with:
```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

Then commit and push to trigger a Render redeploy.

---

## Quick Test After Fix:

Test if CORS is working:
```powershell
curl -H "Origin: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app" `
     -H "Access-Control-Request-Method: POST" `
     -H "Access-Control-Request-Headers: Content-Type" `
     -X OPTIONS `
     https://focs2-0.onrender.com/api/auth/login -v
```

Look for `Access-Control-Allow-Origin` in the response.

---

## Verification:

After updating FRONTEND_URL on Render:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login/register
4. You should NOT see CORS errors anymore
5. Login/registration should work!

---

**Current Settings:**
- Backend: https://focs2-0.onrender.com ✅
- Frontend: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app ✅
- Backend FRONTEND_URL: http://localhost:3000 ❌ (NEEDS UPDATE)

**After Fix:**
- Backend FRONTEND_URL: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app ✅

---

**Estimated fix time**: 2-3 minutes + 1-2 minutes for Render redeploy
