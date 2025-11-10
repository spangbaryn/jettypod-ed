---
name: devpod-discovery
description: Facilitates DevPod discovery conversations at epic and feature levels. Only trigger when CLAUDE.md contains <discovery_phase> tag, or user explicitly asks 'show me discovery options' or 'let me explore approaches'. Do NOT trigger for fresh projects - CLAUDE.md immediate action handles that.
---

# DevPod Discovery Facilitator

This Skill guides users through discovery at three different levels, each with different questions and outputs.

## STEP 1: Detect Discovery Level

Check CLAUDE.md to determine which discovery level is active:

**If you see `<discovery_phase>` with `Level: project`:**
→ Follow [PROJECT-DISCOVERY.md](PROJECT-DISCOVERY.md) protocol

**If you see current work is an Epic with architectural decisions needed:**
→ Follow [EPIC-DISCOVERY.md](EPIC-DISCOVERY.md) protocol

**If you see current work is a Feature in discovery phase:**
→ Follow [FEATURE-DISCOVERY.md](FEATURE-DISCOVERY.md) protocol

**If user mentions discovery but no discovery_phase context exists:**
→ Ask which level: "Are we discovering the overall project concept, an epic's technical approach, or a specific feature implementation?"

## STEP 2: Follow the Appropriate Protocol

Once you've identified the level, follow that protocol exactly. Each level has:
- REQUIRED OPENING statement (say verbatim to user)
- Step-by-step instructions
- 3-options presentation template
- Completion requirements

## The Three Levels

### Project-Level Discovery
- **Question:** Does the overall concept work? What's the right platform/architecture?
- **Examples:** Web vs mobile vs desktop, monolith vs microservices, architecture foundation
- **Output:** Platform decision, architectural foundation, core approach documented

### Epic-Level Discovery
- **Question:** What technical approach should span multiple features in this epic?
- **Examples:** Real-time (WebSockets vs SSE), Offline-first (sync strategy), AI integration (which service)
- **Output:** Architectural decision documented for the epic
- **Note:** Not all epics need discovery - only when technical approach affects multiple features

### Feature-Level Discovery
- **Question:** How should this specific feature work?
- **Examples:** Simple form vs advanced form, basic chart vs interactive dashboard
- **Output:** Implementation approach selected, BDD scenarios written

## Common Pattern: 3-Options Template

ALL three levels use this pattern when presenting approaches:

```
**Option 1: Simple** [quickest to build]
- **Pros**: ✅ [2-3 specific advantages]
- **Cons**: ❌ [2-3 specific trade-offs]

**Option 2: Balanced** [good mix of features and effort]
- **Pros**: ✅ [2-3 specific advantages]
- **Cons**: ❌ [2-3 specific trade-offs]

**Option 3: Advanced** [most features, most complex]
- **Pros**: ✅ [2-3 specific advantages]
- **Cons**: ❌ [2-3 specific trade-offs]

**Additional options considered but not recommended:**
- *Simple alternative*: [Brief description] - Not selected because [1-line reason]
- *Balanced alternative*: [Brief description] - Not selected because [1-line reason]
- *Advanced alternative*: [Brief description] - Not selected because [1-line reason]

**Would you like me to create working prototypes of these options?**
```

**CRITICAL:** Always ask before building prototypes. User must explicitly confirm.

## Key Principles

1. **Be prescriptive** - Follow the scripts exactly, don't improvise
2. **Set expectations** - Tell user what to expect upfront
3. **No time estimates** - Never mention how long something takes
4. **Ask before prototyping** - Always get explicit confirmation
5. **Document decisions** - Record winner and rationale
6. **Call backend commands** - You execute the devpod commands, user doesn't

Now proceed to the appropriate level-specific protocol.
