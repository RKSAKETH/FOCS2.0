# 🚀 Automated Setup Script for FOCS Toxicology Portal
# Run this script to set up the project quickly

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Secure Crime Lab Toxicology Portal - Setup            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\krish\Downloads\FOCS Project 2.0"

# Check Node.js installation
Write-Host "✓ Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please download from: https://nodejs.org" -ForegroundColor Yellow
    exit
}

# Check MongoDB
Write-Host ""
Write-Host "✓ Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoVersion = mongod --version
    Write-Host "  MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  MongoDB not found in PATH" -ForegroundColor Red
    Write-Host "  You'll need MongoDB for this project." -ForegroundColor Yellow
    Write-Host "  Options:" -ForegroundColor Yellow
    Write-Host "    1. Install MongoDB Community Server locally" -ForegroundColor Yellow
    Write-Host "    2. Use MongoDB Atlas (cloud)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 1: Backend Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Set-Location "$projectRoot\backend"

# Create .env file
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit backend\.env and configure:" -ForegroundColor Red
    Write-Host "   - EMAIL_USER (your Gmail address)" -ForegroundColor Yellow
    Write-Host "   - EMAIL_PASS (Gmail App Password)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (any random string)" -ForegroundColor Yellow
    Write-Host "   - MASTER_SECRET (any random string)" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Press Enter when you've configured .env (or type 'skip' to continue)"
} else {
    Write-Host ".env file already exists" -ForegroundColor Green
}

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  STEP 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Set-Location "$projectRoot\frontend"

# Create .env file
if (!(Test-Path ".env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created frontend .env file" -ForegroundColor Green
} else {
    Write-Host "Frontend .env file already exists" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE! 🎉" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure MongoDB is running:" -ForegroundColor White
Write-Host "   - Local: Start MongoDB service from Windows Services" -ForegroundColor Gray
Write-Host "   - Or use MongoDB Atlas cloud connection string in backend\.env" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Configure Email (for OTP):" -ForegroundColor White
Write-Host "   - Edit backend\.env" -ForegroundColor Gray
Write-Host "   - Set EMAIL_USER and EMAIL_PASS (Gmail App Password)" -ForegroundColor Gray
Write-Host "   - See QUICKSTART.md for detailed instructions" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Start Backend (Terminal 1):" -ForegroundColor White
Write-Host "   cd 'c:\Users\krish\Downloads\FOCS Project 2.0\backend'" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""

Write-Host "4. Start Frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd 'c:\Users\krish\Downloads\FOCS Project 2.0\frontend'" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""

Write-Host "5. Open browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   README.md - Full project documentation" -ForegroundColor Gray
Write-Host "   QUICKSTART.md - Quick start guide" -ForegroundColor Gray
Write-Host "   PROJECT_SUMMARY.md - All security components explained" -ForegroundColor Gray
Write-Host ""

Write-Host "For help with Gmail App Password setup, see:" -ForegroundColor Yellow
Write-Host "QUICKSTART.md → Section 4: Gmail App Password Setup" -ForegroundColor Gray
Write-Host ""

Set-Location $projectRoot

Write-Host "Happy coding! 🚀🔐" -ForegroundColor Cyan
