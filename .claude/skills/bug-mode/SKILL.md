---
name: bug-mode
description: Guide implementation of bug fixes with comprehensive fix, regression test creation, and verification. Receives enriched context from bug-planning and executes with iteration until verification passes.
---

# Bug Mode Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Bug Fix Flow                                                       │
│                                                                     │
│  Bug Planning → [BUG MODE] → Done                                   │
│                 ▲▲▲▲▲▲▲▲▲▲                                          │
│                 YOU ARE HERE                                        │
│                                                                     │
│  Single pass: Covers speed through stable (internal) or             │
│               through production (external) comprehensively.        │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Difference from Feature Modes

**Bug fixes do NOT follow speed → stable → production progression.**

- **Features:** Iterative refinement (speed makes it work, stable makes it robust, production makes it scalable)
- **Bugs:** Single comprehensive fix (fix the root cause properly the first time)

Why? A bug fix should:
1. Fix the root cause completely
2. Include proper error handling from the start
3. Pass the regression test
4. Be production-ready immediately

---

Guides Claude Code through comprehensive bug fix implementation. Receives context from bug-planning skill (root cause, breadcrumbs).

## Instructions

When this skill is activated, you are implementing a bug fix directly on the bug work item. The bug-planning skill has already:
- Identified root cause
- Created the bug work item with breadcrumbs
- Started the worktree with `work start`

Your job: Implement the fix, write a regression test, and verify everything passes.

## 🔑 Critical Context

**You are working in an isolated git worktree:**
- `work start [bug-id]` already created a dedicated worktree
- All file operations must use **absolute paths** from the worktree
- The worktree has its own branch - changes are isolated from main

**Worktree path is available in Step 0 output** - use it for all file operations.

---

## 🚨 SHELL CWD RECOVERY

**If ALL bash commands start failing with "Error: Exit code 1" and no output:**

Your shell's working directory was likely inside a worktree that was deleted. The CWD no longer exists.

**Recovery steps:**
1. Get the main repo path from your session context
2. Run: `cd <main-repo-path>`
3. Verify: `pwd && ls .jettypod`
4. Resume your work

---

## 🛑 PRE-FLIGHT VALIDATION (REQUIRED)

**Before proceeding, validate the worktree exists.**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.status, wt.worktree_path, wt.branch_name FROM work_items wi LEFT JOIN worktrees wt ON wi.id = wt.work_item_id WHERE wi.status = 'in_progress' AND wi.type = 'bug'"
```

**Check the result:**

| worktree_path | What it means | Action |
|---------------|---------------|--------|
| **Has a path** | ✅ Worktree exists, ready to proceed | Continue to Step 0 |
| **NULL or empty** | ❌ `work start` was not called | **STOP - run `jettypod work start [bug-id]` first** |
| **No rows returned** | ❌ No bug is in progress | **STOP - verify the bug exists and run `work start`** |

---

## Implementation Steps

### Step 0: Initialize Bug Mode Context

**Get the current work context:**

```bash
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.description, wt.worktree_path, wt.branch_name FROM work_items wi LEFT JOIN worktrees wt ON wi.id = wt.work_item_id WHERE wi.status = 'in_progress' AND wi.type = 'bug'"
```

**Extract breadcrumbs from bug description:**
The bug-planning skill embedded implementation guidance:
- Root cause location (file:line)
- Fix approach (steps)
- Files to modify
- Verification criteria

**Display to user:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐛 BUG MODE: Fixing #[bug-id]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bug: #[id] [title]
Worktree: [worktree_path]
Branch: [branch_name]

Root Cause:
[From breadcrumbs - what's broken and where]

Fix Approach:
[From breadcrumbs - steps to fix]

Starting implementation...
```

**Proceed to Step 1.**

---

### Step 1: Implement Comprehensive Fix

**CRITICAL:** Bug fixes must be comprehensive from the start.

**Use breadcrumbs to guide implementation:**
1. Navigate to the root cause location
2. Understand the surrounding code
3. Implement the fix following the approach from bug-planning
4. Add proper error handling (don't just fix the happy path)
5. Consider edge cases related to the bug

**What "comprehensive" means:**

**INTERNAL projects (project_state = 'internal'):**
- Fix the root cause
- Add validation to prevent the bug condition
- Handle the error gracefully if it somehow occurs
- Ensure related edge cases are covered

**EXTERNAL projects (project_state = 'external'):**
- Everything for internal, PLUS:
- Consider security implications
- Add logging for debugging
- Ensure graceful degradation
- Consider concurrent access if relevant

**Check project state:**

```bash
sqlite3 .jettypod/work.db "SELECT project_state FROM project_config WHERE id = 1"
```

**Implement iteratively:**

```
━━━ Iteration 1 ━━━
📂 Reading: [file:line from breadcrumbs]
🔧 Change: [what you're fixing]
```

**After implementation:**

```
🎉 Fix Implemented

Changes made:
- [Change 1]
- [Change 2]
- [Error handling added]

Now writing regression test...
```

**Proceed to Step 2.**

---

### Step 2: Write Regression Test

**Goal:** Create a test that verifies the bug is fixed and prevents regression.

**Derive feature slug** from bug title (lowercase, hyphens, no special chars).

**Write regression test in worktree:**

Feature file at `<worktree>/features/<bug-slug>.feature`:

```gherkin
Feature: [Bug title] - Regression Test
  Prevents regression of bug #<bug-id>

  Root cause: [Brief description]

  Scenario: [Description of correct behavior]
    Given [setup that triggers the bug condition]
    When [action that previously caused the bug]
    Then [expected correct behavior]
    And [additional verifications]
```

Step definitions at `<worktree>/features/step_definitions/<bug-slug>.steps.js`

**Validate with dry-run:**

```bash
cd <worktree> && npx cucumber-js --dry-run features/<bug-slug>.feature
```

Fix any undefined steps or syntax errors.

**Run the regression test:**

```bash
npx cucumber-js features/<bug-slug>.feature --format progress
```

**Confirm test passes:**

```
✅ Regression Test Passing

Test: features/<bug-slug>.feature
Status: PASSING

The fix is verified by the regression test.
```

**Proceed to Step 3.**

---

### Step 3: Verify No Regressions

**Run related BDD tests** (the regression test + tests in the same area):

```bash
# Run the regression test you just wrote
npx cucumber-js features/<bug-slug>.feature --format progress

# Run related tests in the same area (if any exist)
# Use jettypod impact to find affected tests, or identify tests in the same feature area
npx cucumber-js features/<related-feature>.feature --format progress 2>/dev/null || true
```

**What counts as "related tests":**
- The regression test you wrote for this bug
- Tests for the same feature/component area
- Tests that exercise the code you modified

**If regressions found:**

```
⚠️ Regression Detected

Failing test: [test name]
Error: [error message]

Investigating...
```

Fix the regression and re-run tests. Iterate until all related tests pass.

**When all related tests pass:**

```
✅ Related Tests Passing

- Regression test: ✅ PASS
- Related area tests: ✅ [X] scenarios passing

Ready to commit and merge.
```

**Proceed to Step 4.**

---

### Step 4: Commit and Merge

**Commit the fix:**

```bash
git add . && git commit -m "fix: [Brief description of the bug fix]

Root cause: [What was broken]
Fix: [What was changed]

Closes #<bug-id>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Merge (3 steps):**

```bash
# Step 1: Merge (can run from worktree - it won't delete it)
jettypod work merge <bug-id>
```

```bash
# Step 2: cd to main repo
cd <main-repo-path>
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree
jettypod work cleanup <bug-id>
```

**Proceed to Step 5.**

---

### Step 5: Mark Bug as Done

**After the fix is merged, mark the bug as done:**

```bash
jettypod work status <bug-id> done
```

**Display completion:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bug Fix Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐛 Bug: #[bug-id] [title]
🧪 Regression test: ✅ features/<bug-slug>.feature

What was fixed:
- Root cause: [brief description]
- Fix: [what changed]
- Prevention: [validation/error handling added]

The bug is now fixed and protected by a regression test.
```

**End bug-mode skill.**

---

## Validation Checklist

Before ending bug-mode skill, ensure:
- [ ] Fix implemented comprehensively (not just happy path)
- [ ] Regression test written and passing
- [ ] Related tests passing (no regressions in affected area)
- [ ] Fix committed with descriptive message
- [ ] Bug merged to main
- [ ] Worktree cleaned up
- [ ] Bug marked as done

---

## Command Reference

**Merge fix (CRITICAL: cd to main repo separately):**
```bash
jettypod work merge <bug-id>     # ALWAYS include bug ID
```

```bash
cd <main-repo>                   # Change to main repo
jettypod work cleanup <bug-id>   # Clean up worktree
```

**Mark bug complete:**
```bash
jettypod work status <bug-id> done
```
