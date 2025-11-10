---
name: stable-mode
description: Guide implementation of stable mode chores with comprehensive testing and error handling. Use when user starts work on a stable mode chore. Analyzes BDD scenarios, reviews speed mode implementation, and adds proper error handling, validation, and edge case coverage.
---

# Stable Mode Skill

Guides Claude Code through stable mode implementation with comprehensive testing focus. Users confirm approach but Claude Code writes the code.

## Instructions

When this skill is activated, you are helping implement a stable mode chore to add comprehensive testing and error handling. Follow this structured approach:

### Overview

**Stable Mode Goal:** Add error handling, validation, and edge case coverage to the speed mode implementation.

**CRITICAL DISTINCTION:**
- **Speed mode implemented ALL functionality** - every feature/function is already working on the happy path
- **Stable mode adds robustness** - error handling, validation, edge cases, error messages

**Key Principles:**
- **Build on speed implementation** - do not re-implement features, ADD to them
- **Comprehensive error handling** - catch all failure modes, show clear error messages
- **Input validation** - validate all inputs, handle edge cases (empty, null, max values, wrong types)
- **Edge case coverage** - handle boundary conditions, race conditions, state consistency
- **All BDD scenarios pass** - happy path AND error/edge case scenarios
- **Autonomous execution** - Claude Code writes code, user confirms approach

**User Profile:** May not know how to code - Claude Code does the implementation autonomously.

---

## Implementation Steps

### Step 0: Create Additional Scenarios (If First Stable Chore)

**CRITICAL:** If this is the FIRST stable mode chore for this feature, you must ADD edge case scenarios and step definitions.

**Check if scenarios exist beyond happy path:**
1. Read the feature's `.feature` file
2. Count scenarios - if only 1 (happy path), ADD edge case scenarios
3. Update step definitions to include new scenarios

**Add to `.feature` file:**
```gherkin
# Error handling scenario
Scenario: [Error case title]
  Given [setup for error condition]
  When [action that triggers error]
  Then [expected error handling]
  And [system remains stable]

# Edge case scenario
Scenario: [Edge case title]
  Given [edge condition setup]
  When [action at boundary]
  Then [expected edge case behavior]
```

**Add to `features/step_definitions/[feature-slug].steps.js`:**
- Implement Given/When/Then steps for new scenarios
- Follow existing patterns from happy path steps
- Include proper error assertions

**IMPORTANT:** Only do this ONCE per feature (first stable chore). Subsequent stable chores implement existing scenarios.

### Step 1: Analyze Scenario to Implement

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Get current work item and parent feature's scenario file
2. Read the full scenario file (should now have happy path + edge cases)
3. Identify which scenario this chore addresses
4. Extract requirements from the scenario's Given/When/Then steps

**Code to get scenario (with error handling):**

```javascript
const { getCurrentWork } = require('../../lib/current-work');
const { getDb } = require('../../lib/database');
const fs = require('fs');
const path = require('path');

try {
  const currentWork = getCurrentWork();

  // Error handling: Check if current work exists
  if (!currentWork) {
    console.error('❌ No current work found. Run: jettypod work start <chore-id>');
    return;
  }

  // Error handling: Check if parent exists
  if (!currentWork.parent_id) {
    console.error('❌ Current work has no parent feature. This chore must be part of a feature.');
    return;
  }

  const db = getDb();
  db.get('SELECT * FROM work_items WHERE id = ?', [currentWork.parent_id], (err, feature) => {
    // Error handling: Database errors
    if (err) {
      console.error('❌ Database error:', err.message);
      db.close();
      return;
    }

    // Error handling: Feature not found
    if (!feature) {
      console.error('❌ Parent feature not found in database.');
      db.close();
      return;
    }

    // Error handling: No scenario file
    if (!feature.scenario_file) {
      console.error('❌ Feature has no scenario_file. Cannot determine what to implement.');
      console.log('Suggestion: Create a scenario file and update the feature.');
      db.close();
      return;
    }

    const scenarioPath = path.join(process.cwd(), feature.scenario_file);

    // Error handling: Scenario file doesn't exist
    if (!fs.existsSync(scenarioPath)) {
      console.error(`❌ Scenario file not found: ${scenarioPath}`);
      console.log('Suggestion: Create the scenario file or update the feature.scenario_file path.');
      db.close();
      return;
    }

    // Error handling: File read errors
    let scenarioContent;
    try {
      scenarioContent = fs.readFileSync(scenarioPath, 'utf8');
    } catch (readErr) {
      console.error(`❌ Cannot read scenario file: ${readErr.message}`);
      db.close();
      return;
    }

    // Error handling: Empty scenario file
    if (!scenarioContent || scenarioContent.trim().length === 0) {
      console.error('❌ Scenario file is empty.');
      db.close();
      return;
    }

    // Parse all scenarios...
    db.close();
  });
} catch (err) {
  console.error('❌ Unexpected error in Step 1:', err.message);
  return;
}
```

**Identify target scenario (with error handling):**

```javascript
// Parse scenarios from Gherkin content
const scenarios = [];
const scenarioBlocks = scenarioContent.split(/\nScenario:/);

// Error handling: No scenarios found
if (scenarioBlocks.length < 2) {
  console.error('❌ No scenarios found in scenario file.');
  console.log('Suggestion: Add Gherkin scenarios to the feature file.');
  return;
}

// Parse each scenario
for (let i = 1; i < scenarioBlocks.length; i++) {
  const block = 'Scenario:' + scenarioBlocks[i];
  const titleMatch = block.match(/Scenario:\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
  scenarios.push({ title, content: block });
}

// Match scenario to chore
const choreDesc = currentWork.description.toLowerCase();
let targetScenario = null;

// Try to match by scenario number in chore description
const scenarioNumMatch = choreDesc.match(/scenario\s+(\d+)/);
if (scenarioNumMatch) {
  const num = parseInt(scenarioNumMatch[1]);
  if (num > 0 && num <= scenarios.length) {
    targetScenario = scenarios[num - 1];
  }
}

// Try to match by keywords if no number match
if (!targetScenario) {
  for (const scenario of scenarios) {
    const scenarioLower = scenario.title.toLowerCase();
    // Skip happy path (usually first scenario)
    if (scenarios.indexOf(scenario) === 0) continue;

    // Match keywords from chore description
    const keywords = choreDesc.split(/\s+/).filter(w => w.length > 3);
    const matches = keywords.filter(k => scenarioLower.includes(k));

    if (matches.length > 0) {
      targetScenario = scenario;
      break;
    }
  }
}

// Error handling: No matching scenario
if (!targetScenario) {
  console.error('❌ Cannot match chore to any scenario in feature file.');
  console.log('Available scenarios:');
  scenarios.forEach((s, i) => console.log(`  ${i + 1}. ${s.title}`));
  console.log('\nSuggestion: Update chore description to reference a specific scenario.');
  return;
}
```

**Display to user:**

```
🧪 Stable Mode: [Feature Name]

Target Scenario:
[Scenario title]

What needs to happen:
• [Given] Initial state: [requirement]
• [When] Action/condition: [requirement]
• [Then] Expected behavior: [requirement]

Now reviewing speed mode implementation...
```

**Move to Step 2 automatically.**

### Step 2: Review Speed Mode Implementation

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Find files created/modified in speed mode
2. Read the existing implementation
3. Identify what's missing for this scenario
4. Understand current code structure

**Find speed mode files (with error handling):**

```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Try to find files from git history
let speedModeFiles = [];

try {
  // Get commits for this feature
  const featureName = feature.title.toLowerCase().replace(/\s+/g, '-');
  const { stdout: gitLog } = await execPromise(
    `git log --oneline --all --grep="${featureName}" -10`
  );

  // Error handling: No commits found
  if (!gitLog || gitLog.trim().length === 0) {
    console.log('⚠️  No git commits found for this feature.');
    console.log('Asking user for files created in speed mode...');

    // Ask user which files were created
    console.log('\n📝 Which files did speed mode create/modify for this feature?');
    console.log('(List file paths, one per line, or type "none" if no files exist)\n');

    // Wait for user response...
    // If user says "none", handle gracefully
    return;
  }

  // Get files changed in those commits
  const commits = gitLog.trim().split('\n').map(line => line.split(' ')[0]);

  for (const commit of commits) {
    try {
      const { stdout: files } = await execPromise(`git diff-tree --no-commit-id --name-only -r ${commit}`);
      const fileList = files.trim().split('\n').filter(f => f.length > 0);
      speedModeFiles.push(...fileList);
    } catch (diffErr) {
      // Ignore errors for individual commits
      continue;
    }
  }

  // Remove duplicates
  speedModeFiles = [...new Set(speedModeFiles)];

  // Error handling: No files found
  if (speedModeFiles.length === 0) {
    console.error('❌ No files found in git history for this feature.');
    console.log('Suggestion: Either:');
    console.log('  1. Specify files manually');
    console.log('  2. Check if speed mode committed changes');
    console.log('  3. Start fresh if speed mode was not completed\n');

    // Ask user for files
    console.log('📝 Which files should be reviewed? (or type "start-fresh" to begin from scratch)');
    return;
  }

  console.log(`✅ Found ${speedModeFiles.length} files from speed mode`);

} catch (gitErr) {
  console.error('⚠️  Git error:', gitErr.message);
  console.log('Falling back to manual file specification...\n');

  console.log('📝 Which files did speed mode create/modify?');
  return;
}

// Validate files are readable
const readableFiles = [];
const unreadableFiles = [];

for (const filePath of speedModeFiles) {
  const fullPath = path.join(process.cwd(), filePath);

  // Error handling: File doesn't exist
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File no longer exists: ${filePath}`);
    continue;
  }

  // Error handling: File not readable
  try {
    fs.accessSync(fullPath, fs.constants.R_OK);
    readableFiles.push(filePath);
  } catch (accessErr) {
    unreadableFiles.push(filePath);
    console.error(`❌ Cannot read file: ${filePath}`);
  }
}

// Error handling: No readable files
if (readableFiles.length === 0) {
  console.error('❌ No readable speed mode files found.');
  console.log('Cannot proceed without existing implementation to review.');
  console.log('\nSuggestion: Verify that speed mode was completed or start implementation from scratch.');
  return;
}

if (unreadableFiles.length > 0) {
  console.log(`⚠️  ${unreadableFiles.length} files cannot be read - skipping them`);
}

speedModeFiles = readableFiles;
```

**Identify gaps:**
- What error handling is missing?
- What validation is not performed?
- What edge cases are not covered?
- What needs to change to pass this scenario?

**Display analysis:**

```
📊 Code Analysis Complete

Current Implementation:
• Files: [list]
• Happy path: ✅ Working
• Error handling: ❌ Missing [specific gaps]
• Validation: ❌ Missing [specific gaps]
• Edge cases: ❌ Not handled [specific gaps]

To pass the target scenario, I need to:
1. [Specific change]
2. [Specific change]
3. [Specific change]

Now proposing comprehensive implementation...
```

**Move to Step 3 automatically.**

### Step 3: Propose and Execute Comprehensive Implementation

**Two phases: Propose (get user confirmation) → Execute (autonomous)**

#### Phase 1: Propose Comprehensive Implementation

**Present your analysis and proposal:**

```
💡 Comprehensive Implementation Proposal

Based on scenario and code analysis, here's how I'll add proper error handling and make the scenario pass:

**Changes needed:**
1. [File]: Add [specific error handling/validation]
2. [File]: Add [specific edge case handling]
3. [File]: Add [specific tests]

**Error handling approach:**
• [Specific errors to catch and how to handle them]
• [User-friendly error messages]
• [Graceful failure behavior]

**Validation approach:**
• [Input validation checks]
• [Boundary condition handling]
• [State validation]

**Why this approach:**
[Brief explanation of how this satisfies the scenario with proper quality]

Sound good? I'll implement this autonomously once you confirm.
```

**WAIT for user confirmation or adjustments.**

If user adjusts: revise proposal and confirm again.

#### Phase 2: Autonomous Execution

**CRITICAL:** After user confirms, Claude Code executes autonomously - no permission needed for individual code changes.

**Execution loop (with iteration limits and error handling):**

```javascript
const MAX_ITERATIONS = 10; // Prevent infinite loops
const TEST_TIMEOUT = 60000; // 60 second timeout per test run

let iteration = 0;
let scenarioPasses = false;

while (!scenarioPasses && iteration < MAX_ITERATIONS) {
  iteration++;
  console.log(`\n🔄 Iteration ${iteration}/${MAX_ITERATIONS}`);

  // 1. Modify existing files using Edit tool
  try {
    // Add error handling, validation, error messages, etc.
    console.log('✍️  Adding error handling to [file]...');
    // ... use Edit tool ...
    console.log('✅ Updated [file]');
  } catch (editErr) {
    console.error('❌ Error modifying files:', editErr.message);
    console.log('Retrying with adjusted approach...');
    continue;
  }

  // 2. Run tests with timeout
  console.log('🧪 Running tests...');

  let testsPassed = false;
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);

    const { stdout, stderr } = await execPromise('npm run test:bdd -- features/[feature-slug].feature', {
      timeout: TEST_TIMEOUT,
      killSignal: 'SIGTERM'
    });

    // Parse BDD test output to check if target scenario passes
    // Step definitions (created during feature discovery) execute your code
    const targetScenarioPassed = stdout.includes('[scenario-title]') && stdout.includes('✓');

    if (targetScenarioPassed) {
      console.log('✅ Target scenario passes!');

      // Check if ALL scenarios still pass
      const allPass = !stdout.includes('✗') && !stdout.includes('failing');

      if (allPass) {
        console.log('✅ All scenarios still passing!');
        scenarioPasses = true;
      } else {
        console.log('⚠️  Target scenario passes but other scenarios broke.');
        console.log('Adjusting to fix regressions...');
      }
    } else {
      console.log('❌ Target scenario still failing');

      // Extract failure reason from test output
      const failureMatch = stdout.match(/AssertionError: (.+)/);
      const failureReason = failureMatch ? failureMatch[1] : 'Unknown failure';

      console.log(`Reason: ${failureReason}`);
      console.log('Analyzing and adjusting...');
    }

  } catch (testErr) {
    // Error handling: Test timeout
    if (testErr.killed && testErr.signal === 'SIGTERM') {
      console.error('❌ Tests timed out after 60 seconds');
      console.log('This might indicate an infinite loop or hung process.');
      console.log('Suggestion: Check for blocking operations or missing async/await');

      // Ask user if they want to continue
      console.log('\n⚠️  Test timeout - continue trying? (yes/no)');
      // If no, break
      break;
    }

    // Error handling: Test execution errors
    console.error('❌ Test execution error:', testErr.message);

    // Check if it's a missing test file
    if (testErr.message.includes('No tests found') || testErr.message.includes('Cannot find module')) {
      console.error('Test file might not exist or is misconfigured.');
      console.log('Suggestion: Create the test file or check test configuration');
      break;
    }

    console.log('Retrying...');
  }
}

// Error handling: Max iterations reached
if (!scenarioPasses && iteration >= MAX_ITERATIONS) {
  console.error('\n❌ Maximum iterations reached without passing scenario');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🛑 Unable to make scenario pass automatically');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nPossible reasons:');
  console.log('• Scenario requirements may need clarification');
  console.log('• Implementation approach may need rethinking');
  console.log('• External dependencies may be missing');
  console.log('• Test assertions may be incorrect');
  console.log('\nSuggestions:');
  console.log('1. Review the scenario and verify it\'s achievable');
  console.log('2. Check test output for specific failure patterns');
  console.log('3. Try a different implementation approach');
  console.log('4. Ask for help if stuck\n');

  // Ask user how to proceed
  console.log('How would you like to proceed?');
  console.log('  1. Review changes made so far');
  console.log('  2. Try a different approach');
  console.log('  3. Debug manually');
  return;
}
```

**Display progress:**
```
🔄 Iteration 1/10

✍️  Adding error handling to [file]...
✅ Updated [file]

🧪 Running tests...
✅ Target scenario passes!
✅ All scenarios still passing!
```

**Stable mode focus:**
- **Add to existing implementation** - speed mode already implemented all features
- **Comprehensive error handling** - wrap existing code with try/catch, handle failures gracefully
- **Input validation** - add checks before existing logic (null checks, type checks, range validation)
- **Edge case handling** - handle empty arrays, missing properties, boundary values, concurrent access
- **Clear error messages** - user-friendly, actionable feedback for all failure modes
- **All BDD scenarios pass** - happy path (already passing from speed) AND error/edge scenarios

**When all scenarios pass:**

```
🎉 Stable mode scenario passes!

Implementation complete:
• Modified: [list files]
• Error handling: ✅ Comprehensive
• Validation: ✅ Complete
• All scenarios: ✅ Passing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Stable Mode Chore Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This chore is done. Continue with remaining stable mode chores or elevate to production mode when all are complete.
```

**Mark current chore as done and end skill.**


