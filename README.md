# 🤖 Autonomous CI/CD Healing Agent

> **AI-powered DevOps agent that automatically detects, classifies, and fixes test failures in GitHub repositories.**

[![GitHub Actions](https://img.shields.io/badge/Powered%20by-GitHub%20Actions-2088FF?logo=github-actions)](https://github.com/features/actions)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)](https://ai.google.dev)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)

![CI Healing Agent Demo](docs/demo-screenshot.png)

---

## 🎯 **What It Does**

Broken tests? Let AI fix them automatically! This agent:

1. **Clones** your GitHub repository
2. **Detects** test failures automatically  
3. **Classifies** errors using AI (LINTING, SYNTAX, LOGIC, TYPE_ERROR, IMPORT, INDENTATION)
4. **Generates** targeted fixes with Google Gemini
5. **Commits** each fix with format: `[AI-AGENT] Fix SYNTAX in app.py line 42`
6. **Creates** a new branch: `TEAMNAME_LEADERNAME_AI_Fix`
7. **Pushes** to GitHub
8. **Monitors** CI/CD pipeline
9. **Retries** until tests pass (max 5 iterations)
10. **Reports** detailed results in a beautiful dashboard

**Cost**: **$0** - Runs on GitHub Actions free tier + Google Gemini FREE API!

**💰 Why This is Special:**
- ✅ **Google Gemini API = 100% FREE** (1,500 requests/day)
- ✅ **No credit card required** unlike OpenAI
- ✅ **1M tokens/day** on free tier
- ✅ **GitHub Actions = FREE** (2,000 minutes/month)
- ✅ **Vercel Hosting = FREE**

**Total Monthly Cost: $0** 🎉

---

## ✨ **Features**

### 🎨 **Beautiful React Dashboard**
- Real-time status updates during execution
- Live link to GitHub Actions logs
- Comprehensive results visualization:
  - Run summary with branch info
  - Score panel with progress indicator
  - Fixes table with all applied changes
  - CI/CD timeline with retry history

### 🤖 **Intelligent AI Classification**
Automatically categorizes errors into 6 bug types:
- `LINTING` - Style issues, formatting
- `SYNTAX` - Missing colons, brackets
- `LOGIC` - Wrong conditions, assertions
- `TYPE_ERROR` - Type mismatches
- `IMPORT` - Missing/incorrect imports
- `INDENTATION` - Spacing issues

### 🔄 **Multi-Language Support**
- ✅ Python (pytest, unittest)
- ✅ JavaScript/TypeScript (Jest, Vitest)
- ✅ Extensible for more frameworks

### 🏆 **Scoring System**
- **Base**: 100 points
- **Bonus**: +10 if completed under 5 minutes
- **Penalty**: -2 per commit over 20

### 🚀 **GitHub Actions Native**
- No Docker installation required
- Runs on GitHub's free infrastructure
- 2,000 minutes/month free tier
- Full audit logs and artifact storage

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard (Vercel)                  │
│  Beautiful UI with real-time status updates                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP POST /api/run-agent
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Lightweight Backend (Vercel/Node.js)           │
│  Triggers workflows, polls status, fetches results          │
└─────────────────────┬───────────────────────────────────────┘
                      │ GitHub API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                GitHub Actions (FREE Runner)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Agent Orchestrator (agent-runner/orchestrator.js)    │ │
│  │  - Clone repo                                          │ │
│  │  - Run tests                                           │ │
│  │  - Classify errors with OpenAI                        │ │
│  │  - Generate AI fixes                                   │ │
│  │  - Commit & push to new branch                        │ │
│  │  - Retry until tests pass                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start (10 Minutes)**

### Prerequisites
- Node.js 20+
- GitHub Account
- Google Gemini API Key (FREE: https://aistudio.google.com/app/apikey)
- GitHub Personal Access Token

### 1️⃣ **Clone Repository**
```bash
git clone https://github.com/your-username/autofix-bot.git
cd autofix-bot
```

### 2️⃣ **Get GitHub Token**
1. Go to https://github.com/settings/tokens
2. Generate classic token with `repo` + `workflow` scopes
3. Copy token

### 3️⃣ **Add Secrets**
1. Go to your repo → Settings → Secrets → Actions
2. Add secret: `GEMINI_API_KEY`

### 4️⃣ **Run Setup Script**
```powershell
.\start.ps1
```

**That's it!** 🎉

The script will:
- Install all dependencies
- Create `.env` file
- Start backend on port 3001
- Start frontend on port 8080
- Open browser automatically

### Manual Setup

See [COMPLETE_SETUP.md](COMPLETE_SETUP.md) for detailed step-by-step instructions.

---

## 📖 **Usage**

### ⚠️ **IMPORTANT: Repository Permissions**

✨ **NEW: Automatic Forking Feature!**

The agent now **automatically handles permission issues** for you:

✅ **What happens:**
- Agent checks if you have write access to the repository
- If **NO** write access → Automatically **forks** the repo to your account
- Makes fixes in your fork → Creates a **PR back to the original** repository
- If **YES** write access → Works directly on the repo (no fork needed)

📝 **This means you can now:**
- Enter **ANY public GitHub repository URL**
- No need to manually fork - we handle it automatically!
- Works on your own repos AND other people's repos seamlessly

**Previous behavior (manual forking):**
~~1. Click "Fork" on their GitHub repository~~
~~2. Use your forked URL~~
~~3. The agent will push to your fork~~

**Now you can just paste any repo URL and we'll handle the rest!** 🎉

---

### 🚀 **Steps to Use**

1. **Open** http://localhost:8080 (or your Vercel deployment URL)
2. **Enter**:
   - Repository URL (e.g., `https://github.com/YOUR-USERNAME/your-repo`)
   - Team Name (e.g., `Team Alpha`)
   - Leader Name (e.g., `John Doe`)
3. **Click** "Run Healing Agent"
4. **Watch** real-time status updates
5. **View** live logs on GitHub Actions
6. **See** results in beautiful dashboard

**Tip**: Always test with your own repositories or forks!

---

## 📊 **Example Output**

### Branch Created
```
TEAM_ALPHA_JOHN_DOE_AI_Fix
```

### Commit Messages
```
[AI-AGENT] Fix LINTING in src/utils.py line 15
[AI-AGENT] Fix SYNTAX in src/validator.py line 8
[AI-AGENT] Fix LOGIC in src/model.py line 42
[AI-AGENT] Add results summary
```

### Results JSON
```json
{
  "teamName": "TEAM_ALPHA",
  "leaderName": "JOHN_DOE",
  "branchName": "TEAM_ALPHA_JOHN_DOE_AI_Fix",
  "totalFailures": 7,
  "totalFixes": 7,
  "finalCIStatus": "PASSED",
  "totalTimeTaken": "3m 42s",
  "score": {
    "base": 100,
    "timeBonus": 10,
    "commitPenalty": 0,
    "final": 110
  }
}
```

---

## 🛠️ **Tech Stack**

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Sonner (toast notifications)

### Backend
- Node.js + Express
- Octokit (GitHub API)
- AdmZip (artifact extraction)

### AI & Automation
- Google Gemini 2.0 Flash (error classification & fixes) - **FREE!**
- GitHub Actions (execution environment)
- simple-git (Git operations)

### Deployment
- Frontend: Vercel
- Backend: Vercel
- Agent: GitHub Actions

**Total Cost**: $0 (all free tiers!)

---

## 📁 **Project Structure**

```
autofix-bot/
├── src/                        # Frontend React app
│   ├── components/             # UI components
│   ├── pages/Index.tsx         # Main dashboard
│   ├── lib/
│   │   ├── api.ts             # API client with polling
│   │   └── types.ts           # TypeScript interfaces
│   └── ...
│
├── backend-github/             # Lightweight API server
│   ├── server.js              # Express app
│   ├── package.json
│   └── .env.example
│
├── agent-runner/              # Agent code (runs on GitHub)
│   ├── src/
│   │   └── orchestrator.js    # Main agent logic
│   └── package.json
│
├── .github/workflows/
│   └── run-agent.yml          # GitHub Actions workflow
│
├── start.ps1                  # Quick start script
├── COMPLETE_SETUP.md          # Detailed setup guide
└── README.md                  # This file
```

---

## 🧪 **Testing**

### Create a Test Repository

**Python Example**:
```python
# test_example.py
def test_addition():
    assert 1 + 1 == 3  # Intentionally wrong!
```

**JavaScript Example**:
```javascript
// app.test.js
test('addition', () => {
  expect(1 + 1).toBe(3); // Intentionally wrong!
});
```

Run the agent and watch it fix the assertions automatically!

---

## 🚀 **Deployment**

### Deploy Backend
```bash
cd backend-github
vercel --prod
```

### Deploy Frontend  
```bash
vercel --prod
```

### Add Environment Variables
```bash
vercel env add GITHUB_TOKEN
vercel env add WORKFLOW_REPO_OWNER
vercel env add WORKFLOW_REPO_NAME
vercel env add OPENAI_API_KEY
```

**Done!** Your app is live! 🎉

---

## 🐛 **Troubleshooting**

### Backend won't start
```powershell
# Kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Workflow not triggering
- Check GitHub token has `workflow` scope
- Verify workflow file is on `main` branch
- Ensure secrets are set in repo settings

### See [COMPLETE_SETUP.md](COMPLETE_SETUP.md) for more troubleshooting

---

## 📚 **Documentation**

- [**COMPLETE_SETUP.md**](COMPLETE_SETUP.md) - Full setup guide
- [**QUICKSTART.md**](QUICKSTART.md) - Quick reference
- [**GITHUB_ACTIONS_SETUP.md**](GITHUB_ACTIONS_SETUP.md) - Workflow details
- [**FIXES_NEEDED.md**](FIXES_NEEDED.md) - Production improvements

---

## 🏆 **Why This Project is Special**

✅ **No Docker** - Runs on GitHub Actions  
✅ **$0 Cost** - 100% free infrastructure  
✅ **Production-Ready** - Error handling, retries, monitoring  
✅ **Beautiful UI** - Professional React dashboard  
✅ **Real-time Updates** - Live status and GitHub logs  
✅ **Smart AI** - Context-aware error classification  
✅ **Multi-Language** - Python, JavaScript, TypeScript  
✅ **Scalable** - GitHub handles all scaling  

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file

---

## 👤 **Author**

Built with ❤️ for hackathon submission

**GitHub**: [your-username](https://github.com/your-username)  
**LinkedIn**: [your-profile](https://linkedin.com/in/your-profile)

---

## 🙏 **Acknowledgments**

- Google for Gemini API
- GitHub for Actions infrastructure
- shadcn/ui for beautiful components
- All open-source contributors

---

## 📸 **Screenshots**

### Dashboard - Loading State
![Loading](docs/loading.png)

### Dashboard - Results
![Results](docs/results.png)

### GitHub Actions Logs
![GitHub Actions](docs/github-actions.png)

---

## 🎥 **Demo Video**

[![Watch Demo](docs/thumbnail.png)](https://youtube.com/your-demo)

---

**⭐ If you like this project, give it a star!**

**Happy Hacking! 🚀**
