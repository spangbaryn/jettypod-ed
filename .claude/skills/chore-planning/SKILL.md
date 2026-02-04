---
name: chore-planning
description: Guide standalone chore planning with automatic type classification and routing to chore-mode. Invoked by request-routing for substantial technical work - refactoring, infrastructure, migrations, or enhancements where the implementation approach is obvious. For chores under technical epics, detects ancestry and passes context to chore-mode indicating no mode progression needed. (project)
---

# Chore Planning Skill

Guides Claude through standalone chore planning including automatic type classification, loading type-specific guidance from the taxonomy, building enriched context, and routing to chore-mode for execution. For chores under **technical epics**, detects this ancestry and passes context to skip mode progression.

## Instructions

When this skill is activated, you are helping plan a standalone chore (one without a parent feature). Follow this structured approach:

### Step 1: Understand the Chore Context

You'll receive context about:
- Chore title and description
- Project context
- No parent feature (standalone chores don't have features)

**⚡ FIRST: Detect Technical Epic Ancestry**

Check if this chore belongs to a **technical epic** (an epic that creates chores directly without features):

1. Check if the chore has a parent epic (not a feature)
2. If it has a parent epic, check if that epic was created as a technical epic (detected by epic-planning based on refactor/migrate/infrastructure signals)

**If chore belongs to a technical epic:**
- Set `IS_TECHNICAL_EPIC = true`
- Display: `⚡ Technical Epic Chore - no mode progression`
- This context will be passed to chore-mode

**If chore is standalone or under a regular epic:**
- Set `IS_TECHNICAL_EPIC = false`
- Proceed with normal flow

Display:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Planning Standalone Chore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Chore:** [Title]
**Description:** [Description if provided]

Analyzing chore type...
```

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After understanding the chore context, register this skill execution:

```bash
jettypod workflow start chore-planning <chore-id>
```

This creates an execution record for session resume.

### Step 2: Classify Chore Type

Classify the chore by matching keywords in the title and description against these patterns:

| Type | Keywords |
|------|----------|
| **refactor** | refactor, restructure, reorganize, extract, inline, rename, move, split, consolidate, simplify, decouple, modularize |
| **dependency** | update, upgrade, bump, migrate, dependency, package, library, framework, version, security patch, vulnerability, npm, yarn |
| **cleanup** | cleanup, clean up, remove, delete, deprecate, dead code, unused, legacy, obsolete, prune, trim |
| **tooling** | tooling, ci, cd, pipeline, build, lint, eslint, prettier, config, configuration, script, automation, github action, workflow, jest, test setup |

**Classification rules:**
- Count keyword matches (exact word boundary matches = 2 points, partial = 1 point)
- Highest score wins
- Default to **refactor** if no matches
- Confidence: high (4+ points), medium (2-3 points), low (0-1 points)

Display:

```
**Type Classification:** [type] (confidence: [high/medium/low])
```

**If confidence is low:**
```
⚠️ Low confidence classification. The chore might be:
- [type] - because [reason based on keywords found]
- [alternative type] - if [alternative interpretation]

Proceeding with [type]. Let me know if this should be different.
```

### Step 3: Apply Type-Specific Guidance

Based on the classified type, apply this guidance:

---

**REFACTOR Guidance:**

*Scope Considerations:*
- Define clear boundaries - what code is being restructured
- Identify all callers/dependents of code being changed
- Ensure behavior remains unchanged (refactor, not rewrite)
- Consider breaking into smaller refactors if scope is large

*Verification Criteria:*
- All existing tests pass without modification
- No new functionality added (that requires new tests)
- Code review confirms behavior preservation
- Performance is not degraded

*Test Handling:* Tests required. Run all tests for affected modules before and after. Update test file paths/imports if moved. Do NOT change test assertions - if tests fail, the refactor broke behavior.

---

**DEPENDENCY Guidance:**

*Scope Considerations:*
- Identify which packages are being updated
- Check changelogs for breaking changes
- Note any deprecated APIs that need migration
- Consider update strategy: one at a time vs batch

*Verification Criteria:*
- All tests pass after update
- Application builds successfully
- No new deprecation warnings (or documented)
- Security vulnerabilities addressed (if security update)

*Test Handling:* Tests not required. Run full test suite to catch regressions. No new tests needed unless migrating to new API patterns. Document any test changes needed due to library API changes.

---

**CLEANUP Guidance:**

*Scope Considerations:*
- Define what is being cleaned (dead code, unused files, etc.)
- Verify code is actually unused (grep for references)
- Set clear boundaries to avoid scope creep
- Consider impact on git history/blame

*Verification Criteria:*
- All tests still pass
- No broken imports or references
- Application runs correctly
- Removed code was actually unused

*Test Handling:* Tests not required. Run existing tests to ensure nothing breaks. Remove tests only if they test deleted code. No new tests needed for cleanup work.

---

**TOOLING Guidance:**

*Scope Considerations:*
- Define what tooling is being changed (CI, build, dev environment)
- Document current behavior before changes
- Consider impact on team workflows
- Plan rollback strategy if changes cause issues

*Verification Criteria:*
- CI pipeline passes
- Build completes successfully
- Dev environment works for all team members
- No regression in build times or developer experience

*Test Handling:* Tests not required. Verify tooling changes work via manual testing or CI runs. Add integration tests only if tooling is complex. Focus on verification over unit testing for infrastructure.

---

Display the relevant guidance:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 [Type] Chore Guidance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Scope Considerations:**
[List applicable items from above]

**Verification Criteria:**
[List applicable items from above]

**Test Handling:**
- Tests required: [yes/no based on type]
- Approach: [from above]
```

### Step 4: Build Enriched Context

Combine all information into a structured context object:

```javascript
const choreContext = {
  chore: {
    id: [chore-id],
    title: '[title]',
    description: '[description]',
    type: 'chore',
    parent_id: null  // standalone, or epic_id if under technical epic
  },
  classification: {
    type: '[classified-type]',
    confidence: '[high/medium/low]'
  },
  technicalEpic: {
    isTechnicalEpic: true/false,  // from Step 1 detection
    skipModeProgression: true/false  // same as isTechnicalEpic
  },
  guidance: {
    scope: [...],
    verification: [...],
    testHandling: {
      required: true/false,
      approach: '...'
    }
  }
};
```

**Note:** If `technicalEpic.isTechnicalEpic = true`, chore-mode will skip mode progression (no speed→stable→production phases).

### Step 5: Analyze Codebase Impact

Based on the chore type and guidance, analyze what needs to be done:

**For REFACTOR chores:**
- Identify the code being restructured
- Find all callers/dependents
- List affected test files

**For DEPENDENCY chores:**
- Check current version
- Review changelog for breaking changes
- Identify affected code

**For CLEANUP chores:**
- Find all references to code being removed
- Verify nothing depends on it
- List files to modify

**For TOOLING chores:**
- Check current tool configuration
- Identify affected workflows
- Review CI/CD impacts

Display analysis:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Impact Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Files to modify:**
[List of files]

**Tests to run:**
[List of test files/patterns]

**Verification steps:**
[Specific steps based on guidance]
```

### Step 6: Create Implementation Plan

Based on the analysis, create a focused plan:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Implementation Plan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Step 1:** [First action]
**Step 2:** [Second action]
...

**Verification:**
1. [First check from guidance]
2. [Second check from guidance]
...

Ready to proceed?
```

### Step 7: Route to Chore Mode

**WAIT for user confirmation.**

When user confirms (responds with "yes", "proceed", "let's go", etc.):

**Invoke the chore-mode skill using the Skill tool:**

```
Use the Skill tool with skill: "chore-mode"
```

**Pass the technical epic context** in the skill arguments so chore-mode knows whether to skip mode progression:

```
Arguments should include:
- choreContext (from Step 4)
- technicalEpic.isTechnicalEpic = true/false
- technicalEpic.skipModeProgression = true/false
```

The chore-mode skill will:
1. Create a worktree for the chore
2. Execute the implementation plan
3. Run verification steps
4. Merge when complete

**🔄 WORKFLOW INTEGRATION: Complete workflow**

Before invoking chore-mode:

```bash
jettypod workflow complete chore-planning <chore-id>
```

This marks the `chore_planning_complete` gate as passed, enabling chore-mode to start.

**End chore-planning skill after invoking chore-mode.**

## Key Principles

1. **Automatic classification** - AI determines chore type from title/description
2. **Taxonomy-driven guidance** - Load specific guidance for each chore type
3. **Context enrichment** - Build complete context before execution
4. **Impact analysis** - Understand what the chore affects
5. **Verification-focused** - Use type-specific verification criteria
6. **Seamless handoff** - Route to chore-mode with full context
7. **Technical epic awareness** - Detect when a chore belongs to a technical epic and pass this context to chore-mode so it skips mode progression (no speed→stable→production phases)

## Chore Type Quick Reference

| Type | Keywords | Test Handling |
|------|----------|---------------|
| refactor | refactor, restructure, extract, rename | Run all tests, don't modify assertions |
| dependency | update, upgrade, bump, migrate | Run full suite, check for deprecations |
| cleanup | remove, delete, unused, legacy | Verify no references, run affected tests |
| tooling | ci, build, lint, config | Run affected pipelines |

## Validation

Before routing to chore-mode, ensure:
- [ ] Chore type classified
- [ ] Taxonomy guidance loaded
- [ ] Impact analysis complete
- [ ] Implementation plan created
- [ ] User confirmed ready to proceed
