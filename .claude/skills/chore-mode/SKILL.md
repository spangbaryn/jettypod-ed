---
name: chore-mode
description: Guide implementation of standalone chores with type-appropriate guidance, verification steps, and test handling. Receives enriched context from chore-planning and executes with iteration until verification passes. For chores under technical epics, receives context indicating no mode progression needed (already the default for all chores).
---

# Chore Mode Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Standalone Chore Execution                                         │
│                                                                      │
│  chore-planning → [CHORE MODE] → Done                               │
│                    ▲▲▲▲▲▲▲▲▲▲▲                                      │
│                    YOU ARE HERE                                      │
│                                                                      │
│  Chores are focused tasks - no speed/stable/production progression. │
│  Execute once with type-appropriate verification, then done.        │
└─────────────────────────────────────────────────────────────────────┘
```

Guides Claude Code through chore execution with type-specific guidance, test handling, and verification criteria from the chore taxonomy.

## Instructions

When this skill is activated, you are executing a standalone chore. The chore-planning skill has already classified the type and built enriched context. Follow this structured approach:

### Overview

**Chore Mode Goal:** Execute the chore according to type-specific guidance and verify completion using taxonomy criteria.

**Key Principles:**
- **Type-aware execution** - Different chore types have different test handling and verification
- **Guided verification** - Use taxonomy verification checklist, not arbitrary checks
- **Iteration with limits** - Max 5 iterations to achieve verification
- **No mode progression** - Chores don't have speed/stable/production phases
- **Technical epic awareness** - Acknowledge when a chore belongs to a technical epic (display indicator, confirm no mode progression)

**Chore Types Quick Reference:**

| Type | Test Handling | Key Constraint |
|------|---------------|----------------|
| refactor | Affected tests only | Do NOT modify test assertions |
| dependency | Full test suite | Check for deprecation warnings |
| cleanup | Affected tests | Verify code is actually unused |
| tooling | CI/manual verification | Focus on verification over unit tests |

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

## Implementation Steps

### Step 1: Receive and Display Context

**Your task:** Acknowledge the context passed from chore-planning.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a CONTEXT step.** File writes happen in Step 5.

You will receive:
- `choreContext.chore` - Chore ID, title, description
- `choreContext.classification` - Type and confidence
- `choreContext.guidance` - Scope, verification, testHandling from taxonomy
- `choreContext.implementationPlan` - Files to modify, affected tests
- `choreContext.technicalEpic` - (optional) Technical epic context:
  - `isTechnicalEpic: true/false` - Whether this chore belongs to a technical epic
  - `skipModeProgression: true/false` - Whether to skip mode progression (always true for chores)

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Chore Mode: [Chore Title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: [TYPE] (confidence: [high/medium/low])
Chore ID: #[id]

Implementation Plan:
• Files to modify: [list from context]
• Affected tests: [list from context]
```

**If `technicalEpic.isTechnicalEpic = true`:**

Add this line after Chore ID:
```
⚡ Technical Epic Chore - no mode progression
```

This confirms the chore belongs to a technical epic and will execute directly without any speed→stable→production phases (which is the default for all chores anyway).

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After receiving context, register this skill execution:

```bash
jettypod workflow start chore-mode <chore-id>
```

This validates that `chore_planning_complete` gate is passed (if applicable) and creates an execution record for session resume.

**Move to Step 2 automatically.**

### Step 2: Create Worktree

**Your task:** Create an isolated worktree for this chore.

**🚫 FORBIDDEN: Manual Git Worktree Commands**
```
❌ git worktree add ...
❌ git checkout -b feature/...
❌ git branch feature/...
```
**ALWAYS use `jettypod work start`** - it handles branch naming, path conventions, database tracking, and cleanup. Manual git commands will create orphaned worktrees that break the merge workflow.

```bash
jettypod work start [chore-id]
```

This creates a worktree at `.jettypod-work/[id]-[title-slug]` and switches to a new branch.

**🛑 VALIDATION REQUIRED:** After running `work start`, verify the worktree was created:

```bash
sqlite3 .jettypod/work.db "SELECT worktree_path FROM worktrees WHERE work_item_id = [chore-id] AND status = 'active'"
```

| Result | What it means | Action |
|--------|---------------|--------|
| **Has a path** | ✅ Worktree created successfully | Continue to Step 3 |
| **Empty/no rows** | ❌ Worktree creation failed | **STOP - check the error output from `work start` and resolve before continuing** |

**Display (on success):**

```
📁 Worktree created: .jettypod-work/[id]-[title-slug]
Branch: chore-[id]-[title-slug]
```

**Display (on failure):**

```
❌ Worktree creation failed. Check:
  - Are there uncommitted changes? Run: git status
  - Does the branch already exist? Run: git branch -a | grep [chore-id]
  - Is there a worktree conflict? Run: git worktree list

Resolve the issue before continuing.
```

**Move to Step 3 only if worktree was created successfully.**

**🔒 WORKTREE PATH LOCK**

After worktree validation passes, capture and lock the path:
- `WORKTREE_PATH` - the absolute path from the query result

**Display:**

```
🔒 WORKTREE LOCK ACTIVE
Path: ${WORKTREE_PATH}

All file writes will use this path.
```

**From this point forward, ALL file operations MUST use paths starting with `${WORKTREE_PATH}/`**

### Step 3: Establish Test Baseline

**Your task:** Run tests to establish baseline before making changes.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a TESTING step.** File writes happen in Step 5.

**Test handling varies by type:**

**For REFACTOR:**
```bash
# Run only affected module tests
npm test -- [affected-test-patterns]
```

**For DEPENDENCY:**
```bash
# Run full test suite
npm test
```

**For CLEANUP:**
```bash
# Run affected tests
npm test -- [affected-test-patterns]
```

**For TOOLING:**
```bash
# Run CI pipeline or specific verification
# (may not have unit tests)
```

**Display:**

```
🧪 Establishing test baseline...

Baseline Result:
  Tests: [X] passing / [Y] total
  Execution time: [Z]s

✅ Baseline established - all tests passing
```

**CRITICAL:** If baseline tests fail, STOP. Fix existing failures before proceeding with chore work.

**🔄 WORKFLOW CHECKPOINT: Test baseline established**

```bash
jettypod workflow checkpoint <chore-id> --step=3
```

**Move to Step 4 automatically.**

### Step 4: Display Type-Specific Guidance

**Your task:** Display warnings and constraints based on chore type.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a GUIDANCE step.** File writes happen in Step 5.

**Load guidance from taxonomy:**

```javascript
const { getGuidance } = require('./lib/chore-taxonomy');
const guidance = getGuidance('[chore-type]');
```

**Display type-specific warnings:**

**For REFACTOR:**
```
⚠️  REFACTOR CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• All existing tests MUST pass WITHOUT modification
• If tests fail, the refactor broke behavior - FIX THE CODE, not the tests
• No new functionality - this is restructuring only
• Behavior must be preserved exactly
```

**For DEPENDENCY:**
```
⚠️  DEPENDENCY CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Run FULL test suite to catch regressions
• Check for deprecation warnings after update
• Review changelog for breaking changes
• Update code if API changed
```

**For CLEANUP:**
```
⚠️  CLEANUP CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• VERIFY code is actually unused before deleting
• Search for all references (grep for function names)
• Remove tests ONLY if they test deleted code
• Check for dynamic references (string-based imports)
```

**For TOOLING:**
```
⚠️  TOOLING CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Verify via CI run or manual testing
• Focus on verification over unit testing
• Document current behavior before changes
• Plan rollback strategy
```

**Move to Step 5 automatically.**

### Step 5: Execute with Iteration

**🔒 WORKTREE PATH REQUIRED:** All file writes MUST use the `WORKTREE_PATH` captured in Step 2.

**✅ NOW you may write files** - worktree is locked, guidance is displayed.

**Your task:** Make changes and iterate until tests pass. Max 5 iterations.

```
━━━ Iteration [N]/5 ━━━

✍️  Making changes...
[Describe what you're changing]

🧪 Running tests...
```

**On each iteration:**
1. Make focused changes based on implementation plan
2. Run appropriate tests (type-dependent)
3. Check results

**Display progress:**

```
📊 Progress: [X]/[Y] tests passing

✅ Newly passing:
  • [test name]

❌ Still failing:
  • [test name]: [brief error]

🔧 Next: [what you'll fix]
```

**Exit conditions:**
- ✅ All tests pass → Move to Step 6
- ❌ Max iterations reached → Display failure, ask user for guidance

**🔄 WORKFLOW CHECKPOINT: Execution complete** (when all tests pass)

```bash
jettypod workflow checkpoint <chore-id> --step=5
```

**On max iterations:**

```
⚠️  Maximum iterations (5) reached

Final Progress: [X]/[Y] tests passing

Still failing:
  • [test name]: [error]

Options:
1. Review implementation approach
2. Break into smaller changes
3. Get user guidance

What would you like to do?
```

**STOP and wait for user input if max iterations reached.**

### Step 6: Run Verification Checklist

**Your task:** Run through type-specific verification criteria from taxonomy.

**Load verification from taxonomy:**

```javascript
const { getGuidance } = require('./lib/chore-taxonomy');
const guidance = getGuidance('[chore-type]');
// guidance.verification contains the checklist
```

**Display and verify each item:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Verification Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[✅/❌] All existing tests pass without modification
[✅/❌] No new functionality added
[✅/❌] Code review confirms behavior preservation
[✅/❌] Performance is not degraded
```

**Verification methods:**
- **Tests pass**: Run `npm test` and check exit code
- **No new functionality**: Review diff for new features
- **Behavior preservation**: Compare before/after behavior
- **Performance**: Run benchmarks if applicable

**If any verification fails:**

```
❌ Verification failed:
  • [failed item]: [reason]

Returning to iteration loop...
```

Go back to Step 5 to fix issues.

**If all verification passes → Move to Step 7.**

### Step 7: Complete and Merge

**Your task:** Commit changes and merge to main.

```bash
# Stage and commit
git add .
git commit -m "chore: [brief description]"
git push
```

**Merge and cleanup (3 steps):**

```bash
# Step 1: Merge (can run from worktree - it won't delete it)
jettypod work merge [chore-id]
```

```bash
# Step 2: cd to main repo
cd /path/to/main/repo
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree (now safe since shell is in main repo)
jettypod work cleanup [chore-id]
```

**Display:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Chore Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: [TYPE]
Iterations: [N]/5
Tests: [X]/[Y] passing

Verification:
✅ All existing tests pass without modification
✅ No new functionality added
✅ Code review confirms behavior preservation
✅ Performance is not degraded

Merged to main. Chore #[id] marked done.
```

**🔄 WORKFLOW INTEGRATION: Complete workflow**

```bash
jettypod workflow complete chore-mode <chore-id>
```

This marks the `chore_mode_complete` gate as passed. The standalone chore is now complete.

**End skill.**

---

## Error Handling

### Baseline Tests Fail
```
❌ Cannot proceed - baseline tests failing

[X] tests failing before chore work started.
Fix existing test failures before proceeding.

Failing tests:
  • [test name]: [error]
```

### Verification Loop
If verification fails repeatedly (3+ times on same item):
```
⚠️  Verification stuck on: [item]

This has failed [N] times. Options:
1. Review the implementation approach
2. Check if this verification is applicable
3. Ask user for guidance
```

### Worktree Issues
```
❌ Worktree creation failed

Error: [message]

Try:
  jettypod work cleanup
  jettypod work start [chore-id]
```

---

## Type Reference

### REFACTOR
- **Goal:** Restructure code without changing behavior
- **Tests:** Affected modules only
- **Key rule:** NEVER modify test assertions
- **Verification:** Tests pass, behavior unchanged

### DEPENDENCY
- **Goal:** Update packages safely
- **Tests:** Full suite
- **Key rule:** Check changelogs for breaking changes
- **Verification:** Tests pass, no deprecation warnings

### CLEANUP
- **Goal:** Remove unused code
- **Tests:** Affected modules
- **Key rule:** Verify code is actually unused
- **Verification:** No broken references, tests pass

### TOOLING
- **Goal:** Improve build/CI/dev tools
- **Tests:** CI pipeline or manual
- **Key rule:** Plan rollback strategy
- **Verification:** CI passes, workflows work
