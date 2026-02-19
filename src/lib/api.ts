// API configuration
// In production, use relative paths to hit the same domain's /api routes
// In development, point to local backend server
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

export interface AgentRequest {
  repoUrl: string;
  teamName: string;
  leaderName: string;
}

export interface AgentResponse {
  message: string;
  runId: number;
  status: string;
  statusUrl: string;
  githubUrl: string;
}

export interface WorkflowStatus {
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'cancelled';
  runUrl: string;
}

/**
 * Trigger the healing agent workflow
 */
export async function triggerAgent(request: AgentRequest): Promise<AgentResponse> {
  const response = await fetch(`${API_BASE_URL}/run-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to trigger agent');
  }

  return response.json();
}

/**
 * Check workflow status
 */
export async function checkWorkflowStatus(runId: number): Promise<WorkflowStatus> {
  const response = await fetch(`${API_BASE_URL}/status/${runId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check status');
  }

  return response.json();
}

/**
 * Get results from completed workflow
 */
export async function getResults(runId: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/results/${runId}`);

  if (response.status === 404) {
    // Results not ready yet
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch results');
  }

  return response.json();
}

/**
 * Poll for results with timeout
 */
export async function pollForResults(
  runId: number,
  onProgress?: (status: WorkflowStatus) => void,
  maxAttempts: number = 60
): Promise<any> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    // Check status first
    const status = await checkWorkflowStatus(runId);
    
    if (onProgress) {
      onProgress(status);
    }

    // If completed, try to get results
    if (status.status === 'completed') {
      // Wait a bit for artifact to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = await getResults(runId);
      if (results) {
        return results;
      }
      
      // If results failed to fetch, throw error
      if (status.conclusion === 'failure') {
        throw new Error('Workflow failed. Check GitHub Actions logs.');
      }
    }

    // Wait 5 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Timeout waiting for results');
}
