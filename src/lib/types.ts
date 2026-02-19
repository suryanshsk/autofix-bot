export type BugType = "LINTING" | "SYNTAX" | "LOGIC" | "TYPE_ERROR" | "IMPORT" | "INDENTATION";

export type FixStatus = "FIXED" | "FAILED" | "PENDING";

export interface Fix {
  file: string;
  bugType: BugType;
  line: number;
  commitMessage: string;
  status: FixStatus;
  errorMessage?: string;
  beforeCode?: string;
  afterCode?: string;
  description?: string;
}

export interface CIIteration {
  iteration: number;
  passed: boolean;
  timestamp: string;
}

export interface AgentResult {
  repoUrl: string;
  teamName: string;
  leaderName: string;
  branchName: string;
  pullRequestUrl: string | null;
  totalFailures: number;
  totalFixes: number;
  finalCIStatus: "PASSED" | "FAILED";
  totalTimeTaken: string;
  totalCommits: number;
  fixes: Fix[];
  ciTimeline: CIIteration[];
  score: {
    base: number;
    timeBonus: number;
    commitPenalty: number;
    final: number;
  };
}

export const MOCK_RESULT: AgentResult = {
  repoUrl: "https://github.com/team-alpha/ml-pipeline",
  teamName: "TEAM_ALPHA",
  leaderName: "JOHN_DOE",
  branchName: "TEAM_ALPHA_JOHN_DOE_AI_Fix",
  pullRequestUrl: "https://github.com/team-alpha/ml-pipeline/pull/42",
  totalFailures: 7,
  totalFixes: 7,
  finalCIStatus: "PASSED",
  totalTimeTaken: "3m 42s",
  totalCommits: 12,
  fixes: [
    { 
      file: "src/utils.py", 
      bugType: "LINTING", 
      line: 15, 
      commitMessage: "[AI-AGENT] Fix linting error in src/utils.py line 15", 
      status: "FIXED",
      errorMessage: "Unused import 'os'",
      beforeCode: "import os\nimport sys\n\ndef process():\n    return sys.platform",
      afterCode: "import sys\n\ndef process():\n    return sys.platform",
      description: "Removed unused import statement"
    },
    { 
      file: "src/validator.py", 
      bugType: "SYNTAX", 
      line: 8, 
      commitMessage: "[AI-AGENT] Fix syntax error in src/validator.py line 8", 
      status: "FIXED",
      errorMessage: "SyntaxError: invalid syntax",
      beforeCode: "def validate(data)\n    if not data:\n        return False",
      afterCode: "def validate(data):\n    if not data:\n        return False",
      description: "Added missing colon after function definition"
    },
    { 
      file: "src/model.py", 
      bugType: "LOGIC", 
      line: 42, 
      commitMessage: "[AI-AGENT] Fix logic error in src/model.py line 42", 
      status: "FIXED",
      errorMessage: "Division by zero potential",
      beforeCode: "result = total / count",
      afterCode: "result = total / count if count > 0 else 0",
      description: "Added zero-division protection"
    },
    { 
      file: "src/types.ts", 
      bugType: "TYPE_ERROR", 
      line: 23, 
      commitMessage: "[AI-AGENT] Fix type error in src/types.ts line 23", 
      status: "FIXED",
      errorMessage: "Type 'string' is not assignable to type 'number'",
      beforeCode: "const age: number = '25';",
      afterCode: "const age: number = 25;",
      description: "Fixed type mismatch"
    },
    { 
      file: "src/config.py", 
      bugType: "IMPORT", 
      line: 3, 
      commitMessage: "[AI-AGENT] Fix import error in src/config.py line 3", 
      status: "FIXED",
      errorMessage: "ModuleNotFoundError: No module named 'utils'",
      beforeCode: "from utils import helper",
      afterCode: "from .utils import helper",
      description: "Changed to relative import"
    },
    { 
      file: "src/parser.py", 
      bugType: "INDENTATION", 
      line: 67, 
      commitMessage: "[AI-AGENT] Fix indentation in src/parser.py line 67", 
      status: "FIXED",
      errorMessage: "IndentationError: unexpected indent",
      beforeCode: "def parse():\n    data = get_data()\n        return data",
      afterCode: "def parse():\n    data = get_data()\n    return data",
      description: "Fixed incorrect indentation"
    },
    { 
      file: "src/api.py", 
      bugType: "SYNTAX", 
      line: 31, 
      commitMessage: "[AI-AGENT] Fix syntax error in src/api.py line 31", 
      status: "FIXED",
      errorMessage: "SyntaxError: closing parenthesis ')' does not match opening parenthesis '['",
      beforeCode: "items = data.get('items', [])",
      afterCode: "items = data.get('items', [])",
      description: "Fixed mismatched brackets"
    },
  ],
  ciTimeline: [
    { iteration: 1, passed: false, timestamp: "2026-02-19T10:00:12Z" },
    { iteration: 2, passed: false, timestamp: "2026-02-19T10:01:28Z" },
    { iteration: 3, passed: true, timestamp: "2026-02-19T10:03:54Z" },
  ],
  score: { base: 100, timeBonus: 10, commitPenalty: 0, final: 110 },
};

export function formatBranchName(teamName: string, leaderName: string): string {
  const clean = (s: string) =>
    s.toUpperCase().replace(/[^A-Z0-9 ]/g, "").replace(/\s+/g, "_").trim();
  return `${clean(teamName)}_${clean(leaderName)}_AI_Fix`;
}
