# Pre-Build Test Script
# This script verifies the backend connection and builds the frontend

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🧪 FOCS Project 2.0 - Pre-Deployment Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test Backend Connection
Write-Host "`n[1/4] Testing Backend Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://focs2-0.onrender.com/api/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is ONLINE and responding" -ForegroundColor Green
    Write-Host "   API Message: $($response.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend connection FAILED!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease ensure your backend is deployed and running on Render." -ForegroundColor Yellow
    exit 1
}

# Check Frontend Directory
Write-Host "`n[2/4] Checking Frontend Directory..." -ForegroundColor Yellow
$frontendPath = "c:\Users\krish\Downloads\FOCS Project 2.0\frontend"
if (Test-Path $frontendPath) {
    Write-Host "✅ Frontend directory found" -ForegroundColor Green
    Set-Location $frontendPath
} else {
    Write-Host "❌ Frontend directory NOT found!" -ForegroundColor Red
    exit 1
}

# Check Environment Variables
Write-Host "`n[3/4] Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host "   Content: $envContent" -ForegroundColor Gray
} else {
    Write-Host "⚠️  .env file not found (will use .env.production)" -ForegroundColor Yellow
}

if (Test-Path ".env.production") {
    $envProdContent = Get-Content ".env.production"
    Write-Host "✅ .env.production file exists" -ForegroundColor Green
    Write-Host "   Content: $envProdContent" -ForegroundColor Gray
} else {
    Write-Host "❌ .env.production file NOT found!" -ForegroundColor Red
    Write-Host "   Creating .env.production now..." -ForegroundColor Yellow
    "VITE_API_URL=https://focs2-0.onrender.com/api" | Out-File -FilePath ".env.production" -Encoding utf8
    Write-Host "✅ Created .env.production" -ForegroundColor Green
}

# Install Dependencies (if needed)
Write-Host "`n[4/4] Checking Dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Dependency installation FAILED!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Build for Production
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🏗️  Building Frontend for Production" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅✅✅ BUILD SUCCESSFUL! ✅✅✅" -ForegroundColor Green
    Write-Host "`nYour production build is ready in the 'dist' folder." -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy the 'dist' folder to your hosting platform" -ForegroundColor White
    Write-Host "2. Update FRONTEND_URL environment variable on Render backend" -ForegroundColor White
    Write-Host "3. Test all features after deployment" -ForegroundColor White
    Write-Host "`nFor detailed deployment instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please review the errors above and fix them before deploying." -ForegroundColor Yellow
    exit 1
}

# Optional: Preview Build
Write-Host "`n=====================================" -ForegroundColor Cyan
$preview = Read-Host "Would you like to preview the build locally? (y/n)"
if ($preview -eq "y" -or $preview -eq "Y") {
    Write-Host "`nStarting preview server..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop the preview server" -ForegroundColor Gray
    npm run preview
}
