---
name: simple-improvement
description: Guide implementation of simple improvements to existing functionality. Invoked by request-routing for straightforward changes like copy changes, styling tweaks, or minor behavior adjustments where the implementation is obvious. (project)
---

# Simple Improvement Skill

```
┌─────────────────────────────────────────────────────────────────────┐
│  Simple Improvement Flow                                             │
│                                                                      │
│  Plan Routing → [SIMPLE IMPROVEMENT] → Done                          │
│                  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲                               │
│                  YOU ARE HERE                                        │
│                                                                      │
│  This is a LIGHTWEIGHT workflow - no speed/stable modes.             │
│  Single chore, direct implementation, done.                          │
└─────────────────────────────────────────────────────────────────────┘
```

Lightweight workflow for basic enhancements to existing functionality. Bypasses the full speed/stable mode progression for simple changes.

## When to Use

This skill is invoked by request-routing when work is identified as a **simple improvement**:
- Copy/text changes
- Styling tweaks
- Minor behavior adjustments
- Small bug fixes to existing functionality

## When NOT to Use

Route back to request-routing for:
- New functionality (even if small)
- Changes requiring new data models
- Complex logic changes
- Features needing error handling design

---

## Instructions

### Step 1: Validate Simplicity

**Confirm the work is truly a simple improvement.**

**Ask the user:**

```
Let me confirm this is a simple improvement. Please describe the change:

What exactly needs to change? (Be specific - e.g., "Change button text from 'Submit' to 'Save'")
```

**⚡ WAIT for user response.**

**First, check for vague or incomplete descriptions:**

**Vague Description Signals:**
| Signal | Examples |
|--------|----------|
| Too short | Less than 20 characters |
| No specifics | "fix the thing", "update it", "make it better" |
| Missing context | No file, component, or location mentioned |
| Ambiguous action | "change something", "tweak the code" |

**If description is vague or unclear:**

```
I need more details to proceed. Your description is too vague for me to understand what needs to change.

Please provide:
• What specific element/text/behavior needs to change?
• Where is it located? (file, page, component)
• What should it look like after the change?

Example: "Change the submit button text from 'Submit' to 'Save Changes' on the contact form"
```

**⚡ WAIT for user to provide a clearer description before proceeding.**

Do NOT continue until you have a specific, actionable description.

---

**Once you have a clear description, analyze for complexity signals:**

**Complexity Signal Detection:**
Scan the user's description for these patterns:

| Signal | Keywords/Patterns |
|--------|-------------------|
| New data models | "new table", "add column", "database", "schema" |
| New API | "new endpoint", "API", "new route" |
| Complex logic | "if/else", "conditional", "depends on", multiple "and" clauses |
| Multiple components | mentions 3+ different files/areas, "also need to" |
| Architectural changes | "refactor", "restructure", "new system" |

❌ **Route back to request-routing if ANY complexity signal detected:**
- New database tables/columns needed
- New API endpoints required
- Complex conditional logic
- Multiple interconnected changes
- Need for error handling design

✅ **Continue if the change is:**
- Single file or 2-3 related files
- Modifying existing code (not creating new features)
- Clear, specific scope
- No architectural decisions needed

**If too complex:**

```
⚠️ This change appears to require new data models or architectural changes. This is more than a simple improvement.

I'm routing you back to request-routing for proper planning.
```

**Then IMMEDIATELY:**
1. Invoke request-routing skill using the Skill tool
2. END this skill (do not continue)

**If confirmed simple:**

```
✅ Confirmed: This is a simple improvement.

Change: [summarize the specific change]
Scope: [list files likely affected]

Creating implementation chore...
```

**Proceed to Step 2.**

---

### Step 2: Create Implementation Chore

**Create a single chore with NO mode assigned.**

```bash
jettypod work create chore "[Brief description of the change]" "[Detailed description including:
- What to change
- Where to change it
- Expected outcome]" --parent=<feature-id>
```

**IMPORTANT:** Do NOT use `--mode` flag. Simple improvements don't use speed/stable modes.

**Display to user:**

```
✅ Created Chore #[id]: [title]

Ready to implement. Starting chore...
```

**If chore creation fails:**

When the `jettypod work create` command fails, display error details and suggest recovery:

```
❌ Failed to create chore: [error message] ([error code if available])

This could be caused by:
• Database is locked by another process
• File system permissions issue
• Corrupted work.db file

Suggested actions:
1. Retry the operation
2. Check if another process is using the database
3. Verify system status with: ls -la .jettypod/
4. If persistent, try: jettypod work cleanup --all
```

**⚡ WAIT for user to acknowledge before retrying or investigating further.**

Do NOT proceed to Step 3 until chore is successfully created.

**Proceed to Step 3.**

---

### Step 3: Start Chore and Implement

**Start the chore to create a worktree:**

```bash
jettypod work start <chore-id>
```

**🛑 STOP AND CHECK:** Verify worktree was created successfully before proceeding.

```bash
sqlite3 .jettypod/work.db "SELECT worktree_path FROM worktrees WHERE work_item_id = <chore-id> AND status = 'active'"
```

**If empty or error:** Stop and investigate. Do NOT proceed without a valid worktree.

**Capture the worktree path:**
- `WORKTREE_PATH` - the absolute path from the query result (e.g., `/path/to/.jettypod-work/42-fix-button-text`)

**Display confirmation:**

```
📁 Worktree created: ${WORKTREE_PATH}

From this point forward, ALL file operations MUST use paths starting with:
${WORKTREE_PATH}/
```

**🔒 WORKTREE PATH LOCK:** Store `WORKTREE_PATH` - all file operations in this skill MUST use this path prefix.

---

**Then implement the change directly:**

1. Read the file(s) that need modification (using `${WORKTREE_PATH}/...`)
2. Make the specific change requested (using `${WORKTREE_PATH}/...`)
3. Verify the change looks correct

**Display progress:**

```
📝 Implementing change...

Modified: ${WORKTREE_PATH}/[relative path]
Change: [what was changed]

Verifying...
```

**Proceed to Step 4.**

---

### Step 4: Verify and Complete

**Quick verification:**
- Does the change match what was requested?
- Is the code syntactically correct?
- Are there any obvious issues?

**If issues found:** Fix them before proceeding.

**If verification passes:**

**🔒 WORKTREE PATH REQUIRED:** Use the `WORKTREE_PATH` captured in Step 3.

```bash
# Commit the change
cd ${WORKTREE_PATH}
git add .
git commit -m "fix: [brief description]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Then merge (CRITICAL: run as separate Bash calls):**

⚠️ Shell CWD persists. You MUST run `cd` as a SEPARATE Bash tool call before merge.

```bash
# Bash call 1: Change to main repo
cd <main-repo-path>
```

```bash
# Bash call 2: Merge and cleanup
jettypod work merge <chore-id>
jettypod work cleanup <chore-id>
```

**If merge fails:**

When `jettypod work merge` encounters an error (e.g., merge conflicts), the worktree is preserved for debugging.

```
❌ Merge failed: [error message from git]

Conflicting files:
• [list conflicting files if available]

⚠️ IMPORTANT: The worktree has been PRESERVED for debugging at:
   [worktree-path]

Resolution steps:
1. Navigate to the worktree: cd [worktree-path]
2. Resolve the conflicts in the listed files
3. Stage resolved files: git add [resolved-files]
4. Commit the resolution: git commit -m "resolve: merge conflicts"
5. Return to main repo: cd [main-repo-path]
6. Retry the merge: jettypod work merge <chore-id>

Need help? Run: git status (in worktree) to see conflict status
```

**⚡ WAIT for user to resolve conflicts before retrying.**

Do NOT attempt to auto-resolve conflicts - let the user handle them manually.

**Mark feature as done:**

```bash
jettypod work status <feature-id> done
```

**Display completion:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Simple Improvement Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Change: [what was changed]
Files: [files modified]
Feature: #[id] marked as done

No further action needed.
```

**END skill.**

---

## Key Differences from Speed/Stable Mode

| Aspect | Simple Improvement | Speed/Stable Mode |
|--------|-------------------|-------------------|
| Chores | 1 chore, no mode | Multiple chores with modes |
| BDD | Not required | Required |
| Handoff | None - direct to done | Speed → Stable → (Production) |
| Scope | Single focused change | Full feature implementation |
| Time | Minutes | Hours to days |

---

## Command Reference

```bash
# Create chore (no mode)
jettypod work create chore "<title>" "<description>" --parent=<feature-id>

# Start chore
jettypod work start <chore-id>

# Merge (CRITICAL: separate Bash calls - cd first, then merge)
cd <main-repo>                      # Bash call 1
jettypod work merge <chore-id>      # Bash call 2

# Cleanup
jettypod work cleanup <chore-id>

# Mark feature done
jettypod work status <feature-id> done
```
