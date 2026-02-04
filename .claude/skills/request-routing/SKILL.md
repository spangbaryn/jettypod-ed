---
name: request-routing
description: "⚡ ENTRY POINT FOR ALL WORK REQUESTS. Invoke this skill FIRST when user describes ANY work - 'build X', 'fix Y', 'add Z', 'create feature', 'implement'. Do NOT create work items or invoke other planning skills directly. This skill analyzes intent and routes to the correct workflow. (project)"
---

# Request Routing Skill

**⚡ UNIVERSAL ENTRY POINT** - This skill MUST be invoked FIRST when a user describes work they want done.

**DO NOT:**
- Create work items (`jettypod work create`) before invoking this skill
- Invoke feature-planning, bug-planning, chore-planning, epic-planning, or simple-improvement directly
- Ask the user what type of work this is

**DO:**
- Invoke this skill immediately when user describes work
- Let this skill analyze the request and route to the correct workflow
- The target skill will create work items as needed

Routes user work requests to the correct planning workflow with minimal friction.

## Instructions

When this skill is activated, you are helping route a user's work request to the appropriate planning skill. Follow this structured approach:

### Step 1: Extract Intent Signals

From the user's request, identify work type and complexity signals:

**Work type signals:**
| Signal Words | Likely Route |
|--------------|--------------|
| fix, bug, broken, crash, error, not working, regression | bug-planning |
| (refactor, migrate, infrastructure, technical debt) + (epic, large, across, all, major) | epic-planning (technical) |
| refactor, rename, move, clean up, upgrade, migrate, infrastructure | chore-planning |
| add, build, create, implement, new feature, capability, workflow | feature-planning |
| epic, initiative, project, roadmap, multi-feature | epic-planning |
| tweak, change, update, adjust + small scope | simple-improvement |

**Complexity signals:**
| Signal | Indicates |
|--------|-----------|
| "quick", "small", "just", "simple", "tweak" | Lower complexity |
| "feature", "workflow", "experience", "redesign" | Higher complexity |
| References specific file/function | Lower complexity |
| Has edge cases to consider (validation, failures, states) | Higher complexity |
| Could fail in interesting ways | Higher complexity |
| Needs error handling design | Higher complexity |

### Step 2: Gather Context (Silent - No Questions)

Before routing, quickly probe the codebase for context. **Do NOT ask the user for this information.**

```bash
# Check for related existing code
jettypod impact "<key-term-from-request>"
```

```bash
# Check for existing work items
jettypod backlog | grep -i "<key-term>"
```

**Assess from results:**
- Existing code? → Likely modification vs creation
- Related work items? → May already be planned
- How many files affected? → Complexity indicator

### Step 3: Route with Stated Assumption

**DO NOT ASK a routing question.** State your routing decision with reasoning.

## Routing Decision Tree

```
User request
     │
     ▼
Contains bug/fix/broken/error signals?
     ├─► Yes → bug-planning
     │
     ▼
Is this a large TECHNICAL initiative?
(Refactor/migrate/infrastructure + epic-scale: "across all", "major", "entire")
     ├─► Yes → epic-planning (technical)
     │         (Creates chores directly, no features, no mode progression)
     │
     ▼
Describes large multi-feature initiative?
     ├─► Yes → epic-planning
     │
     ▼
Does this need UX exploration?
(Multiple valid approaches? User-facing behavior with design choices?)
     ├─► Yes → feature-planning
     │
     ▼
Are there edge cases to consider?
(Validation? Error states? Things that could fail? Multiple outcomes?)
     ├─► Yes → feature-planning
     │         (The speed→stable split helps: make it work, then handle edge cases)
     │
     ▼
Is this substantial technical work?
(Refactoring, infrastructure, migrations, multi-file changes)
     ├─► Yes → chore-planning
     │
     ▼
Is this truly atomic?
(No edge cases. Happy path IS the complete implementation.)
     └─► Yes → simple-improvement
```

## Route Definitions

| Route | When to Use | Progression |
|-------|-------------|-------------|
| **bug-planning** | Something is broken/not working as expected | Investigation → fix |
| **epic-planning (technical)** | Large technical initiative (refactor, migration, infrastructure) with no user-facing features | Break down → chores directly (no features, no modes) |
| **epic-planning** | Large initiative spanning multiple features | Break down → plan features |
| **feature-planning** | New behavior needing UX exploration OR has edge cases worth sequencing | UX exploration → BDD → speed → stable → production |
| **chore-planning** | Substantial technical work, clear implementation | speed → stable → production |
| **simple-improvement** | Atomic change where happy path IS the complete implementation | Direct implementation |

## Routing Examples

**→ bug-planning**
- "The login button doesn't work on mobile"
- "Getting a crash when I save"
- "Users are seeing a 500 error"

**→ epic-planning (technical)**
- "Migrate the entire codebase from CommonJS to ESM"
- "Refactor authentication across all modules"
- "Major infrastructure overhaul for the API layer"
- "Technical debt cleanup across the whole project"

*(Technical work at epic scale - no user-facing features, just chores)*

**→ epic-planning**
- "We need a full authentication system"
- "Build out the reporting dashboard"
- "Plan the v2 API migration"

*(User-facing initiatives with multiple features)*

**→ feature-planning**
- "Add drag-and-drop reordering for cards"
- "Implement user notifications"
- "Build a search feature"

*(Multiple valid UX approaches exist)*

**→ feature-planning (small but has edge cases)**
- "Add form validation to the signup form"
- "Add retry logic when the API fails"
- "Add confirmation before deleting items"
- "Add input validation for the settings"

*(Looks small, but has edge cases: what errors? what states? what feedback? Speed→stable split helps.)*

**→ chore-planning**
- "Refactor the auth module to use the new pattern"
- "Migrate from Moment.js to date-fns"
- "Add TypeScript to the utils folder"
- "Set up CI/CD pipeline"

*(Technical work, obvious approach, but substantial)*

**→ simple-improvement**
- "Change the button text from 'Submit' to 'Save'"
- "Make the error message more descriptive"
- "Add a loading spinner to the save button"
- "Change the header color to blue"
- "Add a tooltip to the settings icon"

*(Truly atomic: no edge cases, no error states to design, happy path IS the complete implementation)*

## Stating Your Routing Decision

**Bug:**
```
Sounds like a bug - [X] isn't working as expected. Let me help you investigate.
```
Then invoke bug-planning skill.

**Technical Epic:**
```
This is a large technical initiative - no user-facing features, just coordinated technical work. Let's break it down into chores.
```
Then invoke epic-planning skill with context indicating technical epic.

**Epic:**
```
This is a larger initiative with multiple features. Let's break it down.
```
Then invoke epic-planning skill.

**Feature (UX exploration):**
```
This adds new user-facing behavior with some design choices to explore. Let me suggest a few approaches.
```
Then invoke feature-planning skill.

**Feature (edge cases):**
```
This has edge cases worth handling separately - let's make it work first, then handle the error states.
```
Then invoke feature-planning skill.

**Chore:**
```
This is technical work with a clear implementation path. Let me help you plan it out.
```
Then invoke chore-planning skill.

**Simple improvement:**
```
This is a straightforward change. Let me implement it.
```
Then invoke simple-improvement skill.

---

**If genuinely ambiguous (rare - should be <20% of cases):**
```
I could approach "[brief description]" as:
- A **simple improvement** - implement it directly (no edge cases to worry about)
- A **feature** - sequence it (make it work first, then handle edge cases)

Are there edge cases worth handling separately, or is this truly atomic?
```

Only ask when you truly cannot decide based on signals and context.

### Step 4: Invoke Target Skill

After stating your routing decision, immediately invoke the appropriate skill using the Skill tool:
- `bug-planning`
- `chore-planning`
- `feature-planning`
- `epic-planning`
- `simple-improvement`

**This skill ends after invocation.** The target skill takes over.
