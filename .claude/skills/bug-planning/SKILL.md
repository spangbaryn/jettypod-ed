---
name: bug-planning
description: Guide structured bug investigation with symptom capture, hypothesis testing, and root cause identification. Invoked by request-routing when user reports a bug, mentions unexpected behavior, or describes something broken. (project)
---

# Bug Planning Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Bug Planning Flow                                                  │
│                                                                     │
│  Symptom → Hypothesis → Evidence → Root Cause → Bug Work Item       │
│                                                                     │
│  Output: Bug work item with root cause breadcrumbs                  │
└─────────────────────────────────────────────────────────────────────┘
```

Guides Claude through systematic bug investigation. Produces a bug work item with clear breadcrumbs for implementation.

## Instructions

When this skill is activated, you are investigating a bug to identify root cause and plan the fix.

---

## Phase 1: Symptom Capture

**Goal:** Understand exactly what's happening before investigating.

**Gather from user:**

```
🐛 Bug Investigation

I need to understand the bug before we investigate.

**What's happening?**
> [User describes the problem]

**What should happen instead?**
> [Expected behavior]

**Reproduction steps?**
> [How to trigger the bug]

**Any error messages?**
> [Exact error text, stack traces]

**When did it start?**
> [ ] Always been broken
> [ ] After a specific change (which?)
> [ ] Not sure
```

**If user provides partial info**, ask follow-up questions. Don't proceed until you have:
- Clear actual vs expected behavior
- Reproduction steps (or acknowledgment it's intermittent)
- Error messages if any

**Document symptoms:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Bug Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Symptom:** [What's happening]
**Expected:** [What should happen]
**Reproduction:** [Steps]
**Error:** [Error message if any]
**Context:** [When it started, related changes]

Proceeding to hypothesis formation...
```

**Proceed to Phase 2.**

---

## Phase 2: Hypothesis Formation

**Goal:** Form testable theories about what might cause the bug.

**CRITICAL:** Execute autonomously - no user input needed.

**Your task:**
1. Analyze symptoms for clues
2. Search codebase for relevant code
3. Check recent changes (git log)
4. Form 2-4 testable hypotheses
5. Rank by likelihood

**Codebase analysis:**

```bash
# Search for code related to the failing functionality
# Use Glob/Grep based on keywords from symptoms
```

```bash
# Check recent changes to relevant files
git log --oneline -10 -- <relevant-files>
```

**Display hypotheses:**

```
🔍 Hypotheses

Based on symptoms and codebase analysis:

**H1 (Most Likely): [Title]**
- Theory: [What might be wrong]
- Test: [How to confirm/eliminate]
- Files: [Specific files to check]

**H2: [Title]**
- Theory: [What might be wrong]
- Test: [How to confirm/eliminate]
- Files: [Specific files to check]

**H3: [Title]**
- Theory: [What might be wrong]
- Test: [How to confirm/eliminate]
- Files: [Specific files to check]

Starting evidence gathering with H1...
```

**Proceed to Phase 3.**

---

## Phase 3: Evidence Gathering

**Goal:** Test hypotheses systematically until root cause is found.

**CRITICAL:** Test one hypothesis at a time. Document findings.

**For each hypothesis:**

1. **Read relevant code** (Read tool)
2. **Add diagnostics if needed** (temporary logging)
3. **Evaluate evidence** - supports, refutes, or partial?

**Display progress:**

```
━━━ Testing H1: [Title] ━━━

📂 Reading: [file:lines]
🔎 Looking for: [specific issue]

**Finding:** [What you discovered]

**Verdict:** ✅ CONFIRMED / ❌ ELIMINATED / ⚠️ PARTIAL
```

**If ELIMINATED:** Move to next hypothesis.
**If PARTIAL:** Gather more evidence.
**If CONFIRMED:** Proceed to Phase 4.

**If all hypotheses eliminated:**

```
⚠️ Initial hypotheses eliminated

What we learned:
- H1: Eliminated because [reason]
- H2: Eliminated because [reason]

Forming new hypotheses...
```

Loop back to Phase 2 with new information.

**Proceed to Phase 4 when root cause confirmed.**

---

## Phase 4: Root Cause Confirmation

**Goal:** Confirm root cause with user before creating work item.

**⚡ ASYNC BOUNDARY - Wait for user confirmation**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Root Cause Identified
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**What's broken:** [Specific code/logic]
**Why:** [The actual cause]
**Location:** [file:line]
**Evidence:** [What confirmed this]

**Proposed fix:**
[Brief description of how to fix it]

Does this match your understanding? Ready to create the bug work item?
```

**WAIT for user confirmation.**

If user disagrees or adds context, revise understanding and confirm again.

**Proceed to Phase 5.**

---

## Phase 5: Create Bug Work Item

**Goal:** Create tracked bug work item with breadcrumbs for implementation.

**Create bug work item with description:**

```bash
jettypod work create bug "[Bug title - brief description]" "Root cause: [What's broken and why]
Location: [file:line]

Fix approach:
- [Step 1]
- [Step 2]

Files to modify:
- [file1]: [what to change]
- [file2]: [what to change]

Verification:
- Regression test passes
- Original bug no longer reproduces
- [Any other checks]"
```

**Capture the bug ID from output.**

**Proceed to Phase 6.**

---

## Phase 6: Hand Off to Bug Mode

**Goal:** Start the bug worktree and hand off to implementation.

**Display completion:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bug Planning Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Bug: #<bug-id> [title]
📍 Root cause: [file:line]
🔧 Fix approach: [brief summary]

Ready to implement the fix?
```

**WAIT for user response.**

**If user confirms:**

```bash
jettypod work start <bug-id>
```

**Verify worktree created:**

```bash
sqlite3 .jettypod/work.db "SELECT worktree_path FROM worktrees WHERE work_item_id = <bug-id> AND status = 'active'"
```

**Then invoke bug-mode:**

```
Use the Skill tool with skill: "bug-mode"
```

**Bug-planning skill complete.**

---

## Validation Checklist

Before completing bug-planning:
- [ ] Symptoms clearly documented
- [ ] Root cause confirmed with evidence
- [ ] User confirmed root cause
- [ ] Bug work item created with breadcrumbs
- [ ] Bug worktree started with `work start`
- [ ] bug-mode skill invoked
