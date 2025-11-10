---
name: epic-discover
description: Guide epic planning with feature brainstorming and optional architectural decision prototyping. Use when user asks to plan an epic, mentions planning features for an epic, says "help me plan epic", or when they just created an epic and want to break it down into features.
---

# Epic Discovery Skill

Guides Claude through comprehensive epic planning including feature identification and architectural decisions.

## Instructions

When this skill is activated, you are helping plan an epic. Follow this structured approach:

### Step 1: Understand the Epic

You'll receive context about the epic being planned. Review:
- Epic title and description
- Project context
- Any parent context

### Step 2: Check Existing Decisions

**CRITICAL:** Before suggesting approaches, check if architectural decisions already exist for this epic:

```javascript
const { getDecisionsForEpic } = require('../../lib/decisions-helpers');
const epicDecisions = await getDecisionsForEpic(epicId);
```

If decisions exist, present them to the user:

```
🎯 **Existing Architectural Decisions for This Epic:**

[For each decision:]
- **[Aspect]:** [Decision]
  *Rationale:* [Why this was chosen]
  *Decided:* [Date]

These decisions were made previously. Before we continue:
1. Do these decisions still apply?
2. Should we revisit any of them?
3. Are there additional aspects we need to decide?
```

Only proceed with suggesting new architectural options if:
- No decisions exist yet, OR
- User confirms decisions need to be revisited, OR
- User identifies new aspects to decide

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

### Step 4: Architectural Decision (Optional)

After features are defined, ask if this epic needs a shared technical approach:

```
**Architectural question:** Does this epic need a shared technical decision?

For example:
- Which library/framework for this capability?
- What data structure or protocol?
- What architectural pattern?

Examples where architectural decisions matter:
- Real-time features: WebSockets vs SSE vs polling?
- Auth system: Which auth library and token strategy?
- Data sync: Optimistic vs pessimistic locking?

Should we explore different architectural approaches?
```

### Step 5A: If Architectural Decision Needed

If the epic needs architectural decision, suggest exactly 3 approaches:

```
Here are 3 different architectural approaches for [epic name]:

**Option 1: [Simple/Conservative approach name]**
- **Pros**: ✅ [2-3 advantages - proven, reliable, fast to implement]
- **Cons**: ❌ [2-3 trade-offs - limitations, constraints]
- **Technical Impact**: [How this affects the features in this epic]

**Option 2: [Balanced approach name]**
- **Pros**: ✅ [2-3 advantages - good balance]
- **Cons**: ❌ [2-3 trade-offs]
- **Technical Impact**: [How this affects the features in this epic]

**Option 3: [Advanced/Modern approach name]**
- **Pros**: ✅ [2-3 advantages - powerful, flexible]
- **Cons**: ❌ [2-3 trade-offs - complexity, learning curve]
- **Technical Impact**: [How this affects the features in this epic]

**Additional approaches considered but not recommended:**
- *[Alternative 1]*: [Brief] - Not selected because [reason]
- *[Alternative 2]*: [Brief] - Not selected because [reason]

Would you like me to create working prototypes of these architectural approaches?
```

### Step 5B: If Prototyping Needed

If user wants to prototype approaches:

1. Build 2-3 prototype approaches in `/prototypes/epic-[id]-[approach-name]/`
2. Each prototype should demonstrate the architectural difference
3. **Add prototype header**:
   ```
   // Prototype: Epic [epic-id] - [approach name]
   // Created: [date]
   // Purpose: Demonstrate [architectural aspect]
   // Decision: [to be filled after testing]
   ```
4. After user tests, help them choose the winner
5. Document the decision and rationale

### Step 5C: If Approach Already Known

If user already knows the approach or skips prototyping:

```
Which architectural approach works best for this epic?
```

Then record their decision.

### Step 6: Create Features and Complete Discovery

Once features are defined and architectural decision is made (if needed):

```
I'll create these features now:

[Run commands to create features]

jettypod work create feature "[Feature 1]" "[Description]" --parent=[epic-id]
jettypod work create feature "[Feature 2]" "[Description]" --parent=[epic-id]
...

[If architectural decision was made, confirm rationale first]

**Propose the rationale to the user:**

"I'm going to record this architectural decision:

Aspect: Architecture
Decision: [architectural approach chosen]
Rationale: [why this approach was selected]

Does this rationale capture why you chose this approach? (You can edit it if needed)"

WAIT for user to confirm or provide edited rationale.

**Then record with final rationale:**

jettypod work epic-implement [epic-id] \
  --aspect="Architecture" \
  --decision="[architectural approach chosen]" \
  --rationale="[user's confirmed/edited rationale]"

✅ Epic planning complete!

**Next step:** Plan your first feature
Run: jettypod work discover [feature-id]
Or talk to Claude Code: "Let's do feature discovery for #[feature-id]"
```

## Key Principles

1. **Feature brainstorming is always required** - Don't skip this even if architectural decision is clear
2. **Architectural decision is optional** - Not all epics need one (e.g., "Q1 Goals" is just grouping)
3. **Always suggest exactly 3 options** when architectural decision needed - Simple/Conservative, Balanced, Advanced
4. **Be specific about features** - Each feature should be user-facing capability
5. **Use the Approach Suggestion template** - Pros, Cons, Technical Impact format
6. **Suggest next step** - Always end with clear guidance on what to do next
7. **Use jettypod commands** - Create features using jettypod CLI, record decisions with epic-implement

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

## Validation

Before completing epic discovery, ensure:
- [ ] At least 2-3 features identified
- [ ] Features are user-facing capabilities (not technical tasks)
- [ ] Architectural decision documented if needed
- [ ] Features created in database
- [ ] User knows next step .jettypod work discover [feature-id])
