# Build: Zoning Intelligence Tool (Major Differentiator)

## Why This Matters
PermitFlow has ZERO zoning intelligence. This is the #1 thing developers need before they even apply for a permit. Enter an address → know exactly what you can build. This is a kill shot.

## Stack
Next.js 15, tRPC, dark theme. Uses hardcoded Boston zoning district data (no external API needed for MVP).

## What to Build

### 1. Public Zoning Lookup Tool — `src/app/(public)/tools/zoning-lookup/page.tsx`
A public tool (no auth required). URL: /tools/zoning-lookup

**UI:**
- Hero: "Boston Zoning Intelligence" — "Know exactly what you can build before you spend a dollar"
- Address input with "Analyze" button
- Results panel (shown after submit)

**For MVP, use a static lookup table based on Boston neighborhood → common zoning district.**
When user types an address, parse the street/neighborhood and return the most likely zoning classification.

**Static zoning data to encode (Boston-specific):**

```javascript
const BOSTON_ZONING = {
  // Residential Districts
  'R-1': { 
    name: 'Residential 1-Family',
    allowedUses: ['Single-family dwelling', 'Home occupation', 'Accessory structures'],
    minLotArea: '6,000 sq ft',
    maxFAR: '0.5',
    maxHeight: '35 ft / 2.5 stories',
    frontSetback: '20 ft',
    sideSetback: '10 ft',
    rearSetback: '30 ft',
    parkingRequired: '1 space per unit',
    aduAllowed: true,
    notes: 'ADU allowed by-right under MA ADU law (2024)'
  },
  'R-2': {
    name: 'Residential 2-Family',
    allowedUses: ['1-2 family dwelling', 'Home occupation', 'ADU'],
    minLotArea: '5,000 sq ft',
    maxFAR: '0.8',
    maxHeight: '35 ft / 2.5 stories',
    frontSetback: '15 ft',
    sideSetback: '8 ft',
    rearSetback: '25 ft',
    parkingRequired: '1.5 spaces per unit',
    aduAllowed: true,
    notes: 'Common in Dorchester, Roxbury, Mattapan'
  },
  'R-3': {
    name: 'Residential 3-Family',
    allowedUses: ['1-3 family dwelling', 'ADU', 'Home occupation'],
    minLotArea: '5,000 sq ft',
    maxFAR: '1.0',
    maxHeight: '40 ft / 3 stories',
    frontSetback: '10 ft',
    sideSetback: '5 ft',
    rearSetback: '20 ft',
    parkingRequired: '1 space per unit',
    aduAllowed: true,
    notes: 'Common in Jamaica Plain, South End'
  },
  'MFR': {
    name: 'Multi-Family Residential',
    allowedUses: ['Multi-family dwelling', 'Mixed-use with GF retail', 'Residential hotel'],
    minLotArea: '3,000 sq ft',
    maxFAR: '2.0',
    maxHeight: '55 ft / 4-5 stories',
    frontSetback: '0-5 ft',
    sideSetback: '0 ft (party wall)',
    rearSetback: '15 ft',
    parkingRequired: '0.75 spaces per unit',
    aduAllowed: true,
    notes: 'Typically requires Article 80 review >15,000 GFA'
  },
  'B-1': {
    name: 'Local Business',
    allowedUses: ['Retail', 'Restaurant', 'Personal services', 'Mixed-use residential above'],
    minLotArea: 'None',
    maxFAR: '2.0',
    maxHeight: '55 ft',
    frontSetback: '0 ft',
    sideSetback: '0 ft',
    rearSetback: '10 ft',
    parkingRequired: 'Varies by use',
    aduAllowed: false,
    notes: 'Ground floor commercial required'
  },
  'B-2': {
    name: 'Community Business',
    allowedUses: ['All B-1 uses', 'Supermarket', 'Auto service', 'Medical office'],
    minLotArea: 'None',
    maxFAR: '3.0',
    maxHeight: '65 ft',
    frontSetback: '0 ft',
    sideSetback: '0 ft',
    rearSetback: '10 ft',
    parkingRequired: '1 per 300 GFA retail, varies',
    aduAllowed: false,
    notes: 'Common along main corridors'
  },
  'I-1': {
    name: 'Light Industrial',
    allowedUses: ['Light manufacturing', 'Warehouse', 'R&D', 'Maker space'],
    minLotArea: 'None',
    maxFAR: '2.0',
    maxHeight: '50 ft',
    frontSetback: '20 ft',
    sideSetback: '15 ft',
    rearSetback: '20 ft',
    parkingRequired: '1 per 1000 GFA',
    aduAllowed: false,
    notes: 'Residential conversion requires ZBA variance'
  }
};

// Neighborhood → likely zoning mapping for MVP
const NEIGHBORHOOD_ZONING = {
  'back bay': 'MFR',
  'beacon hill': 'R-3',
  'south end': 'MFR',
  'south boston': 'R-2',
  'dorchester': 'R-2',
  'roxbury': 'R-2',
  'jamaica plain': 'R-3',
  'roslindale': 'R-1',
  'west roxbury': 'R-1',
  'hyde park': 'R-1',
  'mattapan': 'R-2',
  'east boston': 'R-2',
  'charlestown': 'R-3',
  'allston': 'MFR',
  'brighton': 'R-2',
  'fenway': 'MFR',
  'mission hill': 'R-3',
  'chinatown': 'MFR',
  'downtown': 'B-2',
  'financial district': 'B-2',
  'seaport': 'B-2',
  'south boston waterfront': 'B-2',
};
```

**Results panel shows:**
1. **Zoning District** — e.g., "R-2: Residential 2-Family" (big header)
2. **What You Can Build** — allowed uses as chips/badges
3. **Key Numbers** grid:
   - Max FAR | Max Height | Min Lot Size
   - Front/Side/Rear Setbacks | Parking Required
4. **ADU Allowed?** — prominent YES/NO badge (huge for MassDwell crossover!)
5. **Permit Requirements** — based on zoning + project type:
   - "Proposed GFA > 15,000 sqft → Article 80 Large Project Review required"
   - "Changing use from residential to commercial → ZBA Special Permit required"
   - "3+ units new construction → BPDA Development Review likely"
6. **Quick Actions** — "Track compliance for this address" (→ create project), "View permit guides"
7. **Disclaimer** — "This is a guide based on typical Boston zoning. Always verify with Boston ISD before filing."

**The address parsing logic:**
- Lowercase the address
- Check if it contains any neighborhood name from NEIGHBORHOOD_ZONING
- Also check for known street patterns (e.g., "Commonwealth Ave" → Back Bay/Allston)
- Return the zoning match with confidence level
- If no match → return "R-2" as default with note "Could not determine exact district — showing typical Boston residential zoning"

### 2. Add to public tools nav
In `src/app/(public)/permits/page.tsx` or wherever tools are listed, add a card/link for the Zoning Lookup tool.

### 3. Add to dashboard sidebar
In `src/app/(dashboard)/layout.tsx`, add "Zoning Lookup" link pointing to /tools/zoning-lookup in the nav. Surgical addition only.

## Constraints
- New files only except surgical nav additions
- 100% static data — no external API calls needed for MVP
- Must pass `npm run build`
- Dark theme (the public tool page uses the public layout wrapper)
- This is a MARKETING tool — beautiful, impressive, shareable
