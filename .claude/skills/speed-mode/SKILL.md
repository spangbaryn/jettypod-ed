---
name: speed-mode
description: Guide implementation of speed mode chores with autonomous code analysis and execution. Use when user starts work on a speed mode chore. Analyzes BDD scenarios, proposes implementation, writes code, and generates stable mode chores at completion.
---

# Speed Mode Skill

Guides Claude Code through speed mode implementation with autonomous analysis and execution. Users confirm approach but Claude Code writes the code.

## Instructions

When this skill is activated, you are helping implement a speed mode chore to make the happy path scenario pass. Follow this structured approach:

### Overview

**Speed Mode Goal:** Implement ALL scoped functionality to make the happy path BDD scenario pass, assuming everything works correctly.

**Key Principles:**
- **Implement ALL features/functions** defined in the scenario - do not skip functionality
- **Assume happy path** - assume inputs are valid, files upload successfully, types are correct
- **No error handling** - no validation, no edge case handling, no error messages (that's for stable mode)
- **Fast iteration** - single file when possible, inline code over abstraction
- **Pragmatic** - localStorage for data, simple implementations
- **Autonomous execution** - Claude Code writes code, user confirms approach

**User Profile:** May not know how to code - Claude Code does the implementation autonomously.

---

## Implementation Steps

### Step 1: Check for Breadcrumbs and Analyze Scenario

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Get the current work item and read its description for breadcrumbs
2. If breadcrumbs exist (Scenario steps addressed, Implementation guidance, Verification), use them
3. If no breadcrumbs, fall back to full autonomous analysis
4. Read the parent feature's scenario file
5. Parse the Gherkin and identify what needs to be implemented

**Code to check for breadcrumbs:**

```javascript
const { getCurrentWork } = require('../../lib/current-work');
const { getDb } = require('../../lib/database');
const fs = require('fs');
const path = require('path');

const currentWork = getCurrentWork();

// Check if description has breadcrumbs from feature-discover
const hasBreadcrumbs = currentWork.description &&
  currentWork.description.includes('Scenario steps addressed:') &&
  currentWork.description.includes('Implementation guidance:') &&
  currentWork.description.includes('Verification:');

// Get parent feature
const db = getDb();
db.get('SELECT * FROM work_items WHERE id = ?', [currentWork.parent_id], (err, feature) => {
  if (!feature.scenario_file) {
    console.error('No scenario file found for this feature');
    return;
  }

  const scenarioPath = path.join(process.cwd(), feature.scenario_file);
  const scenarioContent = fs.readFileSync(scenarioPath, 'utf8');

  // Parse and analyze...
});
```

**Parse Gherkin:**
- Extract first `Scenario:` block (happy path)
- Parse Given/When/Then/And steps
- Identify:
  - Initial state setup (Given)
  - User actions (When)
  - Expected outcomes (Then)
  - Observable changes (And)

**Display to user (with breadcrumbs):**

```
🚀 Speed Mode: [Chore Title]

Scenario steps addressed:
[Steps from breadcrumbs]

Implementation guidance:
[Files, patterns, functions from breadcrumbs]

Verification:
[Step definitions from breadcrumbs]

Now analyzing codebase to finalize implementation approach...
```

**Display to user (without breadcrumbs):**

```
🚀 Speed Mode: [Feature Name]

Happy Path Scenario:
[Scenario title]

What needs to happen:
• [Given] Initial state: [extracted requirement]
• [When] User action: [extracted action]
• [Then] Expected result: [extracted outcome]
• [And] Observable change: [extracted change]

Now analyzing codebase to propose implementation...
```

**Move to Step 2 automatically.**

### Step 2: Autonomous Codebase Analysis

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Check for epic architectural decisions
2. Use breadcrumbs if available, otherwise discover patterns
3. Verify/find relevant existing files
4. Understand code patterns and conventions
5. Identify where new code should be added

**Check for architectural decisions:**

```javascript
const { getDecisionsForEpic } = require('../../lib/decisions-helpers');

// Get epic from current work
db.get('SELECT epic_id FROM work_items WHERE id = ?', [currentWork.parent_id], async (err, feature) => {
  if (feature.epic_id) {
    const decisions = await getDecisionsForEpic(feature.epic_id);
    // Decisions constrain your implementation approach
  }
});
```

**If breadcrumbs exist (from feature-discover):**
- Parse "Files to create/modify" section - these are your target files
- Parse "Patterns to follow" section - read these reference files first
- Parse "Key functions/components needed" - these guide your implementation
- Verify reference files exist and read them to understand patterns
- Confirm target file locations make sense in project structure

**If no breadcrumbs (autonomous discovery):**
- Use Glob tool to find files matching patterns from scenario
  - Example: Scenario mentions "login" → search for `**/*login*.js`, `**/*auth*.js`
- Use Grep tool to search for keywords from scenario
  - Example: Scenario mentions "dashboard" → grep for "dashboard"
- Read similar features to understand patterns

**Understand patterns:**
- File structure conventions (where do features live?)
- Naming patterns (camelCase? kebab-case?)
- Import/export patterns
- Testing patterns (if tests exist)
- Database patterns (if data persistence mentioned)

**Identify integration points:**
- Where does this feature hook into existing code?
- What files need to import the new code?
- What existing functions need to call the new code?

**Display analysis results:**

```
📊 Codebase Analysis Complete

Architectural Constraints:
[List any epic decisions that apply]

Existing Patterns Found:
• File structure: [pattern]
• Naming convention: [pattern]
• Similar feature: [file path and pattern]

Integration Points:
• New code will go in: [directory]
• Needs to be imported by: [file]
• Will call existing: [function/module]

Now proposing implementation approach...
```

**Move to Step 3 automatically.**

### Step 3: Propose and Execute Implementation

**Two phases: Propose (get user confirmation) → Execute (autonomous)**

#### Phase 1: Propose Implementation Approach

**Present your analysis and proposal:**

```
💡 Implementation Proposal

Based on scenario analysis and codebase patterns, here's how I'll make the scenario pass:

**Files to create/modify:**
1. [file path] - [what it will do]
2. [file path] - [what it will do]

**Key implementation points:**
• [Point 1]: [specific approach]
• [Point 2]: [specific approach]
• [Point 3]: [specific approach]

**Why this approach:**
[Brief explanation of how this satisfies the scenario while following codebase patterns]

Sound good? I'll implement this autonomously once you confirm.
```

**WAIT for user confirmation or adjustments.**

If user adjusts: revise proposal and confirm again.

#### Phase 2: Autonomous Execution

**CRITICAL:** After user confirms, Claude Code executes autonomously - no permission needed for individual code changes.

**Execution loop:**

1. **Create/modify files** using Write/Edit tools
   - Follow the proposed plan
   - Write minimal code (speed mode - happy path only)
   - Add basic comments for clarity
   - Use inline code over abstractions

2. **Run BDD tests** to verify step definitions pass
   ```javascript
   // Run the feature's BDD tests (scenarios + step definitions)
   const { exec } = require('child_process');
   exec('npm run test:bdd -- [feature-file].feature', (err, stdout) => {
     // Check if step definitions pass
     // Step definitions were created during feature discovery
     // Your implementation must make them pass
   });
   ```

3. **Check if BDD scenario passes**
   - Run: `npm run test:bdd -- features/[feature-slug].feature`
   - Step definitions execute your implementation code
   - If yes: Move to final step
   - If no: Analyze failure, adjust code, iterate
   - **CRITICAL:** Tests must pass before moving on

4. **Display progress:**
   ```
   ✍️  Writing [file name]...
   ✅ Created [file name]

   🧪 Running tests...
   ❌ Scenario failed: [error message]
   🔧 Adjusting [specific fix]...
   ✅ Scenario passes!
   ```

**Speed mode constraints:**
- **Implement ALL scoped functionality** - if the scenario requires file upload, implement it (just assume it works)
- **Single file when possible** - keep it simple
- **NO error handling** - no try/catch, no validation, no edge cases
- **Assume everything works** - valid inputs, successful operations, correct types
- **localStorage/memory for data** - no full database setup
- **Inline code over separate modules** - keep it simple
- **Focus: Make. All. Features. Work.** (on the happy path)

**When scenario passes:**

```
🎉 Happy path scenario passes!

Implementation complete:
• Created: [list files]
• Modified: [list files]
• Tests: ✅ Passing

Now analyzing what was built to propose stable mode chores...
```

**Move to final step automatically.**

### Step 4: Generate Stable Mode Chores

**Two phases: Analyze and propose → Get confirmation → Create autonomously**

#### Phase 1: Analyze Implementation

**Your task:** Review what was built and identify what's needed for stable mode.

**Analysis checklist:**

1. **Error handling gaps**
   - What user errors are possible?
   - What system errors could occur?
   - What validation is missing?

2. **Edge cases**
   - Boundary conditions (empty inputs, max values, etc.)
   - Race conditions
   - State consistency issues

3. **Non-happy-path scenarios**
   - Read the full scenario file (not just happy path)
   - Identify scenarios 2+ (error handling, edge cases)
   - Check what additional behavior is needed

4. **Code quality needs**
   - What needs better structure/organization?
   - What needs proper error messages?
   - What needs logging/debugging support?

#### Phase 2: Propose Stable Mode Chores

**Present your analysis:**

```
📋 Stable Mode Chores Proposal

I've analyzed the implementation. Here are the chores needed for stable mode:

**Chore 1: [Title]**
- Why: [What gap this fills]
- Scope: [What specifically needs to be done]
- Scenario: [Which BDD scenario this addresses, if applicable]

**Chore 2: [Title]**
- Why: [What gap this fills]
- Scope: [What specifically needs to be done]
- Scenario: [Which BDD scenario this addresses, if applicable]

**Chore 3: [Title]**
- Why: [What gap this fills]
- Scope: [What specifically needs to be done]
- Scenario: [Which BDD scenario this addresses, if applicable]

These chores will make all BDD scenarios pass with proper error handling and edge case coverage.

Sound good? I'll create these chores once you confirm.
```

**WAIT for user confirmation or adjustments.**

If user adjusts: revise chores and confirm again.

#### Phase 3: Create Chores Autonomously

**CRITICAL:** After user confirms, create chores programmatically - no additional permission needed.

**Code to create chores:**

```javascript
const { create } = require('./features/work-tracking');
const { getCurrentWork } = require('../../lib/current-work');

const currentWork = getCurrentWork();
const featureId = currentWork.parent_id; // Parent feature

// For each confirmed chore:
await create('chore', 'Chore Title', 'Description', featureId, 'stable', false);
```

**Display results:**

```
✅ Created [N] stable mode chores

Chores created:
• #[ID]: [Title]
• #[ID]: [Title]
• #[ID]: [Title]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Speed Mode Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What we accomplished:
✅ Happy path scenario passes
✅ Stable mode chores ready

Next step: Elevate to stable mode
  jettypod work elevate [feature-id] stable

Then start the first stable mode chore:
  jettypod work start [chore-id]
```

**Mark current chore as done and end skill.**

