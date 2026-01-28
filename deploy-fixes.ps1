# 🚀 Deploy Backend Fixes - CORS + Email Timeout

# This script commits and deploys the fixes for:
# 1. CORS error (new Vercel URL support)
# 2. Email timeout (increased from 15s to 30s)

Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔧 Deploying Backend Fixes                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan

$projectPath = "c:\Users\krish\Downloads\FOCS Project 2.0"
Set-Location $projectPath

Write-Host "`n📋 Changes being deployed:" -ForegroundColor Yellow
Write-Host "  ✅ CORS: Now accepts ALL Vercel preview deployments" -ForegroundColor White
Write-Host "  ✅ Email: Increased timeout from 15s → 30s" -ForegroundColor White
Write-Host "  ✅ Email: Added connection pooling for reliability" -ForegroundColor White
Write-Host "  ✅ Email: Better error logging" -ForegroundColor White

Write-Host "`n[1/4] Checking Git Status..." -ForegroundColor Yellow
git status

Write-Host "`n[2/4] Adding modified files..." -ForegroundColor Yellow
git add backend/server.js backend/utils/emailService.js

Write-Host "`n[3/4] Committing changes..." -ForegroundColor Yellow
git commit -m "fix: CORS wildcard for Vercel + increased email timeout

- Allow all *.vercel.app domains (no need to update for each deploy)
- Increase email timeouts from 15s to 30s for cloud reliability
- Add connection pooling for Gmail SMTP
- Improve error logging for email issues
- Verify SMTP connection before sending
- Better timeout error messages"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit status: $LASTEXITCODE" -ForegroundColor Yellow
}

Write-Host "`n[4/4] Pushing to repository..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅✅✅ PUSH SUCCESSFUL! ✅✅✅" -ForegroundColor Green
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    Write-Host "`n1. Monitor Render Deployment:" -ForegroundColor Cyan
    Write-Host "   👉 https://dashboard.render.com/" -ForegroundColor White
    Write-Host "   - Select service: focs2-0" -ForegroundColor Gray
    Write-Host "   - Check 'Events' tab" -ForegroundColor Gray
    Write-Host "   - Wait for 'Deploy live' (~2 minutes)" -ForegroundColor Gray
    
    Write-Host "`n2. After Deployment Completes:" -ForegroundColor Cyan
    Write-Host "   - Go to your frontend" -ForegroundColor Gray
    Write-Host "   - Try registration" -ForegroundColor Gray
    Write-Host "   - Should NOT get CORS error ✅" -ForegroundColor Gray
    Write-Host "   - OTP email should send (may take 20-30s) ✅" -ForegroundColor Gray
    
    Write-Host "`n3. Check Render Logs for:" -ForegroundColor Cyan
    Write-Host "   ✅ 'Allowing Vercel deployment'" -ForegroundColor Gray
    Write-Host "   ✅ 'Email server connected'" -ForegroundColor Gray
    Write-Host "   ✅ 'OTP sent successfully'" -ForegroundColor Gray
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    Write-Host "`n⏱️  Estimated deployment time: 2-3 minutes" -ForegroundColor Yellow
    
    Write-Host "`n📧 Note about Gmail:" -ForegroundColor Cyan
    Write-Host "   - First OTP may take 20-30 seconds" -ForegroundColor Gray
    Write-Host "   - This is normal for Gmail SMTP on cloud platforms" -ForegroundColor Gray
    Write-Host "   - Subsequent emails will be faster" -ForegroundColor Gray
    
    Write-Host "`n🔗 Testing while you wait:" -ForegroundColor Cyan
    try {
        $health = Invoke-RestMethod -Uri "https://focs2-0.onrender.com/api/health" -Method Get
        Write-Host "   ✅ Backend API is online" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Backend might be redeploying..." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "`n❌ PUSH FAILED!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - Internet connection" -ForegroundColor White
    Write-Host "  - Git credentials" -ForegroundColor White
    Write-Host "  - Repository permissions" -ForegroundColor White
    exit 1
}

Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   🎉 FIXES DEPLOYED TO RENDER                    ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nFrontend: https://focs-2-0-evlt0fol0-rksakeths-projects.vercel.app" -ForegroundColor Cyan
Write-Host "Backend:  https://focs2-0.onrender.com" -ForegroundColor Cyan
Write-Host "`nTest after Render deployment completes!" -ForegroundColor White
