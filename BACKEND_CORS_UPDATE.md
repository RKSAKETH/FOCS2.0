# ⚠️ BACKEND CORS UPDATE REQUIRED

## What You Need to Do on Render

After you deploy your frontend, you **MUST** update your backend's CORS configuration to allow requests from your frontend domain.

## Quick Steps:

1. **Deploy your frontend first** and note the URL (e.g., `https://your-app.vercel.app`)

2. **Go to Render Dashboard**: https://dashboard.render.com/

3. **Select your backend service**: `focs2-0`

4. **Click on "Environment" in the left sidebar**

5. **Add or update the environment variable**:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-actual-frontend-url.com`
   
   Examples:
   - Vercel: `https://focs-project.vercel.app`
   - Netlify: `https://focs-project.netlify.app`
   - Render: `https://focs-frontend.onrender.com`

6. **Save Changes** - Render will automatically redeploy your backend

7. **Wait** for the redeployment to complete (usually 1-2 minutes)

8. **Test** your deployed frontend - CORS errors should be gone!

---

## Alternative: Allow Multiple Origins

If you want to allow multiple frontend URLs (e.g., development + production + preview), you'll need to update your backend code.

### Option A: Update via Web (Single Domain)
Just set the `FRONTEND_URL` environment variable as described above. This works with your current code.

### Option B: Update Code (Multiple Domains)
Edit `backend/server.js` and replace the CORS middleware:

**Current (Single Domain):**
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

**Replace with (Multiple Domains):**
```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-app.vercel.app',
    'https://your-app.netlify.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
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

Then redeploy your backend on Render.

---

## ⚠️ IMPORTANT SECURITY NOTE

**DO NOT** set CORS origin to `*` (wildcard) in production! This is a security risk and will not work with credentials.

**Bad** ❌:
```javascript
app.use(cors({
    origin: '*',  // DON'T DO THIS!
    credentials: true
}));
```

**Good** ✅:
```javascript
app.use(cors({
    origin: 'https://your-specific-domain.com',
    credentials: true
}));
```

---

## How to Verify It's Working

After updating the `FRONTEND_URL` variable:

1. Wait for Render to redeploy (check the "Events" tab)
2. Visit your deployed frontend
3. Open browser DevTools (F12)
4. Go to Console tab
5. Try logging in or making any API request
6. You should NOT see any CORS errors

If you still see CORS errors:
- Double-check the URL matches exactly
- Ensure there are no trailing slashes
- Check that Render finished redeploying
- Clear browser cache and try again

---

## Current Backend Configuration

Your backend is currently configured to accept requests from:
- `process.env.FRONTEND_URL` (to be set) OR
- `http://localhost:3000` (fallback for development)

**Source**: `backend/server.js` line 18-21

---

## Quick Test

After setting `FRONTEND_URL`, test if CORS is working:

```powershell
# Replace with your actual frontend URL
curl -H "Origin: https://your-frontend-url.com" `
     -H "Access-Control-Request-Method: POST" `
     -H "Access-Control-Request-Headers: Content-Type" `
     -X OPTIONS `
     https://focs2-0.onrender.com/api/auth/login -v
```

Look for `Access-Control-Allow-Origin` in the response headers.

---

**Remember**: Update this environment variable AFTER deploying your frontend!
