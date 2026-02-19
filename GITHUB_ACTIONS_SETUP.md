# 🚀 CI Healing Agent - GitHub Actions Edition

**No Docker Required! No Railway Required! Runs directly on GitHub's free infrastructure.**

## 🎯 Architecture

```
Frontend (React)
    ↓
Backend (Express) - Just triggers workflows
    ↓
GitHub Actions (FREE!)
    ├── Clone target repo
    ├── Run tests
    ├── Classify errors with AI
    ├── Generate fixes
    ├── Commit & Push
    └── Upload results
```

**Cost**: 100% FREE using GitHub Actions (2,000 minutes/month on free plan)

---

## 🏗️ Project Structure

```
autofix-bot/
├── frontend/              # React dashboard (your existing code)
├── backend-github/        # Lightweight Express server (triggers workflows)
│   ├── server.js         # Main API server
│   ├── package.json
│   └── .env.example
├── agent-runner/         # Agent code (runs on GitHub Actions)
│   ├── src/
│   │   └── orchestrator.js
│   └── package.json
└── .github/
    └── workflows/
        └── run-agent.yml  # GitHub Actions workflow
```

---

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **OpenAI API Key** (get free credits at https://platform.openai.com)
3. **Node.js 20+** (for local development)

---

## ⚡ Quick Setup

### **Step 1: Get GitHub Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
4. Click **"Generate token"**
5. Copy the token (starts with `ghp_...`)

### **Step 2: Add Secrets to Your Repository**

1. Go to your repo: `Settings` → `Secrets and variables` → `Actions`
2. Click **"New repository secret"**
3. Add these secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GITHUB_TOKEN`: Automatically available (no setup needed)

### **Step 3: Install Backend Dependencies**

```powershell
cd backend-github
npm install
```

### **Step 4: Configure Backend**

```powershell
# Copy .env.example to .env
copy .env.example .env

# Edit .env with your details
notepad .env
```

Update with:
```env
GITHUB_TOKEN=ghp_your_token_here
WORKFLOW_REPO_OWNER=your-github-username
WORKFLOW_REPO_NAME=autofix-bot
PORT=3001
```

### **Step 5: Start Backend**

```powershell
npm start
```

Backend will run on: http://localhost:3001

### **Step 6: Update Frontend API URL**

```powershell
cd ..\frontend
```

Update [src/pages/Index.tsx](../frontend/src/pages/Index.tsx#L18):

```typescript
const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
  setLoading(true);
  setResult(null);

  try {
    // Call backend which triggers GitHub Actions
    const response = await fetch('http://localhost:3001/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, teamName, leaderName }),
    });

    if (!response.ok) throw new Error('Failed to trigger agent');

    const data = await response.json();
    
    // Poll for status
    const runId = data.runId;
    let completed = false;
    
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`http://localhost:3001/api/status/${runId}`);
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed') {
        completed = true;
        // You'd need to fetch the artifact or results here
        // For now, show success
        alert('Agent completed! Check GitHub Actions for results.');
      }
    }
    
  } catch (error) {
    console.error(error);
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### **Step 7: Start Frontend**

```powershell
npm run dev
```

Frontend will run on: http://localhost:8080

---

## 🎮 How to Use

1. **Open frontend**: http://localhost:8080
2. **Enter details**:
   - Repository URL: `https://github.com/username/repo`
   - Team Name: `Team Alpha`
   - Leader Name: `John Doe`
3. **Click "Run Healing Agent"**
4. **Watch progress**:
   - Backend triggers GitHub Actions workflow
   - Go to: https://github.com/your-username/autofix-bot/actions
   - See real-time logs
5. **Get results**:
   - Download artifact after completion
   - Or check the target repository for new branch

---

## 🔍 How It Works

1. **User submits form** → Frontend calls backend API
2. **Backend triggers workflow** → Uses GitHub API to start Actions
3. **GitHub Actions runs**:
   - Clones target repository
   - Runs tests
   - Finds failures
   - Calls OpenAI to classify errors
   - Generates fixes
   - Commits and pushes to new branch
   - Uploads `results.json` as artifact
4. **Results available**:
   - Download from GitHub Actions artifacts
   - View new branch on target repo

---

## 📊 Monitoring

### **View Workflow Runs**

```
https://github.com/{your-username}/autofix-bot/actions
```

### **Check Logs**

1. Click on a workflow run
2. Click "heal-ci" job
3. Expand steps to see detailed logs

### **Download Results**

1. Go to completed workflow
2. Scroll to **Artifacts** section
3. Download `agent-results`
4. Extract and view `results.json`

---

## 🚀 Deployment (100% FREE)

### **Option 1: Deploy Backend to Vercel**

```powershell
cd backend-github
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### **Option 2: Deploy to GitHub Pages (Static Site)**

Alternative: Make frontend call GitHub API directly (no backend needed!)

Update frontend to use Octokit:

```javascript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: 'ghp_your_token' });

await octokit.actions.createWorkflowDispatch({
  owner: 'your-username',
  repo: 'autofix-bot',
  workflow_id: 'run-agent.yml',
  ref: 'main',
  inputs: { repo_url: repoUrl, team_name: teamName, leader_name: leaderName }
});
```

Deploy frontend:
```powershell
cd frontend
npm run build
# Upload dist/ folder to GitHub Pages
```

---

## 💡 Benefits of GitHub Actions Approach

✅ **No Docker needed** - Runs on GitHub's infrastructure  
✅ **No server hosting** - GitHub Actions is serverless  
✅ **100% free** - 2,000 minutes/month on free plan  
✅ **No Railway/Vercel needed** - Self-contained  
✅ **Built-in CI/CD** - Already integrated with GitHub  
✅ **Artifact storage** - Results saved automatically  
✅ **Audit logs** - Full execution history  
✅ **Scalable** - GitHub handles scaling  

---

## 🐛 Troubleshooting

### **Workflow not triggering?**

- Check GitHub token has `workflow` scope
- Verify repo owner/name in `.env`
- Ensure workflow file is committed to `main` branch

### **Workflow failing?**

- Check GitHub Actions logs for errors
- Verify `OPENAI_API_KEY` secret is set
- Ensure target repo is accessible

### **Backend connection refused?**

```powershell
# Check if backend is running
curl http://localhost:3001/api/health
```

---

## 📝 Example Usage

**Test Repository**: Create a simple repo with failing tests:

```python
# test_example.py
def test_failing():
    assert 1 == 2  # This will fail
```

Run agent, it will:
1. Detect pytest framework
2. Run tests → fail
3. Classify as LOGIC error
4. Generate fix: `assert 1 == 1`
5. Commit and push
6. Run tests again → pass ✅

---

## 🎥 Demo Video Script

1. Show GitHub Actions workflow file
2. Start backend: `npm start`
3. Start frontend: `npm run dev`
4. Enter test repo details
5. Click "Run Healing Agent"
6. Switch to GitHub Actions tab
7. Show real-time logs
8. Wait for completion
9. Show new branch created
10. Show results.json artifact

---

## 🏆 Why This Approach Wins

- **Judges love it**: Uses GitHub's native features
- **No dependencies**: No Docker/Railway needed
- **Transparent**: Full logs visible in GitHub
- **Reproducible**: Anyone can run it
- **Professional**: Production CI/CD platform

---

## 📚 Additional Resources

- GitHub Actions Docs: https://docs.github.com/actions
- Octokit API: https://github.com/octokit/rest.js
- OpenAI API: https://platform.openai.com/docs

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and improve!

---

## 📄 License

MIT

---

**Built with ❤️ using GitHub Actions (no Docker required!)**
