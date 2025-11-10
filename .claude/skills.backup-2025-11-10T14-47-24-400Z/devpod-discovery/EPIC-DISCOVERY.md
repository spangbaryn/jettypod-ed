# Epic-Level Discovery Protocol

Use this protocol when an epic needs a shared technical approach that affects multiple features.

**Important:** Not all epics need discovery. Only use this when architectural decisions span features.

---

## When to Use This Skill (Automatic Detection)

**Trigger this skill automatically when:**
- User runs `devpod work epic-discover <id>`
- User runs `devpod work start <id>` on an epic with `needs_discovery=1`
- User says "let's do epic discovery" or "epic discovery for #X"
- User mentions "architectural decision" or "technical approach" for an epic
- User asks about WebSockets vs SSE, REST vs GraphQL, or similar technical choices
- User creates epic with `--needs-discovery` and asks what's next

**Proactive detection:**
- Before starting work on any epic, check `devpod work show <epic-id>`
- If `needs_discovery=1` and no decisions recorded, proactively suggest:
  "This epic needs architectural discovery. Want me to guide you through evaluating technical approaches?"

**Key phrases that should trigger this skill:**
- "work on epic [that has needs_discovery]"
- "start epic discovery"
- "architectural decision for epic"
- "which technical approach should we use"
- "prototype options for this epic"

---

## STEP 1: REQUIRED OPENING (Say this verbatim to user)

"We're doing epic discovery because this epic needs a shared technical approach across multiple features.

**Here's what to expect:**
1. I'll ask what technical decision affects multiple features
2. I'll suggest 2-3 architectural approaches
3. We'll prototype the key technical patterns
4. You'll evaluate which architecture handles your requirements
5. You'll tell me which approach won and why
6. I'll document the architectural decision for this epic

**Note:** We can make multiple decisions (architecture, design patterns, testing strategy, etc.) - each recorded separately.

Sound good? What's the technical question we need to answer?"

---

## STEP 2: Identify the Architectural Question

Help the user articulate what needs to be decided. Epic discovery is for questions like:

**Real-time collaboration:**
- WebSockets vs Server-Sent Events vs Long Polling?
- Operational Transform vs CRDT for conflict resolution?

**Offline-first capability:**
- IndexedDB vs LocalStorage vs SQLite WASM?
- Sync on reconnect vs background sync?

**AI/ML integration:**
- OpenAI vs Anthropic vs local models?
- Streaming vs batch processing?

**Data layer:**
- REST vs GraphQL vs tRPC?
- Client-side state management approach?

**Authentication/Authorization:**
- Session-based vs JWT vs OAuth flow?
- Where to enforce permissions (client/edge/API)?

Ask clarifying questions:
- Which features in this epic share this technical concern?
- What requirements must the solution meet?
- Any constraints? (cost, latency, team expertise)

---

## STEP 3: Present 3 Architectural Options

You MUST present exactly 3 options using the template below.

Adapt to the specific technical decision. Examples:

### Example A: Real-Time Collaboration

"Based on your requirements for real-time collaboration across 3 features, here are 3 approaches:

**Option 1: Simple - Server-Sent Events (SSE)**
One-way server-to-client updates
- **Pros**: ✅ Simple HTTP, no new protocol ✅ Auto-reconnect built-in ✅ Works through proxies
- **Cons**: ❌ One-way only (client can't push) ❌ Text-only messages ❌ Connection limit per domain

**Option 2: Balanced - WebSockets**
Full bidirectional communication
- **Pros**: ✅ True bidirectional ✅ Binary support ✅ Lower latency ✅ Industry standard
- **Cons**: ❌ More complex than SSE ❌ Proxy/firewall issues ❌ Manual reconnect logic

**Option 3: Advanced - WebRTC Data Channels**
Peer-to-peer communication
- **Pros**: ✅ Direct peer connections ✅ No server bandwidth ✅ Ultra-low latency
- **Cons**: ❌ Complex NAT traversal ❌ Signaling server still needed ❌ Peer discovery complexity

**Additional options considered but not recommended:**
- *Long polling* - Not selected because inefficient for real-time needs
- *Firebase Realtime Database* - Not selected because vendor lock-in and cost
- *Socket.IO library* - Not selected because adds abstraction layer we don't need

**Would you like me to create working prototypes of these options?**

Which ones interest you most? Or should we refine the approaches first?"

### Example B: State Management

"Based on your features sharing complex client state, here are 3 state management approaches:

**Option 1: Simple - React Context + useReducer**
Built-in React state management
- **Pros**: ✅ No dependencies ✅ Simple to understand ✅ Good for small/medium apps
- **Cons**: ❌ Re-renders can be inefficient ❌ No dev tools ❌ Boilerplate for complex state

**Option 2: Balanced - Zustand**
Lightweight external state
- **Pros**: ✅ Minimal boilerplate ✅ Good performance ✅ Simple API ✅ Dev tools available
- **Cons**: ❌ Another dependency ❌ Less ecosystem than Redux ❌ Newer/smaller community

**Option 3: Advanced - Redux Toolkit**
Full-featured state management
- **Pros**: ✅ Mature ecosystem ✅ Excellent dev tools ✅ Middleware for async ✅ Time-travel debugging
- **Cons**: ❌ More boilerplate ❌ Steeper learning curve ❌ Can be overkill for simple apps

**Additional options considered but not recommended:**
- *MobX* - Not selected because observable patterns add complexity
- *Jotai/Recoil* - Not selected because atomic state not needed for our use case
- *Plain useState* - Not selected because state crosses too many components

**Would you like me to create working prototypes of these options?**

Which ones interest you most? Or should we refine the approaches first?"

---

## STEP 4: Build Technical Prototypes (Only After Explicit Confirmation)

**CRITICAL:** Do NOT start building until user explicitly says yes.

If user confirms:

1. Create `/prototypes` directory at project root if it doesn't exist
2. For each selected option, build a technical proof-of-concept
3. Use naming: `YYYY-MM-DD-epic-{epic-name}-{option}.{ext}`
   - Example: `2025-10-29-epic-realtime-websockets/`
   - Example: `2025-10-29-epic-realtime-sse/`
4. Add header comment:
   ```
   // Epic Prototype: [Epic Name] - [Option Level]
   // Created: [Date]
   // Purpose: Validate [architectural approach]
   // Decision: [outcome - filled in later]
   ```
5. Focus on the technical pattern, not complete features
6. Demonstrate how multiple features would use this approach

**What to prototype:**
- The integration pattern
- Key technical constraints (latency, reliability)
- How features will interface with this approach
- Any performance or complexity implications

---

## STEP 5: Record Architectural Decision

After user evaluates prototypes and selects winner, you MUST call:

```bash
devpod work epic-implement <epic-id> --aspect="[decision type]" --decision="[approach]" --rationale="[reason]"
```

**The --aspect parameter** categorizes the type of decision (Architecture, Design Pattern, State Management, Testing Strategy, API Design, etc.)

**Example:**
```bash
devpod work epic-implement 42 --aspect="Architecture" --decision="WebSockets with Socket.io" --rationale="Bidirectional communication required for chat and notifications. Performance testing showed <50ms latency. Team has Socket.io experience."
```

**Multiple decisions per epic:**
You can call this command multiple times with different aspects. For example:
```bash
devpod work epic-implement 42 --aspect="Architecture" --decision="WebSockets" --rationale="Real-time bidirectional communication needed"
devpod work epic-implement 42 --aspect="State Management" --decision="Zustand" --rationale="Lightweight, good performance for shared connection state"
devpod work epic-implement 42 --aspect="Testing Strategy" --decision="Mock Socket.io in tests" --rationale="Fast unit tests without real connections"
```

Then inform the user:

"✅ Epic discovery decision recorded!

**Epic:** [epic name]
**Aspect:** [decision type]
**Decision:** [approach name]
**Rationale:** [why it was chosen]

This architectural decision has been documented. You can:
- Add more decisions for other aspects
- Start building features using this approach

Ready to continue?"

---

## When NOT to Use Epic Discovery

Skip epic discovery when:

❌ **Features are independent** - No shared technical concerns
- Example: Epic "Q1 Goals" with unrelated features

❌ **Decision is obvious** - Team already knows the approach
- Example: "Use our existing authentication system"

❌ **Constraints dictate solution** - Only one viable option
- Example: "Must use company-standard SQL database"

Instead, just create the epic and start building features.

---

## Common Epic-Level Questions

**Infrastructure/Platform:**
- Deployment strategy? (containers, serverless, VMs)
- Hosting provider? (AWS, Vercel, self-hosted)
- Database choice? (Postgres, MongoDB, DynamoDB)

**Integration:**
- API design pattern? (REST, GraphQL, gRPC)
- Authentication flow? (OAuth, SAML, API keys)
- Third-party service? (Stripe, Twilio, SendGrid)

**Performance:**
- Caching strategy? (Redis, CDN, in-memory)
- Background jobs? (queue system, cron, serverless)
- Search implementation? (ElasticSearch, Algolia, Postgres FTS)

**Real-time:**
- Notification delivery? (push, websocket, polling)
- Live updates? (SSE, websockets, polling)
- Collaborative editing? (OT, CRDT, lock-based)

---

## Success Criteria

You've completed epic discovery when:
- ✅ Architectural approach is validated with prototypes
- ✅ Multiple features can build on this foundation
- ✅ Technical constraints and trade-offs are understood
- ✅ Decision is recorded with rationale
- ✅ `devpod work epic-implement` has been called
- ✅ Team is ready to build features using this approach
