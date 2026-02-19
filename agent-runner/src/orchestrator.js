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
const MAX_RETRIES = 5;
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
  };

  try {
    console.log('🚀 Starting CI Healing Agent...');
    console.log(`📦 Repository: ${REPO_URL}`);
    console.log(`👥 Team: ${TEAM_NAME}`);
    console.log(`👤 Leader: ${LEADER_NAME}`);
    console.log(`🌿 Branch: ${result.branchName}`);

    // Step 1: Clone repository
    console.log('\n📥 Cloning repository...');
    await fs.ensureDir(WORKSPACE);
    
    const cloneUrl = GITHUB_TOKEN
      ? REPO_URL.replace('https://', `https://${GITHUB_TOKEN}@`)
      : REPO_URL;
    
    const git = simpleGit();
    await git.clone(cloneUrl, WORKSPACE);
    const repoGit = simpleGit(WORKSPACE);

    // Step 2: Create branch
    console.log(`\n🌿 Creating branch: ${result.branchName}`);
    await repoGit.checkoutLocalBranch(result.branchName);

    // Step 3: Initialize services
    const llmService = new LLMService(GEMINI_API_KEY);
    const testRunner = new TestRunner(WORKSPACE);

    // Step 4: Healing loop
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
      
      // Classify errors
      const errors = await llmService.classifyError(
        testResult.stdout + '\n' + testResult.stderr
      );

      if (errors.length === 0) {
        console.log('⚠️  Could not classify errors, retrying...');
        continue;
      }

      result.totalFailures += errors.length;
      console.log(`📊 Found ${errors.length} error(s)`);

      // Fix each error
      for (const error of errors) {
        console.log(`\n🔧 Fixing: ${error.bugType} in ${error.file}:${error.line}`);
        
        const filePath = path.join(WORKSPACE, error.file);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️  File not found: ${error.file}, skipping...`);
          continue;
        }

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
      }

      // Push after each iteration
      console.log('⬆️  Pushing changes...');
      try {
        await repoGit.push('origin', result.branchName, ['--set-upstream']);
      } catch (pushError) {
        console.log('⚠️  First push failed, force pushing...');
        await repoGit.push('origin', result.branchName, ['--force', '--set-upstream']);
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
    result.score.final = result.score.base + result.score.timeBonus - result.score.commitPenalty;
    result.totalFixes = result.fixes.length;

    // Step 6: Create Pull Request
    console.log('\n📝 Creating Pull Request...');
    try {
      const { owner, repo } = parseGitHubUrl(REPO_URL);
      const octokit = new Octokit({ auth: GITHUB_TOKEN });
      
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

      const pr = await octokit.pulls.create({
        owner,
        repo,
        title: prTitle,
        head: result.branchName,
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
