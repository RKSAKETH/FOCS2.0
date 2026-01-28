# Quick Deploy Script for CORS Fix
# This script commits and pushes the backend CORS fix to trigger Render redeploy

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🚀 CORS Fix Deployment Script                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$projectPath = "c:\Users\krish\Downloads\FOCS Project 2.0"
Set-Location $projectPath

Write-Host "`n[1/5] Checking Git Status..." -ForegroundColor Yellow
git status

Write-Host "`n[2/5] Adding modified backend file..." -ForegroundColor Yellow
git add backend/server.js

Write-Host "`n[3/5] Committing changes..." -ForegroundColor Yellow
git commit -m "fix: Update CORS configuration to support Vercel deployment

- Allow multiple origins including localhost and Vercel
- Fix login/registration errors caused by CORS blocking
- Support both development and production environments"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit successful!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit failed or no changes to commit" -ForegroundColor Yellow
    Write-Host "This might mean the changes were already committed." -ForegroundColor Gray
}

Write-Host "`n[4/5] Pushing to repository..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push successful!" -ForegroundColor Green
    
    Write-Host "`n[5/5] Monitoring Render deployment..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Render should now automatically deploy your backend." -ForegroundColor White
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://dashboard.render.com/" -ForegroundColor White
    Write-Host "  2. Select your service: focs2-0" -ForegroundColor White
    Write-Host "  3. Check 'Events' tab to monitor deployment" -ForegroundColor White
    Write-Host "  4. Wait for 'Deploy live' message (~1-2 minutes)" -ForegroundColor White
    Write-Host "  5. Test your frontend: login/registration should work!" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    Write-Host "`n✅ DEPLOYMENT INITIATED!" -ForegroundColor Green
    Write-Host "`nWhile you wait, test if backend is healthy:" -ForegroundColor Cyan
    
    try {
        $health = Invoke-RestMethod -Uri "https://focs2-0.onrender.com/api/health" -Method Get
        Write-Host "✅ Backend is ONLINE" -ForegroundColor Green
        Write-Host "   Status: $($health.success)" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Backend might be redeploying..." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    Write-Host "Please check your internet connection and Git credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    🎉 FIX DEPLOYED! Wait for Render redeploy     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nFrontend URL: https://focs-2-0-fv44b3rj5-rksakeths-projects.vercel.app" -ForegroundColor Cyan
Write-Host "Backend URL:  https://focs2-0.onrender.com" -ForegroundColor Cyan
Write-Host "`nAfter Render completes deployment, try logging in again!" -ForegroundColor White
