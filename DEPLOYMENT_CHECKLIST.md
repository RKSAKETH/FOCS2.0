# 🚀 DEPLOYMENT CHECKLIST

## ✅ Completed (Already Done)

- [x] Backend deployed to Render at `https://focs2-0.onrender.com`
- [x] Frontend `.env` file created with production backend URL
- [x] Frontend `.env.production` file created
- [x] Deployment configuration files created (`vercel.json`, `netlify.toml`)
- [x] Test and build script created (`test-and-build.ps1`)
- [x] `.gitignore` updated to properly handle environment files

## 📋 To Do (Before/During Frontend Deployment)

### 1. Test the Build
- [ ] Run the test and build script:
  ```powershell
  cd "c:\Users\krish\Downloads\FOCS Project 2.0"
  .\test-and-build.ps1
  ```
  OR manually:
  ```powershell
  cd "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
  npm install
  npm run build
  ```

### 2. Choose Deployment Platform
- [ ] Decide on deployment platform:
  - [ ] **Vercel** (Recommended - easiest for Vite/React)
  - [ ] **Netlify** (Good alternative)
  - [ ] **Render** (Keep everything on one platform)
  - [ ] **Other** (GitHub Pages, Cloudflare Pages, etc.)

### 3. Deploy Frontend
- [ ] Follow the deployment steps for your chosen platform (see DEPLOYMENT_GUIDE.md)
- [ ] Set environment variable: `VITE_API_URL=https://focs2-0.onrender.com/api`
- [ ] Note your frontend URL after deployment: `_______________________________`

### 4. Update Backend CORS
- [ ] Go to Render dashboard: https://dashboard.render.com/
- [ ] Select your backend service: `focs2-0`
- [ ] Go to **Environment** tab
- [ ] Add/Update: `FRONTEND_URL=<your-frontend-url>`
- [ ] Wait for automatic redeployment

### 5. Test Deployed Application
- [ ] Open your deployed frontend URL
- [ ] Test user registration
- [ ] Check email for OTP
- [ ] Test login with OTP
- [ ] Create a test report
- [ ] View reports
- [ ] Check audit logs
- [ ] Test all user roles (if applicable)

### 6. Production Verification
- [ ] No CORS errors in browser console
- [ ] All API calls working (check Network tab)
- [ ] Email OTP delivery working
- [ ] Report creation and viewing working
- [ ] Audit logs recording correctly
- [ ] Responsive design working on mobile

### 7. Optional: Custom Domain
- [ ] Register domain (if not already done)
- [ ] Configure DNS settings
- [ ] Update deployment platform with custom domain
- [ ] Update backend `FRONTEND_URL` with custom domain
- [ ] Verify SSL certificate is active

---

## 🔗 Important Links

- **Backend (Deployed)**: https://focs2-0.onrender.com
- **Backend API**: https://focs2-0.onrender.com/api
- **Backend Health Check**: https://focs2-0.onrender.com/api/health
- **Frontend (Local)**: http://localhost:3000
- **Frontend (Deployed)**: `<Add after deployment>`
- **Render Dashboard**: https://dashboard.render.com/

---

## 🆘 Quick Troubleshooting

### If you see CORS errors:
1. Verify `FRONTEND_URL` is set correctly on Render
2. Check that backend has redeployed after env change
3. Ensure URLs match exactly (no trailing slashes)

### If API calls fail:
1. Check backend is running: Visit https://focs2-0.onrender.com/api/health
2. Check browser console for exact error
3. Verify `.env.production` has correct backend URL
4. Rebuild frontend if env variables changed

### If build fails:
1. Delete `node_modules` and reinstall: `rm -r node_modules; npm install`
2. Clear dist folder: `rm -r dist`
3. Try building again: `npm run build`
4. Check for any error messages in the build output

---

## 📞 Need Help?

Refer to:
- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment instructions
- **README.md** - Project overview and local setup
- **PROJECT_SUMMARY.md** - Full project documentation

---

**Ready to Deploy?**
Run: `.\test-and-build.ps1` to start!
