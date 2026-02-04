---
name: production-mode
description: Guide implementation of production mode chores with production standards validation. Use when user starts work on a production mode chore. Detects context (Scenario A/B/C), validates/generates scenarios, and implements production hardening comprehensively.
---

# Production Mode Skill

Guides Claude Code through production mode implementation with focus on security, scale, and compliance. Autonomous execution - Claude Code writes the code.

## Instructions

When this skill is activated, you are helping implement a production mode chore to add production hardening. Follow this structured approach:

### Overview

**Production Mode Goal:** Harden features for production deployment with security, performance, and compliance standards.

**CRITICAL CONTEXT DETECTION:**
- Production mode has **3 different starting scenarios** (A/B/C)
- **Must detect context first** before proceeding
- Different workflows for each scenario

**Key Principles:**
- **Context-aware execution** - adapt to Scenario A/B/C
- **Standards-driven** - use production standards from external-transition
- **Autonomous execution** - Claude Code writes code, user confirms approach
- **Comprehensive hardening** - security, performance, compliance, infrastructure

**User Profile:** May not know how to code - Claude Code does the implementation autonomously.

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

## Implementation Steps

### Step 0: Detect Production Context (CRITICAL FIRST STEP)

**MUST RUN FIRST:** Detect which scenario applies to this feature.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a DETECTION step.** File writes happen in Step 3.

**To detect context, check these conditions:**

```bash
# Get current work item and parent feature
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.type, wi.parent_id, wi.epic_id, parent.title as parent_title FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress'"

# Check for production scenarios in the feature file
# (Look for scenarios tagged with @production or containing production-related keywords)

# Check for production chores
sqlite3 .jettypod/work.db "SELECT COUNT(*) FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND mode = 'production'"

# Check when stable mode was completed (for time gap detection)
sqlite3 .jettypod/work.db "SELECT completed_at FROM work_items WHERE parent_id = <feature-id> AND type = 'chore' AND mode = 'stable' AND status = 'done' ORDER BY completed_at DESC LIMIT 1"
```

Based on these checks, determine which scenario applies.

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After detecting context, register this skill execution:

```bash
jettypod workflow start production-mode <feature-id>
```

This validates that `stable_mode_complete` gate is passed and creates an execution record for session resume.

**Three Scenarios:**

**Scenario A: Fresh from Stable (Hot Context)**
- Production scenarios exist
- Production chores exist
- Completed stable ≤ 1 day ago
- **Workflow:** Quick validation → fill gaps → implement

**Scenario B: Gap in Time (Cold Context)**
- Production scenarios exist
- Production chores exist
- Completed stable > 1 day ago OR project state changed
- **Workflow:** Re-validate → update scenarios → implement

**Scenario C: Post External-Transition (New Infrastructure)**
- NO production scenarios exist
- NO production chores exist
- **Workflow:** Generate scenarios → create chores → implement

---

### Step 1: Read Production Standards

**For all scenarios:** Read production standards file.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a READ step.** File writes happen in Step 3.

```bash
# Check if production standards file exists
ls .jettypod/production-standards.json

# Read the production standards
cat .jettypod/production-standards.json
```

If the file doesn't exist, run external-transition first to generate production standards.

**🔄 WORKFLOW CHECKPOINT: Standards read**

```bash
jettypod workflow checkpoint <feature-id> --step=1
```

---

### Step 2A: Validate Scenarios (Scenario A - Hot Context)

**For Scenario A only:** Quick validation of existing scenarios.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a VALIDATION step.** File writes happen in Step 3.

```javascript
const { validateScenarios } = require('../../lib/production-scenario-validator');
const { getDb } = require('../../lib/database');

try {
  // Get feature scenario file
  const db = getDb();
  const feature = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM work_items WHERE id = ?', [featureId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });

  if (!feature.scenario_file) {
    console.error('❌ Feature has no scenario file.');
    return;
  }

  // Validate scenarios against standards
  const validation = await validateScenarios(feature.scenario_file, standards);

  console.log(`✅ Validation complete:`);
  console.log(`  - Covered: ${validation.covered}/${validation.total} standards`);
  console.log(`  - Gaps: ${validation.gaps.length}`);

  if (validation.hasGaps) {
    console.log('\n⚠️  Missing scenarios for:');
    validation.gaps.forEach(gap => {
      console.log(`  - ${gap.domain}: ${gap.standardId}`);
      console.log(`    ${gap.reasoning}`);
    });

    // Generate and append missing scenarios
    const { generateScenariosFromStandards } = require('../../lib/production-scenario-generator');
    const { appendScenarios } = require('../../lib/production-scenario-appender');

    const missingStandards = { standards: validation.gaps };
    const newScenarios = await generateScenariosFromStandards(missingStandards);

    await appendScenarios(feature.scenario_file, newScenarios);
    console.log(`✅ Added ${newScenarios.length} missing scenarios`);
  } else {
    console.log('✅ All standards are covered by existing scenarios');
  }
} catch (err) {
  console.error('❌ Validation failed:', err.message);
  return;
}
```

---

### Step 2B: Re-Validate Scenarios (Scenario B - Cold Context)

**For Scenario B only:** Re-validate with current standards.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a VALIDATION step.** File writes happen in Step 3.

```javascript
const { validateScenarios } = require('../../lib/production-scenario-validator');
const config = require('../../lib/config');

try {
  console.log('🔄 Re-validating scenarios against current standards...');

  // Check if project state changed
  const projectConfig = config.read();
  console.log(`Project state: ${projectConfig.project_state}`);

  // Get feature scenario file
  const db = getDb();
  const feature = await new Promise((resolve, reject) => {
    db.get('SELECT * FROM work_items WHERE id = ?', [featureId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });

  // Validate scenarios
  const validation = await validateScenarios(feature.scenario_file, standards);

  console.log(`✅ Re-validation complete:`);
  console.log(`  - Covered: ${validation.covered}/${validation.total} standards`);
  console.log(`  - New gaps: ${validation.gaps.length}`);

  if (validation.hasGaps) {
    console.log('\n⚠️  Standards added/changed since last run:');
    validation.gaps.forEach(gap => {
      console.log(`  - ${gap.domain}: ${gap.standardId}`);
    });

    // Generate and append missing scenarios
    const { generateScenariosFromStandards } = require('../../lib/production-scenario-generator');
    const { appendScenarios } = require('../../lib/production-scenario-appender');

    const missingStandards = { standards: validation.gaps };
    const newScenarios = await generateScenariosFromStandards(missingStandards);

    await appendScenarios(feature.scenario_file, newScenarios);
    console.log(`✅ Updated with ${newScenarios.length} new scenarios`);
  }
} catch (err) {
  console.error('❌ Re-validation failed:', err.message);
  return;
}
```

---

### Step 2C: Generate Scenarios (Scenario C - Post-Transition)

**For Scenario C only:** Generate production scenarios from standards.

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to any path
❌ Edit tool to any path
❌ Any file creation or modification
```
**This is a GENERATION step (via jettypod commands, not direct file writes).** File writes happen in Step 3.

```bash
# Get feature details
sqlite3 .jettypod/work.db "SELECT id, title, scenario_file FROM work_items WHERE id = <feature-id>"

# Use jettypod to generate production scenarios
jettypod work elevate <feature-id> production
```

This will:
1. Read production standards from `.jettypod/production-standards.json`
2. Generate production scenarios based on applicable standards
3. Append scenarios to the feature file
4. Create production chores

**🔄 WORKFLOW CHECKPOINT: Scenarios validated/generated** (after any Step 2 variant)

```bash
jettypod workflow checkpoint <feature-id> --step=2
```

---

### Step 3: Implement Production Chore

**🔒 WORKTREE PATH REQUIRED:** All file writes MUST use the `WORKTREE_PATH` captured after pre-flight validation.

**✅ NOW you may write files** - worktree is locked, context is detected.

**For all scenarios:** Implement the current production chore with test-driven iteration.

**Get current work and identify target scenario:**

```bash
# Get current chore details and parent feature's scenario file
sqlite3 .jettypod/work.db "SELECT wi.id, wi.title, wi.description, wi.parent_id, parent.scenario_file FROM work_items wi LEFT JOIN work_items parent ON wi.parent_id = parent.id WHERE wi.status = 'in_progress'"
```

Parse the chore description to find which scenario it addresses (look for "Scenario: ..." in the description).

**RED→GREEN iteration loop:**

1. **Establish RED baseline:**
   ```bash
   npx cucumber-js <scenario-file> --name "<scenario-name>" --format progress
   ```

   **🔄 WORKFLOW CHECKPOINT: RED baseline established**

   ```bash
   jettypod workflow checkpoint <feature-id> --step=3
   ```

2. **Iterate until scenario passes (max 10 iterations):**
   - Implement production hardening using Edit/Write tools
   - Run the target scenario to check progress
   - Parse output to track passing/failing steps
   - Address first failing step each iteration

3. **Full verification when target passes:**
   ```bash
   npx cucumber-js <scenario-file> --format progress
   ```

   Ensure all scenarios still pass (no regressions).

**Implementation focus for production chores:**
- Security measures per standards (rate limiting, input sanitization, etc.)
- Performance targets per standards
- Monitoring and observability
- Compliance requirements

---

## Key Differences from Stable Mode

**Stable Mode:**
- Adds error handling to speed code
- Validates inputs, handles edge cases
- Makes existing features robust

**Production Mode:**
- Hardens features for production deployment
- Implements security, scale, compliance standards
- Adds monitoring, backup, failover capabilities
- Standards-driven (not just adding error handling)

**Example:**

**Stable Mode Chore:** "Add error handling to login feature"
→ Validates email format, handles network errors, shows error messages

**Production Mode Chore:** "Add security hardening to login feature"
→ Rate limiting, brute force protection, MFA support, audit logging

---

## Validation

Before completing production mode, ensure:
- [ ] Context detected correctly (A/B/C)
- [ ] Production standards read successfully
- [ ] All production scenarios pass
- [ ] Security measures implemented per standards
- [ ] Performance targets met per standards
- [ ] Compliance requirements satisfied
- [ ] Monitoring and observability added
- [ ] Documentation updated

---

## Next Steps After Production Mode

Once all production chores complete:
1. Feature is production-ready
2. Can be deployed to external environment
3. Meets all standards for scale, security, compliance

**🔄 WORKFLOW INTEGRATION: Complete workflow**

When all production chores are complete:

```bash
jettypod workflow complete production-mode <feature-id>
```

This marks the `production_mode_complete` gate as passed. The feature is now production-ready.
