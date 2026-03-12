# Build: Phase 6C — ADU Intelligence Module (MassDwell Synergy Play)

## Why This Matters
The 2024 MA ADU law (Chapter 150 of the Acts of 2024) is the biggest zoning reform in Massachusetts in 50 years. Every single-family and two-family home in MA now has BY-RIGHT ADU access. This is MassDwell's entire market.

MeritLayer + MassDwell integration: MeritLayer becomes the free public tool that educates homeowners on ADU eligibility → funnels them to MassDwell for construction. This is a lead generation engine.

## Stack
Next.js 15 App Router, Tailwind, dark theme. 100% static/deterministic — no external APIs.

---

## What to Build

### 1. ADU Eligibility Checker — `src/app/(public)/tools/adu-eligibility/page.tsx`

**URL:** /tools/adu-eligibility

**Hero section:**
```
Massachusetts ADU Eligibility Checker
"Is your property eligible for a by-right ADU under the 2024 MA ADU Law?"
Free tool — no account required
```

**Step 1 form — Property basics:**
- City/Town (dropdown of MA municipalities)
- Zoning District (R-1 / R-2 / R-3 / Other)
- Existing structure type (Single-family / Two-family / Other)
- Lot size (sq ft) — number input
- Primary structure sq ft — number input
- Currently owner-occupied? (Yes / No)

**Results (shown after submit):**

**If eligible:**
```
✅ Your property is likely eligible for a by-right ADU

Under MA General Laws Chapter 40A, Section 3J (2024), your property qualifies for 
an accessory dwelling unit without a variance or special permit.

📐 Your ADU Size Limits:
  Maximum ADU size: [calculated: min(900 sqft, 50% of primary structure)]
  Minimum lot size required: Met ✅

📋 Key Requirements:
  ✓ No owner-occupancy requirement (as of 2025)
  ✓ No additional parking required beyond existing
  ✓ Must meet building code and zoning setbacks
  ✓ Building permit required (no ZBA hearing needed)
  
⏱ Typical Timeline:
  Permitting: 4-8 weeks (Boston ISD)
  Construction: 8-12 weeks (factory-built modular)
  Total: 3-5 months

💰 Estimated Investment:
  Site-built ADU: $180,000 – $350,000
  Modular ADU (MassDwell): Starting at $141,000

🔵 [Get a Free MassDwell Quote →]  ← CTA button, teal, links to massdwell.com
```

**If not immediately eligible:**
```
⚠️ Your property may need additional review

Reason: [specific reason — e.g., "Two-family structures may be subject to local 
bylaw amendments. Check with your local building department."]

Options:
• Request a variance from the ZBA (typically 60-90 days)
• Check if your municipality has adopted local ADU bylaws

[Still interested in an ADU? Talk to MassDwell →]
```

**Encode this MA ADU law logic:**
```javascript
function checkADUEligibility(data) {
  // 2024 MA ADU Law (Chapter 150 of the Acts of 2024 / GL c.40A s.3J)
  
  // Core eligibility: single-family or two-family in residential zone
  const eligibleStructures = ['single-family', 'two-family'];
  const eligibleZones = ['R-1', 'R-2', 'R-3'];
  
  if (!eligibleStructures.includes(data.structureType)) {
    return { eligible: false, reason: 'By-right ADU applies to single-family and two-family homes only.' };
  }
  
  if (!eligibleZones.includes(data.zoningDistrict)) {
    return { eligible: 'maybe', reason: 'Your zoning district may allow ADUs — check local bylaws.' };
  }
  
  // Size calculation
  const maxADUSize = Math.min(900, data.primaryStructureSqft * 0.5);
  
  // Two-family note
  const notes = [];
  if (data.structureType === 'two-family') {
    notes.push('Two-family homes are included under the 2024 law, but some municipalities may have local bylaws — verify with your town.');
  }
  
  return {
    eligible: true,
    maxADUSize,
    notes,
    massDwellModels: [
      { name: 'Dwell Essential', size: 470, bedBath: '1/1', price: 141000 },
      { name: 'Dwell Classic', size: 565, bedBath: '2/1', price: 172000 },
      { name: 'Dwell Deluxe', size: 594, bedBath: '2/1', price: 186000 },
      { name: 'Dwell Prime', size: 892, bedBath: '2/2', price: 270000 },
    ].filter(m => m.size <= maxADUSize),
  };
}
```

**MassDwell model recommendations:**
When eligible, show which MassDwell models fit within their lot/size constraints:
```
🏠 MassDwell Models That Fit Your Property:
┌─────────────────────────────────────────┐
│ Dwell Essential  470 sqft  1bd/1ba  $141K │
│ Dwell Classic    565 sqft  2bd/1ba  $172K │  
│ Dwell Deluxe     594 sqft  2bd/1ba  $186K │
└─────────────────────────────────────────┘
[Get a Free Quote from MassDwell →]
```

---

### 2. ADU Permit Compliance Checklist — `src/app/(public)/permits/boston/adu-permit/page.tsx`

**URL:** /permits/boston/adu-permit

Comprehensive guide for the Boston ADU building permit process:

**Sections:**
1. **Overview** — What's required, timeline (4-8 weeks), fees (typically $1,200-$2,400)
2. **Required Documents Checklist:**
   - ✓ Site plan showing ADU location, setbacks, lot coverage
   - ✓ Floor plans (existing + proposed)
   - ✓ Building elevations (all 4 sides)
   - ✓ Foundation plan
   - ✓ Electrical plan (licensed electrician stamp)
   - ✓ Plumbing plan (licensed plumber stamp)
   - ✓ Energy compliance (IECC 2021 — insulation, windows, HVAC)
   - ✓ Deed (proof of ownership)
   - ✓ Title 5/septic compliance (if applicable)
3. **What's NOT Required (Thanks to 2024 Law):**
   - ✗ ZBA hearing or variance
   - ✗ Special permit from planning board
   - ✗ Additional parking spaces
   - ✗ Owner-occupancy affidavit (removed in 2025 amendment)
4. **Boston ISD Submission Process** — Step by step
5. **Common Rejection Reasons** — Top 5 with fixes
6. **Pro Tips** — Submit complete package, use licensed plans, pre-check zoning

---

### 3. ADU ROI Calculator — `src/components/adu-roi-calculator.tsx`

A standalone calculator component (used on the eligibility page after positive result).

**Inputs:**
- ADU construction cost (pre-filled from selected model, editable)
- Expected monthly rent ($)
- Financing method (Cash / Construction loan / Home equity)
- Interest rate (if financed) 

**Outputs:**
```
📈 Your ADU Investment Return

Monthly Rental Income:        $2,200
Monthly Financing Cost:       -$847
────────────────────────────────────
Net Monthly Cash Flow:        $1,353

Annual Net Income:            $16,236
Total Investment:             $172,000
────────────────────────────────────
Cash-on-Cash Return:          9.4%
Payback Period:               10.6 years
10-Year Total Return:         $162,360 + property appreciation
```

Market rent guidance (encode static Boston ADU rent estimates):
```javascript
const BOSTON_ADU_RENTS = {
  studio_under_400: { low: 1400, mid: 1800, high: 2200 },
  one_bed_400_600: { low: 1800, mid: 2200, high: 2800 },
  two_bed_600_900: { low: 2200, mid: 2800, high: 3400 },
};
```

Show market range as a slider reference: "Boston ADUs this size typically rent for $X–$Y/mo"

---

### 4. Add to navigation

**Public nav** — Add "ADU Tools" dropdown or link:
- ADU Eligibility Checker → /tools/adu-eligibility  
- ADU Permit Guide → /permits/boston/adu-permit

In `src/app/(public)/permits/page.tsx` — add ADU section:
```
🏠 ADU (Accessory Dwelling Units)
"Massachusetts' 2024 ADU law changed everything. Here's what you need to know."
[Check Your Eligibility →]  [ADU Permit Guide →]
```

**Dashboard sidebar** — Add "ADU Tools" link to /tools/adu-eligibility. Surgical addition in `src/app/(dashboard)/layout.tsx`.

---

## Constraints
- New files: eligibility page, ADU permit guide page, ROI calculator component
- Surgical edits ONLY: permits index page (add ADU section), dashboard layout (add nav link)
- Must pass `npm run build`
- Zero TypeScript errors
- Dark theme for all dashboard components; public pages use public layout
- All MassDwell links open in new tab: `target="_blank" rel="noopener noreferrer"`
- CTA buttons teal (#14B8A6), prominent, clear
