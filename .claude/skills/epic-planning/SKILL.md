---
name: epic-planning
description: Guide epic planning with feature brainstorming and optional architectural decision prototyping. Invoked by request-routing for large multi-feature initiatives that need to be broken down into features. For technical epics (refactors, migrations, infrastructure), creates chores directly without features or mode progression. (project)
---

# Epic Planning Skill

Guides Claude through comprehensive epic planning including feature identification and architectural decisions. For **technical epics**, skips feature brainstorming and creates chores directly.

## Instructions

When this skill is activated, you are helping plan an epic. Follow this structured approach:

### Step 1: Determine Entry Point

**Check how this skill was triggered:**

---

**⚡ FIRST: Detect Technical Epic**

Before proceeding, check if this is a **technical epic** by looking for these signals in the request or context passed from request-routing:

| Technical Epic Signals |
|------------------------|
| refactor, migrate, infrastructure, technical debt |
| + epic-scale words: "across all", "major", "entire", "large" |
| No user-facing features mentioned |
| Pure technical/engineering work |

**If technical epic detected:**
- Set `IS_TECHNICAL_EPIC = true`
- Skip UX-focused questions in Scenario B
- Will use Step 3B (Brainstorm Chores) instead of Step 3 (Brainstorm Features)
- Will skip Steps 4-5 (Architectural Decision) - not needed for technical work
- Will create chores in Step 6 instead of features

**If NOT a technical epic:**
- Set `IS_TECHNICAL_EPIC = false`
- Follow normal feature-based flow

---

**Scenario A: Epic ID provided** (e.g., "plan epic #5", "help me with epic 42")

Run this command to get epic context:
```bash
jettypod work status ${EPIC_ID}
```

Capture the title, description, and any existing context.

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After getting the epic context, register this skill execution:

```bash
jettypod workflow start epic-planning <epic-id>
```

This creates an execution record for session resume.

Proceed to Step 2.

---

**Scenario B: Just an idea** (e.g., "I want to add real-time collab", "plan an epic for auth")

User has only provided a sentence or vague concept. **DO NOT suggest features/chores yet.**

**If `IS_TECHNICAL_EPIC = true`:**

Gather technical context. Ask 2-3 of the most relevant questions from:

```
I'd like to understand this technical epic better before suggesting chores.

**Scope:**
- What's the scope? (which modules/areas are affected?)
- What's the end state? (what does "done" look like?)

**Constraints:**
- Any ordering dependencies? (must do X before Y?)
- Any patterns to follow? (existing conventions, migration guides)

**Verification:**
- How will we know it's complete? (tests pass, no warnings, etc.)
```

**If `IS_TECHNICAL_EPIC = false`:**

Gather context first. Ask 2-4 of the most relevant questions from:

```
I'd like to understand this epic better before suggesting features.

**User Experience:**
- What does the user journey look like? (How do users discover/use this?)
- What's the "aha moment" - when does the user feel value?

**Problem & Users:**
- What problem does this solve? (pain point or business need)
- Who are the primary users? (personas or roles)

**Scope & Constraints:**
- What's the scope? (MVP vs full vision)
- Any technical constraints? (must integrate with X, existing patterns to follow)
```

**WAIT for user answers.**

Then synthesize into an epic title + description and create:
```bash
jettypod work create epic "${EPIC_TITLE}" "${EPIC_DESCRIPTION}"
```

Capture the new epic ID from output.

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After creating the epic, register this skill execution:

```bash
jettypod workflow start epic-planning <epic-id>
```

This creates an execution record for session resume.

Proceed to Step 2 if epic already exists, or:
- **If `IS_TECHNICAL_EPIC = true`:** Proceed to Step 3B (Brainstorm Chores)
- **If `IS_TECHNICAL_EPIC = false`:** Proceed to Step 3 (Brainstorm Features)

### Step 2: Check Existing State

**CRITICAL:** Before suggesting anything, check what already exists. Run BOTH commands using the epic ID from Step 1:

```bash
jettypod decisions --epic=${EPIC_ID}
jettypod work children ${EPIC_ID}
```

**Example** (if epic ID is 5):
```bash
jettypod decisions --epic=5
jettypod work children 5
```

Based on results, follow the appropriate path:

---

**Path A: Nothing exists (no decisions AND no features/chores)**

Fresh start.
- **If `IS_TECHNICAL_EPIC = true`:** Proceed to Step 3B (Brainstorm Chores)
- **If `IS_TECHNICAL_EPIC = false`:** Proceed to Step 3 (Brainstorm Features)

---

**Path B: Decisions exist but NO features**

Previous planning was started but not completed. Present existing decisions:

```
🎯 **Existing Architectural Decisions for This Epic:**

[For each decision:]
- **[Aspect]:** [Decision]
  *Rationale:* [Why this was chosen]

These decisions were made previously. I'll use them to guide feature suggestions.
Do these still apply, or should we revisit any?
```

**WAIT for confirmation**, then proceed to Step 3 (Brainstorm Features) using these decisions as context.

---

**Path C: Features exist (with or without decisions)**

Planning was previously completed or partially completed. Present what exists:

```
🎯 **This epic already has children:**

[List features/chores from children command]

**Options:**
1. **Add more** - Brainstorm additional features
2. **Continue planning** - Start feature-planning for one of these
3. **Review decisions** - Check/update architectural decisions

What would you like to do?
```

**Route based on response:**
- "Add more" → Step 3 (Brainstorm Features)
- "Continue planning" → Step 7B (skip 7A since you already have the children list)
- "Review decisions" → Step 4 (Architectural Decision)

### Step 3: Brainstorm Features

Based on the epic's purpose, suggest features that belong in this epic:

```
I'll help you plan the features for this epic.

Based on [epic name], here are the features I recommend:

**Feature 1: [Name]** - [Brief description of what users can do]
**Feature 2: [Name]** - [Brief description]
**Feature 3: [Name]** - [Brief description]
...

**Questions:**
- [Any clarifying questions about scope]
- [Missing features to consider]

What features should we include? What am I missing?
```

**WAIT for user response.**

When user confirms features (says "looks good", "yes", lists modifications, etc.), finalize the feature list and proceed to Step 4.

### Step 3B: Brainstorm Chores (Technical Epic)

**Only used when `IS_TECHNICAL_EPIC = true`**

Based on the technical epic's purpose, suggest chores that accomplish the work:

```
I'll help you plan the chores for this technical epic.

Based on [epic name], here are the chores I recommend:

**Chore 1: [Name]** - [Brief description of technical work]
**Chore 2: [Name]** - [Brief description]
**Chore 3: [Name]** - [Brief description]
...

**Ordering notes:**
- [Any dependencies between chores]
- [Suggested sequence if applicable]

What chores should we include? What am I missing?
```

**WAIT for user response.**

When user confirms chores (says "looks good", "yes", lists modifications, etc.), finalize the chore list and **skip directly to Step 6** (no architectural decision needed for technical epics).

### Step 4: Architectural Decision (Optional)

**⚠️ SKIP THIS STEP if `IS_TECHNICAL_EPIC = true`** - Technical epics don't need architectural decisions. Go directly to Step 6.

After features are defined, ask if this epic needs a shared technical approach.

**Say to user:**
> **Architectural question:** Does this epic need a shared technical decision?
>
> For example:
> - Which library/framework for this capability?
> - What data structure or protocol?
> - What architectural pattern?
>
> Examples where architectural decisions matter:
> - Real-time features: WebSockets vs SSE vs polling?
> - Auth system: Which auth library and token strategy?
> - Data sync: Optimistic vs pessimistic locking?
>
> Should we explore different architectural approaches?

**Track the response:**
- If user says YES → Go to Step 5A
- If user says NO or "already know" → Go to Step 5C
- If unclear → Ask for clarification

### Step 5A: Present Architectural Options

Present exactly 3 approaches. Fill in the bracketed parts with actual content based on the epic:

**Say to user:**
> Here are 3 different architectural approaches for **[fill in epic title]**:
>
> **Option 1: [Simple approach - you fill this in]**
> - **Pros**: ✅ [2-3 actual advantages]
> - **Cons**: ❌ [2-3 actual trade-offs]
> - **Technical Impact**: [How this affects the features]
>
> **Option 2: [Balanced approach - you fill this in]**
> - **Pros**: ✅ [2-3 actual advantages]
> - **Cons**: ❌ [2-3 actual trade-offs]
> - **Technical Impact**: [How this affects the features]
>
> **Option 3: [Advanced approach - you fill this in]**
> - **Pros**: ✅ [2-3 actual advantages]
> - **Cons**: ❌ [2-3 actual trade-offs]
> - **Technical Impact**: [How this affects the features]
>
> Would you like me to create working prototypes to compare these?

**Track the response:**
- If user wants prototypes → Go to Step 5B
- If user picks an option → Go to Step 6 (set `ARCH_DECISION_MADE = true`)
- If user skips → Go to Step 6 (set `ARCH_DECISION_MADE = false`)

### Step 5B: Build Prototypes

If user wants to prototype approaches:

**Sub-step 1: Create prototype worktree**

```bash
jettypod work prototype start ${EPIC_ID} [approach-name]
```

Example (if epic ID is 5, approach is "websockets"):
```bash
jettypod work prototype start 5 websockets
```

This creates a worktree at `.jettypod-work/prototype-<id>-<slug>-<approach>/` where prototypes can be safely built and committed.

**🛑 STOP AND CHECK:** Verify worktree was created successfully before proceeding.

**Sub-step 2: Build prototypes in the worktree**

1. Build prototypes using **absolute paths** to the worktree:
   - `<worktree_path>/prototypes/epic-${EPIC_ID}-${APPROACH_NAME}/`
2. Build 2-3 working prototypes demonstrating the architectural difference
3. **Commit the prototype** in the worktree:
   ```bash
   cd <worktree_path>
   git add .
   git commit -m "Add prototype: [approach-name] for epic #${EPIC_ID}"
   ```

**Sub-step 3: Test and decide**

After user tests, ask which approach they prefer.

**Sub-step 4: Merge prototype**

After user has tested (regardless of whether they pick this approach):

```bash
jettypod work prototype merge ${EPIC_ID}
cd <main-repo-path>
jettypod work cleanup ${EPIC_ID}
```

This merges prototype files to main (in `/prototypes/` directory) and cleans up the worktree.

When user picks a winner → Go to Step 6 (set `ARCH_DECISION_MADE = true`)

### Step 5C: Skip Architecture (User Already Knows)

If user says they already know the approach or don't need architectural decisions:

**Say to user:**
> Got it. We'll skip architectural prototyping for this epic.

Set `ARCH_DECISION_MADE = false` and proceed directly to Step 6.

---

### Step 6: Create Features or Chores

**CRITICAL: Execute these commands with the Bash tool. Do NOT just display them.**

**Before you start:** Confirm you have the epic ID from Step 1. If you're unsure, run:
```bash
jettypod backlog
```

---

#### Step 6A: Create Items (Features OR Chores)

**If `IS_TECHNICAL_EPIC = true`:** Create chores

For each chore the user agreed on, execute this command:

```bash
jettypod work create chore "${CHORE_TITLE}" "${CHORE_DESCRIPTION}" --parent=${EPIC_ID}
```

**Example** (if epic ID is 5):
```bash
jettypod work create chore "Migrate auth module to ESM" "Convert require() to import in auth/" --parent=5
```

After each successful creation, tell the user:
> ✅ Created Chore #[id from output]: [title]

**Then skip to Step 7** (no architectural decision for technical epics).

---

**If `IS_TECHNICAL_EPIC = false`:** Create features

For each feature the user agreed on, execute this command using the epic ID from Step 1:

```bash
jettypod work create feature "${FEATURE_TITLE}" "${FEATURE_DESCRIPTION}" --parent=${EPIC_ID}
```

**Example** (if epic ID is 5):
```bash
jettypod work create feature "Live cursor tracking" "Track cursor positions in real-time" --parent=5
```

After each successful creation, tell the user:
> ✅ Created Feature #[id from output]: [title]

#### Step 6B: Record Architectural Decision (Conditional)

**Check:** Did user select an architectural approach in Step 5A or 5B?
- If YES (user picked Option 1/2/3 or chose after prototyping) → Continue below
- If NO (user said "already know", skipped, declined, or Step 4 was answered "no") → Skip to Step 7

If an architectural decision was made:

**Say to user:**
> I'm going to record this architectural decision:
>
> **Aspect:** Architecture
> **Decision:** [the approach they chose]
> **Rationale:** [why they chose it]
>
> Does this capture why you chose this approach? (You can edit it if needed)

**WAIT for user confirmation.**

After user confirms, execute this command using the epic ID from Step 1 and the actual decision values:

```bash
jettypod work epic-implement ${EPIC_ID} --aspect="${ASPECT}" --decision="${DECISION}" --rationale="${RATIONALE}"
```

**Example** (if epic ID is 5):
```bash
jettypod work epic-implement 5 --aspect="Architecture" --decision="WebSockets with Socket.io" --rationale="Chosen for bi-directional real-time communication"
```

After success, tell the user:
> ✅ Architectural decision recorded

---

### Step 7: Route to Next Planning Skill

#### Step 7A: List Created Items

Run this command using the epic ID from Step 1:
```bash
jettypod work children ${EPIC_ID}
```

#### Step 7B: Recommend Next Item

Based on the output, recommend which item to plan first.

**Say to user:**
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 🎯 Epic Planning Complete!
> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
>
> Created under this epic:
> [List the actual items from the children command output]
>
> 💡 Recommendation: Start with Feature #[actual id] ([actual title])
>    [Your reasoning - e.g., "It's foundational - other features depend on it."]
>
> Plan this one now? [yes / pick different / done for now]

**Recommendation logic:**
- Recommend the first feature (features are typically foundational)
- If only chores exist, recommend the first chore
- Provide brief reasoning

**WAIT for user response.**

#### Step 7C: Route on Confirmation

Based on user response:

**If user confirms (says "yes", "let's go", "proceed", etc.):**

Determine the skill to invoke based on item type:

**If `IS_TECHNICAL_EPIC = true`:**
- **All items are chores** → always invoke `chore-planning`

**If `IS_TECHNICAL_EPIC = false`:**
- **Feature** → invoke `feature-planning`
- **Chore** → invoke `chore-planning`

**Before invoking, state the item ID clearly in your response** (e.g., "I'll start planning Feature #42" or "Let's plan Chore #15"). This ensures the child skill has the ID in context.

**Then IMMEDIATELY invoke the appropriate skill using the Skill tool:**

```
Use the Skill tool with skill: "feature-planning"
```
or
```
Use the Skill tool with skill: "chore-planning"
```

**If user picks different item (says "pick different", "different one", "let me choose", etc.):**

Display a numbered list of all created items:

```
Which item would you like to plan?

1. ✨ Feature #[id]: [title]
2. ✨ Feature #[id]: [title]
3. 🔧 Chore #[id]: [title]

Enter the number of your choice:
```

**WAIT for user to enter a number.**

After user selects (e.g., "2" or "number 2"):
1. Look up the item from the list
2. Determine the skill based on item type:
   - **Feature** → invoke `feature-planning`
   - **Chore** → invoke `chore-planning`
3. **IMMEDIATELY invoke the appropriate skill using the Skill tool**

**If user says "done for now" (or "later", "not now", "skip", "no thanks", etc.):**

Display with actual IDs from the created items:
```
No problem! When you're ready to continue, you can plan any of these:

Features:
  • "Let's do feature discovery for #10" (User registration)
  • "Let's do feature discovery for #11" (Password reset)

Chores:
  • "Help me plan chore #12" (Update CI config)

Or run: jettypod backlog to see all items.
```

**🔄 WORKFLOW INTEGRATION: Complete workflow**

```bash
jettypod workflow complete epic-planning <epic-id>
```

This marks the `epic_planning_complete` gate as passed. Features created under this epic can now begin their own planning.

**Do NOT invoke any skill. End epic-planning skill.**

## Key Principles

1. **Feature brainstorming is always required** - Don't skip this even if architectural decision is clear (for regular epics)
2. **Architectural decision is optional** - Not all epics need one (e.g., "Q1 Goals" is just grouping)
3. **Always suggest exactly 3 options** when architectural decision needed - Simple/Conservative, Balanced, Advanced
4. **Be specific about features** - Each feature should be user-facing capability
5. **Use the Approach Suggestion template** - Pros, Cons, Technical Impact format
6. **Route to next skill** - After creating items, recommend one and invoke the appropriate planning skill
7. **Use jettypod commands** - Create features using jettypod CLI, record decisions with epic-implement
8. **Skill handoff** - Invoke `feature-planning` for features, `chore-planning` for chores
9. **Technical epics are different** - They create chores directly (no features), skip architectural decisions, and always route to `chore-planning`. Chores under technical epics don't use mode progression (no speed→stable→production).

## Example: Epic with Architectural Decision

Epic: "Real-time Collaboration"

**Features brainstormed:**
- Live cursor tracking
- Concurrent editing with conflict resolution
- Presence indicators
- Real-time chat

**Architectural approaches suggested:**

**Option 1: Long Polling (REST)**
- **Pros**: ✅ Simple, works with all proxies, uses existing HTTP infrastructure
- **Cons**: ❌ Higher latency (1-2s), more server load, inefficient for high-frequency updates
- **Technical Impact**: Each feature polls independently, easy to implement per feature

**Option 2: Server-Sent Events (SSE)**
- **Pros**: ✅ Lightweight, auto-reconnection, efficient one-way streaming
- **Cons**: ❌ One-direction only (server→client), limited browser connections (6 per domain)
- **Technical Impact**: Good for cursor/presence, requires separate POST for edits

**Option 3: WebSockets (Socket.io)**
- **Pros**: ✅ Bidirectional, low latency (<100ms), perfect for real-time, fallback support
- **Cons**: ❌ More complex infrastructure, requires sticky sessions, WebSocket proxies needed
- **Technical Impact**: All features use unified connection, best UX but infrastructure complexity

**Additional approaches considered:**
- *WebRTC Data Channels*: Peer-to-peer, low latency - Not selected due to NAT/firewall traversal complexity
- *GraphQL Subscriptions*: Good for selective updates - Not selected as overkill for this use case

**User choice:** Option 3 (WebSockets with Socket.io)

**Rationale confirmation:**
Claude proposes: "Bidirectional real-time updates needed for collaboration, Socket.io provides fallbacks and auto-reconnection"
User confirms: "Yes, that's right"

**Command run:**
```bash
jettypod work epic-implement 5 \
  --aspect="Architecture" \
  --decision="WebSockets with Socket.io" \
  --rationale="Bidirectional real-time updates needed for collaboration, Socket.io provides fallbacks and auto-reconnection"
```

## Example: Epic without Architectural Decision

Epic: "User Management"

**Features brainstormed:**
- User registration
- Profile editing
- Password reset
- Account deletion

**Architectural decision:** None needed - these are independent features using existing auth system

## Example: Technical Epic (Chores Only)

Epic: "Migrate Codebase from CommonJS to ESM"

**Detection:** `IS_TECHNICAL_EPIC = true` (signals: "migrate", "codebase", no user-facing features)

**Context questions asked:**
- What's the scope? → "All JavaScript files in src/ and lib/"
- What's the end state? → "All files use import/export, package.json has type:module"
- Any ordering dependencies? → "Start with leaf modules, work up to entry points"

**Chores brainstormed:**
- Migrate utility modules (src/utils/)
- Migrate lib/ modules
- Migrate core business logic
- Update build configuration
- Update test configuration

**Architectural decision:** Skipped (not needed for technical work)

**Commands run:**
```bash
jettypod work create chore "Migrate utility modules" "Convert src/utils/ from require() to import" --parent=42
jettypod work create chore "Migrate lib modules" "Convert lib/ from require() to import" --parent=42
jettypod work create chore "Migrate core business logic" "Convert src/core/ from require() to import" --parent=42
jettypod work create chore "Update build configuration" "Update webpack/rollup for ESM output" --parent=42
jettypod work create chore "Update test configuration" "Update Jest config for ESM" --parent=42
```

**Routing:** All chores route to `chore-planning` → `chore-mode` (no mode progression)

## Validation

Before completing epic planning, ensure:
- [ ] At least 2-3 features/chores identified
- [ ] Features are user-facing capabilities (not technical tasks)
- [ ] Chores (if any) are standalone work items for this epic
- [ ] Architectural decision documented if needed
- [ ] All items created in database with correct parent_id
- [ ] Recommended next item to plan
- [ ] Routed to feature-planning or chore-planning (or user declined)
