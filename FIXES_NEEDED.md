# 🔧 Essential Fixes for Production

## Issues Found & Fixes

### 1. Better Error Parsing

Replace in `agent-runner/src/orchestrator.js`:

```javascript
parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Try structured format from LLM
    let match = line.match(/^(\w+) error in (.+?) line (\d+) → Fix: (.+)$/);
    if (match) {
      const [, bugType, file, lineNum, description] = match;
      errors.push({
        bugType: bugType.trim(),
        file: file.trim(),
        line: parseInt(lineNum),
        description: description.trim(),
      });
      continue;
    }

    // Fall back to pytest format
    match = line.match(/FAILED (.+?)::(.+?) - (.+?)Error/);
    if (match) {
      const [, file, testName, errorType] = match;
      errors.push({
        bugType: errorType.includes('Syntax') ? 'SYNTAX' : 'LOGIC',
        file: file.replace('::', '/'),
        line: 1,
        description: `Test ${testName} failed`,
      });
      continue;
    }

    // Fall back to jest format
    match = line.match(/● (.+?) › (.+?)\n\s+(\w+Error)/);
    if (match) {
      errors.push({
        bugType: 'LOGIC',
        file: 'unknown',
        line: 1,
        description: match[2],
      });
    }
  }

  return errors;
}
```

### 2. Better Git Error Handling

Add to orchestrator.js:

```javascript
async safePush(git, branchName) {
  try {
    await git.push('origin', branchName, ['--set-upstream']);
    console.log('✅ Push successful');
  } catch (error) {
    if (error.message.includes('rejected')) {
      console.log('⚠️  Push rejected, force pushing...');
      await git.push('origin', branchName, ['--force', '--set-upstream']);
    } else if (error.message.includes('authentication')) {
      throw new Error('GitHub authentication failed. Check your token.');
    } else {
      throw error;
    }
  }
}
```

### 3. Add Timeout Protection

```javascript
async runWithTimeout(promise, timeoutMs, errorMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// Usage:
const testResult = await runWithTimeout(
  testRunner.runTests(),
  300000, // 5 minutes
  'Test execution timeout'
);
```

### 4. Complete Backend Artifact Download

Add to `backend-github/server.js`:

```javascript
const AdmZip = require('adm-zip');

app.get('/api/results/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    // Get artifacts
    const artifacts = await octokit.actions.listWorkflowRunArtifacts({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      run_id: runId,
    });

    const resultsArtifact = artifacts.data.artifacts.find(
      a => a.name === 'agent-results'
    );

    if (!resultsArtifact) {
      return res.status(404).json({ error: 'Results not ready yet' });
    }

    // Download artifact
    const download = await octokit.actions.downloadArtifact({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      artifact_id: resultsArtifact.id,
      archive_format: 'zip',
    });

    // Extract results.json
    const zip = new AdmZip(Buffer.from(download.data));
    const resultsJson = zip.readAsText('results.json');

    res.json(JSON.parse(resultsJson));

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: error.message });
  }
});
```

Install dependency:
```bash
npm install adm-zip
```

### 5. Frontend Real-Time Updates

Replace in `frontend/src/pages/Index.tsx`:

```typescript
const handleSubmit = async (repoUrl: string, teamName: string, leaderName: string) => {
  setLoading(true);
  setResult(null);

  try {
    // Trigger workflow
    const response = await fetch('http://localhost:3001/api/run-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, teamName, leaderName }),
    });

    if (!response.ok) throw new Error('Failed to trigger agent');

    const { runId, githubUrl } = await response.json();
    console.log('Workflow started:', githubUrl);

    // Poll for results
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        throw new Error('Timeout waiting for results');
      }

      attempts++;

      const statusRes = await fetch(`http://localhost:3001/api/results/${runId}`);
      
      if (statusRes.status === 404) {
        // Not ready yet, retry in 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        return poll();
      }

      if (!statusRes.ok) {
        throw new Error('Failed to fetch results');
      }

      const results = await statusRes.json();
      setResult(results);
      setLoading(false);
    };

    await poll();

  } catch (error: any) {
    console.error(error);
    alert('Error: ' + error.message);
    setLoading(false);
  }
};
```

---

## Testing Commands

### Test 1: Branch Name
```powershell
cd agent-runner
node -e "const {formatBranchName} = require('./src/orchestrator'); console.log(formatBranchName('Team Alpha', 'John Doe'));"
```

Expected: `TEAM_ALPHA_JOHN_DOE_AI_Fix`

### Test 2: Local Run
```powershell
$env:REPO_URL="https://github.com/test/repo"
$env:TEAM_NAME="Test"
$env:LEADER_NAME="User"
$env:OPENAI_API_KEY="sk-..."
$env:GITHUB_TOKEN="ghp_..."

node src/orchestrator.js
```

### Test 3: Backend Health
```powershell
curl http://localhost:3001/api/health
```

---

## Priority Order

1. ✅ **Test branch formatter** (1 min)
2. ✅ **Add error handling** (15 min)
3. ✅ **Test local execution** (30 min)
4. ✅ **Fix artifact download** (30 min)
5. ✅ **Add frontend polling** (30 min)
6. ✅ **Test end-to-end** (1 hour)
7. ✅ **Deploy** (30 min)

**Total Time**: ~3.5 hours to production-ready
