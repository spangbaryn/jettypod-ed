# Feature-Level Discovery Protocol

Use this protocol when figuring out how a specific feature should work before building it.

---

## STEP 1: REQUIRED OPENING (Say this verbatim to user)

"We're doing feature discovery to figure out how this feature should work before building.

**Here's what to expect:**
1. I'll ask about the feature requirements
2. I'll suggest 2-3 implementation approaches with pros/cons
3. We'll build prototypes of the promising options
4. You'll test them and tell me which works best
5. I'll record your decision and create BDD scenarios
6. Then we move to Speed Mode to build it for real

Sound good? Let's start - what feature are we building?"

---

## STEP 2: Gather Feature Requirements

After the user responds, ask these questions to understand the feature:

**Core questions:**
- What problem does this feature solve?
- Who uses this feature?
- What's the core workflow or interaction?
- What data is involved?
- Any constraints? (performance, existing code, dependencies)

**Listen for complexity hints:**
- "Just need something simple" → Lean toward Simple option
- "Power users need control" → Lean toward Advanced option
- "Balance ease and power" → Lean toward Balanced option

**Look for similar features:**
- "Like the X feature but for Y" → Reference existing patterns
- "Totally new capability" → More exploration needed

---

## STEP 3: Present 3 Implementation Options

You MUST present exactly 3 options using the template below.

The three levels represent complexity/features, NOT time to build:
- **Simple:** Minimal features, basic UX, quick to understand
- **Balanced:** Good feature set, polished UX, reasonable complexity
- **Advanced:** Full features, sophisticated UX, higher complexity

Adapt to the feature context. Examples:

### Example A: Expense Entry Form

"Based on your requirements for expense tracking, here are 3 implementation approaches:

**Option 1: Simple - Basic Form**
Single page with essential fields only
- **Pros**: ✅ Fast to use ✅ No learning curve ✅ Mobile-friendly ✅ Easy validation
- **Cons**: ❌ No receipt attachment ❌ Limited categories ❌ No draft saving

**Option 2: Balanced - Multi-Step Form with Attachments**
Wizard-style form with photo upload
- **Pros**: ✅ Receipt photos ✅ Category autocomplete ✅ Save drafts ✅ Better validation
- **Cons**: ❌ More clicks ❌ Requires file storage ❌ Slightly complex

**Option 3: Advanced - Smart Expense Capture**
OCR receipt scanning with auto-fill
- **Pros**: ✅ Scan receipts automatically ✅ AI category suggestion ✅ Bulk upload ✅ Audit trail
- **Cons**: ❌ Needs OCR service ❌ Complex error handling ❌ Higher cost per scan

**Additional options considered but not recommended:**
- *Voice entry* - Not selected because accuracy issues outweigh convenience
- *Email-based entry* - Not selected because requires email parsing infrastructure
- *Spreadsheet upload* - Not selected because doesn't match single-expense workflow

**Would you like me to create working prototypes of these options?**

If yes, which ones interest you most? Or should we refine the approach first?"

### Example B: User Dashboard

"Based on your requirements for a user dashboard, here are 3 implementation approaches:

**Option 1: Simple - Card Grid**
Static cards showing key metrics
- **Pros**: ✅ Clear information hierarchy ✅ Responsive layout ✅ Fast to load
- **Cons**: ❌ No customization ❌ Fixed metrics ❌ No drill-down

**Option 2: Balanced - Draggable Widgets**
User can arrange and show/hide cards
- **Pros**: ✅ Personalization ✅ Save layouts ✅ More widget types ✅ Better engagement
- **Cons**: ❌ Need drag-drop library ❌ State management complexity ❌ Mobile UX tricky

**Option 3: Advanced - Customizable Dashboard Builder**
User creates custom widgets with queries
- **Pros**: ✅ Fully customizable ✅ Power user delight ✅ Chart types ✅ Data flexibility
- **Cons**: ❌ Complex UI ❌ Query builder needed ❌ Performance concerns ❌ Steep learning curve

**Additional options considered but not recommended:**
- *Pre-built templates* - Not selected because users want specific metrics
- *Single-page table* - Not selected because doesn't leverage visual hierarchy
- *Full BI tool integration* - Not selected because over-engineered for basic dashboard

**Would you like me to create working prototypes of these options?**

If yes, which ones interest you most? Or should we refine the approach first?"

---

## STEP 4: Build Feature Prototypes (Only After Explicit Confirmation)

**CRITICAL:** Do NOT start building until user explicitly says yes.

If user confirms:

1. Create `/prototypes` directory at project root if it doesn't exist
2. For each selected option, build a functional prototype
3. Use naming: `YYYY-MM-DD-{feature-name}-{option}.{ext}`
   - Example: `2025-10-29-expense-entry-simple.html`
   - Example: `2025-10-29-expense-entry-balanced.js`
   - Example: `2025-10-29-expense-entry-advanced/` (if multi-file)
4. Add header comment to each:
   ```
   // Prototype: [Feature Name] - [Option Level]
   // Created: [Date]
   // Purpose: [what this explores]
   // Decision: [outcome - filled in later]
   ```
5. Make prototypes interactive and testable
6. Use realistic data so user can evaluate the UX

**Prototype Guidelines:**
- Functional, not just mockups
- Demonstrate the key interaction
- Show the complexity level honestly
- Use placeholder data/APIs if needed
- Keep minimal - prove the concept only

---

## STEP 5: Write BDD Scenarios

After user selects the winning approach, generate BDD scenarios covering:

**Happy path (Speed Mode scenarios):**
```gherkin
Feature: Expense Entry

Scenario: User submits valid expense
  Given I am on the expense entry form
  When I enter amount "50.00"
  And I select category "Meals"
  And I enter description "Team lunch"
  And I click "Submit"
  Then I should see "Expense submitted successfully"
  And expense should appear in my list
```

**Additional scenarios (for Stable Mode later):**
- Error handling (invalid amounts, missing fields)
- Edge cases (maximum amounts, special characters)
- Data integrity (duplicate prevention, required fields)

Create the feature file:
```bash
mkdir -p features
touch features/{feature-name}.feature
```

Write scenarios to the file using the Edit or Write tool.

---

## STEP 6: Record Decision

After scenarios are written, you MUST call:

```bash
devpod work implement <feature-id> --winner="prototypes/[path]" --rationale="[user's reason]"
```

**Example:**
```bash
devpod work implement 186 --winner="prototypes/2025-10-29-expense-entry-simple.html" --rationale="Simple form won - users want speed over features. Advanced was overengineered for MVP."
```

Then inform the user:

"✅ Feature discovery complete! I've recorded your decision and created BDD scenarios.

**Feature:** [feature name]
**Winner:** [option name]
**Rationale:** [why it was chosen]
**Scenarios:** features/[feature-name].feature

The feature is ready to build in Speed Mode. Shall I start the implementation?"

---

## Common Feature Patterns

### Forms
- **Simple:** Basic HTML form, client-side validation
- **Balanced:** Multi-step, real-time validation, draft saving
- **Advanced:** Dynamic fields, AI assistance, bulk operations

### Lists/Tables
- **Simple:** Static list with basic sorting
- **Balanced:** Filters, search, pagination
- **Advanced:** Virtual scrolling, column customization, bulk actions

### Charts/Visualizations
- **Simple:** Static chart from library (Chart.js)
- **Balanced:** Interactive charts with drill-down
- **Advanced:** Custom D3 visualizations, animations

### Editor/Input
- **Simple:** Textarea with basic formatting
- **Balanced:** WYSIWYG editor (TinyMCE/Quill)
- **Advanced:** Block editor (like Notion), collaborative editing

### Navigation/Search
- **Simple:** Static menu, keyword search
- **Balanced:** Dynamic menu, faceted search
- **Advanced:** Command palette, AI-powered search

---

## Prototype Conventions

**File Structure:**
```
/prototypes/
  2025-10-29-feature-simple.js      ← Single file for simple
  2025-10-29-feature-balanced/      ← Folder for multi-file
    index.html
    app.js
    styles.css
  2025-10-29-feature-advanced/      ← Folder for complex
    /components
    /utils
    index.html
```

**Header Format:**
```javascript
// Prototype: Expense Entry - Simple
// Created: 2025-10-29
// Purpose: Validate basic form approach with essential fields only
// Decision: WINNER - chosen for MVP simplicity and speed
```

**Keep as learning artifacts:**
- Don't delete prototypes after picking winner
- They document the decision-making process
- Future features can reference them
- They show what was considered and why

---

## Common Mistakes to Avoid

❌ Don't build prototypes without explicit confirmation
❌ Don't present more than 3 main options (overwhelming)
❌ Don't forget to write BDD scenarios
❌ Don't skip recording the decision with devpod command
❌ Don't move to Speed Mode without completing discovery
❌ Don't make all options similar (differentiate complexity levels)

---

## Success Criteria

You've completed feature discovery when:
- ✅ User understands what they're building
- ✅ Implementation approach validated with prototypes
- ✅ BDD scenarios written (happy path minimum)
- ✅ Decision recorded with winner and rationale
- ✅ `devpod work implement` has been called
- ✅ Ready to enter Speed Mode for implementation
