require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const AdmZip = require('adm-zip');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// GitHub API client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Your repo details (where the workflow lives)
const WORKFLOW_REPO_OWNER = process.env.WORKFLOW_REPO_OWNER || 'your-username';
const WORKFLOW_REPO_NAME = process.env.WORKFLOW_REPO_NAME || 'autofix-bot';
const WORKFLOW_FILE = 'run-agent.yml';

// In-memory storage for run tracking
const runs = new Map();

/**
 * POST /api/run-agent
 * Triggers GitHub Actions workflow
 */
app.post('/api/run-agent', async (req, res) => {
  try {
    const { repoUrl, teamName, leaderName } = req.body;

    // Validation
    if (!repoUrl || !teamName || !leaderName) {
      return res.status(400).json({
        error: 'Missing required fields: repoUrl, teamName, leaderName',
      });
    }

    console.log(`🚀 Triggering workflow for ${repoUrl}`);

    // Trigger workflow via GitHub API
    const response = await octokit.actions.createWorkflowDispatch({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      workflow_id: WORKFLOW_FILE,
      ref: 'main',
      inputs: {
        repo_url: repoUrl,
        team_name: teamName,
        leader_name: leaderName,
      },
    });

    // Wait for run to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

    const runsResponse = await octokit.actions.listWorkflowRuns({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      workflow_id: WORKFLOW_FILE,
      per_page: 1,
    });

    const run = runsResponse.data.workflow_runs[0];
    const runId = run?.id;

    if (runId) {
      runs.set(runId, { repoUrl, teamName, leaderName, status: 'running' });
    }

    res.json({
      message: 'Workflow triggered successfully',
      runId,
      status: 'running',
      statusUrl: `/api/status/${runId}`,
      githubUrl: run?.html_url,
    });

  } catch (error) {
    console.error('❌ Error triggering workflow:', error);
    res.status(500).json({
      error: 'Failed to trigger workflow',
      message: error.message,
    });
  }
});

/**
 * GET /api/status/:runId
 * Check workflow status and get results
 */
app.get('/api/status/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    const run = await octokit.actions.getWorkflowRun({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      run_id: runId,
    });

    const status = run.data.status;
    const conclusion = run.data.conclusion;

    // If completed, try to get the artifact
    if (status === 'completed') {
      try {
        const artifacts = await octokit.actions.listWorkflowRunArtifacts({
          owner: WORKFLOW_REPO_OWNER,
          repo: WORKFLOW_REPO_NAME,
          run_id: runId,
        });

        const resultsArtifact = artifacts.data.artifacts.find(
          a => a.name === 'agent-results'
        );

        if (resultsArtifact) {
          return res.json({
            status: 'completed',
            conclusion,
            artifactUrl: resultsArtifact.archive_download_url,
            message: 'Download artifact to see results',
          });
        }
      } catch (artifactError) {
        console.error('Could not fetch artifacts:', artifactError);
      }
    }

    res.json({
      status,
      conclusion,
      runUrl: run.data.html_url,
    });

  } catch (error) {
    console.error('❌ Error checking status:', error);
    res.status(500).json({
      error: 'Failed to check status',
      message: error.message,
    });
  }
});

/**
 * GET /api/results/:runId
 * Download and parse results from workflow artifact
 */
app.get('/api/results/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    console.log(`📥 Fetching results for run ${runId}`);

    const artifacts = await octokit.actions.listWorkflowRunArtifacts({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      run_id: runId,
    });

    const resultsArtifact = artifacts.data.artifacts.find(
      a => a.name === 'agent-results'
    );

    if (!resultsArtifact) {
      return res.status(404).json({ 
        error: 'Results not ready yet',
        message: 'Workflow is still running or no results generated'
      });
    }

    console.log('📦 Downloading artifact...');
    const download = await octokit.actions.downloadArtifact({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      artifact_id: resultsArtifact.id,
      archive_format: 'zip',
    });

    const zip = new AdmZip(Buffer.from(download.data));
    const resultsJson = zip.readAsText('results.json');
    
    console.log('✅ Results fetched successfully');
    res.json(JSON.parse(resultsJson));

  } catch (error) {
    console.error('❌ Error fetching results:', error);
    res.status(500).json({
      error: 'Failed to fetch results',
      message: error.message,
    });
  }
});

/**
 * POST /api/webhook
 * Receives results from workflow
 */
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('📥 Received webhook from workflow');
    const results = req.body;
    console.log('Results:', JSON.stringify(results, null, 2));
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ci-healing-agent-github' });
});

// Export for Vercel serverless
module.exports = app;
