---
name: feature-planning
description: Guide feature planning with UX approach exploration and BDD scenario generation. Invoked by request-routing when implementing NEW user-facing behavior that requires UX decisions (multiple valid approaches to explore). (project)
---

# Feature Planning Skill

Guides Claude through feature planning including UX approach exploration, optional prototyping, and BDD scenario generation.

## Instructions

When this skill is activated, you are helping discover the best approach for a feature. Follow this structured approach:

## 🔑 Critical Command Distinction

**Six commands in workflow order:**

| Command | Used For | When | Phase |
|---------|----------|------|-------|
| `work prototype start <feature-id> [approach]` | Create worktree for UX prototyping | After UX approaches proposed (Step 4) | Feature Planning |
| `work prototype merge <feature-id>` | Merge prototype to main | After user tests prototype (Step 4) | Feature Planning |
| `work tests start <feature-id>` | Create worktree for test authoring | After Integration Contract (Step 7) | Feature Planning |
| `work implement <feature-id>` | Transition feature to implementation phase | After chores created (Step 11) | Feature Planning |
| `work tests merge` → `cd` → `work cleanup` | Merge tests to main, then cleanup worktree | After transition (Step 12) | Feature Planning |
| `work start <chore-id>` | Start implementing a specific chore | After tests merged (Step 13) | Speed Mode |

**CRITICAL:** All commands are run by **Claude**, not the user. The distinction is:
- `work prototype start` = Creates isolated worktree for UX prototyping (Step 4, optional)
- `work prototype merge` = Land prototype files on main (Step 4)
- `work tests start` = Creates isolated worktree for BDD test authoring (Step 7)
- `work implement` = Ends feature planning, transitions to implementation phase
- `work tests merge` = Land BDD tests on main
- `work start` = Creates worktree/branch for chore implementation

**🛑 STOP GATE:** DO NOT run `work start` until Step 13. Tests must be merged to main first.

**🛑 HANDOFF REQUIREMENT:** After `work start`, you MUST invoke speed-mode using the Skill tool. See Step 13.

---

### Step 1: Get Feature Context

**Extract the feature ID from:**
- Previous message from epic-planning (e.g., "I'll start planning Feature #42")
- User's request (e.g., "plan feature 42", "help me with feature #42")

**Then run:**
```bash
jettypod work show ${FEATURE_ID}
```

This returns: title, description, parent epic (if any), mode, phase, and any existing discovery decisions.

**Capture from the output:**
- `FEATURE_ID` - the feature's ID (shown as `#XX` in output)
- `FEATURE_TITLE` - the feature's title
- `PARENT_EPIC_ID` - the parent epic ID from "Parent:" line (may be null for standalone features)

**If the feature is not found**, ask the user to verify the ID or run `jettypod backlog` to find it.

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After getting the feature context, register this skill execution:

```bash
jettypod workflow start feature-planning <feature-id>
```

This creates an execution record for session resume.

**Proceed to Step 2** (or Step 3 if this is a standalone feature with no parent epic).

### Step 2: Check Epic Architectural Decisions

**Skip this step and proceed to Step 3 if `PARENT_EPIC_ID` from Step 1 is null (standalone feature).**

If this feature belongs to an epic, check for existing architectural decisions.

**Run this command** (replace `${PARENT_EPIC_ID}` with actual ID):

```bash
jettypod decisions --epic=${PARENT_EPIC_ID}
```

This outputs any architectural decisions recorded for the parent epic. If no decisions exist, it will say so.

Display the context with decisions:

```
✨ Planning Feature: [Feature Name]
Epic: [Epic Name]

🎯 **Epic Architectural Decisions:**
[If decisions exist:]
- **[Aspect]:** [Decision]
  *Rationale:* [Why this was chosen]
  *Impact:* [How this constrains/guides this feature]

[If no decisions:]
No architectural decisions recorded for this epic yet.

Let's explore different approaches for this feature [that align with these decisions].
```

**IMPORTANT:** When suggesting UX approaches in the next step, ensure they respect/align with the epic's architectural decisions.

**Proceed to Step 3.**

### Step 3: Suggest 3 UX Approaches

Propose exactly 3 approaches with varying complexity/trade-offs:

```
Here are 3 different approaches for [feature name]:

**Option 1: [Simple/Minimal approach name]**
- **Pros**: ✅ [2-3 advantages]
- **Cons**: ❌ [2-3 trade-offs]
- **Experience**: [What it feels like to use]

**Option 2: [Balanced approach name]**
- **Pros**: ✅ [2-3 advantages]
- **Cons**: ❌ [2-3 trade-offs]
- **Experience**: [What it feels like to use]

**Option 3: [Advanced/Comprehensive approach name]**
- **Pros**: ✅ [2-3 advantages]
- **Cons**: ❌ [2-3 trade-offs]
- **Experience**: [What it feels like to use]

**Additional approaches considered but not recommended:**
- *[Alternative 1]*: [Brief] - Not selected because [reason]
- *[Alternative 2]*: [Brief] - Not selected because [reason]

**💡 Recommendation:** [State which option you recommend and why - 2-3 sentences explaining the reasoning]

Would you like me to create working prototypes of these approaches?
```

**WAIT for user response.**

- If user wants prototypes → Continue to Step 4
- If user declines prototypes → Skip to Step 5

### Step 4: Optional Prototyping

If user wants prototypes:

**Sub-step 1: Create prototype worktree**

```bash
jettypod work prototype start ${FEATURE_ID} [approach-name]
```

Example:
```bash
jettypod work prototype start 42 simple-form
```

This creates a worktree at `.jettypod-work/prototype-<id>-<slug>-<approach>/` where prototypes can be safely built and committed.

**🛑 STOP AND CHECK:** Verify worktree was created successfully before proceeding.

**Sub-step 2: Build prototypes in the worktree**

1. **Build prototypes** using **absolute paths** to the worktree:
   - `<worktree_path>/prototypes/feature-[id]-[approach-name]/`
2. **Name format**: `YYYY-MM-DD-[feature-slug]-[option].ext`
3. **Focus on UX**: Show the feel, not production code
4. **Add visible banner header at TOP of page** (for HTML/web prototypes):
   ```html
   <div style="background: #f0f0f0; border: 2px solid #333; padding: 16px; margin-bottom: 24px; font-family: monospace;">
     <strong>🧪 PROTOTYPE</strong><br>
     Feature: [feature name]<br>
     Option: [option number/name]<br>
     Created: [YYYY-MM-DD]<br>
     Purpose: [what this explores]<br>
     Decision: [to be filled after testing]
   </div>
   ```
   For CLI/terminal prototypes, add similar info as first output.
5. **Commit the prototype** in the worktree:
   ```bash
   cd <worktree_path>
   git add .
   git commit -m "Add prototype: [approach-name] for feature #${FEATURE_ID}"
   ```
6. **Offer to open them**: "Want me to open these in your browser?"

**WAIT for user to test prototypes.**

**Sub-step 3: Merge prototype after testing**

After user has tested (regardless of whether they pick this approach):

```bash
jettypod work prototype merge ${FEATURE_ID}
cd <main-repo-path>
jettypod work cleanup ${FEATURE_ID}
```

This merges prototype files to main (in `/prototypes/` directory) and cleans up the worktree.

<details>
<summary><strong>📋 Prototyping Guidelines (click to expand)</strong></summary>

**Use fastest tech to demonstrate UX:**
- Quick HTML+JS for web UX
- Simple CLI scripts for command-line UX
- Minimal frameworks, maximum clarity

**What to prototype:**
- User interaction flow
- Visual layout (if UI)
- Command structure (if CLI)
- API shape (if API)

**What NOT to prototype:**
- Production error handling
- Database layer
- Authentication (unless that's the feature)
- Test coverage

</details>

### Step 5: Choose Winner

After user tests (or skips prototyping):

```
Which approach works best?
```

**WAIT for user response.**

User picks winner. Note their choice - you'll record it formally in Step 11 when transitioning to implementation.

**🔄 WORKFLOW CHECKPOINT: Winner chosen**

```bash
jettypod workflow checkpoint <feature-id> --step=5
```

**Proceed to Step 6.**

### Step 6: Define Integration Contract

**CRITICAL:** Before writing scenarios, you MUST define how users reach this feature. Features that pass tests but aren't integrated into the product are useless.

**Ask yourself and document:**

1. **Entry Point** - How does a user reach this feature?
   - Web: URL/route (e.g., `/login`, `/dashboard/settings`)
   - CLI: Command (e.g., `jettypod backlog`)
   - UI: Button, link, menu item (e.g., "Login button in header")
   - API: Endpoint that exposes this (e.g., `POST /api/auth/login`)

2. **Caller Code** - What existing code must invoke/import the new feature?
   - Which file imports it (e.g., `src/app/layout.tsx`)
   - Which component/function renders or calls it
   - Where it's registered/mounted (e.g., router config, command registry)

3. **Integration Scenario** - A BDD scenario proving the feature is reachable
   - Must start from an existing entry point users can access
   - Must navigate/invoke to reach the new feature
   - Proves the feature isn't an "island"

**Display to user:**

```
📍 Integration Contract

**Entry Point:** [How users reach this feature]
**Caller Code:** [What existing code invokes this]
**Integration Test:** [Scenario proving reachability]

Example:
- Entry Point: `/login` route
- Caller Code: `src/app/layout.tsx` renders `<LoginButton>` in header, which links to `/login`
- Integration Test: "Given I'm on the home page, When I click 'Sign In', Then I see the login form"
```

**WAIT for user to confirm or adjust the integration contract.**

**Proceed to Step 7.**

### Step 7: Create Test Worktree

**CRITICAL:** Create the isolated worktree BEFORE proposing scenarios. This ensures:
1. A safe workspace exists before any file discussion
2. Claude has `WORKTREE_PATH` before being tempted to write files
3. Writing to main is impossible because we're in worktree context

**🚫 FORBIDDEN: Manual Git Worktree Commands**
```
❌ git worktree add ...
❌ git checkout -b tests/...
❌ git branch tests/...
```
**ALWAYS use jettypod commands** - they handle branch naming, path conventions, database tracking, and cleanup. Manual git commands will create orphaned worktrees that break the merge workflow.

**Run:**

```bash
jettypod work tests start ${FEATURE_ID}
```

This creates:
- Worktree at `.jettypod-work/tests-<id>-<slug>/`
- Branch `tests/feature-<id>-<slug>`

**🛑 STOP AND CHECK:** Verify worktree was created successfully. If you see an error, investigate before continuing.

**Capture from output:**
- `WORKTREE_PATH` - the absolute path to the worktree (e.g., `/path/to/.jettypod-work/tests-42-email-login`)

Example output:
```
✅ Created test worktree: /path/to/.jettypod-work/tests-42-email-login
Branch: tests/feature-42-email-login

Write your BDD files to:
  <worktree>/features/email-login.feature
  <worktree>/features/step_definitions/email-login.steps.js
```

**Display:**

```
📁 Test worktree created: ${WORKTREE_PATH}
Branch: tests/feature-${FEATURE_ID}-${FEATURE_SLUG}

🔒 WORKTREE LOCK ACTIVE: All BDD file writes will use this path.
```

**🔒 WORKTREE PATH LOCK**

From this point forward, ALL file operations for BDD tests MUST use paths starting with:
```
${WORKTREE_PATH}/features/
```

**Store `WORKTREE_PATH`** - you'll need it for Step 9.

**Proceed to Step 8.**

### Step 8: Propose BDD Scenarios

**🚫 FORBIDDEN: Writing Files at This Step**
```
❌ Write tool to ${WORKTREE_PATH}/features/*.feature
❌ Write tool to ${WORKTREE_PATH}/features/step_definitions/*.js
❌ Any file creation (even in worktree)
```
**Files are written in Step 9** after user confirms the scenarios. At this step, you are ONLY displaying proposed scenarios to the user for confirmation.

**Feature slug:** Derive `FEATURE_SLUG` from the feature title:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Examples: "Email Password Login" → "email-password-login", "User's Profile (v2)" → "users-profile-v2"

Based on chosen approach, **display** the proposed scenarios to the user:

```
📋 Proposed BDD Scenarios

**Feature file:** ${WORKTREE_PATH}/features/[feature-slug].feature
**Step definitions:** ${WORKTREE_PATH}/features/step_definitions/[feature-slug].steps.js
```

Then show the full Gherkin content:

```gherkin
Feature: [Feature Name]
  [Brief description based on chosen UX approach]

  Epic: [Epic name if applicable]
  Approach: [Chosen approach name]

  # Integration Contract:
  # Entry Point: [from Step 6]
  # Caller Code: [from Step 6]

# INTEGRATION SCENARIO (REQUIRED - proves feature is reachable)
Scenario: User can reach [feature] from [entry point]
  Given I am on [existing entry point users can access]
  When I [navigate/click/invoke to reach the feature]
  Then I [see/access the feature]

# FEATURE SCENARIOS (required + optional functionality)
Scenario: [Core functionality - required workflow]
  Given [initial state]
  When [user takes main action]
  Then [expected successful outcome]
  And [observable UI/system state change]

Scenario: [Optional feature 1 - if applicable]
  Given [initial state]
  When [user uses optional feature]
  Then [feature works correctly]

# SPEED MODE: All success scenarios above (integration + required + optional)
# STABLE MODE: Will add error handling, validation failures, edge cases
```

Then list the step definitions that will be created:

```
**Step definitions to implement:**
• Given I am on [entry point] - [brief implementation note]
• When I [action] - [brief implementation note]
• Then I [outcome] - [brief implementation note]
[etc.]

Does this capture the feature correctly? Any scenarios to add/change?
```

**Scenario content requirements:**
- **FIRST scenario MUST be the Integration Scenario** from Step 6 (proves reachability)
- **Include all "make it work" scenarios**:
  - All success paths - required functionality AND optional features
  - Multiple valid workflows if the feature supports them
  - Success variations (different outcomes that are all correct)
  - NO error handling scenarios (added in stable mode)
  - NO validation failures (added in stable mode)
  - NO security/compliance scenarios (added in production mode)

**WAIT for user confirmation.**

- If user confirms → Proceed to Step 9
- If user requests changes → Revise scenarios and display again
- **Store the confirmed scenarios in memory** - you'll write them in Step 9

**🔄 WORKFLOW CHECKPOINT: BDD scenarios confirmed**

```bash
jettypod workflow checkpoint <feature-id> --step=8
```

**Proceed to Step 9.**

**Template for speed mode (make it work):**

```gherkin
Feature: [Feature Name]
  [Brief description based on chosen UX approach]

  Epic: [Epic name if applicable]
  Approach: [Chosen approach name]

  # Integration Contract:
  # Entry Point: [from Step 6]
  # Caller Code: [from Step 6]

# INTEGRATION SCENARIO (REQUIRED - proves feature is reachable)
Scenario: User can reach [feature] from [entry point]
  Given I am on [existing entry point users can access]
  When I [navigate/click/invoke to reach the feature]
  Then I [see/access the feature]

# FEATURE SCENARIOS (required + optional functionality)
Scenario: [Core functionality - required workflow]
  Given [initial state]
  When [user takes main action]
  Then [expected successful outcome]
  And [observable UI/system state change]

Scenario: [Optional feature 1 - if applicable]
  Given [initial state]
  When [user uses optional feature]
  Then [feature works correctly]

# SPEED MODE: All success scenarios above (integration + required + optional)
# STABLE MODE: Will add error handling, validation failures, edge cases
# These failure scenarios are added by stable-mode skill, NOT during feature discovery
```

**Example for Login feature (speed mode):**
```gherkin
Feature: Email/Password Login
  Simple inline form with email and password fields

  Epic: User Authentication
  Approach: Simple inline form

  # Integration Contract:
  # Entry Point: /login route
  # Caller Code: src/app/layout.tsx renders LoginButton in header

# INTEGRATION SCENARIO
Scenario: User can reach login form from home page
  Given I am on the home page
  When I click the "Sign In" button in the header
  Then I am on the login page
  And I see the email and password fields

# FEATURE SCENARIOS
Scenario: User successfully logs in with valid credentials
  Given I am on the login page
  When I enter valid email and password
  And I click the login button
  Then I am redirected to the dashboard
  And I see a welcome message with my name
  And I have an active session token

Scenario: User logs in with "Remember me" option (optional feature)
  Given I am on the login page
  When I enter valid credentials
  And I check the "Remember me" checkbox
  And I click the login button
  Then I am redirected to the dashboard
  And my session persists for 30 days
```

<details>
<summary><strong>📋 BDD Scenario Guidelines (click to expand)</strong></summary>

**Scenario naming:**
- Use present tense
- Be specific about what's being tested
- Focus on user behavior

**Given/When/Then structure:**
- **Given**: Set up initial state
- **When**: User action
- **Then**: Observable outcome

**What feature planning creates:**

Feature planning creates speed mode scenarios (make it work - all success paths):
```gherkin
Scenario: User successfully [does the required thing]
  Given [setup]
  When [action]
  Then [success]

Scenario: User successfully [uses optional feature]
  Given [setup]
  When [uses optional capability]
  Then [feature works correctly]
```

**Additional scenarios are added LATER by stable-mode skill:**

Stable mode adds error handling and validation:
```gherkin
Scenario: Handle invalid input
  Given [setup]
  When [invalid action]
  Then [appropriate error]
```

Production mode adds security/scale/compliance:
```gherkin
Scenario: Prevent unauthorized access
  Given [unauthorized user]
  When [attempts action]
  Then [access denied with proper error]
```

**IMPORTANT:** Feature planning creates all success scenarios (required + optional). Stable/production chores add failure scenarios later.

</details>

### Step 9: Write and Validate BDD Files

**NOW you may write files** - the worktree exists (from Step 7) and scenarios are confirmed (from Step 8).

**🔒 WORKTREE PATH REQUIRED:** All file writes MUST use the `WORKTREE_PATH` captured in Step 7.

Using the scenarios confirmed in Step 8, write the files using **absolute paths to the worktree**:

**A. Write scenario file** using Write tool:
```
${WORKTREE_PATH}/features/${FEATURE_SLUG}.feature
```

**B. Write step definitions file** using Write tool:
```
${WORKTREE_PATH}/features/step_definitions/${FEATURE_SLUG}.steps.js
```

**Step definition requirements:**
1. Implement all Given/When/Then steps from the scenarios
2. Follow existing patterns - check other `.steps.js` files for conventions
3. Include test environment setup/cleanup
4. All Given steps (setup state)
5. All When steps (execute actions)
6. All Then steps (verify outcomes)

**Validate BDD infrastructure:**

Run cucumber dry-run **from within the worktree**:

```bash
cd ${WORKTREE_PATH} && npx cucumber-js --dry-run features/${FEATURE_SLUG}.feature
```

**What the output means:**

✅ **Success** - No errors, all steps have definitions:
```
0 scenarios
0 steps
```
(Dry-run doesn't execute, so 0 is correct)

❌ **Undefined steps** - Missing step definitions:
```
Undefined. Implement with the following snippet:
  Given('I am on the login page', function () {
    ...
  });
```
→ Add the missing step definition to your `.steps.js` file

❌ **Syntax error** - Invalid Gherkin:
```
Parse error in features/foo.feature
```
→ Fix the feature file syntax

❌ **Duplicate steps** - Multiple definitions match:
```
Multiple step definitions match
```
→ Remove or rename one of the duplicate step definitions

**If validation fails:**
1. Read the error message carefully
2. Fix the step definitions or scenario file **in the worktree**
3. Re-run the dry-run command
4. **Loop until validation passes** - do NOT proceed until green

**If validation succeeds:**
Display: "✅ BDD infrastructure validated - all steps have definitions"

**Update database with scenario file path:**

```bash
sqlite3 .jettypod/work.db "UPDATE work_items SET scenario_file = 'features/${FEATURE_SLUG}.feature' WHERE id = ${FEATURE_ID}"
```

**Proceed to Step 10.**

### Step 10: Propose Speed Mode Chores

**CRITICAL:** After BDD files are written and validated, analyze the codebase and propose technical implementation chores. **DO NOT CREATE CHORES YET** - the feature must transition to implementation mode first (Step 11).

**Your analysis should consider:**
- The BDD scenarios (integration + all success paths)
- The Integration Contract from Step 6
- Existing codebase structure and patterns
- Epic's architectural decisions (if any)
- Tech stack and framework conventions
- Which scenario steps each chore addresses
- Similar code patterns to follow

**REQUIRED: At least one chore MUST be an Integration Chore** that:
- Wires the feature into the existing app
- Makes the Integration Scenario pass
- Modifies the caller code identified in Step 6

**Say to the user:**

```
Now let me analyze the codebase and propose implementation chores for speed mode.

[Analyze codebase, read relevant files, check patterns]

Based on the scenario and my understanding of the codebase, here are the chores I recommend for speed mode:

**Chore 1: [Integration chore - wire feature into app]** ⚡ INTEGRATION
- Why: Makes the feature reachable from [entry point]
- Integration Contract:
  • Entry point: [from Step 6]
  • Caller code to modify: [specific file/function]
- Scenario steps addressed:
  • [Integration scenario Given/When/Then steps]
- Implementation guidance:
  • Files to modify: [caller code files]
  • What to add: [route, link, import, menu item, etc.]
- Verification:
  • Integration scenario passes (feature is reachable)

**Chore 2: [Core functionality chore]**
- Why: [What this accomplishes toward the scenario]
- Scenario steps addressed:
  • [Which Given/When/Then steps this chore makes work]
- Implementation guidance:
  • Files to create/modify: [specific paths]
  • Patterns to follow: [reference existing similar code]
  • Key functions/components needed: [list]
- Verification:
  • [Which step definitions should pass]

[etc.]

These chores will make all scenarios pass (integration + required + optional features).

Sound good? Any adjustments?
```

**WAIT for user response.**

- If user confirms → Proceed to Step 11
- If user requests changes → Revise chore proposals, then WAIT again
- If user adds/removes chores → Update your list accordingly

### Step 11: Rationale, Create Chores, and Transition

Complete the discovery phase by recording the decision, creating chores, and transitioning the feature from discovery to implementation.

**CRITICAL: You must EXECUTE commands using the Bash tool. Do NOT just display them as text.**

#### Sub-step A: Confirm Rationale

Display to user:

```
I'm going to record this decision:

Winner: [approach name or prototypes/winner-file]
Rationale: [Why this approach was chosen]

Does this rationale capture why you chose this approach? (You can edit it if needed)
```

**WAIT for user to confirm or provide edited rationale.**

#### Sub-step B: Create the Chores

**CRITICAL: Create chores BEFORE running `work implement`.** The system validates that chores exist before allowing the transition.

For each chore that the user confirmed in Step 10, use the Bash tool to create it:

```bash
jettypod work create chore "[Chore title]" "[Chore description]" --parent=${FEATURE_ID}
```

Replace `${FEATURE_ID}` with actual ID. Example:
```bash
jettypod work create chore "Set up auth routes" "Create login/logout endpoints..." --parent=42
```

**CRITICAL: Copy the EXACT proposal from Step 10 into each chore description.** Do not paraphrase or summarize - the implementation guidance must be preserved verbatim:

```
[Technical description from Step 10]

Scenario steps addressed:
• [EXACT steps from Step 10]

Implementation guidance:
• Files to create/modify: [EXACT paths from Step 10]
• Patterns to follow: [EXACT references from Step 10]
• Key functions/components needed: [EXACT list from Step 10]

Verification:
• [EXACT step definitions from Step 10]
```

#### Sub-step C: Execute Transition

**After ALL chores are created, use Bash tool to EXECUTE the work implement command:**

```bash
jettypod work implement ${FEATURE_ID} \
  --winner="[approach-name or prototypes/winner-file]" \
  --rationale="[user's confirmed/edited rationale]"
```

Replace `${FEATURE_ID}` with actual ID. Example:
```bash
jettypod work implement 42 --winner="Simple inline form" --rationale="Fastest UX, cleanest implementation"
```

**DO NOT display this as example text. EXECUTE IT using the Bash tool.**

**If the command fails**, check the error message:
- "Feature not found" → Verify the feature ID
- "No chores exist" → You skipped Sub-step B - go back and create chores first
- "Already in implementation" → Feature was already transitioned, proceed to Step 12

After successful transition, display:

```
✅ Feature transitioned to implementation phase
✅ Created X chores for speed mode

Now I'll merge the BDD tests to main...
```

**🔄 WORKFLOW CHECKPOINT: Implementation transition complete**

```bash
jettypod workflow checkpoint <feature-id> --step=11
```

**Proceed to Step 12.**

### Step 12: Merge Tests to Main

The BDD files were written in Step 9. Now merge them to main.

**Merge and cleanup (3 steps):**

```bash
# Step 1: Merge tests (can run from worktree - it won't delete it)
jettypod work tests merge ${FEATURE_ID}
```

```bash
# Step 2: cd to main repo
cd <main-repo-path>
pwd && ls .jettypod  # verify
```

```bash
# Step 3: Clean up the worktree (now safe since shell is in main repo)
jettypod work cleanup ${FEATURE_ID}
```

This will:
- Commit changes in the worktree
- Merge to main
- Push to remote
- Mark worktree as merged (cleanup is separate)

**🛑 STOP AND CHECK:** Verify merge succeeded:
- ✅ "Tests merged to main" → Proceed to Step 13
- ❌ Error → Investigate, worktree still exists for debugging

**After successful merge, display:**

```
✅ Feature transitioned to implementation phase
✅ Created X chores for speed mode
✅ BDD tests merged to main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Feature Planning Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BDD scenarios: features/[feature-slug].feature
🧪 Step definitions: features/step_definitions/[feature-slug].steps.js
✅ Feature phase: Implementation
🚀 Feature mode: Speed

💡 Recommendation: Start with Chore #[first-chore-id] ([chore-title])
   [Brief reasoning - e.g., "It sets up the foundation the other chores depend on."]

Start this one? [yes / pick different / done for now]
```

**🔄 WORKFLOW INTEGRATION: Complete workflow**

```bash
jettypod workflow complete feature-planning <feature-id>
```

This marks the `feature_planning_complete` gate as passed, enabling speed-mode to start.

**Proceed to Step 13.**

### Step 13: Start First Chore

**Feature planning is now complete.** The feature has been transitioned to implementation phase, tests are on main, and chores are ready.

The completion message above already includes your recommendation. Now:

**WAIT for user response.**

**If user confirms (says "yes", "let's go", etc.):**

1. Run `jettypod work start [chore-id]` using Bash tool
2. **Then IMMEDIATELY invoke speed-mode using the Skill tool** (see below)

**If user says "pick different":**

1. List all chores and let them choose
2. Run `work start` on their choice
3. **Then IMMEDIATELY invoke speed-mode using the Skill tool** (see below)

**If user says "done for now":**

End feature-planning skill without starting a chore. Do NOT invoke speed-mode.

---

**After user picks a chore, execute these steps IN ORDER:**

**🚫 FORBIDDEN: Manual Git Worktree Commands**
```
❌ git worktree add ...
❌ git checkout -b feature/...
❌ git branch feature/...
```
**ALWAYS use `jettypod work start`** - it handles branch naming, path conventions, database tracking, and cleanup. Manual git commands will create orphaned worktrees that break the merge workflow.

**Step 1: Start the chore (creates worktree and branch):**
```bash
jettypod work start [chore-id]
```

**🛑 STOP AND CHECK:** Look at the output of `work start`. You should see:
```
✅ Created worktree: /path/to/.jettypod-work/[id]-[title-slug]
Branch: feature/work-[id]-[title-slug]
```

**If you see `⚠️ Working in main repository (worktree creation failed)`:**
- **DO NOT proceed to speed-mode**
- Investigate why worktree failed (uncommitted changes? branch conflict?)
- Fix the issue and re-run `work start`
- Only continue after seeing `✅ Created worktree`

**Step 2: Verify worktree exists before invoking speed-mode:**
```bash
sqlite3 .jettypod/work.db "SELECT worktree_path FROM worktrees WHERE work_item_id = [chore-id] AND status = 'active'"
```

If this returns empty/no rows, **STOP** - the worktree wasn't created properly.

**Step 3: State the chore ID clearly in your response:**
> "I'll start implementing Chore #[id]: [title]"

**Step 4: IMMEDIATELY invoke speed-mode using the Skill tool:**
```
Use the Skill tool with skill: "speed-mode"
```

**🛑 CRITICAL:** You MUST:
1. Run `work start` first
2. Verify the worktree was created (not fallback to main)
3. THEN invoke speed-mode using the Skill tool

If you skip `work start` or proceed when worktree creation failed, the merge workflow will break later.

**Feature-planning skill is now complete.** Speed-mode takes over and handles the implementation.

## Example: Feature Planning Flow

**Feature:** "Email/password login"
**Epic decision:** "Using Auth.js with JWT tokens"

**Suggested approaches:**
1. **Simple inline form** - Email + password fields, inline validation
2. **Multi-step flow** - Step 1: Email, Step 2: Password (better mobile UX)
3. **Unified auth form** - Combined login/signup (switches based on email)

**User picks:** Option 1 (Simple inline form)

**Scenarios generated (speed mode - all success paths):**
```gherkin
Feature: Email/Password Login

Scenario: Successful login with credentials
  Given I am on the login page
  When I enter valid credentials and submit
  Then I am redirected to the dashboard
  And I have an active JWT token

Scenario: Login with "Remember me" option
  Given I am on the login page
  When I enter valid credentials
  And I check "Remember me"
  And I submit
  Then I am redirected to the dashboard
  And my session persists for 30 days

# SPEED MODE: All success scenarios above (required + optional features)
# STABLE MODE: Will add error handling scenarios like "Invalid credentials"
```

**Rationale confirmation:**
Claude proposes: "Simple inline form chosen - fastest for users, cleanest UX"
User confirms: "Yes, perfect"

**Transition:** `jettypod work implement 10 --winner="prototypes/2025-10-30-login-simple.html" --rationale="Simple inline form chosen - fastest for users, cleanest UX"`

## Validation Checklist

Before completing feature planning, ensure:
- [ ] Epic's architectural decision is shown (if exists)
- [ ] Exactly 3 approaches suggested
- [ ] Winner chosen (with prototypes or without)
- [ ] **Integration Contract defined** (entry point, caller code, integration scenario)
- [ ] **Test worktree created** with `work tests start` (Step 7)
- [ ] **Integration Scenario is FIRST scenario** in proposed scenarios
- [ ] BDD scenarios **proposed and confirmed** by user (Step 8)
- [ ] **BDD files written** in worktree using `WORKTREE_PATH` (Step 9)
- [ ] **BDD infrastructure validated** with dry-run (Step 9)
- [ ] **At least one Integration Chore proposed** (wires feature into app)
- [ ] Speed mode chores proposed and confirmed (Step 10)
- [ ] Chores created in database (Step 11)
- [ ] Feature transitioned to implementation with `work implement` (Step 11)
- [ ] **Tests merged to main** with `work tests merge` → `cd` → `work cleanup` (Step 12)
- [ ] First chore started with `work start [chore-id]` (Step 13)
- [ ] **Speed-mode skill invoked using Skill tool** (Step 13)
