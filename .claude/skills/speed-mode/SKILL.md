---
name: speed-mode
description: Guide implementation of speed mode chores with autonomous code analysis and execution. Use when user starts work on a speed mode chore. Analyzes BDD scenarios, proposes implementation, writes code, and generates stable mode chores at completion.
---

# Speed Mode Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mode Progression Flow                                               │
│                                                                      │
│  Feature Planning → [SPEED MODE] → Stable Mode → Production Mode     │
│                      ▲▲▲▲▲▲▲▲▲▲▲                                     │
│                      YOU ARE HERE                                    │
│                                                                      │
│  Next: After ALL speed chores complete, this skill generates         │
│        stable mode chores and IMMEDIATELY invokes stable-mode skill. │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛑 CRITICAL HANDOFF REQUIREMENT

**After completing ALL speed mode chores, you MUST:**
1. Generate stable mode BDD scenarios and step definitions
2. Create stable mode chores
3. Set feature mode to stable
4. **IMMEDIATELY invoke stable-mode using the Skill tool**

**🛑 STOP GATE:** DO NOT end this skill without invoking stable-mode. Speed mode is ONLY a checkpoint - features are INCOMPLETE without stable mode.

---

## 🚫 FORBIDDEN: Skipping Stable Mode

```
❌ Ending speed-mode skill without invoking stable-mode skill
❌ Using `jettypod work status <feature-id> done` to mark feature complete
❌ Telling user "feature is complete" after speed mode
❌ Skipping Step 7 (Transition to Stable Mode)
❌ Any action that bypasses the speed→stable progression
```

**What "Feature Complete" Actually Means:**
- **Internal projects:** Feature complete = stable-mode skill finished (all stable chores done)
- **External projects:** Feature complete = production-mode skill finished
- Speed mode complete = checkpoint only, NOT feature complete

**If you find yourself wanting to end without stable-mode:**
1. STOP - you are about to skip required workflow steps
2. Re-read Step 7 requirements
3. Generate stable mode scenarios
4. Create stable mode chores
5. Invoke stable-mode skill

---

Guides Claude Code through speed mode implementation with autonomous analysis and execution. Users confirm approach but Claude Code writes the code.

## Instructions

When this skill is activated, you are helping implement a speed mode chore to make all success scenarios pass. Follow this structured approach:

## 🔑 Critical Context

**You are working in an isolated git worktree:**
- `work start [chore-id]` created a dedicated worktree for this chore
- All file operations must use **absolute paths** from the worktree (not relative paths)
- The worktree has its own branch - changes are isolated from main
- BDD tests and unit tests run in the worktree context

**Worktree path is available in Step 0 output** - use it for all file operations.

---

## 🚨 SHELL CWD RECOVERY

**If ALL bash commands start failing with "Error: Exit code 1" and no output:**

Your shell's working directory was likely inside a worktree that was deleted. The CWD no longer exists.

**Recovery steps:**
1. Get the main repo path from your session context (look for the project path in earlier messages)
2. Run: `cd <main-repo-path>`
3. Verify: `pwd && ls .jettypod`
4. Resume your work

**Example:**
```bash
cd /Users/erikspangenberg/personal-assistant && pwd
```

**Why this happens:** When a worktree is merged, it gets deleted. If your shell was inside that worktree directory, all subsequent commands fail because the CWD doesn't exist.

---

## 🛑 PRE-FLIGHT VALIDATION (REQUIRED)

**Before proceeding with ANY implementation, you MUST validate the worktree exists.**

Run this query FIRST:

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.status, wt.worktree_path, wt.branch_name FROM work_items wi LEFT JOIN worktrees wt ON wi.id = wt.work_item_id WHERE wi.status = 'in_progress' AND wi.type = 'chore'"
```

**Check the result:**

| worktree_path | What it means | Action |
|---------------|---------------|--------|
| **Has a path** (e.g., `/path/to/.jettypod-work/...`) | ✅ Worktree exists, ready to proceed | Continue to Step 0 |
| **NULL or empty** | ❌ `work start` was not called | **STOP - run `jettypod work start [chore-id]` first** |
| **No rows returned** | ❌ No chore is in progress | **STOP - verify the chore exists and run `work start`** |

**🛑 STOP GATE:** If `worktree_path` is NULL or no rows returned, you MUST run `jettypod work start [chore-id]` before continuing. DO NOT proceed without a valid worktree.

**Example of valid output:**
```
4|Add nav link|in_progress|/Users/erik/project/.jettypod-work/4-add-nav-link|feature/work-4-add-nav-link
```

**Example of INVALID output (missing worktree):**
```
4|Add nav link|in_progress||
```
↑ Empty worktree_path means `work start` was never called. Run it now.

---

## 🔒 WORKTREE PATH LOCK

**After pre-flight validation passes, capture and lock the worktree path:**

From the pre-flight query output, extract and store:
- `WORKTREE_PATH` - the absolute path to the worktree (e.g., `/path/to/.jettypod-work/4-add-nav-link`)

**Display:**
```
🔒 WORKTREE LOCK ACTIVE
Path: ${WORKTREE_PATH}

All file writes will use this path.
```

**From this point forward, ALL file operations MUST use paths starting with:**
```
${WORKTREE_PATH}/
```

---

### Overview

**Speed Mode Goal:** Make it work - implement ALL functionality (integration + required + optional features) to make success scenarios pass, assuming everything works correctly.

**Key Principles:**
- **Integration first** - ensure the feature is wired into the app and reachable (Integration Scenario must pass)
- **Implement ALL features/functions** defined in scenarios - both required and optional functionality
- **All success paths** - every workflow that should work when inputs are valid
- **Assume success** - assume inputs are valid, files upload successfully, types are correct
- **No error handling** - no validation, no edge case handling, no error messages (that's for stable mode)
- **Fast iteration** - single file when possible, inline code over abstraction
- **Use real infrastructure** - use the actual database/storage from your tech stack, not mocks
- **Autonomous execution** - Claude Code writes code, user confirms approach

**User Profile:** May not know how to code - Claude Code does the implementation autonomously.

<details>
<summary><strong>📋 Speed Mode Constraints (click to expand)</strong></summary>

**What to implement:**
- **Integration** - wire feature into the app so it's reachable (Integration Scenario)
- ALL scoped functionality - required features AND optional features from all success scenarios
- Multiple valid workflows if the feature supports them
- Success variations (different outcomes that are all correct)

**What NOT to implement:**
- ❌ Error handling (try/catch, validation, edge cases)
- ❌ Input validation (null checks, type checks, range validation)
- ❌ Error messages for failures
- ❌ Edge case handling (empty arrays, boundary values, race conditions)

**Code organization:**
- Single file when possible - keep it simple
- Inline code over separate modules initially
- Use real infrastructure (actual database/storage from your tech stack, not mocks)
- Focus: Make. All. Features. Work. (all success paths)

</details>

---

## 🧪 Unit Testing in Speed Mode - True TDD

**Unit tests are written DURING the RED→GREEN loop, not after.**

**The TDD workflow (each iteration):**
1. **Identify next failing BDD step** - Which scenario step needs to pass next?
2. **Write unit test for the function** - Test the specific function/logic needed
3. **Watch unit test fail (RED)** - Confirm test catches the missing implementation
4. **Write minimal code** - Just enough to make the unit test pass
5. **Run unit test (GREEN)** - Verify the function works in isolation
6. **Run BDD scenarios** - Check if this makes any BDD steps pass
7. **Next iteration** - Repeat for next failing step

**What to unit test:**
- New functions you're creating (not framework/library code)
- Core logic and business rules
- Success scenarios only (no error cases - that's stable mode)

**Where to put unit tests:**
- Follow project conventions: `test/`, `__tests__/`, or `*.test.js` alongside code
- Check existing test files for patterns

<details>
<summary><strong>📋 TDD Example (click to expand)</strong></summary>

```javascript
// Iteration 1: BDD step "Given a user exists" is failing

// 1. Write unit test first (RED)
test('createUser creates user with valid data', () => {
  const user = createUser('John', 'john@example.com');
  expect(user.name).toBe('John');
  expect(user.email).toBe('john@example.com');
});
// Run: FAILS - createUser doesn't exist

// 2. Write minimal implementation (GREEN)
function createUser(name, email) {
  return { name, email };
}
// Run unit test: PASSES
// Run BDD: "Given a user exists" now passes

// Iteration 2: Next failing BDD step...
```

**Unit test scope in speed mode:**
```javascript
// ✅ Speed mode unit tests (success paths)
test('createUser creates user with valid data', () => {
  const user = createUser('John', 'john@example.com');
  expect(user.name).toBe('John');
  expect(user.email).toBe('john@example.com');
});

// ❌ NOT in speed mode (stable mode adds these)
test('createUser throws error for invalid email', () => {
  expect(() => createUser('John', 'invalid')).toThrow();
});
```

</details>

---

## Quick Reference: Async Boundaries

**Where Claude Code MUST wait for user confirmation:**

| Step | Location | Why |
|------|----------|-----|
| Step 3A | Before implementing (conditional) | User confirms implementation approach - only if ambiguous |
| Step 7B | Before creating stable chores | User confirms proposed stable mode chores - always |

**Where Claude Code executes autonomously:**
- Steps 0-2: Initialize, analyze scenarios, analyze codebase
- Step 3: Decision to skip/ask confirmation
- Steps 4-5: RED baseline, RED→GREEN→REFACTOR loop
- Step 6: Route to next chore OR transition to Step 7
- Step 7 (after confirmation): Create chores, commit, set mode, invoke stable-mode

---

## Implementation Steps

### Step 0: Initialize Speed Mode Context

**You are now in speed mode,** implementing a chore to make success scenarios pass.

**Get the current work context:**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.parent_id, parent.title as parent_title, parent.scenario_file, wt.worktree_path, wt.branch_name FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id LEFT JOIN worktrees wt ON wi.id = wt.work_item_id WHERE wi.status = 'in_progress' AND wi.type = 'chore'"
```

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After getting the work context, register this skill execution:

```bash
jettypod workflow start speed-mode <feature-id>
```

This validates that `feature_planning_complete` gate is passed and creates an execution record for session resume.

**Display to user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 SPEED MODE: Implementing Chore #[id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chore: [title]
Feature: #[parent-id] [parent-title]
Worktree: [worktree_path]
Branch: [branch_name]

Analyzing BDD scenarios to determine implementation approach...
```

**Then proceed to Step 1.**

---

### Step 1: Check for Breadcrumbs and Analyze Scenario

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is an ANALYSIS step.** File writes happen in Step 5.

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Get the current work item and read its description for breadcrumbs
2. If breadcrumbs exist (Scenario steps addressed, Implementation guidance, Verification), use them
3. If no breadcrumbs, fall back to full autonomous analysis
4. Read the parent feature's scenario file
5. Parse the Gherkin and identify what needs to be implemented

**To get current work and check for breadcrumbs:**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.description, wi.parent_id, parent.title as parent_title, parent.scenario_file FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress' AND wi.type = 'chore'"
```

**Check for breadcrumbs** by examining the chore's description for:
- "Scenario steps addressed:"
- "Implementation guidance:"
- "Verification:"

If all three sections exist, use them. Otherwise, fall back to autonomous analysis.

**Then read the scenario file** using the Read tool on the path returned by `scenario_file`.

**Parse Gherkin:**
- Extract all `Scenario:` blocks (all success paths - required + optional features)
- Parse Given/When/Then/And steps for each scenario
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

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is an ANALYSIS step.** File writes happen in Step 5.

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**Your task:**
1. Check for epic architectural decisions
2. Use breadcrumbs if available, otherwise discover patterns
3. Verify/find relevant existing files
4. Understand code patterns and conventions
5. Identify where new code should be added

**Check for architectural decisions:**

```bash
# Get the epic ID for this feature
sqlite3 .jettypod/work.db "SELECT epic_id FROM work_items WHERE id = <feature-id>"

# Get decisions for this epic
sqlite3 .jettypod/work.db "SELECT title, decision, rationale FROM discovery_decisions WHERE work_item_id = <epic-id>"
```

Decisions constrain your implementation approach - use them to guide technology choices and patterns.

**If breadcrumbs exist (from feature-planning):**
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

**🔄 WORKFLOW CHECKPOINT: Codebase analysis complete**

```bash
jettypod workflow checkpoint <feature-id> --step=2
```

### Step 3: Decide if Confirmation Needed

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a DECISION step.** File writes happen in Step 5.

**Evaluate if you need user confirmation before implementing:**

**Skip confirmation (proceed directly to Step 4) if:**
- Breadcrumbs are comprehensive (files, patterns, functions all specified)
- Implementation approach is clear and unambiguous
- Only one reasonable way to implement the scenario
- Epic architectural decisions are clear and constraining

**Ask for confirmation (Step 3A) if:**
- Multiple valid implementation approaches exist
- Breadcrumbs are vague or missing key details
- Architectural choice impacts other features
- You're uncertain about the right approach

### Step 3A: Propose Implementation Approach (Conditional)

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a PROPOSAL step.** File writes happen in Step 5.

**⚡ ASYNC BOUNDARY - Only execute this if confirmation needed**

**Present your analysis and proposal to the user:**

```
💡 Implementation Proposal

I see multiple ways to approach this. Here's what I'm thinking:

**Option I'm recommending:**
• Files to create/modify: [specific paths]
• Key approach: [what makes this the right choice]
• Why: [rationale - why this over alternatives]

**Alternative considered:**
• [Brief description] - not choosing because [reason]

Sound good, or would you prefer a different approach?
```

**⚡ WAIT for user confirmation or adjustments.**

If user adjusts: revise proposal and confirm again before proceeding.

**If you skipped this step:** Proceed directly to Step 4.

---

### Step 4: Establish RED Baseline

**CRITICAL:** After user confirms, execute autonomously - no permission needed for code changes.

Before writing any implementation code, run tests to establish the RED state:

```bash
# Get current work and parent feature's scenario file
sqlite3 .jettypod/work.db "SELECT wi.id, wi.parent_id, parent.scenario_file FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress'"
# This gives you the chore ID, parent feature ID, and path to the .feature file

# Run BDD tests to establish RED baseline
npx cucumber-js <scenario-file-path> --format progress
```

Parse the output to identify:
- Total steps and how many are failing
- Which specific steps are failing
- The first error message

This establishes your RED baseline - all or most steps should be failing initially.

**Display RED baseline:**
```
🔴 Establishing RED baseline...

RED Baseline: 5 of 8 steps failing

Failing steps:
  ✖ Given a user is logged in
  ✖ When they click the dashboard button
  ✖ Then they should see their dashboard
  ✖ And the dashboard should show their username
  ✖ And the dashboard should show their recent activity

First error:
  Step: Given a user is logged in
  Error: Error: login function is not defined

🎯 Goal: Make all steps pass

Now implementing...
```

**🔄 WORKFLOW CHECKPOINT: RED baseline established**

```bash
jettypod workflow checkpoint <feature-id> --step=4
```

---

### Step 5: RED→GREEN→REFACTOR Loop

**🔒 WORKTREE PATH REQUIRED:** All file writes MUST use the `WORKTREE_PATH` captured after pre-flight validation.

**✅ NOW you may write files** - worktree is locked, approach is confirmed.

**Execute autonomously** - iterate until tests pass (max 10 iterations).

**Each iteration (True TDD):**

1. **Identify next failing BDD step** - Which scenario step to tackle?
2. **Write unit test** - Test the function/logic needed for that step (watch it fail - RED)
3. **Write minimal implementation** - Just enough code to pass the unit test
4. **Run unit test** - Verify it passes (GREEN)
5. **Run BDD scenarios** - Check if BDD step now passes
6. **Display progress** - Show what's passing, what's next
7. **Continue or exit** - If all BDD scenarios pass → REFACTOR. Otherwise, repeat.

**Show progress each iteration:**
```
━━━ Iteration 3/10 ━━━
📝 Unit test: test/dashboard.test.js - sortActivityByDate()
   RED: Test fails - function doesn't exist yet
✍️  Implementation: src/dashboard.js - added sortActivityByDate()
   GREEN: Unit test passes
🧪 Running BDD scenarios...
📊 Progress: 7/8 BDD steps passing
✅ Newly passing: And activity should be sorted by date
🔧 Next failure: And activity should be filterable
    BDD step: When I filter by category "work"
```

**When GREEN achieved:**
```
🎉 GREEN: All success scenarios passing!
```

**🔄 WORKFLOW CHECKPOINT: GREEN achieved**

```bash
jettypod workflow checkpoint <feature-id> --step=5
```

**Then REFACTOR (quick pass, 5 min max):**
- Extract duplicated code
- Rename unclear variables
- Simplify complex expressions
- Remove dead code

**Re-run tests after refactor** to ensure nothing broke.

<details>
<summary><strong>📋 TDD Loop Guidelines (click to expand)</strong></summary>

**Iteration strategy:**
- Start with first failing step
- Make minimal change to pass that step
- Run tests immediately
- Move to next failure

**If stuck after 5 iterations:**
- Review approach - is there a simpler path?
- Check assumptions - are you solving the right problem?
- Break down the change - can you make smaller steps?

**Max 10 iterations:**
- If you hit max without GREEN, stop
- Display final progress and suggest next steps
- Consider breaking chore into smaller pieces

</details>

---

### Step 6: Route After Chore Completion

**CRITICAL: After GREEN, check if more speed chores remain.**

**Check for incomplete speed chores:**

```bash
# Get current work to find parent feature ID and current chore ID
sqlite3 .jettypod/work.db "SELECT wi.id, wi.parent_id FROM work_items wi WHERE wi.status = 'in_progress'"

# Count remaining speed chores (excluding current)
sqlite3 .jettypod/work.db "SELECT id, title FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND mode = 'speed' AND status != 'done' AND id != <current-chore-id> ORDER BY created_at LIMIT 1"
```

---

**Route A: More speed chores remain → Start next chore**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Speed Mode Chore Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Success scenarios pass for this chore

More speed mode chores remain. Starting next chore:
#[next-chore-id]: [next-chore-title]
```

**Merge and start next:**

```bash
# Commit changes in the worktree
git add . && git commit -m "feat: [brief description of what was implemented]"
```

```bash
# Step 1: Merge (can run from worktree - it won't delete it)
jettypod work merge [current-chore-id]
```

```bash
# Step 2: cd to main repo
cd /path/to/main/repo
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree, then start next chore
jettypod work cleanup [current-chore-id]
jettypod work start [next-chore-id]
```

The speed-mode skill will automatically re-invoke for the next chore.

---

**Route B: All speed chores complete → Transition to Step 7**

If the query returns no remaining chores, proceed to Step 7.

---

### Step 7: Transition to Stable Mode

**🛑 CRITICAL: This step ONLY runs after ALL speed chores are complete.**

This is the transition from speed mode to stable mode. Follow these phases in order.

#### Step 7A: Validate BDD Infrastructure and Verify Integration

**CRITICAL: Before transitioning, validate BDD infrastructure and verify integration.**

**1. Run dry-run validation to catch step definition conflicts:**

```bash
node -e "
const { validateBddInfrastructure } = require('./lib/skills/feature-planning/dry-run-validator');
validateBddInfrastructure('<scenario-file-path>').then(result => {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
});
"
```

**If validation FAILS with `duplicate_step` error:**
- Two step definition files define the same step pattern
- The error shows which files conflict
- **STOP** - create a chore to fix the step definition conflict before proceeding
- This is a test infrastructure bug, not a feature implementation issue

**If validation FAILS with other errors:**
- Check for `undefined_step` (missing step definitions)
- Check for `syntax_error` (malformed Gherkin)
- Fix the specific issue before proceeding

**If validation PASSES:** Continue to run integration scenario.

**2. Run the integration scenario:**

```bash
# Run ONLY the integration scenario (first scenario in the feature file)
npx cucumber-js <scenario-file-path> --name "User can reach" --format progress
```

**If integration scenario FAILS:**
- The feature exists but isn't wired into the app
- Stop and fix integration before proceeding
- Check: Is the route registered? Is the link/button added? Is the import in place?

**If integration scenario PASSES:**
- Feature is reachable by users
- Proceed to Step 7B

#### Step 7B: Merge Final Speed Chore

```bash
# Commit changes in the worktree
git add . && git commit -m "feat: [brief description of what was implemented]"
```

```bash
# Step 1: Merge with transition flag (can run from worktree - it won't delete it)
jettypod work merge [current-chore-id] --with-transition
```

```bash
# Step 2: cd to main repo
cd /path/to/main/repo
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree
jettypod work cleanup [current-chore-id]
```

After cleanup, you are on main branch. Ready to generate stable mode scenarios.

#### Step 7C: Generate and Propose Stable Mode Chores

**⚡ ASYNC BOUNDARY - Must wait for user confirmation**

**1. Create a test worktree for writing stable mode scenarios:**

**🚫 FORBIDDEN: Manual Git Worktree Commands**
```
❌ git worktree add ...
❌ git checkout -b tests/...
❌ git branch tests/...
```
**ALWAYS use jettypod commands** - they handle branch naming, path conventions, database tracking, and cleanup. Manual git commands will create orphaned worktrees that break the merge workflow.

```bash
jettypod work tests <feature-id>
```

This creates an isolated worktree at `.jettypod-work/tests-<id>-<slug>` with branch `tests/feature-<id>-<slug>`.

**🛑 CRITICAL:** All BDD file operations MUST use absolute paths in the test worktree:
- ✅ `/path/to/.jettypod-work/tests-42-login/features/login.feature`
- ❌ `features/login.feature` (this would write to main repo!)

**2. Read the feature's scenario file and analyze for stable mode needs:**

```bash
sqlite3 .jettypod/work.db "SELECT id, title, scenario_file FROM work_items WHERE id = <feature-id>"
```

**3. Generate stable mode BDD scenarios** covering:
- **Error scenarios** - Invalid input, missing params, system errors, permission failures
- **Edge cases** - Empty inputs, boundary values, special characters
- **State consistency** - Concurrent ops, partial failures, invalid state transitions

**4. Append scenarios to the feature file IN THE TEST WORKTREE:**

Use the Edit tool to append to `<worktree-path>/features/<feature-file>`:

```gherkin
# Stable Mode Scenarios - Error Handling and Edge Cases

Scenario: [Error scenario title]
  Given [context]
  When [error condition]
  Then [expected error handling]

Scenario: [Edge case title]
  Given [context]
  When [edge case input]
  Then [expected behavior]
```

**5. Create step definitions IN THE TEST WORKTREE** at `<worktree-path>/features/step_definitions/<feature-slug>-stable.steps.js`

**6. Commit and merge the test worktree:**

**🚨 CRITICAL: Shell CWD Corruption Prevention**

The merge will delete the test worktree. If your shell is inside that worktree, ALL subsequent commands will fail. You MUST:
1. Chain the cd and merge in a SINGLE bash command
2. Verify your shell is in main repo AFTER merge

```bash
# First: Commit in the test worktree (separate command is OK here)
cd <worktree-path> && git add features/ && git commit -m "test: Add stable mode BDD scenarios and step definitions

Added error handling and edge case scenarios for stable mode.
- [N] new stable mode scenarios
- Step definitions for validation and error handling"
```

**Merge and cleanup (3 steps):**

```bash
# Step 1: Merge tests (can run from worktree - it won't delete it)
jettypod work tests merge <feature-id>
```

```bash
# Step 2: cd to main repo
cd <main-repo-path>
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree (now safe since shell is in main repo)
jettypod work cleanup <feature-id>
```

**7. Present proposal to user:**

```
📋 Stable Mode Transition

I've generated [N] stable mode scenarios covering error handling and edge cases.

Here are the chores needed to make these scenarios pass:

**Chore 1: [Title]**
- Why: [What gap this fills]
- Scope: [What specifically needs to be done]
- Scenarios: [Which BDD scenarios this addresses]

**Chore 2: [Title]**
- Why: [What gap this fills]
- Scope: [What specifically needs to be done]
- Scenarios: [Which BDD scenarios this addresses]

Sound good? I'll create these chores once you confirm.
```

**⚡ WAIT for user confirmation or adjustments.**

#### Step 7D: Create Chores and Complete Transition

**After user confirms, execute autonomously:**

**1. Set feature mode to stable FIRST:**

```bash
jettypod work set-mode <feature-id> stable
```

**🛑 CRITICAL:** You MUST set mode to stable BEFORE creating chores. The system blocks chore creation while feature is in speed mode.

**2. Create stable mode chores:**

```bash
jettypod work create chore "[Chore title]" "[Description with scenarios addressed]" --parent=<feature-id>
```

Repeat for each confirmed chore. **Do NOT use `--mode` flag** - chores inherit mode from their parent feature.

**3. Release merge lock (CRITICAL: separate Bash calls):**

```bash
cd <main-repo>                           # Bash call 1
```

```bash
jettypod work merge <last-chore-id> --release-lock   # Bash call 2
```

**🔄 WORKFLOW COMPLETE: Speed mode finished**

Mark speed mode as complete (this passes the `speed_mode_complete` gate, enabling stable-mode):

```bash
jettypod workflow complete speed-mode <feature-id>
```

#### Step 7E: Start First Stable Chore and Invoke Stable Mode Skill

**🛑 CRITICAL HANDOFF - You MUST start the first chore BEFORE invoking stable-mode.**

**1. Get the first stable chore:**

```bash
sqlite3 .jettypod/work.db "SELECT id, title FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND status != 'done' ORDER BY created_at LIMIT 1"
```

Note: Chores don't have a `mode` column - they inherit context from their parent feature. Since we just set the feature to stable mode, these are the stable chores.

**2. Start the first stable chore:**

```bash
jettypod work start <first-stable-chore-id>
```

**🛑 STOP AND CHECK:** Look at the output. You should see:
```
✅ Created worktree: /path/to/.jettypod-work/[id]-[title-slug]
```

If you see `⚠️ Working in main repository (worktree creation failed)`, fix the issue before continuing.

**3. Verify worktree exists:**

```bash
sqlite3 .jettypod/work.db "SELECT worktree_path FROM worktrees WHERE work_item_id = <first-stable-chore-id> AND status = 'active'"
```

If empty, **STOP** - worktree wasn't created properly.

**4. Display completion message:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Speed Mode Complete! Transitioning to Stable Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  CRITICAL: Speed mode is ONLY a checkpoint.
The feature is INCOMPLETE without stable mode.

What we accomplished:
✅ All speed mode chores complete
✅ Generated [N] stable mode BDD scenarios
✅ Created step definitions for stable scenarios
✅ Created [N] stable mode chores
✅ Feature mode set to stable
✅ Started first stable chore #[id]

🚀 Now invoking stable-mode skill...
```

**5. Invoke stable-mode:**

```
Use the Skill tool with skill: "stable-mode"
```

**🛑 CRITICAL:** You MUST:
1. Run `work start` for the first stable chore
2. Verify the worktree was created
3. THEN invoke stable-mode using the Skill tool

If you skip `work start`, stable-mode will fail because no chore is in progress.

**End speed-mode skill.**

---

## Validation Checklist

Before ending speed-mode skill, ensure:
- [ ] All speed mode chores complete (GREEN on all success scenarios)
- [ ] **Integration scenario passes** (feature is reachable, not an "island")
- [ ] Stable mode BDD scenarios generated and committed
- [ ] Step definitions created for stable scenarios
- [ ] Stable mode chores created
- [ ] Feature mode set to stable
- [ ] **First stable chore started with `work start`**
- [ ] **Worktree verified for first stable chore**
- [ ] **stable-mode skill invoked using Skill tool**

---

## Command Reference

**Complete chores (CRITICAL: run cd and merge as SEPARATE Bash calls):**
```bash
# Bash call 1: Change to main repo
cd <main-repo>
```
```bash
# Bash call 2: Merge (ALWAYS include chore ID)
jettypod work merge <chore-id>                    # Merge chore by ID
jettypod work merge <chore-id> --with-transition  # Hold lock for transition
jettypod work merge <chore-id> --release-lock     # Release held lock
```

**Start chores:**
```bash
jettypod work start <chore-id>   # Create worktree and start chore
```

**Create test worktree (for writing BDD scenarios):**
```bash
jettypod work tests <feature-id>        # Create worktree for writing tests
jettypod work tests merge <feature-id>  # Merge tests (preserves worktree)
cd <main-repo>                          # cd to main repo
jettypod work cleanup <feature-id>      # Clean up worktree
```

**Set feature mode (BEFORE creating chores):**
```bash
jettypod work set-mode <feature-id> stable
```

**Create chores (AFTER setting mode):**
```bash
jettypod work create chore "<title>" "<description>" --parent=<feature-id>
```
Note: Do NOT use `--mode` flag - chores inherit mode from parent feature.

**❌ DO NOT use these to complete chores:**
- `jettypod work status <id> done`
- `jettypod work complete <id>`
