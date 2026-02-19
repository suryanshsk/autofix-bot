import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const WORKFLOW_REPO_OWNER = process.env.WORKFLOW_REPO_OWNER || 'suryanshsk';
const WORKFLOW_REPO_NAME = process.env.WORKFLOW_REPO_NAME || 'autofix-bot';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { runId } = req.query;

    const run = await octokit.actions.getWorkflowRun({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      run_id: runId,
    });

    const status = run.data.status;
    const conclusion = run.data.conclusion;

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

    return res.json({
      status,
      conclusion,
      runUrl: run.data.html_url,
    });

  } catch (error) {
    console.error('❌ Error checking status:', error);
    return res.status(500).json({
      error: 'Failed to check status',
      message: error.message,
    });
  }
}
