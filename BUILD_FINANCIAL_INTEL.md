# Build: Phase 6A — Financial Intelligence (Developer-First Kill Shot)

## Why This Matters
No permit software anywhere has this. PermitFlow is for GCs. This is for the developer writing the checks.
Every week of permit delay = thousands in carry costs. MeritLayer makes that visible and urgent.

## Stack
Next.js 15, tRPC, dark theme, Tailwind. All calculations are deterministic/formula-based — no external APIs.

---

## Feature 1: Hold Cost Calculator — `src/components/hold-cost-calculator.tsx`

A standalone component that can live in the project detail page (new "Financials" tab).

### UI
Dark card with form inputs:
- **Loan Amount** — number input, default empty, placeholder "$2,400,000"
- **Interest Rate (%)** — number input, default 7.0
- **Projected Delay (weeks)** — auto-populated from deadline forecast if available, also manually editable
- **Current Compliance %** — read from project data automatically

### Output (real-time as user types):
```
Weekly Carry Cost:     $3,230
Projected Total Delay: 3 weeks
Total Hold Cost Risk:  $9,692

If you complete 2 more compliance items this week:
→ Projected delay drops to 1 week
→ You save $6,461
```

### Formula:
```
weeklyCarryCost = (loanAmount * (interestRate / 100)) / 52
totalHoldCost = weeklyCarryCost * delayWeeks
```

### Styling:
- Large number display for key figures
- Red for hold cost (urgency)
- Green for "potential savings"
- "Every week matters. Complete your compliance items to reduce delay." CTA text

---

## Feature 2: Permit Fee Estimator — `src/components/permit-fee-estimator.tsx`

Pre-calculate Boston permit fees before filing. Boston ISD uses a public formula.

### Boston ISD 2024 Fee Schedule (encode this data):

**Building Permit Fees (new construction/addition):**
```javascript
const BUILDING_FEES = {
  // Per square foot (new construction)
  residential_new: { rate: 8.00, min: 150, description: 'New residential construction' },
  residential_addition: { rate: 6.00, min: 100, description: 'Residential addition' },
  commercial_new: { rate: 12.00, min: 200, description: 'New commercial construction' },
  commercial_addition: { rate: 9.00, min: 150, description: 'Commercial addition' },
  // Per unit (multi-family)
  multifamily_new: { ratePerUnit: 500, min: 500, description: 'New multi-family (per unit)' },
};

const TRADE_FEES = {
  electrical: { base: 75, perUnit: 15, description: 'Electrical permit' },
  plumbing: { base: 75, perUnit: 20, description: 'Plumbing permit' },
  gas: { base: 75, perUnit: 15, description: 'Gas permit' },
  hvac: { base: 100, perUnit: 25, description: 'HVAC/mechanical permit' },
};

const SPECIAL_FEES = {
  zba_variance: 250,
  zba_special_permit: 500,
  article80_small: 1500,
  article80_large: 5000,
  landmark_review: 300,
  bpda_review: 2500,
  demo_permit: 250,
};
```

### UI:
Form with:
- **Project Type** — dropdown: New Residential / Residential Addition / New Multi-family / Commercial / Commercial Addition
- **Square Footage** — number input
- **Number of Units** — number input (shown for multi-family)
- **Trade Work** — checkboxes: Electrical / Plumbing / Gas / HVAC
- **Special Reviews Needed** — checkboxes: ZBA Variance / ZBA Special Permit / Article 80 / BPDA Review / Landmark / Demo

Output (real-time calculation):
```
Fee Breakdown:
Building Permit:    $4,800
Electrical:         $390
Plumbing:           $415
HVAC:               $475
Article 80 (Small): $1,500
─────────────────────────
Total Estimated:    $7,580

Note: Fees are estimates based on Boston ISD 2024 schedule. 
Actual fees determined at permit counter.
```

---

## Feature 3: Soft Cost Tracker — DB + UI

Track professional fees and expenses tied to the project through the permit process.

### 3a. DB Schema addition in `src/db/schema.ts` (append only):
```typescript
export const softCosts = pgTable("soft_costs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'legal' | 'architectural' | 'engineering' | 'survey' | 'permit_fees' | 'consulting' | 'other'
  description: text("description").notNull(),
  vendor: text("vendor"),
  amount: integer("amount").notNull(), // cents
  paidAt: timestamp("paid_at"),
  isPaid: boolean("is_paid").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 3b. Migration — `drizzle/0006_soft_costs.sql`:
```sql
CREATE TABLE IF NOT EXISTS "soft_costs" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "category" text NOT NULL,
  "description" text NOT NULL,
  "vendor" text,
  "amount" integer NOT NULL,
  "paid_at" timestamp,
  "is_paid" boolean DEFAULT false,
  "notes" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "soft_costs_project_idx" ON "soft_costs"("project_id");
```

### 3c. tRPC Router — `src/server/api/routers/soft-costs.ts`:
```typescript
// Procedures:
// list(projectId) → all soft costs for a project
// create({ projectId, category, description, vendor, amount, isPaid, notes }) → new record
// update({ id, ...fields }) → update record (mark paid, edit amount, etc.)
// delete(id) → remove record
// summary(projectId) → { totalBudgeted, totalPaid, totalUnpaid, byCategory }
```
Add to `src/server/api/root.ts`: `softCosts: softCostsRouter`

### 3d. Soft Cost UI Component — `src/components/soft-costs-tab.tsx`

Display:
- Summary header: Total Spent | Total Unpaid | Largest Category
- Category breakdown: horizontal bar chart (pure CSS/Tailwind, no chart library)
  - Legal | Architectural | Engineering | Survey | Permit Fees | Other
- Itemized table: description | vendor | amount | paid status | date
- "Add Expense" button → inline form (no modal needed, just an expandable row)
- Quick-toggle paid/unpaid on each row

---

## Feature 4: Wire into Project Page

In `src/app/(dashboard)/projects/[id]/page.tsx`:
- Add **"Financials"** tab to the tabs list (after existing tabs)
- Tab content: render all 3 components stacked vertically:
  1. HoldCostCalculator (reads project compliance % automatically via hook/prop)
  2. PermitFeeEstimator (standalone calculator)
  3. SoftCostsTab (DB-connected)

The HoldCostCalculator should receive `complianceScore` and `projectId` as props so it can auto-populate the delay estimate from the deadline forecast data.

---

## Constraints
- New files for all components and routers
- Surgical edits ONLY for: `src/db/schema.ts` (append), `src/server/api/root.ts` (add import + router), project page (add tab)
- Must pass `npm run build` with zero TypeScript errors
- Dark theme throughout — consistent with existing design system
- All calculations are client-side/deterministic — no external API calls
- Amounts stored as integer cents in DB, displayed as formatted dollars in UI
