# Natural Language Coding Feature Development Guide

## The Two-Phase Model

**Everything you build has two phases:**

### 1. Discovery Phase
Figure out what to build through prototyping
- Build 2-3 working prototypes
- Test different approaches
- Pick the winner
- Write BDD scenarios
- Archive prototypes in `/prototypes`

### 2. Implementation Phase
Build it through progressive modes
- **Speed Mode:** Prove it works (happy path only)
- **Stable Mode:** Make it dependable (error handling, edge cases, internal use)
- **Production Mode:** Safe, compliant, scalable (security + scale + compliance for external users)

**Applies to all levels:**
- **Project Discovery/Implementation:** Does the overall concept work? Build the product.
- **Epic Discovery/Implementation:** What technical approach for related features? Build the features.
- **Feature Discovery/Implementation:** How should this feature work? Build the feature.

---

## Project States

Projects exist in two states based on who accesses them:

**Internal Project:**
- Team only, staging/preview environments
- Dependable infrastructure (auth, database, hosting)
- No external users or customers
- No security hardening required
- Examples: Localhost, Vercel preview, Railway staging, internal tools

**External Project:**
- Customers and public can access
- Security hardened (penetration tested, audited)
- Scales to external user load
- Compliance certified (GDPR, HIPAA, SOC2)
- 24/7 monitoring
- Examples: Public production URLs, customer-facing apps, public APIs

**Transition:** Going from Internal to External is itself a set of features (security hardening, monitoring setup, compliance) that go through Discovery → Implementation.

**Critical:** Once ANY external users (customers, public) can access your project, it must be External. Staging can stay Internal.

---

## Feature Modes (Implementation Phase)

Features progress through three modes during implementation, always in order:

### 1. Speed Mode (Checkpoint)
- **Purpose:** Prove the approach works
- **Duration:** Quick pass-through, don't stay here
- **Standards:** Cover happy path only, single file, localStorage, basic try/catch
- **Next:** Immediately elevate to Stable

### 2. Stable Mode (Where Features Live)
- **Purpose:** Make it dependable for internal use
- **Who uses it:** Your team, staging environments, internal tools
- **Standards:** All Speed scenarios plus comprehensive error handling, edge cases, input validation, light refactor
- **Security:** None required (walled garden)
- **Next:** Elevate to Production only if project is External and feature is customer-facing

### 3. Production Mode (Customer-Facing)
- **Purpose:** Safe, compliant, and scalable for external users
- **Who uses it:** Customers, public, external users
- **Standards:** All Stable scenarios plus comprehensive security, scale, and compliance coverage
- **Three Pillars:** Security + Scale + Compliance
- **Required:** ANY customer-facing features in External Projects

---

## How Project States and Feature Modes Interact

**Internal Project:**
- Features: Speed → Stable
- All features stay in Stable Mode
- No Production Mode features (project isn't External)

**External Project:**
- Customer-facing features: Speed → Stable → Production
- Internal-only features: Speed → Stable (admin tools, dashboards team uses)
- Project infrastructure provides security/scale/compliance baseline

---

## Discovery Phase (All Levels)

**When to use:** Multiple viable approaches exist, or you don't understand the problem yet.

**Purpose:** Figure out what to build before Implementation Phase.

### Project-Level Discovery
- Does the overall concept work?
- Is the core user flow viable?
- Should this be web/mobile/desktop?

### Epic-Level Discovery
- What's the right technical approach for this set of related features?
- Which architecture handles our requirements?
- Examples: Real-time collaboration (WebSockets vs SSE?), Offline-first (which sync strategy?)

**Note:** Not all epics need discovery. Some are just groupings of independent features.

### Feature-Level Discovery
- How should this specific feature work?
- Which UI pattern works best?
- What's the right level of complexity?

**Process (same at all levels):**
1. Build 2-3 working prototypes
2. Test each approach
3. Pick the winner
4. Write BDD scenarios
5. Move prototypes to `/prototypes` directory

**Output:** Clear direction + BDD scenarios (prototypes archived for reference)

**Next:** Enter Implementation Phase, starting with Speed Mode.

---

## Implementation Phase: Speed Mode

**Purpose:** Validate the approach works. This is a checkpoint you pass through quickly.

**Process:**
1. Build code that passes core BDD scenarios (happy path)
2. Focus on happy path only
3. Use simple tech (single file, localStorage)
4. Verify it works
5. **Immediately elevate to Stable Mode**

**Standards:**
- BDD scenarios covering happy path only
- Single file when possible
- localStorage for data
- Basic try/catch on critical paths
- No edge case handling
- No comprehensive error handling

**Anti-pattern:** Staying in Speed Mode. Always elevate to Stable immediately.

---

## Implementation Phase: Stable Mode

**Purpose:** Make features reliable and dependable for internal use.

**Who uses it:** Your team, staging environments, preview deploys, internal tools. Never external users.

**No security required:** Stable Mode assumes walled garden. Only your team can access it.

**Elevation from Speed:**
1. Keep all Speed Mode tests (must still pass)
2. Add scenarios for:
   - Error handling (invalid inputs, network failures)
   - Edge cases (empty states, boundary conditions)
   - Data integrity (corrupt data handling)
   - User-facing error messages
3. Enhance code to pass all scenarios

**Standards:**
- All Speed scenarios plus error/edge case coverage
- Proper error handling with clear messages
- Input validation
- Edge case handling
- Graceful degradation
- Data integrity checks
- Code organized into modules
- Integration tests with other features

**Light refactor (end of Stable Mode):**
1. Extract obvious duplication
2. Fix poor naming
3. Ensure basic error handling is present
4. Make code scannable (clear names, short functions)
5. Organize into logical files/folders
6. Remove dead code (commented code, unused functions)
7. Add minimal "why" comments for complex logic

**Who can use Stable Mode features:**
- Your internal team
- Staging environments (Vercel staging, Railway preview)
- Development/test environments
- Internal tools behind VPN/SSO
- Admin dashboards for team use only
- **Never:** External users, customers, public

---

## Implementation Phase: Production Mode

**Purpose:** Make features safe, compliant, and scalable for external users.

**The Three Pillars:**

### 1. Security
- Authentication and authorization
- Input sanitization and validation
- Encryption (data at rest and in transit)
- Protection against attacks (XSS, CSRF, injection)
- Security audit logging
- Rate limiting
- Security testing and audits

### 2. Scale
- Performance at 100+ concurrent users
- Response time <200ms
- Database optimization
- Caching strategy
- Load testing validated
- Graceful degradation under load
- Monitoring and alerting

### 3. Compliance
- GDPR/HIPAA/SOC2 requirements
- Audit trails for all data access
- Data retention and deletion policies
- Breach notification procedures
- Regular compliance audits
- Legal review

**Elevation from Stable:**
1. Keep all Stable Mode tests (must still pass)
2. Add scenarios covering security, scale, and compliance:
   - **Security:** Attack vectors, authorization bypass attempts, injection attacks, data leaks
   - **Scale:** Concurrent user load, performance degradation, rate limiting, caching failures
   - **Compliance:** Audit requirements, data retention, breach scenarios, regulatory edge cases
3. Enhance code to pass all scenarios

**When required:**
- ANY external users (customers, public)
- Public production URLs
- Real customers using your product
- Public APIs
- Handling money, PII, or health data
- Revenue-critical features

**NOT required for:**
- Staging/preview environments (still Internal)
- Internal admin tools your team uses
- Development/test environments

---

## When and How to Run Tests

**The challenge:** Running all tests before every commit kills momentum. Different tests have different speeds and purposes.

### Test Types and Speed

**BDD/Gherkin Scenarios (End-to-End Tests)**
- Test complete user flows
- Slowest (seconds to minutes per scenario)
- Your primary test type in this framework

**Integration Tests** (if you write them)
- Test how pieces work together
- Medium speed (seconds)
- Example: API endpoint + database

**Unit Tests** (if you write them)
- Test individual functions
- Fastest (milliseconds)
- Example: Date parsing function

### When to Run Tests

**During Active Development:**
- Run only scenarios for the feature you're working on
- Manual execution: `npm run test:feature` or similar
- Don't run everything constantly

**Before Committing (Pre-commit Hook):**
- **DON'T run BDD scenarios** (too slow)
- Run fast checks only: linting, formatting, unit tests if you have them
- Keep pre-commit under 5 seconds

**Before Pushing:**
- Run all scenarios for features you changed (manual)
- Speed Mode: Run happy path scenarios (30 seconds - 2 minutes)
- Stable Mode: Run full scenario suite (2-10 minutes)
- Make sure they pass before pushing

**In CI/CD Pipeline (Automatic after push):**
- Run ALL scenarios for the entire project
- This can take 10-30 minutes or more
- Blocks deployment if tests fail
- This is where slow tests belong

**Before Deployment:**
- CI/CD must be green (all tests passing)
- Sometimes additional smoke tests on staging

### Practical Workflow

```bash
# During development (manual, as needed)
npm run test:watch           # Auto-run tests for files you're editing
npm run test:feature-name    # Run scenarios for current feature

# Pre-commit hook (automatic, fast only)
npm run lint                 # Code style
npm run test:unit            # Unit tests (if you have them)
# NO BDD scenarios here

# Before pushing (manual)
npm run test:scenarios       # All BDD scenarios you changed

# CI/CD (automatic, everything)
npm run test:all             # Every scenario in the project
```

### Mode-Specific Test Running

**Speed Mode:**
- Run happy path scenarios manually after each change
- Quick feedback loop (30 seconds)
- No pre-commit hooks

**Stable Mode:**
- Run full scenario suite manually before committing feature
- Takes longer (2-10 minutes)
- Still no pre-commit hooks (too slow)
- CI/CD runs everything automatically

**Production Mode:**
- Run full scenario suite including security/scale/compliance
- Takes much longer (10-30+ minutes)
- Definitely in CI/CD only
- May need parallel test execution

### Key Principles

1. **Fast tests in pre-commit** - Keep it under 5 seconds
2. **Slow tests in CI/CD** - Let the pipeline handle full suites
3. **Run subset during development** - Only what you're working on
4. **CI blocks deployment** - All tests must pass before production
5. **Don't let slow tests kill momentum** - Manual execution during dev is fine

**The golden rule:** If a test suite takes more than 10 seconds, don't put it in a pre-commit hook.

---

## Complete Workflows

### Starting a New Project

**1. Project Discovery (optional)**
- Build 2-3 project prototypes to validate concept
- Test core user flows
- Pick winning approach
- Write initial scenarios
- Move prototypes to `/prototypes`

**2. Setup Internal Project**
- Initialize repo
- Set up database (if needed)
- Basic infrastructure (auth, hosting)
- Set up testing framework (Gherkin/BDD scenarios)
- Configure CI/CD pipeline for automated test runs
- Pre-commit hooks for fast checks only (linting, no BDD tests)
- Status: Internal Project

**3. Build Features**
- Break work into Epics → Features
- For each feature: Discovery → Implementation (Speed → Stable)
- All features live in Stable Mode (internal use)

**4. Go External (when ready)**
- Treat "External Project Infrastructure" as an epic with features:
  - Feature: Security hardening (Discovery → Speed → Stable → Production)
  - Feature: Monitoring setup (Discovery → Speed → Stable → Production)
  - Feature: Compliance certification (Discovery → Speed → Stable → Production)
- Status: External Project

**5. Elevate Customer-Facing Features**
- Customer-facing features → Production Mode
- Internal-only features → Stay in Stable Mode

**6. Launch**
- External users can access
- Customer-facing features are Production Mode

### Building a New Epic

**1. Epic Discovery (if needed)**
- Does this epic need a shared technical approach?
- Prototype architecture options if technical approach affects multiple features
- Examples: Real-time collaboration, offline-first, AI-powered search
- Pick winner, define approach

**2. Break into Features**
- Define individual features within epic
- Add to backlog
- Prioritize

**3. Implement Features**
- Each feature: Discovery → Implementation (Speed → Stable → Production if needed)

### Building a New Feature

**1. Feature Discovery (if needed)**
- Prototype 2-3 approaches
- Pick winner, write scenarios
- Define chores (technical tasks)
- Move prototypes to `/prototypes`

**2. Speed Mode**
- Build all chores that pass happy path scenarios
- Verify it works
- **Don't stop here**

**3. Stable Mode**
- Add scenarios for errors and edge cases
- Elevate all chores to Stable together
- Light refactor
- Feature ready for internal use

**4. Production Mode (if needed)**
- Project is External AND feature is customer-facing
- Add scenarios for security/scale/compliance
- Feature safe, compliant, and scalable

---

## Work Item Hierarchy

```
Epic (business initiative)
└── Feature ← MODES SET HERE
    └── Chore (technical task, inherits feature mode)
```

**Modes are set at the Feature level.** All chores within a feature inherit that mode.

**Feature progression:**
```
All chores built in Speed Mode
↓
All chores elevated to Stable Mode together
↓
All chores elevated to Production Mode together (if needed)
```

Features elevate as complete units, never piecemeal.

---

## Decision Framework

### For Projects

**Question 1:** Are you still prototyping the project concept?
- **YES** → Project Discovery
- **NO** → Question 2

**Question 2:** Will external users (customers, public) access this?
- **NO** (team only, staging) → Internal Project
- **YES** (public, customers) → Build "External Project Infrastructure" features to transition

### For Epics

**Question 1:** Does this epic need a shared technical approach across features?
- **YES** → Epic Discovery (prototype architecture options)
- **NO** → Just break into features

### For Features

**Question 1:** Do you know what to build?
- **NO** → Feature Discovery
- **YES** → Speed Mode, then Question 2

**Question 2:** You just finished Speed Mode. Elevate to:
- **Always** → Stable Mode first
- **Then** → Production Mode (only if project is External and feature is customer-facing)

---

## Mode Comparison Table

| Aspect | Speed | Stable | Production |
|--------|-------|--------|------------|
| **Purpose** | Prove it works | Make it dependable | Safe, compliant, scalable |
| **Users** | None (checkpoint) | Internal only | External users |
| **Test Coverage** | Happy path only | + Errors & edge cases | + Security, scale, compliance |
| **Focus** | Does it work? | Can it handle problems? | Is it production-ready? |
| **Stay here?** | NO (pass through) | YES (if Internal) | YES (if External) |
| **Security** | None | None (walled garden) | Full hardening |
| **Refactor** | None | Light refactor | As needed |

---

## Common Mistakes

**1. Staying in Speed Mode**
- ❌ "Feature works, ship it!"
- ✓ "Feature works, now add error handling (Stable Mode)"

**2. Launching Internal Project to public without hardening**
- ❌ "Let's launch publicly with our Internal Project"
- ✓ "Build External Project Infrastructure features first (security, monitoring, compliance)"

**3. Skipping Speed Mode**
- ❌ "I'll build it in Stable Mode from the start"
- ✓ "Always pass through Speed, then elevate to Stable"

**4. Starting as External Project**
- ❌ "We'll have users eventually, so start External"
- ✓ "Start Internal, build External Infrastructure features when ready"

**5. Inconsistent feature modes in External Projects**
- ❌ "Customer-facing feature is Stable Mode in External Project"
- ✓ "Customer-facing features must be Production Mode in External Projects"

---

## Key Principles

1. **Two phases for everything** - Discovery (figure it out) → Implementation (build it)
2. **Discovery at all levels** - Project, Epic (if needed), Feature
3. **Speed is a checkpoint** - Pass through quickly, don't stay
4. **Stable is for internal use** - Team, staging, never customers
5. **Production is for customers** - External-facing features only
6. **Infrastructure is just features** - Going External = building infrastructure features
7. **Tests accumulate** - Speed → Stable → Production (never delete)
8. **Features elevate as units** - All chores together
9. **Project state sets ceiling** - Can't have Production features in Internal Project

---

## Example: Expense Tracker

**Project Discovery**
- Built 3 approaches: mobile-first, web-first, desktop app
- Tested with team
- Chose web-first React app

**Setup Internal Project**
- Initialized repo, Postgres database, Vercel hosting
- Basic auth with Next.js

**Epic: Expense Management**
- Epic Discovery: Should we use OCR for receipts or manual entry?
  - Prototyped both
  - Manual entry won (OCR too complex for v1)
- Features defined: Expense Entry, Reports, Categories

**Build Expense Entry Feature**
- Feature Discovery: Form layout options
- Speed Mode: Form passing happy path scenarios
- Stable Mode: Added validation, error handling, edge cases
- Living in Stable (internal team using it)

**Build Reports Feature**
- Speed Mode: Basic chart generation
- Stable Mode: Error handling, empty states
- Living in Stable

**Decision: Go External**
- Epic: External Project Infrastructure
  - Feature: Security hardening (Discovery → Implementation)
  - Feature: Monitoring (Datadog setup)
  - Feature: GDPR compliance
- Status: External Project

**Elevate for Launch**
- Expense Entry → Production Mode (customers use it)
- Reports → Stay Stable (internal admin only)

**Result:** External Project, one Production feature (expense entry), one Stable feature (reports).

---

*Discovery figures it out. Implementation builds it. Speed proves it works. Stable makes it dependable. Production makes it safe, compliant, and scalable.*
