# Build: Phase 6C — ADU Intelligence Module (MassDwell Lead Engine)

## Why This Matters
The 2024 MA ADU law is the biggest zoning change in Massachusetts in 50 years.
Every single-family and two-family homeowner in MA now has by-right ADU access.
MeritLayer becomes the top-of-funnel for MassDwell — free tool that generates qualified leads.
This is the merger of two Steve Vettori businesses.

## Stack
Next.js 15 App Router, dark theme, Tailwind. Static data + deterministic logic. No external APIs needed.

---

## Feature 1: ADU Eligibility Checker — `src/app/(public)/tools/adu-eligibility/page.tsx`

**URL:** /tools/adu-eligibility

### Hero Section:
```
🏠 Massachusetts ADU Eligibility Checker
Find out if you can build an ADU on your property — for free, in 60 seconds.
Under the 2024 MA ADU Law, most MA homeowners now qualify by right.
[address input] [Check Eligibility →]
```

### The MA 2024 ADU Law — encode these rules:
```javascript
const MA_ADU_LAW_2024 = {
  effectiveDate: 'February 2, 2025', // 6 months after signing
  byRightEligibility: {
    zoningTypes: ['R-1', 'R-2', 'R-3', 'single-family', 'two-family'],
    maxSize: 900, // sq ft OR 50% of primary dwelling, whichever is smaller
    maxHeight: 24, // feet for detached ADU
    setbacks: 'Standard zoning setbacks apply',
    ownerOccupancy: false, // NOT required (removed from final law)
    rentalAllowed: true,
    shortTermRentalAllowed: false, // municipality can restrict STR
    byRightTypes: ['attached', 'detached', 'basement', 'garage_conversion'],
    permitRequired: true,
    designReviewExempt: true, // municipalities cannot require discretionary review
  },
  municipalOptions: {
    canRestrictSTR: true,
    canRequireOwnerOccupancy: false,
    canSetSizeRequirements: true, // within state limits
    cannotRequireParking: true, // no additional parking required by right
    cannotRequireSpecialPermit: true, // this is the key change
  },
  bostonSpecific: {
    additionalRequirements: [
      'Building permit required from Boston ISD',
      'Inspectional Services review for zoning compliance',
      'Utility connections (water/sewer) may require separate permits',
    ],
    timeline: '8-16 weeks from permit application to occupancy',
    massDwellTimeline: '8-12 weeks post-approval',
  }
};
```

### Results Panel (after address entry):

**Result: ELIGIBLE ✅** (shown for most MA addresses)

```
Great news! Under Massachusetts' 2024 ADU Law, your property
is eligible to add an Accessory Dwelling Unit by right.

What "by right" means:
✅ No special permit required
✅ No discretionary review
✅ No neighbor notification required
✅ No additional parking required
✅ Can be rented (long-term)

Your ADU Options:
┌─────────────────────────────────────────────────┐
│ 🏗️  Detached ADU                                │
│ Up to 900 sq ft | Up to 24 ft tall              │
│ Typical cost: $141,000–$270,000                 │
│ Timeline: 8–12 weeks with MassDwell             │
├─────────────────────────────────────────────────│
│ 🏠  Attached / Basement ADU                     │
│ Up to 900 sq ft                                 │
│ Typically less expensive, same process           │
│ Timeline: 12–16 weeks                           │
│                                                 │
└─────────────────────────────────────────────────┘

Permit Requirements in Boston:
• Building permit: Boston ISD (~$1,600–$4,800 in fees)
• Electrical permit: ~$300–$600
• Plumbing permit: ~$200–$400
• Estimated total fees: $2,100–$5,800

Typical Timeline:
Permit Application → Approval → Construction → Occupancy
     2-4 weeks    →  4-8 wks  →   8-12 wks  →  CO issued
```

### The MassDwell CTA (prominent, teal, can't miss):
```
┌─────────────────────────────────────────────────────────────────┐
│  🏗️  Ready to build your ADU?                                    │
│                                                                  │
│  MassDwell builds factory-crafted ADUs 50% faster than          │
│  traditional construction. Starting at $141,000.                 │
│  Boston's modular ADU specialist — 8-12 weeks post-approval.    │
│                                                                  │
│  [Get a Free MassDwell Quote →]                                  │
│  Links to: https://massdwell.com                                 │
└─────────────────────────────────────────────────────────────────┘
```

### MA ADU Permit Checklist (shown below CTA):
Full compliance checklist specific to MA ADU permits:
1. ☐ Zoning compliance verification (setbacks, height, size)
2. ☐ Building permit application (Boston ISD Form A)
3. ☐ Stamped architectural plans
4. ☐ Energy compliance documentation (IECC 2021)
5. ☐ Utility connection plan (water, sewer, electrical)
6. ☐ Smoke/CO detector compliance plan
7. ☐ ADA considerations (if rental unit)
8. ☐ Final inspection + Certificate of Occupancy

"Track these requirements in MeritLayer → [Create Free Project]"

---

## Feature 2: ADU Financial Calculator — `src/components/adu-financial-calculator.tsx`

Embedded in the ADU eligibility page below the results.

### Inputs:
- **ADU Model** — dropdown: Essential (470 sqft, $141K) | Classic (565 sqft, $172K) | Deluxe (594 sqft, $186K) | Prime (892 sqft, $270K)
- **Estimated Monthly Rent** — number input, default $2,200, placeholder "Boston avg: $2,200-$3,500"
- **Your Mortgage Rate** — optional, for financing calc
- **Financing** — toggle: Cash / Financed (10% down, 30yr)

### Output:
```
ADU Investment Analysis — MassDwell Classic (565 sqft)

Cost:                    $172,000
Permit Fees (est):       $3,400
Total Investment:        $175,400

Monthly Revenue:         $2,500
Annual Revenue:          $30,000
Annual ROI:              17.1%
Payback Period:          5.8 years

If Financed (10% down, 7%):
Down Payment:            $17,500
Monthly Payment:         $1,048
Monthly Net Cash Flow:   $1,452
Annual Net:              $17,424
```

---

## Feature 3: ADU Permit Tracking Project Template

When user clicks "Create Free Project" from the ADU tool:
- Pre-populate a project named "[Address] ADU"
- Auto-populate the compliance checklist with the 8 MA ADU permit items
- Auto-add the standard permit workflow for ADU in Boston

This is essentially a project template. For MVP, implement as a URL parameter:
`/dashboard?template=adu&address=[encoded]`

In `src/app/(dashboard)/dashboard/page.tsx`, detect `?template=adu` and show a "Create ADU Project" modal pre-filled with the template data. Surgical addition.

---

## Feature 4: Add ADU Tool to Navigation

### Public permits page (`src/app/(public)/permits/page.tsx`):
Add ADU eligibility checker card in a featured position — "New: 2024 MA ADU Law" badge.

### Dashboard sidebar (`src/app/(dashboard)/layout.tsx`):
Add "ADU Tools" link pointing to /tools/adu-eligibility. Surgical addition.

---

## Constraints
- New files for: eligibility page, financial calculator component
- Surgical additions for: permits index, dashboard sidebar, dashboard page (template modal)
- Must pass `npm run build` with zero TypeScript errors
- The MassDwell CTA must be prominent and link to https://massdwell.com
- ADU financial numbers must match USER.md MassDwell product line exactly:
  - Essential: 470 sqft, $141,000
  - Classic: 565 sqft, $172,000
  - Deluxe: 594 sqft, $186,000
  - Prime: 892 sqft, $270,000
- Dark theme throughout
