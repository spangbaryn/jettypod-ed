---
name: feature-planning
description: Guide feature planning with UX approach exploration and BDD scenario generation. Use when user asks to plan a feature, mentions designing/implementing a feature, says "help me plan feature", or wants to explore UX approaches for a specific feature.
---

# Feature Planning Skill

Guides Claude through feature planning including UX approach exploration, optional prototyping, and BDD scenario generation.

## Instructions

When this skill is activated, you are helping discover the best approach for a feature. Follow this structured approach:

### Step 1: Understand the Feature Context

You'll receive context about:
- Feature title and description
- Parent epic (if any)
- Project context

### Step 2: Check Epic Architectural Decisions

**CRITICAL:** If this feature belongs to an epic, check for existing architectural decisions:

```javascript
const { getDecisionsForEpic } = require('../../lib/decisions-helpers');

if (parentEpicId) {
  const epicDecisions = await getDecisionsForEpic(parentEpicId);
  // Surface decisions to user
}
```

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

Would you like me to create working prototypes of these approaches?
```

### Step 4: Optional Prototyping

If user wants prototypes:

1. **Build prototypes** in `/prototypes/feature-[id]-[approach-name]/`
2. **Name format**: `YYYY-MM-DD-[feature-slug]-[option].ext`
3. **Focus on UX**: Show the feel, not production code
4. **Add prototype header**:
   ```
   // Prototype: [feature] - [option]
   // Created: [date]
   // Purpose: [what this explores]
   // Decision: [to be filled after testing]
   ```
5. **Offer to open them**: "Want me to open these in your browser?"

### Step 5: Choose Winner

After user tests (or skips prototyping):

```
Which approach works best?
```

User picks winner. Record it.

### Step 6: Generate BDD Scenarios AND Step Definitions

**CRITICAL:** BDD scenarios and step definitions must ALWAYS be created together. Never create scenarios without step definitions.

Based on chosen approach, generate:

**A. Scenario file** at `features/[feature-slug].feature` using Write tool:

1. **Create file** at `features/[feature-slug].feature` using Write tool
2. **ONLY include happy path scenario**:
   - Happy path ONLY - the core user journey that proves it works
   - NO error handling scenarios (added in stable mode)
   - NO edge cases (added in stable mode)
   - NO security/compliance scenarios (added in production mode)

**B. Step definitions file** at `features/step_definitions/[feature-slug].steps.js` using Write tool:

1. **Create file** at `features/step_definitions/[feature-slug].steps.js`
2. **Implement all Given/When/Then steps** from the scenarios
3. **Follow existing patterns** - check other `.steps.js` files for conventions
4. **Include**:
   - Test environment setup/cleanup
   - All Given steps (setup state)
   - All When steps (execute actions)
   - All Then steps (verify outcomes)

3. **Update database** with scenario file path:
   ```javascript
   // After creating scenario file AND step definitions
   const { getDb } = require('../../lib/database');
   const db = getDb();

   db.run(
     `UPDATE work_items SET scenario_file = ? WHERE id = ?`,
     ['features/[feature-slug].feature', featureId],
     (err) => {
       if (err) console.error('Failed to update scenario_file:', err);
     }
   );
   ```

**Template for speed mode (happy path only):**

```gherkin
Feature: [Feature Name]
  [Brief description based on chosen UX approach]

  Epic: [Epic name if applicable]
  Approach: [Chosen approach name]

Scenario: [Happy path scenario - core user journey]
  Given [initial state]
  When [user takes main action]
  Then [expected successful outcome]
  And [observable UI/system state change]

# SPEED MODE: Only happy path above
# STABLE MODE: Will add error handling, edge cases, validation scenarios
# These additional scenarios are added by stable-mode skill, NOT during feature discovery
```

**Example for Login feature (speed mode):**
```gherkin
Feature: Email/Password Login
  Simple inline form with email and password fields

  Epic: User Authentication
  Approach: Simple inline form

Scenario: User successfully logs in with valid credentials
  Given I am on the login page
  When I enter valid email and password
  And I click the login button
  Then I am redirected to the dashboard
  And I see a welcome message with my name
  And I have an active session token
```

### Step 7: Propose Speed Mode Chores

**CRITICAL:** After generating BDD scenarios, analyze the codebase and propose technical implementation chores with rich breadcrumbs for speed mode execution.

**Your analysis should consider:**
- The BDD scenarios (especially the happy path)
- Existing codebase structure and patterns
- Epic's architectural decisions (if any)
- Tech stack and framework conventions
- Which scenario steps each chore addresses
- Similar code patterns to follow
- Specific step definitions that should pass

**Say to the user:**

```
Now let me analyze the codebase and propose implementation chores for speed mode.

[Analyze codebase, read relevant files, check patterns]

Based on the scenario and codebase, here are the chores I recommend for speed mode:

**Chore 1: [Technical task title]**
- Why: [What this accomplishes toward the scenario]
- Scenario steps addressed:
  • [Which Given/When/Then steps this chore makes work]
- Implementation guidance:
  • Files to create/modify: [specific paths]
  • Patterns to follow: [reference existing similar code]
  • Key functions/components needed: [list]
- Verification:
  • Step definitions that should pass: [specific steps from .steps.js]

**Chore 2: [Technical task title]**
- Why: [What this accomplishes]
- Scenario steps addressed:
  • [Which steps]
- Implementation guidance:
  • Files to create/modify: [paths]
  • Patterns to follow: [references]
  • Key functions/components needed: [list]
- Verification:
  • Step definitions that should pass: [steps]

[etc.]

These chores will make the happy path scenario pass.

Sound good? Any adjustments?
```

**Wait for user confirmation/adjustments.**

**Then create the chores with rich descriptions:**

```javascript
// For each confirmed chore:
const { create } = require('./features/work-tracking');

const description = `[Technical description]

Scenario steps addressed:
• [Which Given/When/Then steps this chore makes work]

Implementation guidance:
• Files to create/modify: [specific paths]
• Patterns to follow: [reference existing similar code]
• Key functions/components needed: [list]

Verification:
• Step definitions that should pass: [specific steps from .steps.js file]`;

await create('chore', 'Chore Title', description, featureId, 'speed', false);
// Repeat for each chore
```

**Example chore description:**

```
Build login form component with email/password fields

Scenario steps addressed:
• Given I am on the login page
• When I enter valid credentials and submit

Implementation guidance:
• Create: src/components/LoginForm.jsx
• Follow pattern: src/components/SignupForm.jsx (similar form structure)
• Key components: EmailInput, PasswordInput, SubmitButton
• Key functions: handleSubmit(), validateEmailFormat()

Verification:
• features/step_definitions/login.steps.js - 'I am on the login page' should pass
• features/step_definitions/login.steps.js - 'I enter valid credentials and submit' should pass
```

**Report:**
```
✅ Created X chores for speed mode

Each chore includes:
• Scenario steps it addresses
• Implementation guidance with file paths and patterns
• Step definitions to verify against

Ready to start implementation: jettypod work start [first-chore-id]
```

### Step 8: Transition to Implementation

Complete the discovery phase by transitioning the feature from discovery to implementation.

**CRITICAL: You must EXECUTE the transition command using the Bash tool. Do NOT just display it as text.**

#### Step 8A: Propose Rationale

Display to user:

```
I'm going to record this decision:

Winner: [approach name or prototypes/winner-file]
Rationale: [Why this approach was chosen]

Does this rationale capture why you chose this approach? (You can edit it if needed)
```

**WAIT for user to confirm or provide edited rationale.**

#### Step 8B: Execute Transition

**CRITICAL: After user confirms, use Bash tool to EXECUTE the work implement command:**

```javascript
// Use Bash tool to execute:
node jettypod.js work implement [feature-id] \
  --winner="[approach-name or prototypes/winner-file]" \
  --rationale="[user's confirmed/edited rationale]"
```

**DO NOT display this as example text. EXECUTE IT using the Bash tool.**

After execution succeeds, verify the feature transitioned to implementation phase and display:

```
✅ Feature transitioned to implementation phase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Feature Discovery Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BDD scenarios: features/[feature-slug].feature
🧪 Step definitions: features/step_definitions/[feature-slug].steps.js
✅ Feature phase: Implementation
🚀 Feature mode: Speed

**Next step:** Start implementing the first chore
Run: jettypod work start [first-chore-id]

Build code that passes the happy path scenarios we just wrote.
```

## Key Principles

1. **Always suggest exactly 3 options** - Simple, Balanced, Advanced
2. **Show epic's architectural decision** - Feature should align with epic's technical approach
3. **UX first, tech second** - Focus on what it feels like to use, not implementation details
4. **Prototypes are optional but valuable** - User can skip if approach is obvious
5. **BDD scenarios are required** - Discovery isn't complete without scenarios
6. **Guide to next step** - Always end with clear action

## Prototyping Guidelines

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

## BDD Scenario Guidelines

**Scenario naming:**
- Use present tense
- Be specific about what's being tested
- Focus on user behavior

**Given/When/Then structure:**
- **Given**: Set up initial state
- **When**: User action
- **Then**: Observable outcome

**What feature-discover creates:**

**Feature discovery ONLY creates speed mode scenarios (happy path):**
```gherkin
Scenario: User successfully [does the thing]
  Given [setup]
  When [action]
  Then [success]
```

**Additional scenarios are added LATER by stable-mode skill:**

Stable mode adds error handling:
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

**IMPORTANT:** Feature discovery only creates happy path. Stable/production chores add more scenarios later.

## Example: Feature Discovery Flow

**Feature:** "Email/password login"
**Epic decision:** "Using Auth.js with JWT tokens"

**Suggested approaches:**
1. **Simple inline form** - Email + password fields, inline validation
2. **Multi-step flow** - Step 1: Email, Step 2: Password (better mobile UX)
3. **Unified auth form** - Combined login/signup (switches based on email)

**User picks:** Option 1 (Simple inline form)

**Scenarios generated:**
```gherkin
Feature: Email/Password Login

Scenario: Successful login
  Given I am on the login page
  When I enter valid credentials and submit
  Then I am redirected to the dashboard
  And I have an active JWT token

Scenario: Invalid credentials
  Given I am on the login page
  When I enter invalid credentials
  Then I see an error message
  And I remain on the login page
```

**Rationale confirmation:**
Claude proposes: "Simple inline form chosen - fastest for users, cleanest UX"
User confirms: "Yes, perfect"

**Transition:** `jettypod work implement 10 --winner="prototypes/2025-10-30-login-simple.html" --rationale="Simple inline form chosen - fastest for users, cleanest UX"`

## Validation

Before completing feature discovery, ensure:
- [ ] Epic's architectural decision is shown (if exists)
- [ ] Exactly 3 approaches suggested
- [ ] Winner chosen (with prototypes or without)
- [ ] BDD scenarios written
- [ ] Step definitions written for ALL scenario steps
- [ ] Scenarios file exists at `features/[feature-slug].feature`
- [ ] Step definitions file exists at `features/step_definitions/[feature-slug].steps.js`
- [ ] User knows next step .jettypod work start [feature-id])
