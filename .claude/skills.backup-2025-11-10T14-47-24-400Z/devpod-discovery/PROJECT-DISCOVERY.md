# Project-Level Discovery Protocol

Use this protocol when validating the overall project concept and choosing the platform/architecture foundation.

**Important:** Project discovery happens once at the start to establish the technical foundation.

---

## STEP 1: REQUIRED OPENING (Say this verbatim to user)

"👋 Hey there. It looks like you're kicking off a new project. Between you, me and DevPod, we're going to get something really cool off the ground that keeps your code maintainable, your development smooth, and your users happy.

**Here's what to expect:**
1. I'll help you define what users actually DO in your product
2. I'll suggest 3 different user experience approaches
3. We'll build throwaway prototypes to test the experiences (if needed)
4. You'll pick which experience works best
5. I'll break the project into epics so you have a clear plan
6. We'll choose the tech stack that fits (tech follows experience)
7. I'll record the decision and you're off to the races

Ready? Let's start simple: **What do users DO in this product? Walk me through it.**"

---

## STEP 2: Define the User Journey

After the user responds, help them articulate what users actually DO. Focus on concrete actions, not abstract vision.

**Ask:**
"Walk me through the user journey - from opening the product to getting value from it. What happens?"

**If they're uncertain about details, reassure them:**
"Not sure about some of these details yet? That's totally fine - we can explore those questions hands-on with prototypes."

**Good answers look like:**
- ✅ "A developer types commands to track work items and sees them in a tree"
- ✅ "A designer drags components onto a canvas to build a landing page"
- ✅ "A team member describes what they want and AI builds it for them"

**Bad answers look like:**
- ❌ "It solves the problem of productivity"
- ❌ "It's a platform for collaboration"
- ❌ "Users can do whatever they want"

**Listen for experience hints (not platform hints):**
- "Quick commands" → CLI or keyboard-driven workflow
- "Visual arrangement" → Drag-and-drop or canvas-based
- "Just tell it what to do" → Conversational or AI-driven
- "Browse and discover" → Gallery or feed-based

---

## STEP 3: Present 3 User Experience Approaches

You MUST present exactly 3 options using the template below.

**CRITICAL:** These are UX approaches, NOT tech stacks. We're prototyping what it FEELS LIKE to use the product.

**Adapt the options to the user's core workflow.** Examples:

### Example A: Work Tracking Tool

"Based on what you've described, here are 3 ways users could track their work:

**Option 1: Command-Line Workflow**
Type commands in terminal, see text output
- **Pros**: ✅ Fast for keyboard-driven devs ✅ Scriptable and automatable ✅ No context switching
- **Cons**: ❌ Not visual ❌ Steeper learning curve ❌ Hard to share with non-technical team
- **Experience**: `devpod create feature "User Auth"` → see text confirmation

**Option 2: Visual Dashboard**
Click to create, drag to organize, see charts
- **Pros**: ✅ Easy to grasp at a glance ✅ Intuitive for non-devs ✅ Beautiful visualizations
- **Cons**: ❌ Slower than keyboard ❌ Requires browser open ❌ More complex to build
- **Experience**: Open web app → click "New Feature" → fill form → drag into sprint

**Option 3: Conversational AI**
Tell Claude what you're working on, it tracks everything
- **Pros**: ✅ Natural language ✅ Zero learning curve ✅ Works in existing workflow
- **Cons**: ❌ Less explicit control ❌ Requires AI context ❌ Harder to audit
- **Experience**: "I'm working on user auth" → DevPod updates automatically

**Additional approaches considered but not recommended:**
- *Kanban board* - Not selected because your team prefers hierarchical trees
- *Git-based* - Not selected because you want separation from commits
- *Spreadsheet* - Not selected because too manual and error-prone

**Would you like me to create working prototypes of these experiences?**

Which ones interest you most? Or should we refine the approaches first?"

### Example B: Website Builder

"Based on what you've described, here are 3 ways users could build websites:

**Option 1: Template Selection**
Pick a template, fill in the blanks
- **Pros**: ✅ Fastest path to done ✅ Professional results ✅ No design skills needed
- **Cons**: ❌ Limited customization ❌ Looks like other sites ❌ Boxed in by template
- **Experience**: Browse templates → pick one → edit text/images → publish

**Option 2: Drag-and-Drop Editor**
Build from scratch, arrange components visually
- **Pros**: ✅ Total creative control ✅ Unique designs ✅ See changes live
- **Cons**: ❌ Slower to build ❌ Design skills helpful ❌ Can look unprofessional
- **Experience**: Blank canvas → drag header → drag hero → style → publish

**Option 3: Code-First with Live Preview**
Write HTML/CSS/JS, see results instantly
- **Pros**: ✅ Full power and control ✅ No abstraction layer ✅ Learn web dev
- **Cons**: ❌ Requires coding knowledge ❌ Slower for simple sites ❌ More to learn
- **Experience**: Code editor on left → live preview on right → deploy

**Additional approaches considered but not recommended:**
- *AI generates entire site* - Not selected because you want control
- *WordPress-style* - Not selected because too complex for beginners
- *Markdown-based* - Not selected because too limiting for custom designs

**Would you like me to create working prototypes of these experiences?**

Which ones interest you most? Or should we refine the approaches first?"

### Example C: Note-Taking App

"Based on what you've described, here are 3 ways users could take notes:

**Option 1: Linear Document**
Write top-to-bottom like a journal
- **Pros**: ✅ Familiar and simple ✅ Chronological context ✅ No organization needed
- **Cons**: ❌ Hard to find old notes ❌ No connections between ideas ❌ Gets cluttered
- **Experience**: Open app → type → scroll to see history

**Option 2: Networked Notes**
Link notes together like a wiki
- **Pros**: ✅ Discover connections ✅ Build knowledge graph ✅ Powerful search
- **Cons**: ❌ Requires linking discipline ❌ Can get messy ❌ Learning curve
- **Experience**: Create note → [[link]] to other notes → explore connections

**Option 3: Canvas-Based**
Arrange notes spatially on infinite canvas
- **Pros**: ✅ Spatial memory ✅ Visual clustering ✅ Flexible organization
- **Cons**: ❌ Harder on mobile ❌ Can become chaotic ❌ Requires zoom/pan
- **Experience**: Drop notes anywhere → arrange by proximity → zoom to navigate

**Additional approaches considered but not recommended:**
- *Folder hierarchy* - Not selected because too rigid
- *Tag-based only* - Not selected because hard to browse
- *Timeline view* - Not selected because locks you into chronology

**Would you like me to create working prototypes of these experiences?**

Which ones interest you most? Or should we refine the approaches first?"

---

## STEP 4: Build Experience Prototypes (Only After Explicit Confirmation)

**CRITICAL:** Do NOT start building until user explicitly says yes.

**IMPORTANT:** These prototypes validate the EXPERIENCE, not the tech stack. Build throwaway code that demonstrates what it FEELS LIKE to use each option.

If user confirms, follow these steps:

1. Create `/prototypes` directory at project root if it doesn't exist
2. For each selected UX option, build a minimal prototype that demonstrates the experience
3. Use naming: `YYYY-MM-DD-{experience-description}-{option}.{ext}`
   - Example: `2025-10-29-cli-workflow/`
   - Example: `2025-10-29-visual-dashboard/`
   - Example: `2025-10-29-conversational-ai/`
4. Add header comment to each prototype:
   ```
   // Prototype: [Project Name] - [UX Option]
   // Created: [Date]
   // Purpose: Validate [what this experience feels like]
   // Tech: [whatever is fastest to build this experience]
   // Decision: [outcome - filled in later]
   ```

**What to prototype for each experience type:**

**For CLI workflow:**
- Build a simple bash script or Node.js CLI that demonstrates the commands
- Focus on the interaction: what users type, what they see back
- Example: `devpod-cli-prototype.sh` that shows command → output flow

**For visual dashboard:**
- Build static HTML with CSS that shows the layout and components
- Use fake data to demonstrate what it looks like filled in
- Add minimal JavaScript to show interactions (click, drag, etc.)
- Example: `dashboard.html` that shows the UI and flow

**For conversational/AI:**
- Write a script or document showing the conversation flow
- Can be a simple chat interface or even just a text file showing the dialogue
- Example: `conversation-flow.md` showing user input → system response

**For canvas/spatial:**
- Build an HTML canvas or SVG demo showing the spatial arrangement
- Example: Drag-droppable elements on an infinite canvas

**Key principles:**
- Use whatever tech is FASTEST to demonstrate the experience
- Don't worry about production code quality - this is throwaway
- Focus on: Does this experience feel right for the job?
- Include fake data to make it realistic
- User should be able to "try it out" even if it's fake

5. After building, offer to open them:
   - Ask: "Want me to open these in your browser so you can try them out?"
   - If yes, use: `open /path/to/prototype/file.html`

6. Guide user through testing each prototype
   - Ask: "Which one felt natural?"
   - Ask: "Which workflow fits how you think about this problem?"
   - Ask: "Which would you actually use?"

---

## STEP 5: Break Project Into Epics

After user picks the winning experience, propose how to break the project into epics.

**CRITICAL:** You propose the epic breakdown. The user validates/adjusts. Don't ask them to define epics - they don't know how.

**Say:**
"Based on what you described, here's how I'd break this into epics:

**Epic 1: [Name]** - [What it covers - specific capabilities]
**Epic 2: [Name]** - [What it covers]
**Epic 3: [Name]** - [What it covers]

Sound right?"

**Example epic breakdowns by project type:**

**CLI work tracking tool:**
- Epic 1: Core Work Item Management - Create, list, update work items
- Epic 2: Hierarchical Structure - Parent-child relationships, tree view
- Epic 3: Git Integration - Sync with branches, commit messages

**Visual website builder:**
- Epic 1: Template System - Browse, select, customize templates
- Epic 2: Content Editor - Edit text, images, basic styling
- Epic 3: Publishing - Deploy to hosting, custom domains

**Note-taking app:**
- Epic 1: Core Note Management - Create, edit, search notes
- Epic 2: Linking System - Wiki-style links between notes
- Epic 3: Organization - Tags, folders, filters

**After user validates (or adjusts), create the epics:**
```bash
devpod work create epic "[Epic Name]" "[Description]"
```

Run this command for each epic.

**After creating all epics, say:**
"✅ Epics created and added to your backlog.

**Quick tip:** Click the split terminal icon (⚏) in VS Code to view DevPod alongside this terminal. That way you can see both at once.

Run `devpod work tree` in that terminal to see your backlog - it's a visual tree of all your work."

---

## STEP 6: Choose Tech Stack (Now It's Obvious)

After user picks the winning experience, the tech stack decision becomes obvious.

**Ask:** "Now that we know the experience is [chosen option], let's pick the tech stack."

**The experience dictates the tech:**

**If CLI workflow won:**
- "You're building a CLI. Node.js or Python?"
- Consider: existing team skills, dependencies, ecosystem

**If visual dashboard won:**
- "You're building a visual web app. React? Vue? Plain HTML?"
- Consider: complexity, team experience, need for framework

**If conversational/AI won:**
- "You're building AI interaction. What's the core platform?"
- Consider: where conversations happen (Slack, web, CLI, etc.)

**If mobile-first won:**
- "You're building mobile. React Native or native Swift/Kotlin?"
- Consider: team skills, need for iOS + Android

**Present 2-3 tech options with pros/cons, then let user pick.**

---

## STEP 7: Record Decision

After user picks tech stack, you MUST call this command:

```bash
devpod project discover complete --winner="prototypes/[path]" --rationale="[experience choice] with [tech choice] because [reason]"
```

**Example:**
```bash
devpod project discover complete --winner="prototypes/2025-10-29-cli-workflow" --rationale="CLI workflow chosen for speed and developer focus. Node.js chosen because team already uses it and npm ecosystem is strong."
```

Then inform the user:

"✅ Project discovery complete! I've recorded your decision.

**Experience:** [chosen UX approach]
**Tech Stack:** [chosen tech]
**Rationale:** [why these were chosen]

The project foundation is set. Your CLAUDE.md has been updated.

**Next steps:**
1. Create your first epic for v1 scope
2. Break it into features
3. Start building

Ready to create that first epic?"

---

## Understanding Different Project Types

Adapt your UX exploration based on the project type:

**B2B SaaS:**
- Focus on: Multi-user workflows, data organization, reporting
- UX options might be: Dashboard view, list/table view, workflow automation
- Key question: "How do teams collaborate in this product?"

**Consumer Mobile:**
- Focus on: Quick actions, thumb-friendly, notifications
- UX options might be: Feed-based, card-swiping, menu-driven
- Key question: "What's the 10-second use case?"

**Internal Tool:**
- Focus on: Efficiency, keyboard shortcuts, power user features
- UX options might be: CLI, keyboard-driven web, simple forms
- Key question: "What's the fastest way to get this done?"

**Developer Tool:**
- Focus on: Integration, automation, configuration
- UX options might be: CLI, config files, GUI for setup
- Key question: "Where does this fit in the dev workflow?"

**Content/Creative Tool:**
- Focus on: Creation flow, organization, inspiration
- UX options might be: Canvas-based, template-driven, freeform
- Key question: "What's the creative process like?"

---

## Common Mistakes to Avoid

❌ **Don't jump to tech stack first** - Always define the UX before discussing React vs Vue
❌ **Don't ask about "project vision"** - Ask what users DO, not abstract goals
❌ **Don't skip v1 scoping** - Force the constraint: "2 weeks, what's in?"
❌ **Don't prototype the wrong thing** - Prototype experiences, not architectures
❌ **Don't build without confirmation** - Always get explicit "yes" before prototyping
❌ **Don't suggest 4+ options** - Exactly 3 UX approaches, no more
❌ **Don't forget to record decisions** - Call `devpod project discover complete` with rationale
❌ **Don't move to features without foundation** - Complete discovery before creating epics
❌ **Don't present platform-first options** - "Web vs mobile" comes AFTER experience is defined

---

## Success Criteria

You've completed project discovery when:
- ✅ Core user workflow is clearly defined (what users DO, not abstract vision)
- ✅ v1 scope is constrained (2 weeks, core features only)
- ✅ 3 UX approaches were presented and understood
- ✅ Experience prototypes were built and tested
- ✅ User picked winning experience based on feel, not tech
- ✅ Tech stack was chosen to support the experience
- ✅ Decision is recorded: `devpod project discover complete` has been called
- ✅ User understands the foundation and is ready to create their first epic

**The litmus test:** Can the user describe their product in one sentence that focuses on the user experience, not the technology?

✅ Good: "A CLI where developers type commands to track work items and see them in a tree"
❌ Bad: "A Node.js application with a SQLite database for work management"
