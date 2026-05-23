# 🚀 Quick Start Guide - No Docker/Railway Required!

## ✅ What You Have Now

Three options to run your CI Healing Agent **without Docker or Railway**:

---

## 📊 COMPARISON TABLE

| Feature | GitHub Actions Only | Frontend + Backend | Full Backend |
|---------|-------------------|-------------------|--------------|
| **Docker needed?** | ❌ No | ❌ No | ✅ Yes |
| **Railway needed?** | ❌ No | ❌ No | ❌ Optional |
| **Complexity** | ⭐ Easiest | ⭐⭐ Easy | ⭐⭐⭐ Complex |
| **Free hosting** | ✅ 100% | ✅ Yes | ⚠️ Limited |
| **Setup time** | 10 min | 20 min | 2 hours |
| **Production ready** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🎯 RECOMMENDED: GitHub Actions + Lightweight Backend

**Why**: Runs on GitHub's free infrastructure, no Docker needed!

### What I Created For You:

```
autofix-bot/
├── ✅ frontend/                    (Your existing React app)
├── ✅ backend-github/              (NEW - Lightweight API server)
│   ├── server.js                  (Triggers GitHub Actions)
│   ├── package.json
│   └── .env.example
├── ✅ agent-runner/                (NEW - Runs on GitHub Actions)
│   ├── src/orchestrator.js        (Main agent logic)
│   └── package.json
└── ✅ .github/workflows/
    └── run-agent.yml              (NEW - GitHub Actions workflow)
```

---

## 🏃 GET STARTED IN 5 MINUTES

### Step 1: Get GitHub Token

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select: ✅ `repo` and ✅ `workflow`
4. Copy token

### Step 2: Add Gemini Key to GitHub

1. Go to your repo → Settings → Secrets → Actions
2. Add secret: `OPENAI_API_KEY` = your OpenAI key
3. `GITHUB_TOKEN` is already available automatically

### Step 3: Setup Backend

```powershell
# Install dependencies
cd backend-github
npm install

# Create .env file
copy .env.example .env

# Edit .env - add your details
notepad .env
```

Update `.env`:
```env
GITHUB_TOKEN=ghp_xxxxx
WORKFLOW_REPO_OWNER=your-username
WORKFLOW_REPO_NAME=autofix-bot
PORT=3001
```

### Step 4: Start Backend

```powershell
npm start
```

✅ Backend running at: http://localhost:3001

### Step 5: Test Backend

```powershell
curl http://localhost:3001/api/health
```

Should return: `{"status":"ok"}`

### Step 6: Update Frontend

Your frontend already has the UI! Just update the API call in [src/pages/Index.tsx](src/pages/Index.tsx#L18):

```typescript
const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
  setLoading(true);
  setResult(null);

  try {
    const response = await fetch('http://localhost:3001/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, teamName, leaderName }),
    });

    const data = await response.json();
    console.log('Workflow triggered:', data.githubUrl);
    
    // For now, show the GitHub Actions URL
    alert(`Agent started! View progress: ${data.githubUrl}`);
    
    // TODO: Add polling logic for real-time updates
    
  } catch (error: any) {
    console.error(error);
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 7: Start Frontend

```powershell
cd ..\frontend
npm run dev
```

✅ Frontend running at: http://localhost:8080

### Step 8: Test It!

1. Open http://localhost:8080
2. Enter a GitHub repo URL (can be your test repo)
3. Enter team name: `Test Team`
4. Enter leader name: `John Doe`
5. Click "Run Healing Agent"
6. Go to: https://github.com/your-username/autofix-bot/actions
7. Watch your workflow run in real-time!

---

## 📊 How It Works

```
User fills form in React
    ↓
Frontend calls: POST /api/run-agent
    ↓
Backend (Express) calls GitHub API
    ↓
GitHub Actions workflow starts
    ↓
Workflow runs your agent:
  • Clones target repo
  • Runs tests
  • Classifies errors with OpenAI
  • Generates fixes
  • Commits & pushes to new branch
    ↓
Results saved as artifact
    ↓
Download results.json from GitHub
```

---

## 🎥 View Execution

### GitHub Actions Dashboard
```
https://github.com/{your-username}/autofix-bot/actions
```

1. Click on latest workflow run
2. Click "heal-ci" job
3. See real-time logs
4. Download artifact when complete

---

## 📦 Deploy to Production (FREE)

### Backend → Vercel

```powershell
cd backend-github
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Frontend → Vercel

```powershell
cd frontend
vercel
```

Update API URL to your backend URL.

**Total Cost**: $0 (Both free tiers)

---

## ❓ FAQ

### Q: Do I need Docker?
**A**: ❌ No! GitHub Actions provides the runtime environment.

### Q: Do I need Railway or Heroku?
**A**: ❌ No! Backend can run on Vercel (free). Or skip backend entirely.

### Q: How much does GitHub Actions cost?
**A**: ✅ Free tier: 2,000 minutes/month (enough for ~40 agent runs)

### Q: What if I exceed the free tier?
**A**: You'll get an email warning. Each additional minute costs $0.008.

### Q: Can I run this locally?
**A**: ✅ Yes! Follow steps above. Agent runs on GitHub, but you control it locally.

### Q: How do I get results back?
**A**: Download artifact from GitHub Actions, or implement webhook callback.

### Q: Can I test without GitHub Actions?
**A**: ✅ Yes! Run `node agent-runner/src/orchestrator.js` locally with environment variables.

---

## 🎯 Next Steps

1. ✅ Test locally (Steps 1-8 above)
2. ✅ Create a test repository with failing tests
3. ✅ Run agent and verify it works
4. ✅ Deploy to production (Vercel)
5. ✅ Record demo video
6. ✅ Submit hackathon project!

---

## 📚 Documentation

- **Full Setup**: See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
- **Frontend Only**: See [FRONTEND_ONLY_OPTION.md](FRONTEND_ONLY_OPTION.md)
- **Troubleshooting**: Check workflow logs on GitHub

---

## 🐛 Common Issues

### Backend won't start
```powershell
# Check if port 3001 is available
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <process_id> /F
```

### Workflow not running
- Verify workflow file is on `main` branch
- Check GitHub token has correct permissions
- Make sure secrets are set in repo settings

### Can't trigger workflow
- Ensure `GITHUB_TOKEN` in `.env` has `workflow` scope
- Verify repo owner/name are correct

---

## 🏆 You're Ready!

You now have:
- ✅ Backend that triggers GitHub Actions
- ✅ Agent code that runs on GitHub
- ✅ Frontend dashboard (already built)
- ✅ Zero Docker/Railway dependencies
- ✅ 100% free hosting solution

**Time to test it and deploy! 🚀**
