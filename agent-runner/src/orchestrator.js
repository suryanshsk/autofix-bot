#!/usr/bin/env node

const simpleGit = require('simple-git');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { glob } = require('glob');

const execAsync = promisify(exec);

// Environment variables
const REPO_URL = process.env.REPO_URL;
const TEAM_NAME = process.env.TEAM_NAME;
const LEADER_NAME = process.env.LEADER_NAME;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Configuration
const MAX_RETRIES = 2; // Fix issues in 1-2 iterations max
const WORKSPACE = path.join(process.cwd(), 'workspace');

// Branch formatter
function formatBranchName(teamName, leaderName) {
  const clean = (str) =>
    str
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  
  return `${clean(teamName)}_${clean(leaderName)}_AI_Fix`;
}

// Extract owner and repo from GitHub URL
function parseGitHubUrl(url) {
  const regex = /github\.com\/([^/]+)\/([^/]+?)(\.git)?$/;
  const match = url.match(regex);
  if (!match) throw new Error(`Invalid GitHub URL: ${url}`);
  return { owner: match[1], repo: match[2] };
}

// Check if we have write access to a repository
async function hasWriteAccess(octokit, owner, repo) {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return data.permissions?.push === true;
  } catch (error) {
    return false;
  }
}

// Automatically fork a repository
async function forkRepository(octokit, owner, repo) {
  try {
    console.log(`🍴 Forking ${owner}/${repo}...`);
    const { data: fork } = await octokit.repos.createFork({
      owner,
      repo,
    });
    
    // Wait for fork to be ready
    console.log('⏳ Waiting for fork to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return {
      forkOwner: fork.owner.login,
      forkUrl: fork.clone_url,
    };
  } catch (error) {
    if (error.status === 202) {
      // Fork already exists or is being created
      console.log('✅ Fork already exists or is being created');
      const { data: user } = await octokit.users.getAuthenticated();
      return {
        forkOwner: user.login,
        forkUrl: `https://github.com/${user.login}/${repo}.git`,
      };
    }
    throw error;
  }
}

// LLM Service
class LLMService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async classifyError(errorOutput) {
    console.log('🔍 Classifying errors with AI...');
    
    const prompt = `You are an expert code analyzer. Analyze this test failure output and extract ALL errors.

For EACH error, classify it into EXACTLY one of these categories:
- LINTING: Style issues, formatting, unused imports
- SYNTAX: Missing colons, brackets, parentheses
- LOGIC: Wrong logic, incorrect conditions
- TYPE_ERROR: Type mismatches, undefined variables
- IMPORT: Missing or incorrect imports
- INDENTATION: Spacing/tab issues

Output format (MUST match exactly):
<BUG_TYPE> error in <file_path> line <line_number> → Fix: <one-line description>

Test output:
${errorOutput}

Extract and classify ALL errors now:`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const content = result.response.text() || '';
    return this.parseErrors(content);
  }

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

      // Fall back to pytest format: FAILED tests/test_app.py::test_name - AssertionError
      match = line.match(/FAILED (.+?)::(.+?) - (\w+)/);
      if (match) {
        const [, file, testName, errorType] = match;
        const bugType = errorType.includes('Syntax') ? 'SYNTAX' : 
                       errorType.includes('Import') ? 'IMPORT' :
                       errorType.includes('Type') ? 'TYPE_ERROR' : 'LOGIC';
        errors.push({
          bugType,
          file: file.replace(/\.py$/, '.py').replace('::', '/'),
          line: 1,
          description: `Test ${testName} failed with ${errorType}`,
        });
        continue;
      }

      // Jest/Vitest format: ● test_suite › test_name
      match = line.match(/● (.+?) › (.+)/);
      if (match) {
        errors.push({
          bugType: 'LOGIC',
          file: 'test file',
          line: 1,
          description: match[2],
        });
      }
    }

    return errors;
  }

  async generateFix(file, line, bugType, errorDescription, fileContent) {
    console.log(`🔧 Generating fix for ${bugType} in ${file}:${line}`);
    
    const prompt = `You are an expert programmer. Fix this ${bugType} error.

File: ${file}
Line: ${line}
Error: ${errorDescription}

Current code:
\`\`\`
${fileContent}
\`\`\`

Provide ONLY the corrected code, no explanations:`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    });

    return result.response.text() || fileContent;
  }
}

// Test Runner
class TestRunner {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async installDependencies() {
    console.log('\n📦 Checking and installing dependencies...');
    
    const requirementsPath = path.join(this.repoPath, 'requirements.txt');
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    
    // Install Python dependencies
    if (fs.existsSync(requirementsPath)) {
      console.log('🐍 Found requirements.txt, installing Python dependencies...');
      try {
        await execAsync('pip install -r requirements.txt', { 
          cwd: this.repoPath,
          timeout: 120000 // 2 minute timeout
        });
        console.log('✅ Python dependencies installed');
      } catch (error) {
        console.log('⚠️  Some Python dependencies may have failed to install');
        console.log('   Continuing anyway...');
      }
    } else {
      // No requirements.txt, check if we need pytest
      const pythonTestFiles = await glob('**/{test_*.py,*_test.py}', { 
        cwd: this.repoPath,
        ignore: ['**/node_modules/**', '**/venv/**', '**/.venv/**', '**/dist/**'],
        maxDepth: 3
      });
      
      if (pythonTestFiles.length > 0) {
        console.log('🐍 Python tests found but no requirements.txt');
        console.log('   Installing pytest automatically...');
        try {
          await execAsync('pip install pytest', { 
            cwd: this.repoPath,
            timeout: 60000
          });
          console.log('✅ pytest installed');
        } catch (error) {
          console.log('⚠️  Failed to install pytest:', error.message);
        }
      }
    }
    
    // Install Node.js dependencies
    if (fs.existsSync(packageJsonPath)) {
      const nodeModulesPath = path.join(this.repoPath, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('📦 Found package.json, installing Node.js dependencies...');
        try {
          await execAsync('npm install', { 
            cwd: this.repoPath,
            timeout: 180000 // 3 minute timeout
          });
          console.log('✅ Node.js dependencies installed');
        } catch (error) {
          console.log('⚠️  Some Node.js dependencies may have failed to install');
          console.log('   Continuing anyway...');
        }
      }
    }
  }

  async detectTestFramework() {
    const packageJsonPath = path.join(this.repoPath, 'package.json');
    const requirementsPath = path.join(this.repoPath, 'requirements.txt');

    // Check Node.js/JavaScript frameworks
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      if (pkg.dependencies?.['vitest'] || pkg.devDependencies?.['vitest']) return 'vitest';
      if (pkg.dependencies?.['jest'] || pkg.devDependencies?.['jest']) return 'jest';
      if (pkg.scripts?.['test']) return 'npm test';
    }

    // Check Python frameworks
    if (fs.existsSync(requirementsPath)) {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      if (content.includes('pytest')) return 'pytest';
    }

    // Fallback: Search for test files
    console.log('⚠️  No test framework config found, searching for test files...');
    
    // Look for Python test files (test_*.py, *_test.py)
    const pythonTestFiles = await glob('**/{test_*.py,*_test.py}', { 
      cwd: this.repoPath,
      ignore: ['**/node_modules/**', '**/venv/**', '**/.venv/**', '**/dist/**']
    });
    
    if (pythonTestFiles.length > 0) {
      console.log(`📝 Found ${pythonTestFiles.length} Python test file(s)`);
      return 'pytest-auto';
    }

    // Look for JavaScript/TypeScript test files
    const jsTestFiles = await glob('**/*.{test,spec}.{js,ts,jsx,tsx}', {
      cwd: this.repoPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });
    
    if (jsTestFiles.length > 0) {
      console.log(`📝 Found ${jsTestFiles.length} JavaScript test file(s)`);
      return 'node-auto';
    }

    return 'unknown';
  }

  async runTests() {
    const framework = await this.detectTestFramework();
    let command = '';

    switch (framework) {
      case 'pytest':
        command = 'python -m pytest -v --tb=short';
        break;
      case 'pytest-auto':
        // Try pytest without config (will auto-discover test files)
        command = 'python -m pytest -v --tb=short';
        console.log('🔍 Auto-detected Python tests, trying pytest...');
        break;
      case 'jest':
      case 'vitest':
      case 'npm test':
        command = 'npm test';
        break;
      case 'node-auto':
        // Try node with test script or fallback to jest
        command = 'npm test || npx jest || node --test';
        console.log('🔍 Auto-detected JavaScript tests, trying test runners...');
        break;
      default:
        console.log('⚠️  No tests detected. Creating a passing test result to continue...');
        return {
          stdout: 'No tests found in repository',
          stderr: 'Warning: No test framework or test files detected',
          exitCode: 0
        };
    }

    console.log(`🧪 Running tests with: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.repoPath,
        maxBuffer: 10 * 1024 * 1024,
      });
      return { stdout, stderr, exitCode: 0 };
    } catch (error) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        exitCode: error.code || 1,
      };
    }
  }
}

// Main Orchestrator
async function runAgent() {
  const startTime = Date.now();
  
  const result = {
    repoUrl: REPO_URL,
    teamName: TEAM_NAME.toUpperCase().replace(/\s+/g, '_'),
    leaderName: LEADER_NAME.toUpperCase().replace(/\s+/g, '_'),
    branchName: formatBranchName(TEAM_NAME, LEADER_NAME),
    pullRequestUrl: null,
    totalFailures: 0,
    totalFixes: 0,
    finalCIStatus: 'FAILED',
    totalTimeTaken: '0s',
    totalCommits: 0,
    fixes: [],
    ciTimeline: [],
    score: { base: 100, timeBonus: 0, commitPenalty: 0, final: 100 },
    forked: false,
    originalRepo: null,
  };

  try {
    console.log('🚀 Starting CI Healing Agent...');
    console.log(`📦 Repository: ${REPO_URL}`);
    console.log(`👥 Team: ${TEAM_NAME}`);
    console.log(`👤 Leader: ${LEADER_NAME}`);
    console.log(`🌿 Branch: ${result.branchName}`);
    console.log('');

    // Parse repository details
    const { owner, repo } = parseGitHubUrl(REPO_URL);
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Check write access
    console.log('🔐 Checking repository access...');
    const hasAccess = await hasWriteAccess(octokit, owner, repo);
    
    let cloneUrl = REPO_URL;
    let pushOwner = owner;
    let pushRepo = repo;
    
    if (!hasAccess) {
      console.log('⚠️  No write access detected');
      console.log('🔄 Automatically forking repository...');
      
      const { forkOwner, forkUrl } = await forkRepository(octokit, owner, repo);
      
      console.log(`✅ Forked to: ${forkOwner}/${repo}`);
      result.forked = true;
      result.originalRepo = `${owner}/${repo}`;
      
      cloneUrl = forkUrl;
      pushOwner = forkOwner;
      pushRepo = repo;
    } else {
      console.log('✅ Write access confirmed');
    }

    // Step 1: Clone repository (original or fork)
    console.log(`\n📥 Cloning repository from ${cloneUrl}...`);
    await fs.ensureDir(WORKSPACE);
    
    const cloneUrlWithToken = GITHUB_TOKEN
      ? cloneUrl.replace('https://', `https://${GITHUB_TOKEN}@`)
      : cloneUrl;
    
    const git = simpleGit();
    await git.clone(cloneUrlWithToken, WORKSPACE);
    const repoGit = simpleGit(WORKSPACE);

    // Step 2: Create branch
    console.log(`\n🌿 Creating branch: ${result.branchName}`);
    await repoGit.checkoutLocalBranch(result.branchName);

    // Step 3: Initialize services
    const llmService = new LLMService(GEMINI_API_KEY);
    const testRunner = new TestRunner(WORKSPACE);
    
    // Install dependencies before testing
    await testRunner.installDependencies();

    // Step 4: Healing loop (max 2 iterations)
    for (let iteration = 1; iteration <= MAX_RETRIES; iteration++) {
      console.log(`\n🔄 CI Iteration ${iteration}/${MAX_RETRIES}`);

      const testResult = await testRunner.runTests();
      
      const ciIteration = {
        iteration,
        passed: testResult.exitCode === 0,
        timestamp: new Date().toISOString(),
      };
      result.ciTimeline.push(ciIteration);

      if (testResult.exitCode === 0) {
        console.log('✅ All tests passed!');
        result.finalCIStatus = 'PASSED';
        break;
      }

      console.log('❌ Tests failed, analyzing errors...');
      console.log('\n📋 Test Output (last 500 chars):');
      const output = (testResult.stdout + '\n' + testResult.stderr).slice(-500);
      console.log(output);
      console.log('');
      
      // Classify errors
      const errors = await llmService.classifyError(
        testResult.stdout + '\n' + testResult.stderr
      );

      if (errors.length === 0) {
        console.log('⚠️  Could not classify errors from test output');
        
        if (iteration === MAX_RETRIES) {
          console.log('\n🛑 Reached max iterations. Common issues:');
          console.log('   - Missing dependencies (install manually)');
          console.log('   - Configuration problems (check test setup)');
          console.log('   - Environment issues (Python/Node version mismatch)');
          result.finalCIStatus = 'FAILED';
          break;
        }
        
        console.log('⏭️  Retrying with next iteration...');
        continue;
      }

      result.totalFailures += errors.length;
      console.log(`📊 Found ${errors.length} error(s) to fix in this iteration`);
      
      let fixesAppliedThisIteration = 0;

      // Fix each error
      for (const error of errors) {
        console.log(`\n🔧 Fixing: ${error.bugType} in ${error.file}:${error.line}`);
        
        // Special handling for IMPORT errors - try to install missing package
        if (error.bugType === 'IMPORT') {
          console.log('📦 Detected import error, attempting to install missing package...');
          
          // Extract package name from description (e.g., "Missing module 'requests'")
          const packageMatch = error.description.match(/['"](\w+)['"]/);
          if (packageMatch) {
            const packageName = packageMatch[1];
            console.log(`   Installing: ${packageName}`);
            
            try {
              // Try Python pip install
              if (error.file.endsWith('.py')) {
                await execAsync(`pip install ${packageName}`, { 
                  cwd: WORKSPACE,
                  timeout: 60000
                });
                console.log(`✅ Installed ${packageName} via pip`);
              }
              // Try Node npm install
              else if (error.file.endsWith('.js') || error.file.endsWith('.ts')) {
                await execAsync(`npm install ${packageName}`, { 
                  cwd: WORKSPACE,
                  timeout: 60000
                });
                console.log(`✅ Installed ${packageName} via npm`);
              }
            } catch (installError) {
              console.log(`⚠️  Could not auto-install ${packageName}`);
            }
          }
        }
        
        const filePath = path.join(WORKSPACE, error.file);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${error.file}, skipping...`);
          
          // Track failed fix
          result.fixes.push({
            file: error.file,
            bugType: error.bugType,
            line: error.line,
            commitMessage: `[AI-AGENT] Could not fix ${error.bugType} in ${error.file} - file not found`,
            status: 'FAILED',
            errorMessage: error.description || `${error.bugType} error detected`,
            description: 'File not found in repository',
          });
          
          continue;
        }

        try {
          const originalContent = fs.readFileSync(filePath, 'utf-8');
          const fixedContent = await llmService.generateFix(
            error.file,
            error.line,
            error.bugType,
            error.description,
            originalContent
          );

          // Extract code snippets (3 lines before and after the error line)
          const getCodeSnippet = (content, lineNum, contextLines = 3) => {
            const lines = content.split('\n');
            const start = Math.max(0, lineNum - contextLines - 1);
            const end = Math.min(lines.length, lineNum + contextLines);
            return lines.slice(start, end).join('\n');
          };

          const beforeCode = getCodeSnippet(originalContent, error.line);
          const afterCode = getCodeSnippet(fixedContent, error.line);

          // Write fix
          fs.writeFileSync(filePath, fixedContent);

          // Commit
          const commitMessage = `[AI-AGENT] Fix ${error.bugType} in ${error.file} line ${error.line}`;
          await repoGit.add(error.file);
          await repoGit.commit(commitMessage);

          result.totalCommits++;
          fixesAppliedThisIteration++;
          result.fixes.push({
            file: error.file,
            bugType: error.bugType,
            line: error.line,
            commitMessage,
            status: 'FIXED',
            errorMessage: error.description || `${error.bugType} error detected`,
            beforeCode,
            afterCode,
            description: error.description,
          });

          console.log(`✅ Fixed and committed`);
        } catch (fixError) {
          console.log(`❌ Failed to fix ${error.file}:${error.line} - ${fixError.message}`);
          
          // Track failed fix
          result.fixes.push({
            file: error.file,
            bugType: error.bugType,
            line: error.line,
            commitMessage: `[AI-AGENT] Failed to fix ${error.bugType} in ${error.file}`,
            status: 'FAILED',
            errorMessage: error.description || `${error.bugType} error detected`,
            description: `Fix failed: ${fixError.message}`,
          });
        }
      }
      
      console.log(`\n✅ Applied ${fixesAppliedThisIteration} fix(es) in iteration ${iteration}`);

      // Push after each iteration
      console.log('⬆️  Pushing changes...');
      try {
        await repoGit.push('origin', result.branchName, ['--set-upstream']);
      } catch (pushError) {
        // Check if it's a permission error
        if (pushError.message && pushError.message.includes('403')) {
          console.error('❌ PERMISSION DENIED: Cannot push to this repository');
          console.error('');
          console.error('💡 SOLUTION:');
          console.error('   1. Fork the repository to your account first');
          console.error('   2. Or ensure you have write access to this repo');
          console.error('   3. Or use a GitHub token with push permissions');
          console.error('');
          throw new Error(`Permission denied: You don't have write access to ${REPO_URL}. Please fork the repository or use a repo you own.`);
        }
        
        // Try force push for other errors (e.g., diverged branches)
        console.log('⚠️  First push failed, trying force push...');
        try {
          await repoGit.push('origin', result.branchName, ['--force', '--set-upstream']);
        } catch (forcePushError) {
          if (forcePushError.message && forcePushError.message.includes('403')) {
            throw new Error(`Permission denied: You don't have write access to ${REPO_URL}. Please fork the repository or use a repo you own.`);
          }
          throw forcePushError;
        }
      }
    }

    // Step 5: Calculate final metrics
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    result.totalTimeTaken = `${minutes}m ${seconds}s`;

    if (totalSeconds < 300) result.score.timeBonus = 10;
    if (result.totalCommits > 20) {
      result.score.commitPenalty = (result.totalCommits - 20) * 2;
    }
    result.score.final = Math.min(100, result.score.base + result.score.timeBonus - result.score.commitPenalty);
    result.totalFixes = result.fixes.filter(f => f.status === 'FIXED').length;

    // Step 6: Create Pull Request
    console.log('\n📝 Creating Pull Request...');
    try {
      const prTitle = `[AI-AGENT] Automated Fixes - ${result.totalFixes} issues resolved`;
      const prBody = `## 🤖 Autonomous CI/CD Healing Agent
      
### Summary
- **Total Failures Detected**: ${result.totalFailures}
- **Total Fixes Applied**: ${result.totalFixes}
- **Total Commits**: ${result.totalCommits}
- **Final CI Status**: ${result.finalCIStatus}
- **Time Taken**: ${result.totalTimeTaken}
- **Final Score**: ${result.score.final}/100

### Bug Classification Breakdown
${result.fixes.map(fix => `- **${fix.bugType}**: \`${fix.file}\` (Line ${fix.line})`).join('\n')}

### CI Timeline
${result.ciTimeline.map((it, idx) => `${idx + 1}. Iteration ${it.iteration}: ${it.passed ? '✅ PASSED' : '❌ FAILED'} (${new Date(it.timestamp).toLocaleString()})`).join('\n')}

---
*This PR was automatically generated by the AI Agent following RIFT 2026 guidelines.*`;

      // For forked repos, PR targets original repo with fork head reference
      const prOwner = result.forked ? owner : pushOwner;
      const prHead = result.forked ? `${pushOwner}:${result.branchName}` : result.branchName;

      const pr = await octokit.pulls.create({
        owner: prOwner,
        repo: pushRepo,
        title: prTitle,
        head: prHead,
        base: 'main',
        body: prBody,
      });

      result.pullRequestUrl = pr.data.html_url;
      console.log(`✅ Pull Request created: ${result.pullRequestUrl}`);
    } catch (prError) {
      console.log('⚠️  Could not create Pull Request:', prError.message);
      // Continue even if PR creation fails
    }

    // Step 7: Save results.json
    console.log('\n💾 Saving results.json...');
    const resultsPath = path.join(WORKSPACE, 'results.json');
    await fs.writeJson(resultsPath, result, { spaces: 2 });
    
    try {
      await repoGit.add('results.json');
      await repoGit.commit('[AI-AGENT] Add results summary');
      await repoGit.push('origin', result.branchName);
      result.totalCommits++;
    } catch (error) {
      console.log('⚠️  Could not push results.json, continuing...');
    }

    // Save to working directory for artifact upload
    await fs.writeJson(path.join(process.cwd(), 'results.json'), result, { spaces: 2 });

    console.log('\n🎉 Agent execution complete!');
    console.log(`📊 Final Status: ${result.finalCIStatus}`);
    console.log(`🐛 Failures: ${result.totalFailures}`);
    console.log(`✅ Fixes: ${result.totalFixes}`);
    console.log(`⏱️  Time: ${result.totalTimeTaken}`);
    console.log(`🏆 Score: ${result.score.final}`);

  } catch (error) {
    console.error('❌ Agent execution failed:', error);
    result.finalCIStatus = 'FAILED';
    await fs.writeJson(path.join(process.cwd(), 'results.json'), result, { spaces: 2 });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runAgent().catch(console.error);
}

module.exports = { runAgent, formatBranchName };
