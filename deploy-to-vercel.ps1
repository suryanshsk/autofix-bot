# AutoFix Bot - Vercel Deployment Script
# Run this step-by-step to deploy your AutoFix Bot to production

Write-Host "`n🚀 AutoFix Bot - Vercel Deployment`n" -ForegroundColor Cyan

# Check if Vercel CLI is installed
Write-Host "📋 Step 1: Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!`n" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI is already installed!`n" -ForegroundColor Green
}

# Login to Vercel
Write-Host "📋 Step 2: Login to Vercel..." -ForegroundColor Yellow
Write-Host "Opening browser for authentication...`n" -ForegroundColor White
vercel login

Write-Host "`n✅ Logged in successfully!`n" -ForegroundColor Green

# Deploy Backend
Write-Host "📋 Step 3: Deploying Backend API..." -ForegroundColor Yellow
Write-Host "This will deploy your Express.js backend to Vercel.`n" -ForegroundColor White

$deployBackend = Read-Host "Deploy backend now? (Y/n)"
if ($deployBackend -ne "n") {
    Set-Location backend-github
    Write-Host "Deploying backend...`n" -ForegroundColor Cyan
    vercel --prod
    
    Write-Host "`n✅ Backend deployed!`n" -ForegroundColor Green
    Write-Host "📝 IMPORTANT: Copy the deployment URL shown above!" -ForegroundColor Yellow
    Write-Host "Example: https://autofix-bot-backend-abc123.vercel.app`n" -ForegroundColor Cyan
    
    $backendUrl = Read-Host "Paste your backend URL here"
    
    # Add environment variables
    Write-Host "`n📋 Step 4: Adding Environment Variables..." -ForegroundColor Yellow
    Write-Host "You'll be prompted to enter each value.`n" -ForegroundColor White
    Write-Host "💡 Tip: Get your tokens from backend-github\.env file`n" -ForegroundColor Cyan
    
    Write-Host "Setting GITHUB_TOKEN..." -ForegroundColor Cyan
    vercel env add GITHUB_TOKEN production
    
    Write-Host "`nSetting WORKFLOW_REPO_OWNER..." -ForegroundColor Cyan
    Write-Host "Enter: suryanshsk" -ForegroundColor White
    vercel env add WORKFLOW_REPO_OWNER production
    
    Write-Host "`nSetting WORKFLOW_REPO_NAME..." -ForegroundColor Cyan
    Write-Host "Enter: autofix-bot" -ForegroundColor White
    vercel env add WORKFLOW_REPO_NAME production
    
    Write-Host "`nSetting GEMINI_API_KEY..." -ForegroundColor Cyan
    vercel env add GEMINI_API_KEY production
    
    Write-Host "`n✅ Environment variables added!`n" -ForegroundColor Green
    
    # Redeploy backend with env vars
    Write-Host "Redeploying backend with environment variables..." -ForegroundColor Cyan
    vercel --prod
    
    Set-Location ..
    
    # Update frontend .env.production
    Write-Host "`n📋 Step 5: Updating Frontend Configuration..." -ForegroundColor Yellow
    $envContent = "VITE_API_URL=$backendUrl/api"
    $envContent | Out-File -FilePath ".env.production" -Encoding utf8
    Write-Host "✅ Frontend configured with backend URL`n" -ForegroundColor Green
}

# Deploy Frontend
Write-Host "📋 Step 6: Deploying Frontend Dashboard..." -ForegroundColor Yellow
Write-Host "This will deploy your React dashboard to Vercel.`n" -ForegroundColor White

$deployFrontend = Read-Host "Deploy frontend now? (Y/n)"
if ($deployFrontend -ne "n") {
    Write-Host "Deploying frontend...`n" -ForegroundColor Cyan
    vercel --prod
    
    Write-Host "`n✅ Frontend deployed!`n" -ForegroundColor Green
}

# Success message
Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "           🎉 DEPLOYMENT COMPLETE! 🎉" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "Your AutoFix Bot is now live in production!`n" -ForegroundColor Cyan

Write-Host "📊 System Overview:" -ForegroundColor Yellow
Write-Host "   ✅ Frontend Dashboard: Deployed on Vercel" -ForegroundColor White
Write-Host "   ✅ Backend API: Deployed on Vercel" -ForegroundColor White
Write-Host "   ✅ GitHub Actions: Running on GitHub" -ForegroundColor White
Write-Host "   ✅ Gemini AI: FREE tier" -ForegroundColor White
Write-Host "   💰 Total Cost: `$0/month`n" -ForegroundColor Green

Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test your production deployment" -ForegroundColor White
Write-Host "   2. Share your live URL" -ForegroundColor White
Write-Host "   3. Demo at your hackathon!" -ForegroundColor White
Write-Host "   4. Monitor usage in Vercel dashboard`n" -ForegroundColor White

Write-Host "📖 Documentation: VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "🌐 Vercel Dashboard: https://vercel.com/dashboard`n" -ForegroundColor Cyan
