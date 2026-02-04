---
name: external-transition
description: Guide users through transitioning project from internal to external state when they mention launch, production deployment, or accepting real users. Explains infrastructure work creation and gets confirmation before executing.
---

# External Transition Skill

Guides users through transitioning their JettyPod project from internal (staging/preview) to external (production-ready) state.

## When to Activate

This skill should activate when the user expresses intent to:
- Launch to production
- Accept external/real users
- Deploy publicly
- Go live
- Prepare for production
- Make the project production-ready
- Similar language indicating readiness for customer/public access

## Instructions

When this skill is activated, follow this structured approach:

### Step 1: Explain the Transition

**CRITICAL:** Do not execute anything yet. First explain what this transition means.

Say to the user:

```
You're ready to transition to external state. Here's what that means:

🏗️  **Infrastructure Work Items Will Be Created:**

I'll create an "Infrastructure Readiness" epic with 15 work items across 4 categories:

• **Security Infrastructure (5 items)**
  - Input validation on public endpoints
  - SQL injection prevention
  - XSS protection
  - Rate limiting on public APIs
  - Authentication/authorization

• **Monitoring Setup (3 items)**
  - Error tracking integration
  - Performance monitoring
  - Audit logging

• **Infrastructure Setup (4 items)**
  - Database backup automation
  - Rollback procedures tested
  - Load testing completed
  - Graceful degradation under load

• **Compliance (3 items)**
  - Privacy policy
  - Data retention policy
  - Security headers implemented

📦 **Production Chores Will Be Generated:**

For each feature currently in stable mode, I'll:
  • Generate production scenarios from your chosen standards
  • Append scenarios to the feature's BDD file
  • Create production chores (security, scale, compliance)
  • Move features to production mode and reopen them

This uses your feature's BDD scenarios as context for what needs hardening.

⚠️  **Mode Requirement Changes:**

After this transition, ALL customer-facing features MUST be built through Production mode (not Stable).

This change is essentially permanent - you're declaring that real users will access your project.

Ready to proceed? (yes/no)
```

### Step 2: Wait for Initial Confirmation

**CRITICAL:** Do NOT proceed without explicit confirmation from the user.

Wait for the user to respond with "yes" or similar affirmative response.

**🔄 WORKFLOW INTEGRATION: Start workflow tracking**

After receiving initial confirmation, register this skill execution:

```bash
jettypod workflow start external-transition
```

This creates an execution record for session resume (note: external-transition is project-level, not tied to a specific work item).

If they say "no" or express hesitation, ask what concerns they have or what they need to clarify.

### Step 3: Production Standards Selection

After user confirms, explain production standards and show preset options:

```
Before we transition, let's establish your production standards. These define what "production-ready" means for your project and will guide all future production work.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Choose Your Production Standards Preset
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 **Startup MVP**
Early-stage products, internal tools going external, prototypes with first users

Examples: Beta SaaS with first 20 customers, internal tool opened to partners, developer tool in early access, side project gaining traction

What you get:
  ✅ HTTPS/TLS, basic auth, structured logging
  ✅ Health checks, daily backups (24h RPO)
  ✅ Single region, 2 instances, 99.0% SLO
  ❌ No 24/7 on-call, no multi-region

Cost: $200–$500/mo | Time: 1–2 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 **Production SaaS**
Established SaaS with paying customers, revenue dependency, uptime expectations

Examples: B2B SaaS with annual contracts, consumer app with 5k DAU, API service with enterprise customers, e-commerce platform

What you get:
  ✅ WAF + rate limiting, OAuth/OIDC
  ✅ APM with SLO dashboards, PII sanitization
  ✅ Zero-downtime deployments, 15min backups
  ✅ Multi-AZ, on-call rotation, 99.9% SLO
  ⚠️ Single region (multi-region optional)

Cost: $1.5k–$4k/mo infra + $2k–$3k/mo ops | Time: 4–6 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ **Enterprise**
Mission-critical systems, large customer base with strict SLAs, Fortune 500 customers

Examples: Enterprise SaaS for F500, financial services platform, infrastructure/DevOps tooling, global marketplace

What you get:
  ✅ Everything in Production SaaS, plus:
  ✅ Multi-region active-passive or active-active
  ✅ Advanced DDoS, mTLS, per-tenant encryption
  ✅ SOC2 Type II ready, chaos engineering
  ✅ PITR backups (1min RPO), 99.95% SLO

Cost: $5k–$15k/mo infra + $4k–$8k/mo ops | Time: 8–12 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏥 **Regulated (Healthcare, Finance, Gov)**
Products handling PHI, PCI, FedRAMP - strict compliance mandates, legal liability

Examples: Healthcare app (HIPAA), fintech/payments (PCI), government contractor (FedRAMP), legal tech, HR platform

What you get:
  ✅ Everything in Enterprise, plus:
  ✅ HIPAA/PCI/FedRAMP compliance controls
  ✅ Encryption at rest/in transit, MFA, PAM
  ✅ Quarterly pentesting, annual audits
  ✅ Real-time replication, 99.99% SLO

Cost: $10k–$30k/mo infra + $6k–$12k/mo ops + $20k–$50k/yr audits | Time: 12–24 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Which preset best matches your needs? (startup-mvp / production-saas / enterprise / regulated)
```

### Step 4: Refinement Questions

After user selects preset, ask 3-5 refinement questions to tailor standards:

**For All Presets:**

1. **What does your app do?** (free text)
   - Use to validate preset choice and infer compliance needs

2. **How many users do you expect?**
   - Options: 1-10 / 10-100 / 100-1k / 1k-10k / 10k+
   - Use to adjust performance budgets

3. **What happens if it's down for an hour?**
   - Options: No big deal / Users annoyed / Revenue loss / Contractual violation / Safety risk
   - Use to validate SLO and on-call needs

4. **What happens if you lose the last day of data?**
   - Options: Annoying / Bad but recoverable / Major problem / Catastrophic
   - Use to adjust RPO (24h → 15min → 1min)

5. **Does it handle sensitive data? If yes, what kind?**
   - Examples: Passwords only / Email addresses / Credit cards / Health records
   - Use to activate PII sanitization, encryption, compliance

**Additional for Production SaaS / Enterprise / Regulated:**

6. **Where are your users?** (Single country / North America / Europe / Global)
   - Use for data residency requirements

7. **Do you have compliance requirements?** (GDPR / CCPA / SOC2 / HIPAA / PCI / None yet)
   - Use to activate specific compliance standards

8. **How often do you want to deploy?** (Daily+ / Weekly / Monthly)
   - Use to recommend canary/feature flags

### Step 5: Generate and Show Recommendations

After collecting answers, use the `lib/production-standards-engine.js` to generate tailored standards.

**Execute this code:**

```javascript
const { generateStandards } = require('../../lib/production-standards-engine');

// Build input from collected answers
const input = {
  preset: '[user-selected-preset]', // startup-mvp, production-saas, enterprise, or regulated
  refinement: {
    user_count: '[answer-from-question-2]',      // e.g., '100-1k'
    downtime_impact: '[answer-from-question-3]',  // e.g., 'Users annoyed'
    data_loss_impact: '[answer-from-question-4]', // e.g., 'Annoying'
    sensitive_data: '[answer-from-question-5]'    // e.g., 'Passwords only'
  }
};

// Generate standards
const generatedStandards = generateStandards(input);
```

Then show recommendations to the user:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Recommended Production Standards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on:
  • Preset: [preset name]
  • App: [user's description]
  • Users: [user count]
  • Downtime impact: [impact level]
  • Data loss impact: [impact level]
  • Sensitive data: [yes/no + types]
  • Compliance: [requirements]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SECURITY ([X] standards)

  [✓] TLS/HTTPS enforcement
      Why: [reasoning]
      Test: [acceptance criteria]

  [✓] [Other security standards...]

✅ PERFORMANCE & SCALE ([X] standards)

  [✓] Performance budgets
      Why: [reasoning]
      Test: [acceptance criteria]

  [✓] [Other scale standards...]

✅ COMPLIANCE ([X] standards)

  [✓] [Compliance standards if applicable]

✅ INFRASTRUCTURE ([X] standards)

  [✓] [Infrastructure standards]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Estimated Cost: $[X]–$[Y]/mo

  Infrastructure: $[range]
  Operations: $[range]
  Drivers: [list of cost drivers]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Warnings (if any)

  • [Warning messages for edge cases]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Accept these standards? (yes / review / customize)
```

### Step 6: Handle Customization

If user chooses "review" or "customize", offer interactive customization:

```
Which standards would you like to adjust?

Commands:
  • disable <id>   - Disable a non-required standard
  • adjust <id>    - Modify threshold/config
  • show <id>      - Show details for a standard
  • done           - Accept current configuration
```

Allow user to toggle/adjust standards, then regenerate the summary.

### Step 7: Save Production Standards

After user accepts, save standards to `.jettypod/production-standards.json`.

**Execute this code:**

```javascript
const { saveStandards } = require('../../lib/production-standards-writer');

// Save the generated standards from Step 5
saveStandards(generatedStandards);
```

Then confirm to user:

```
✅ Production standards saved to .jettypod/production-standards.json

These standards will guide all production mode work going forward.
```

**🔄 WORKFLOW CHECKPOINT: Standards saved**

```bash
jettypod workflow checkpoint --step=7
```

### Step 8: Final Confirmation for Transition

Now confirm the actual state transition:

```
Ready to execute the external transition? (yes/no)
```

Wait for final "yes" confirmation.

### Step 9: Execute Transition

Only after receiving explicit "yes" confirmation, execute the transition using the Bash tool:

```bash
jettypod project external
```

### Step 10: Report Results

After the command completes successfully, relay the results to the user:

```
✅ **Transition Complete!**

Your project is now in external state.

📦 Created Infrastructure Readiness epic with:
  • 4 features (Security, Monitoring, Infrastructure, Compliance)
  • 15 chores across those features

🔍 Production mode work items are now visible in your backlog.

**Next Steps:**

1. Run `jettypod backlog` to see all infrastructure work items
2. Start working on infrastructure: `jettypod work start [epic-id]`
3. Remember: All customer-facing features must use Production mode from now on

**Want to start on infrastructure work now?**
```

**🔄 WORKFLOW INTEGRATION: Complete workflow**

```bash
jettypod workflow complete external-transition
```

This marks the `external_transition_complete` gate as passed. The project is now in external state with production standards configured.

### Step 11: Guide Next Actions

If the user wants to start infrastructure work:
- Suggest they run `jettypod backlog` to see the epic
- Offer to help them start work on specific infrastructure items

If they want to continue building features:
- Remind them that customer-facing features require Production mode
- Explain that Production mode includes security, scale, and compliance chores

## Key Principles

1. **Always explain before executing** - User must understand the implications
2. **Always get confirmation** - This is a significant project state change
3. **Emphasize no duplication** - Production chores already exist from stable mode
4. **Clarify mode requirements** - Customer-facing features need Production mode
5. **Guide next steps** - Help user understand what to do after transition

## Example Flow

**User:** "I think we're ready to launch this to real users"

**Claude:** [Explains transition as shown in Step 1]

**User:** "Yes, let's do it"

**Claude:** [Executes command via Bash tool]

**Claude:** [Reports results as shown in Step 4]

**User:** "What should I work on first?"

**Claude:** "I'd suggest starting with the Security Infrastructure items since those are critical for protecting user data. Want me to show you what's in that category?"

## Validation

Before completing external transition, ensure:
- [ ] User expressed intent to go external/production
- [ ] Transition implications explained clearly
- [ ] User provided initial confirmation
- [ ] Production standards preset shown (4 options)
- [ ] User selected preset
- [ ] Refinement questions asked (3-8 questions based on preset)
- [ ] Standards generated using production-standards-engine.js
- [ ] Recommendations shown with reasoning and acceptance criteria
- [ ] User accepted or customized standards
- [ ] Production standards saved to .jettypod/production-standards.json
- [ ] Final confirmation obtained
- [ ] Command executed successfully via Bash tool
- [ ] Results reported to user
- [ ] Next steps suggested
