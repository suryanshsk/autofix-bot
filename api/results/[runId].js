import { Octokit } from '@octokit/rest';
import AdmZip from 'adm-zip';

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
    return res.json(JSON.parse(resultsJson));

  } catch (error) {
    console.error('❌ Error fetching results:', error);
    return res.status(500).json({
      error: 'Failed to fetch results',
      message: error.message,
    });
  }
}
