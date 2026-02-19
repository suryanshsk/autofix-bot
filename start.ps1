# Quick Start Script for CI Healing Agent
# Run this script to set up and start both backend and frontend

Write-Host "🚀 CI/CD Healing Agent - Quick Start" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if backend directory exists
if (-not (Test-Path "backend-github")) {
    Write-Host "❌ backend-github directory not found!" -ForegroundColor Red
    Write-Host "   Make sure you're running this from the project root." -ForegroundColor Yellow
    exit 1
}

# Step 1: Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend-github

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 2: Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  IMPORTANT: Edit .env file with your credentials!" -ForegroundColor Red
    Write-Host "   Required:" -ForegroundColor Yellow
    Write-Host "   - GITHUB_TOKEN (from https://github.com/settings/tokens)" -ForegroundColor Yellow
    Write-Host "   - WORKFLOW_REPO_OWNER (your GitHub username)" -ForegroundColor Yellow
    Write-Host "   - WORKFLOW_REPO_NAME (autofix-bot)" -ForegroundColor Yellow
    Write-Host "`n   Edit .env now? (Y/N)" -ForegroundColor Cyan
    $edit = Read-Host
    if ($edit -eq "Y" -or $edit -eq "y") {
        notepad .env
        Write-Host "`n   Press Enter when done editing..." -ForegroundColor Yellow
        Read-Host
    }
}

# Step 3: Start backend in background
Write-Host "`n🚀 Starting backend on port 3001..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 3

# Test if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might not be ready yet. Check the backend window." -ForegroundColor Yellow
}

# Step 4: Install frontend dependencies
Set-Location ..
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Step 5: Start frontend
Write-Host "`n🎨 Starting frontend on port 8080..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5

# Final instructions
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📊 Your application is running:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:8080" -ForegroundColor White
Write-Host "`n🌐 Opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080"

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure you've set your GITHUB_TOKEN in backend-github/.env" -ForegroundColor White
Write-Host "   2. Add GEMINI_API_KEY secret to your GitHub repo" -ForegroundColor White
Write-Host "   3. Try running the agent with a test repository!" -ForegroundColor White
Write-Host "`n📚 Need help? Check COMPLETE_SETUP.md for detailed instructions" -ForegroundColor Yellow
Write-Host "`n🎉 Happy hacking!" -ForegroundColor Magenta

Read-Host "`nPress Enter to exit"
