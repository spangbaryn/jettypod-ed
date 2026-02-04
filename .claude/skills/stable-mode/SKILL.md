---
name: stable-mode
description: Guide implementation of stable mode chores with comprehensive testing and error handling. Use when user starts work on a stable mode chore. Analyzes BDD scenarios, reviews speed mode implementation, and adds proper error handling, validation, and edge case coverage.
---

# Stable Mode Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mode Progression Flow                                               │
│                                                                      │
│  Feature Planning → Speed Mode → [STABLE MODE] → Production Mode     │
│                                   ▲▲▲▲▲▲▲▲▲▲▲▲                       │
│                                   YOU ARE HERE                       │
│                                                                      │
│  Next: INTERNAL projects → Feature DONE                              │
│        EXTERNAL projects → Invoke production-mode skill              │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛑 CRITICAL HANDOFF REQUIREMENT

**After completing ALL stable mode chores:**

**INTERNAL projects (project_state = 'internal'):**
1. Mark feature as done
2. **End skill** - Feature is complete!

**EXTERNAL projects (project_state = 'external'):**
1. Set feature mode to production
2. **IMMEDIATELY invoke production-mode using the Skill tool**

**🛑 STOP GATE:** For external projects, DO NOT end this skill without invoking production-mode. Stable mode makes it robust - production mode makes it ready for real users at scale.

---

Guides Claude Code through stable mode implementation with comprehensive testing focus. Users confirm approach but Claude Code writes the code.

## Instructions

When this skill is activated, you are helping implement a stable mode chore to add comprehensive testing and error handling. Follow this structured approach:

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

**🚫 FORBIDDEN: Manual Git Worktree Commands**
```
❌ git worktree add ...
❌ git checkout -b feature/...
❌ git branch feature/...
```
**ALWAYS use `jettypod work start`** - it handles branch naming, path conventions, database tracking, and cleanup. Manual git commands will create orphaned worktrees that break the merge workflow.

**Example of valid output:**
```
4|Add error handling|in_progress|/Users/erik/project/.jettypod-work/4-add-error-handling|feature/work-4-add-error-handling
```

**Example of INVALID output (missing worktree):**
```
4|Add error handling|in_progress||
```
↑ Empty worktree_path means `work start` was never called. Run it now.

---

## 🔒 WORKTREE PATH LOCK

**After pre-flight validation passes, capture and lock the worktree path:**

From the pre-flight query output, extract and store:
- `WORKTREE_PATH` - the absolute path to the worktree

**Display:**

```
🔒 WORKTREE LOCK ACTIVE
Path: ${WORKTREE_PATH}

All file writes will use this path.
```

**From this point forward, ALL file operations MUST use paths starting with `${WORKTREE_PATH}/`**

This lock prevents accidental writes to the main repository.

---

### Overview

**Stable Mode Goal:** Transform speed mode's "make it work" implementation into robust, reliable code with comprehensive error handling and validation.

**CRITICAL DISTINCTION:**
- **Speed mode implemented ALL functionality** - every feature/function is already working (integration + all success scenarios)
- **Speed mode verified integration** - the feature is reachable by users (Integration Scenario passed)
- **Stable mode adds COMPLETE robustness** - error handling, validation, and edge cases

**Key Principles:**
- **Build on speed implementation** - do not re-implement features, ADD robustness to them
- **Autonomous execution** - Claude Code writes code, user confirms approach
- **Quality focus** - code should be stable, maintainable, and reliable (ready for internal use)

**User Profile:** May not know how to code - Claude Code does the implementation autonomously.

<details>
<summary><strong>📋 What Stable Mode Includes (click to expand)</strong></summary>

**Stable Mode is NOT just error handling. It includes:**

1. **Comprehensive Error Handling**
   - Catch all failure modes (network errors, file system errors, database errors)
   - User-friendly error messages that explain what went wrong
   - Graceful degradation when things fail
   - Proper error propagation vs. recovery

2. **Input Validation**
   - Null/undefined checks before using values
   - Type validation (is this actually a number/string/object?)
   - Range validation (min/max values, length limits)
   - Format validation (email format, URL format, date format)
   - Sanitization (prevent injection attacks, XSS)

3. **Edge Case Handling**
   - Empty arrays/objects/strings
   - Missing or optional properties
   - Boundary values (0, -1, MAX_INT, empty string)
   - Concurrent access (race conditions, simultaneous operations)
   - Resource limits (too many items, files too large)

4. **State Consistency & Data Integrity**
   - Transaction handling (all-or-nothing operations)
   - Cleanup on failure (rollback partial changes)
   - Prevent corrupted state
   - Handle interrupted operations

5. **All BDD Scenarios Pass**
   - Success scenarios (already passing from speed mode - required + optional features)
   - Error scenarios (how does it handle failures?)
   - Edge case scenarios (boundary conditions, unusual inputs)
   - Concurrent access scenarios (multiple instances)

</details>

---

## 🧪 Unit Testing in Stable Mode - True TDD

**Unit tests are written DURING implementation, not after.**

**The TDD workflow (each iteration):**
1. **Identify next failing BDD step** - Which error/edge case scenario step needs to pass?
2. **Write unit test for the validation/error handling** - Test the specific error condition
3. **Watch unit test fail (RED)** - Confirm test catches the missing validation
4. **Write minimal code** - Add error handling, validation, or edge case handling
5. **Run unit test (GREEN)** - Verify the validation/error handling works in isolation
6. **Run BDD scenarios** - Check if this makes any error/edge case BDD steps pass
7. **Next iteration** - Repeat for next failing step

**What to unit test in stable mode:**
- Validation functions (null checks, type checks, range validation)
- Error handling logic (catch blocks, error recovery)
- Edge case handling (empty arrays, boundary values)
- State consistency (transaction rollback, cleanup on failure)

<details>
<summary><strong>📋 Unit Test Examples (click to expand)</strong></summary>

```javascript
// ✅ Stable mode unit tests (error paths and edge cases)
test('createUser throws ValidationError for null email', () => {
  expect(() => createUser('John', null)).toThrow(ValidationError);
  expect(() => createUser('John', null)).toThrow('Email is required');
});

test('createUser handles empty string email', () => {
  expect(() => createUser('John', '')).toThrow(ValidationError);
});

test('getUserById returns null for non-existent user', () => {
  const user = getUserById(99999);
  expect(user).toBeNull();
});
```

</details>

---

## Quick Reference: Async Boundaries

**Where Claude Code MUST wait for user confirmation:**

| Step | Location | Why |
|------|----------|-----|
| Step 3A | Before implementing (conditional) | User confirms implementation approach - only if ambiguous |

**Where Claude Code executes autonomously:**
- Steps 0-2: Initialize, analyze scenarios, review speed implementation
- Step 3: Decision to skip/ask confirmation
- Steps 4-5: RED baseline, RED→GREEN→REFACTOR loop
- Step 6: Route to next chore OR transition to Step 7
- Step 7: Complete feature (internal) or invoke production-mode (external)

---

## Implementation Steps

### Step 0: Initialize Stable Mode Context

**You are now in stable mode,** implementing a chore to add error handling and edge case coverage.

**Get the current work context:**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.parent_id, parent.title as parent_title, parent.scenario_file, wt.worktree_path, wt.branch_name FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id LEFT JOIN worktrees wt ON wi.id = wt.work_item_id WHERE wi.status = 'in_progress' AND wi.type = 'chore'"
```

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After getting the work context, register this skill execution:

```bash
jettypod workflow start stable-mode <feature-id>
```

This validates that `speed_mode_complete` gate is passed and creates an execution record for session resume.

**Display to user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛡️  STABLE MODE: Implementing Chore #[id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chore: [title]
Feature: #[parent-id] [parent-title]
Worktree: [worktree_path]
Branch: [branch_name]

Analyzing stable mode BDD scenarios to determine what error handling and validation to add...
```

**Then proceed to Step 1.**

---

### Step 1: Analyze Scenario to Implement

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is an ANALYSIS step.** File writes happen in Step 5.

**Your task:**
1. Get current work item and parent feature's scenario file
2. Read the full scenario file (should have success scenarios + stable mode error/edge case scenarios)
3. Identify which scenario this chore addresses
4. Extract requirements from the scenario's Given/When/Then steps
5. Check chore description for breadcrumbs (implementation guidance from speed-mode transition)

**NOTE:** Scenarios and step definitions already exist, created by the speed-mode skill during transition to stable mode. Chore descriptions may contain breadcrumbs with implementation guidance.

**To get scenario information:**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.description, wi.parent_id, parent.title as parent_title, parent.scenario_file, parent.mode FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress'"
```

**Then read the scenario file** using the Read tool on the path returned by `scenario_file`.

**Identify target scenario:**
1. Split the file by `Scenario:` to get individual scenarios
2. Extract scenario titles from each block
3. Match the chore description to a scenario by keywords or scenario numbers
4. If no match found, list available scenarios and ask which one to implement

**Handle errors gracefully:**
- If no current work: "❌ No current work found. Run: jettypod work start <chore-id>"
- If no parent feature: "❌ Current work has no parent feature."
- If no scenario_file: "❌ Feature has no scenario_file."
- If can't match chore to scenario: List available scenarios and ask user

**Display to user:**

```
🧪 Stable Mode: [Feature Name]

Target Scenario:
[Scenario title]

What needs to happen:
• [Given] Initial state: [requirement]
• [When] Action/condition: [requirement]
• [Then] Expected behavior: [requirement]

[If breadcrumbs exist:]
Implementation guidance:
• Files: [files to modify]
• Patterns: [patterns to follow]
• Functions: [functions to add validation to]

Now reviewing speed mode implementation...
```

**Move to Step 2 automatically.**

### Step 2: Review Speed Mode Implementation

**CRITICAL:** Claude Code executes this autonomously - no user permission needed.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is an ANALYSIS step.** File writes happen in Step 5.

**Your task:**
1. Find files created/modified in speed mode
2. Read the existing implementation
3. Identify what's missing for this scenario
4. Understand current code structure

**Find speed mode files:**

```bash
# Find files by looking at the feature's speed chores
sqlite3 .jettypod/work.db "SELECT id, title FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND mode = 'speed'"

# Or search git history
git log --oneline --all --grep="<feature-name>" -10
```

Then use the Read tool to examine the implementation files.

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
• Success scenarios: ✅ Working (from speed mode)
• Error handling: ❌ Missing [specific gaps]
• Validation: ❌ Missing [specific gaps]
• Edge cases: ❌ Not handled [specific gaps]

To pass the target scenario, I need to:
1. [Specific change]
2. [Specific change]
3. [Specific change]

Now proposing comprehensive implementation...
```

**🔄 WORKFLOW CHECKPOINT: Code analysis complete**

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
- Chore description is comprehensive (specific validation/error handling described)
- Implementation approach is clear and unambiguous
- Only one reasonable way to add the error handling
- Similar patterns exist in codebase to follow

**Ask for confirmation (Step 3A) if:**
- Multiple valid error handling approaches exist
- Chore description is vague about specific validation
- Architectural choice impacts other features
- You're uncertain about the right approach

### Step 3A: Propose Implementation Approach (Conditional)

**⚡ ASYNC BOUNDARY - Only execute this if confirmation needed**

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a PROPOSAL step.** File writes happen in Step 5.

**Present your analysis and proposal to the user:**

```
💡 Implementation Proposal

I see multiple ways to approach this error handling. Here's what I'm thinking:

**Option I'm recommending:**
• Error handling strategy: [specific approach]
• Validation approach: [what to validate and how]
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

**CRITICAL:** After user confirms (or skips confirmation), execute autonomously - no permission needed for code changes.

Before writing any implementation code, validate BDD infrastructure and run tests to establish the RED state:

```bash
# Get current work and parent feature's scenario file
sqlite3 .jettypod/work.db "SELECT wi.id, wi.parent_id, parent.scenario_file FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress'"
```

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
- **STOP** - fix the step definition conflict before proceeding
- Common cause: stable mode step definitions duplicating existing steps

**If validation PASSES:** Continue to establish RED baseline.

**2. Run BDD tests to establish RED baseline:**

```bash
npx cucumber-js <scenario-file-path> --format progress
```

Parse the output to identify:
- Total steps and how many are failing
- Which specific stable mode steps are failing (error/edge case scenarios)
- The first error message

**Display RED baseline:**
```
🔴 Establishing RED baseline...

RED Baseline: 3 of 11 steps failing (stable mode scenarios)

Failing steps:
  ✖ Then it should throw a validation error
  ✖ And the error message should be "Email is required"
  ✖ When I provide an empty string as input

First error:
  Step: Then it should throw a validation error
  Error: Error: Expected function to throw but it didn't

🎯 Goal: Make all stable mode scenarios pass

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

1. **Identify next failing BDD step** - Which error/edge case scenario step to tackle?
2. **Write unit test** - Test the validation/error handling needed (watch it fail - RED)
3. **Write minimal implementation** - Add error handling, validation, or edge case code
4. **Run unit test** - Verify it passes (GREEN)
5. **Run BDD scenarios** - Check if BDD step now passes
6. **Display progress** - Show what's passing, what's next
7. **Continue or exit** - If all BDD scenarios pass → REFACTOR. Otherwise, repeat.

**Show progress each iteration:**
```
━━━ Iteration 3/10 ━━━
📝 Unit test: test/user.test.js - validates email format
   RED: Test fails - no validation exists yet
✍️  Implementation: src/user.js - added email format validation
   GREEN: Unit test passes
🧪 Running BDD scenarios...
📊 Progress: 9/11 BDD steps passing
✅ Newly passing: Then it should throw a validation error
🔧 Next failure: And the error message should be user-friendly
    BDD step: Then the error message should be "Email format is invalid"
```

**When GREEN achieved:**
```
🎉 GREEN: All stable mode scenarios passing!
```

**🔄 WORKFLOW CHECKPOINT: GREEN achieved**

```bash
jettypod workflow checkpoint <feature-id> --step=5
```

**Then REFACTOR (quick pass, 5 min max):**
- Extract duplicated validation logic
- Rename unclear error variables
- Simplify complex error handling
- Remove dead code

**Re-run tests after refactor** to ensure nothing broke.

<details>
<summary><strong>📋 TDD Loop Guidelines (click to expand)</strong></summary>

**Iteration strategy:**
- Start with first failing stable mode step
- Make minimal change to pass that step
- Run tests immediately
- Move to next failure

**If stuck after 5 iterations:**
- Review approach - is there a simpler validation?
- Check assumptions - are you handling the right error?
- Break down the change - can you add validation incrementally?

**Max 10 iterations:**
- If you hit max without GREEN, stop
- Display final progress and suggest next steps
- Consider breaking chore into smaller pieces

</details>

---

### Step 6: Route After Chore Completion

**CRITICAL: After GREEN, check if more stable chores remain.**

**Check for incomplete stable chores:**

```bash
# Get current work to find parent feature ID and current chore ID
sqlite3 .jettypod/work.db "SELECT wi.id, wi.parent_id FROM work_items wi WHERE wi.status = 'in_progress'"

# Count remaining stable chores (excluding current)
sqlite3 .jettypod/work.db "SELECT id, title FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND mode = 'stable' AND status != 'done' AND id != <current-chore-id> ORDER BY created_at LIMIT 1"
```

---

**Route A: More stable chores remain → Start next chore**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Stable Mode Chore Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Error handling and validation scenarios pass for this chore

More stable mode chores remain. Starting next chore:
#[next-chore-id]: [next-chore-title]
```

**Merge and start next:**

```bash
# Commit changes in the worktree
git add . && git commit -m "feat: [brief description of error handling added]"
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

The stable-mode skill will automatically re-invoke for the next chore.

---

**Route B: All stable chores complete → Transition to Step 7**

If the query returns no remaining chores, proceed to Step 7.

---

### Step 7: Complete Feature or Transition to Production Mode

**🛑 CRITICAL: This step ONLY runs after ALL stable chores are complete.**

**First, merge the final stable chore:**

```bash
git add . && git commit -m "feat: [brief description of error handling added]"
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
# Step 3: Clean up the worktree
jettypod work cleanup [current-chore-id]
```

**Then check project state:**

```bash
sqlite3 .jettypod/work.db "SELECT project_state FROM project_config WHERE id = 1"
```

---

#### Step 7A: INTERNAL Project → Feature Complete

**If project_state = 'internal':**

```bash
jettypod work status <feature-id> done
```

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FEATURE COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature: #[id] [Feature Title]
Status: ✅ DONE

What we accomplished:
✅ All BDD scenarios passing (success + error handling + edge cases)
✅ Comprehensive error handling and validation
✅ Input validation and edge case coverage
✅ State consistency and data integrity

📝 INTERNAL PROJECT - STABLE MODE IS COMPLETE

This is an internal project - stable mode is the end state.
Feature is complete and ready to use!

Note: If you later transition to external (accepting real users),
run the external-transition skill to generate production chores.
```

**🔄 WORKFLOW INTEGRATION: Complete workflow (internal project)**

```bash
jettypod workflow complete stable-mode <feature-id>
```

This marks the `stable_mode_complete` gate as passed. For internal projects, this is the final workflow step.

**End skill.** Feature is DONE.

---

#### Step 7B: EXTERNAL Project → Invoke Production Mode

**If project_state = 'external':**

**🛑 CRITICAL HANDOFF - You MUST invoke production-mode using the Skill tool.**

**Set feature mode to production:**

```bash
jettypod work set-mode <feature-id> production
```

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Stable Mode Complete! Transitioning to Production Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  CRITICAL: This is an EXTERNAL project.
Stable mode makes it robust - production mode makes it ready for real users.

What we accomplished:
✅ All BDD scenarios passing (success + error handling + edge cases)
✅ Comprehensive error handling and validation
✅ Feature stable and ready for production hardening

🚀 Now invoking production-mode skill...
```

**🔄 WORKFLOW INTEGRATION: Complete workflow (external project)**

```bash
jettypod workflow complete stable-mode <feature-id>
```

This marks the `stable_mode_complete` gate as passed, enabling production-mode to start.

**Invoke production-mode:**

```
Use the Skill tool with skill: "production-mode"
```

The production-mode skill will:
1. Detect feature context (authentication/data/general)
2. Generate production scenarios from standards
3. Create production chores with proper scope

**End stable-mode skill.**

---

## Validation Checklist

Before ending stable-mode skill, ensure:
- [ ] All stable mode chores complete (GREEN on all error/edge case scenarios)
- [ ] Integration scenario still passes (feature remains reachable after error handling added)
- [ ] Final chore merged to main
- [ ] Project state checked (internal vs external)
- [ ] **INTERNAL:** Feature marked as done
- [ ] **EXTERNAL:** Feature mode set to production AND production-mode skill invoked

---

## Command Reference

**Complete chores (CRITICAL: run cd and merge as SEPARATE Bash calls):**
```bash
# Bash call 1: Change to main repo
cd <main-repo>
```
```bash
# Bash call 2: Merge (ALWAYS include chore ID)
jettypod work merge <chore-id>   # Merge chore by ID
```

**Start chores:**
```bash
jettypod work start <chore-id>   # Create worktree and start chore
```

**Set feature status/mode:**
```bash
jettypod work status <feature-id> done      # Mark feature complete (internal only)
jettypod work set-mode <feature-id> production  # Set feature to production mode
```

**❌ DO NOT use these to complete chores:**
- `jettypod work status <chore-id> done`
- `jettypod work complete <id>`

---

## ⚠️ Important: Sequential Workflow

**Stable mode chores MUST be completed sequentially, not in parallel.**

**Why?**
- Multiple chores may modify the same files
- Later chores build on earlier implementations
- Parallel worktrees branch from main independently

**Process:**
1. Complete chore → run `cd <main-repo>` then `jettypod work merge <chore-id>` as SEPARATE Bash calls
2. Start next chore → `jettypod work start <next-id>`
3. Repeat

The merge command handles everything: pushes branch, merges to main, marks chore done, cleans up worktree.
