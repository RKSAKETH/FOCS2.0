# 🚀 Frontend Deployment Guide

## ✅ Pre-Deployment Checklist

Your project has been configured for deployment with the following changes:

### Files Modified/Created:
1. ✅ **`.env`** - Created with production backend URL
2. ✅ **`.env.production`** - Created for production builds
3. ✅ **Backend CORS** - Needs to be updated (see below)

---

## 📦 What's Been Configured

### Frontend Configuration
- **Backend API URL**: `https://focs2-0.onrender.com/api`
- **Environment files**: Created both `.env` and `.env.production`
- **API Configuration**: Already using `import.meta.env.VITE_API_URL` in `src/utils/api.js`

---

## 🔧 Backend Configuration Required

**IMPORTANT**: Before deploying the frontend, you MUST update your backend's CORS configuration on Render.

### Update Backend Environment Variable on Render:

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your backend service (`focs2-0`)
3. Go to **Environment** tab
4. Add or update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=<your-frontend-deployment-url>
```

**Examples based on deployment platform:**
- **Vercel**: `https://<your-app-name>.vercel.app`
- **Netlify**: `https://<your-app-name>.netlify.app`
- **Render**: `https://<your-app-name>.onrender.com`

4. After adding the variable, Render will automatically redeploy your backend

### Alternative: Allow Multiple Origins
If you want to allow multiple frontend URLs (development + production), update your backend's `server.js`:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://<your-frontend-domain>.vercel.app',
        'https://<your-frontend-domain>.netlify.app',
        // Add other domains as needed
    ],
    credentials: true
}));
```

---

## 🌐 Deployment Platforms

Choose one of these platforms to deploy your frontend:

### Option 1: Vercel (Recommended for Vite/React)

1. **Install Vercel CLI** (optional):
   ```powershell
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your Git repository (or upload the `frontend` folder)
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend` (if deploying from root repo)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Environment Variables**: Add `VITE_API_URL=https://focs2-0.onrender.com/api`

3. **Deploy via CLI** (from frontend folder):
   ```powershell
   cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
   vercel
   ```

### Option 2: Netlify

1. **Deploy via Netlify Dashboard**:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Deploy manually"
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Environment variables**: Add `VITE_API_URL=https://focs2-0.onrender.com/api`

2. **Deploy via Netlify CLI**:
   ```powershell
   npm install -g netlify-cli
   cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
   netlify deploy --prod
   ```

### Option 3: Render (Static Site)

1. Go to https://dashboard.render.com/
2. Click "New" → "Static Site"
3. Connect your Git repository
4. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: Add `VITE_API_URL=https://focs2-0.onrender.com/api`

---

## 🏗️ Local Build Test

Before deploying, test the production build locally:

```powershell
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"

# Install dependencies (if not already done)
npm install

# Build for production
npm run build

# Preview the production build
npm run preview
```

The preview will run on `http://localhost:4173` by default.

---

## 📋 Deployment Steps

### Step 1: Test Backend Connection
Verify your backend is accessible:
```powershell
curl https://focs2-0.onrender.com/api/health
```

You should get a JSON response confirming the API is running.

### Step 2: Build Frontend
```powershell
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
npm run build
```

This creates an optimized production build in the `dist` folder.

### Step 3: Deploy
Follow the deployment platform instructions above.

### Step 4: Update Backend CORS
After deployment, update the `FRONTEND_URL` environment variable on Render with your actual frontend URL.

### Step 5: Test
Visit your deployed frontend URL and test:
- ✅ User Registration
- ✅ Login
- ✅ OTP Email functionality
- ✅ Report creation
- ✅ Report viewing
- ✅ Audit logs

---

## 🐛 Troubleshooting

### CORS Errors
**Symptom**: "blocked by CORS policy" errors in browser console

**Solution**: 
1. Verify `FRONTEND_URL` is set correctly on Render backend
2. Check that the URL matches exactly (no trailing slashes)
3. Ensure backend redeployed after env variable change

### API Connection Errors
**Symptom**: Network errors, "Failed to fetch"

**Solution**:
1. Verify backend is running: `https://focs2-0.onrender.com/api/health`
2. Check browser console for exact error
3. Verify `.env.production` has correct URL
4. Rebuild frontend: `npm run build`

### Environment Variables Not Working
**Symptom**: Still connecting to localhost

**Solution**:
1. Verify `.env.production` file exists in `frontend` folder
2. Clear build cache: delete `dist` folder and rebuild
3. Check deployment platform has `VITE_API_URL` env variable set
4. Note: Vite env vars must start with `VITE_`

### Cannot find module errors
**Symptom**: Build errors about missing modules

**Solution**:
```powershell
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
rm -r node_modules
rm package-lock.json
npm install
```

---

## 🔐 Security Checklist

Before going live:
- ✅ Environment variables are set (not hardcoded)
- ✅ CORS configured with specific frontend domain (not wildcard `*`)
- ✅ Backend credentials (JWT_SECRET, MASTER_SECRET) are strong
- ✅ Email credentials are secure
- ✅ MongoDB connection string is using appropriate credentials
- ✅ HTTPS is enabled (automatic on Vercel/Netlify/Render)

---

## 📁 Important Files Reference

### Frontend
- `frontend/.env` - Local development environment variables
- `frontend/.env.production` - Production environment variables
- `frontend/src/utils/api.js` - API configuration
- `frontend/vite.config.js` - Vite build configuration

### Backend (Already deployed)
- Backend URL: `https://focs2-0.onrender.com`
- API Base: `https://focs2-0.onrender.com/api`
- Health Check: `https://focs2-0.onrender.com/api/health`

---

## 🎯 Quick Deploy Commands

For quick reference, here's the complete deployment flow:

```powershell
# Navigate to frontend
cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"

# Ensure dependencies are installed
npm install

# Build for production
npm run build

# Test locally (optional)
npm run preview

# Deploy using your chosen platform
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
# Or use the web dashboard for any platform
```

---

## ✅ Post-Deployment

After successful deployment:

1. **Get your frontend URL** (e.g., `https://your-app.vercel.app`)

2. **Update backend CORS**:
   - Go to Render dashboard
   - Update `FRONTEND_URL` environment variable
   - Wait for automatic redeployment

3. **Test the complete flow**:
   - Visit frontend URL
   - Register a new user
   - Check email for OTP
   - Login and test all features

4. **Update this document** with your actual URLs for future reference

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Render backend logs
3. Verify all environment variables
4. Ensure CORS is properly configured

---

**Created**: January 28, 2026
**Backend**: https://focs2-0.onrender.com
**Frontend**: *To be deployed*
