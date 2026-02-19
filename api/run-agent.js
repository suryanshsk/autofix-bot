import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const WORKFLOW_REPO_OWNER = process.env.WORKFLOW_REPO_OWNER || 'suryanshsk';
const WORKFLOW_REPO_NAME = process.env.WORKFLOW_REPO_NAME || 'autofix-bot';
const WORKFLOW_FILE = 'run-agent.yml';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { repoUrl, teamName, leaderName } = req.body;

    if (!repoUrl || !teamName || !leaderName) {
      return res.status(400).json({
        error: 'Missing required fields: repoUrl, teamName, leaderName',
      });
    }

    console.log(`🚀 Triggering workflow for ${repoUrl}`);

    await octokit.actions.createWorkflowDispatch({
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

    await new Promise(resolve => setTimeout(resolve, 2000));

    const runsResponse = await octokit.actions.listWorkflowRuns({
      owner: WORKFLOW_REPO_OWNER,
      repo: WORKFLOW_REPO_NAME,
      workflow_id: WORKFLOW_FILE,
      per_page: 1,
    });

    const run = runsResponse.data.workflow_runs[0];
    const runId = run?.id;

    return res.json({
      message: 'Workflow triggered successfully',
      runId,
      status: 'running',
      statusUrl: `/api/status/${runId}`,
      githubUrl: run?.html_url,
    });

  } catch (error) {
    console.error('❌ Error triggering workflow:', error);
    return res.status(500).json({
      error: 'Failed to trigger workflow',
      message: error.message,
    });
  }
}
