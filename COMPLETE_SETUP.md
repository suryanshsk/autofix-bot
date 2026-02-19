# 🚀 PRODUCTION-READY SETUP GUIDE

## ✅ Everything is Now Fixed and Ready!

All code is production-ready with:
- ✅ Error handling
- ✅ Real API integration
- ✅ Polling with status updates
- ✅ GitHub Actions workflow
- ✅ Artifact download
- ✅ Beautiful UI/UX
- ✅ Toast notifications

---

## 📋 Prerequisites

1. **Node.js 20+** - Download from https://nodejs.org
2. **GitHub Account** - Free at https://github.com
3. **Google Gemini API Key** - Get FREE from https://aistudio.google.com/app/apikey
4. **GitHub Personal Access Token** - Generate at https://github.com/settings/tokens

---

## 🎯 Quick Setup (10 Minutes)

### Step 1: Get GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Click "Generate token"
5. **Copy the token** (starts with `ghp_...`)

### Step 2: Add Secrets to Your Repository

1. Go to your repo on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add secret:
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key (starts with AIza...)

*Note: `GITHUB_TOKEN` is automatically available in workflows*

### Step 3: Update Workflow File

Edit `.github/workflows/run-agent.yml` if needed:
- Make sure `main` or `master` branch name is correct (line 48)

### Step 4: Install Backend

```powershell
cd backend-github
npm install
```

### Step 5: Configure Backend

```powershell
# Create .env file
copy .env.example .env

# Edit .env
notepad .env
```

Update `.env` with:
```env
GITHUB_TOKEN=ghp_your_token_here
WORKFLOW_REPO_OWNER=your-github-username
WORKFLOW_REPO_NAME=autofix-bot
PORT=3001
```

### Step 6: Start Backend

```powershell
npm start
```

You should see:
```
🚀 Backend running on http://localhost:3001
📝 Environment:
   - Workflow Repo: your-username/autofix-bot
   - GitHub Token: ✅ Set
```

### Step 7: Test Backend

Open a new PowerShell window:
```powershell
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","service":"ci-healing-agent-github"}
```

### Step 8: Install Frontend

```powershell
cd ..
npm install
```

### Step 9: Start Frontend

```powershell
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:8080/
```

### Step 10: Test End-to-End! 🎉

1. Open http://localhost:8080 in your browser
2. You should see the beautiful CI/CD Healing Agent dashboard
3. Fill in the form:
   - **Repository URL**: Enter a GitHub repo (can be yours for testing)
   - **Team Name**: Test Team
   - **Leader Name**: John Doe
4. Click **"Run Healing Agent"**
5. Watch the status messages update
6. Click "View live logs on GitHub Actions" to see real-time execution
7. Wait for results to appear in the dashboard

---

## 🎨 What You'll See

### Loading State
- Animated CPU icon
- Real-time status messages:
  - "Triggering GitHub Actions workflow..."
  - "Workflow started! Running agent..."
  - "Agent running: Cloning → Testing → Fixing → Pushing..."
  - "Workflow completed! Fetching results..."
- Link to GitHub Actions logs

### Results Dashboard
- **Run Summary Card**: Repo, branch, failures, fixes, time, status
- **Score Panel**: Circular progress with base score + bonuses/penalties
- **Fixes Table**: All fixes with bug types, files, lines, commit messages
- **CI/CD Timeline**: Each iteration with pass/fail status

### Toast Notifications
- Success messages
- Error alerts
- Progress updates

---

## 🧪 Create a Test Repository

To properly test, create a simple repo with failing tests:

### Python Example (pytest)

1. Create new GitHub repo: `test-healing-agent`
2. Create `requirements.txt`:
```
pytest
```

3. Create `test_example.py`:
```python
def add(a, b):
    return a + b

def test_addition():
    assert add(2, 2) == 5  # Intentionally wrong!

def test_subtraction():
    assert 3 - 1 == 2  # This will pass
```

4. Push to GitHub
5. Use this repo URL in the dashboard
6. Watch the agent fix the assert statement!

### JavaScript Example (Jest)

1. Create new repo: `test-healing-js`
2. Create `package.json`:
```json
{
  "name": "test-app",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

3. Create `app.test.js`:
```javascript
test('addition', () => {
  expect(1 + 1).toBe(3); // Intentionally wrong!
});
```

4. Push and test!

---

## 🚀 Deploy to Production

### Deploy Backend to Vercel

```powershell
cd backend-github

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then add environment variables:
vercel env add GITHUB_TOKEN
vercel env add WORKFLOW_REPO_OWNER
vercel env add WORKFLOW_REPO_NAME

# Deploy to production
vercel --prod
```

You'll get a URL like: `https://your-backend.vercel.app`

### Deploy Frontend to Vercel

```powershell
cd ..

# Add API URL environment variable
echo "VITE_API_URL=https://your-backend.vercel.app/api" > .env.production

# Deploy
vercel --prod
```

You'll get a URL like: `https://your-app.vercel.app`

**Done! Your app is live! 🎉**

---

## 📊 Monitoring

### View Workflow Runs
```
https://github.com/your-username/autofix-bot/actions
```

### Check Backend Logs (Vercel)
```
vercel logs
```

### Check Frontend Logs
Open browser console (F12)

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: "EADDRINUSE: address already in use"
```powershell
# Kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

**Error**: "GITHUB_TOKEN is missing"
- Check `.env` file exists in `backend-github/`
- Verify token is correct

### Workflow not triggering

1. Check GitHub token permissions (must have `workflow` scope)
2. Verify workflow file is committed to `main` branch:
```powershell
git add .github/workflows/run-agent.yml
git commit -m "Add workflow"
git push
```
3. Check repo name in `.env` matches your actual repo

### Frontend can't connect to backend

1. Make sure backend is running on port 3001
2. Check browser console for CORS errors
3. Verify API URL in `.env` or code

### "Results not ready yet" error

- Workflow might still be running
- Check GitHub Actions page for status
- Artifact may take a few seconds after workflow completes

### Workflow fails

1. Go to GitHub Actions page
2. Click on failed run
3. Check logs for errors
4. Common issues:
   - Gemini API key not set
   - Target repo not accessible
   - Test framework not detected

---

## 💡 Tips for Demo

1. **Prepare a test repo beforehand** with known failures
2. **Show the GitHub Actions logs** live during demo
3. **Highlight the real-time status updates** in the UI
4. **Point out the branch name format**: `TEAM_ALPHA_JOHN_DOE_AI_Fix`
5. **Show the commit messages**: `[AI-AGENT] Fix SYNTAX in app.py line 42`
6. **Emphasize the scoring system** with bonuses/penalties
7. **Mention the free infrastructure**: "Runs on GitHub Actions, $0 cost!"

---

## 🎥 Recording Demo Video

1. Start with the dashboard homepage
2. Explain the problem (test failures block deployment)
3. Enter a repo URL with known failures
4. Show the loading animation and status updates
5. Switch to GitHub Actions to show live logs
6. Return to dashboard when complete
7. Walk through results: summary, Score, fixes, timeline
8. Show the new branch on GitHub
9. Show the commit history with [AI-AGENT] messages
10. End with "All tests passing!" message

---

## ✅ Final Checklist

Before submitting:

- [ ] Backend runs without errors
- [ ] Frontend displays correctly
- [ ] End-to-end test with real repo works
- [ ] GitHub Actions workflow completes successfully
- [ ] Results display in dashboard
- [ ] Branch name format is correct
- [ ] Commit messages have [AI-AGENT] prefix
- [ ] All UI elements look polished
- [ ] Toast notifications work
- [ ] Links to GitHub Actions work
- [ ] Deployed to production (optional)
- [ ] Demo video recorded
- [ ] README updated with screenshots
- [ ] LinkedIn post drafted

---

## 🏆 You're Ready to Win!

Everything is production-ready:
- ✅ Beautiful, responsive UI
- ✅ Real-time status updates  
- ✅ Proper error handling
- ✅ GitHub Actions integration
- ✅ No Docker/Railway needed
- ✅ 100% free infrastructure
- ✅ Professional architecture

**Go show the judges what you built! 🚀**

---

## 📞 Need Help?

If something doesn't work:
1. Check this guide's troubleshooting section
2. Review the logs (backend console, GitHub Actions, browser console)
3. Verify all environment variables are set
4. Make sure all dependencies are installed (`npm install`)

**Good luck with your hackathon! You've got this! 💪**
