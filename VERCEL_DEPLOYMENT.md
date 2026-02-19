# 🚀 Vercel Deployment Guide

## Complete Production Deployment for AutoFix Bot

---

## 📦 Prerequisites

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

---

## 🎯 STEP 1: Deploy Backend API

### 1.1 Navigate to Backend Directory
```powershell
cd C:\Users\admin\OneDrive - MSFT\autofix-bot\backend-github
```

### 1.2 Deploy to Vercel
```powershell
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **autofix-bot-backend** (or your choice)
- Directory? **./backend-github**
- Override settings? **N**

### 1.3 Add Environment Variables

After deployment, add secrets to Vercel:

```powershell
# Set GitHub Token
vercel env add GITHUB_TOKEN production
# When prompted, paste: YOUR_GITHUB_TOKEN_HERE

# Set Workflow Owner
vercel env add WORKFLOW_REPO_OWNER production
# When prompted, paste: suryanshsk

# Set Workflow Repo
vercel env add WORKFLOW_REPO_NAME production
# When prompted, paste: autofix-bot

# Set Gemini API Key
vercel env add GEMINI_API_KEY production
# When prompted, paste: YOUR_GEMINI_API_KEY_HERE

# Set Port (optional, Vercel handles this)
vercel env add PORT production
# When prompted, paste: 3001
```

### 1.4 Get Backend URL

After deployment completes, Vercel will show:
```
✅ Production: https://autofix-bot-backend.vercel.app
```

**SAVE THIS URL!** You'll need it for the frontend.

---

## 🎯 STEP 2: Deploy Frontend Dashboard

### 2.1 Navigate to Root Directory
```powershell
cd C:\Users\admin\OneDrive - MSFT\autofix-bot
```

### 2.2 Update API URL

**Option A: Using Environment Variable (Recommended)**

Create `.env.production` file:
```bash
VITE_API_URL=https://autofix-bot-backend.vercel.app/api
```

**Option B: Direct in Code**

Update `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://autofix-bot-backend.vercel.app/api';
```

### 2.3 Deploy Frontend
```powershell
vercel --prod
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **autofix-bot** (or your choice)
- Directory? **./autofix-bot**
- Override settings? **N**

### 2.4 Add Environment Variable (if using .env.production)

```powershell
vercel env add VITE_API_URL production
# When prompted, paste: https://autofix-bot-backend.vercel.app/api
```

### 2.5 Get Frontend URL

After deployment:
```
✅ Production: https://autofix-bot.vercel.app
```

---

## 🎯 STEP 3: Configure CORS (if needed)

If you get CORS errors, update `backend-github/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://autofix-bot.vercel.app', 'http://localhost:8080'],
  credentials: true
}));
```

Then redeploy backend:
```powershell
cd backend-github
vercel --prod
```

---

## 🎯 STEP 4: Test Production System

1. **Open your production dashboard**:
   ```
   https://autofix-bot.vercel.app
   ```

2. **Test with a repository**:
   - Enter: `https://github.com/suryanshsk/agentic-shopper`
   - Team: `PRODUCTION`
   - Leader: `TEST`
   - Click "Run Healing Agent"

3. **Verify**:
   - ✅ Workflow triggers on GitHub Actions
   - ✅ Agent runs successfully
   - ✅ Results appear in dashboard

---

## 🎯 STEP 5: Update GitHub Secrets (Already Done!)

Your GitHub secrets are already configured:
- ✅ `PERSONAL_GITHUB_TOKEN`
- ✅ `GEMINI_API_KEY`

---

## 📋 Quick Commands Reference

### Redeploy Frontend
```powershell
cd C:\Users\admin\OneDrive - MSFT\autofix-bot
vercel --prod
```

### Redeploy Backend
```powershell
cd C:\Users\admin\OneDrive - MSFT\autofix-bot\backend-github
vercel --prod
```

### View Deployment Logs
```powershell
vercel logs [deployment-url]
```

### List All Projects
```powershell
vercel list
```

### Remove Deployment
```powershell
vercel remove [project-name]
```

---

## 🔍 Troubleshooting

### Issue: API_BASE_URL Not Set
**Solution**: Make sure VITE_API_URL environment variable is set in Vercel dashboard

### Issue: CORS Errors
**Solution**: Update CORS configuration in backend-github/server.js to include your Vercel frontend URL

### Issue: Environment Variables Not Working
**Solution**: Redeploy after adding env vars: `vercel --prod`

### Issue: Build Fails
**Solution**: Check build logs with `vercel logs` and ensure all dependencies are in package.json

---

## 💰 Vercel Free Tier Limits

- ✅ 100 deployments/day
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ **Cost: $0/month**

---

## 🎉 Production URLs

After deployment, you'll have:

**Frontend Dashboard**: `https://autofix-bot.vercel.app`  
**Backend API**: `https://autofix-bot-backend.vercel.app`  
**GitHub Workflow**: `https://github.com/suryanshsk/autofix-bot/actions`

---

## 🏆 Complete Stack (All FREE!)

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | $0 |
| Backend | Vercel | $0 |
| CI/CD | GitHub Actions | $0 |
| AI | Google Gemini | $0 |
| **TOTAL** | | **$0/month** |

---

## 📝 Next Steps After Deployment

1. Share your production URL: `https://autofix-bot.vercel.app`
2. Add to your GitHub README
3. Demo at hackathon with live URL
4. Monitor usage in Vercel dashboard
5. Check GitHub Actions for agent runs

---

**Your AutoFix Bot is now live in production!** 🚀🎉
