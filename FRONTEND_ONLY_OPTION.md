# 🎯 SIMPLEST OPTION: Frontend-Only (No Backend!)

## Architecture

```
React Frontend (with Octokit)
    ↓
Directly calls GitHub API
    ↓
Triggers GitHub Actions
    ↓
Agent runs on GitHub
```

**Requirements**: Just your React app + GitHub token

---

## Setup

### 1. Install Octokit in Frontend

```powershell
cd frontend
npm install @octokit/rest
```

### 2. Create GitHub API Service

Create `frontend/src/lib/github-api.ts`:

```typescript
import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_REPO_OWNER || 'your-username';
const REPO_NAME = import.meta.env.VITE_REPO_NAME || 'autofix-bot';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export async function triggerHealingAgent(
  repoUrl: string,
  teamName: string,
  leaderName: string
) {
  // Trigger workflow
  await octokit.actions.createWorkflowDispatch({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    workflow_id: 'run-agent.yml',
    ref: 'main',
    inputs: {
      repo_url: repoUrl,
      team_name: teamName,
      leader_name: leaderName,
    },
  });

  // Wait for run to be created
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get latest run
  const runs = await octokit.actions.listWorkflowRuns({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    workflow_id: 'run-agent.yml',
    per_page: 1,
  });

  const run = runs.data.workflow_runs[0];
  return {
    runId: run.id,
    htmlUrl: run.html_url,
    status: run.status,
  };
}

export async function checkWorkflowStatus(runId: number) {
  const run = await octokit.actions.getWorkflowRun({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    run_id: runId,
  });

  return {
    status: run.data.status, // queued, in_progress, completed
    conclusion: run.data.conclusion, // success, failure
    htmlUrl: run.data.html_url,
  };
}

export async function getWorkflowArtifacts(runId: number) {
  const artifacts = await octokit.actions.listWorkflowRunArtifacts({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    run_id: runId,
  });

  return artifacts.data.artifacts;
}
```

### 3. Update Index.tsx

Replace the `handleSubmit` function:

```typescript
import { triggerHealingAgent, checkWorkflowStatus } from '@/lib/github-api';

const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
  setLoading(true);
  setResult(null);

  try {
    // Trigger GitHub Actions workflow
    const { runId, htmlUrl } = await triggerHealingAgent(repoUrl, teamName, leaderName);
    
    console.log(`Workflow started: ${htmlUrl}`);
    
    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5s * 60 = 300s)
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const status = await checkWorkflowStatus(runId);
      
      if (status.status === 'completed') {
        completed = true;
        
        if (status.conclusion === 'success') {
          // Show success message with link to GitHub
          setResult({
            ...MOCK_RESULT,
            repoUrl,
            teamName: teamName.toUpperCase().replace(/\s+/g, '_'),
            leaderName: leaderName.toUpperCase().replace(/\s+/g, '_'),
            branchName: formatBranchName(teamName, leaderName),
            finalCIStatus: 'PASSED',
          });
        } else {
          alert(`Workflow failed. View logs: ${htmlUrl}`);
        }
      }
      
      attempts++;
    }
    
    if (!completed) {
      alert(`Workflow still running. View progress: ${htmlUrl}`);
    }
    
  } catch (error: any) {
    console.error(error);
    alert('Error: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### 4. Add Environment Variables

Create `frontend/.env`:

```env
VITE_GITHUB_TOKEN=ghp_your_token_here
VITE_REPO_OWNER=your-username
VITE_REPO_NAME=autofix-bot
```

### 5. Deploy Frontend Only

```powershell
cd frontend

# Build
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or deploy to GitHub Pages
# Push dist/ folder to gh-pages branch
```

Add environment variables in Vercel dashboard.

---

## Benefits

✅ **No backend needed** - Frontend talks directly to GitHub  
✅ **No server hosting** - Just static site hosting  
✅ **Simpler architecture** - One less component  
✅ **Cheaper to run** - Static hosting is free  
✅ **Faster development** - No backend code to write  

---

## Security Note

⚠️ **Important**: Don't expose GitHub token in frontend for production.

**Solution**: Use backend as proxy (the `backend-github` solution above) OR use GitHub OAuth flow.

For hackathon/demo purposes, the direct approach works fine.

---

## Which Approach to Use?

| Approach | Complexity | Security | Best For |
|----------|-----------|----------|----------|
| **Frontend Only** | ⭐ Simplest | ⚠️ Token exposed | Quick demos |
| **Frontend + Backend** | ⭐⭐ Simple | ✅ Secure | Production |
| **Full Backend** | ⭐⭐⭐ Complex | ✅ Most secure | Enterprise |

---

**Recommendation for Hackathon**: Use **Frontend + Backend** (backend-github folder) for best balance of simplicity and security.
