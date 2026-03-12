# Build: Intelligence Layer (Phase 5)

## Stack
Next.js 15 App Router, tRPC, Drizzle ORM, Tailwind, dark theme. OpenAI for AI. @react-pdf/renderer or jsPDF for PDF generation.

## What to Build

### 1. Audit Trail PDF Export — `src/app/api/export/audit-trail/route.ts`
GET endpoint: `/api/export/audit-trail?projectId=[id]`

Generates a professional PDF document containing:
- **Cover page:** MeritLayer logo area (text), Project name + address, Export date, "Prepared for Lenders/Investors/Attorneys"
- **Project Summary:** Created date, total compliance items, completion %, open items
- **Compliance Checklist:** Table with all items — requirement | status (✅/⏳/❌) | due date | notes
- **Permit Workflow:** All permits with status and dates
- **Document Log:** All uploaded documents with upload date and classification
- **Inspection Log:** All inspection steps with status

Use a simple HTML-to-PDF approach: generate clean HTML and return it as application/pdf using a headless approach, OR use the `pdfkit` npm package (already may be available) to build it programmatically.

If pdfkit is not available, use a clean HTML response with print CSS and return content-type text/html with a print-friendly layout — the user can print to PDF from browser. Label it clearly: "Print this page to save as PDF (Cmd+P → Save as PDF)".

Actually, simplest reliable approach: generate a beautiful HTML page at `/projects/[id]/audit-trail` that is print-optimized, and provide a "Download PDF" button that triggers window.print(). This avoids server-side PDF deps entirely.

### 1 (revised). Audit Trail Page — `src/app/(dashboard)/projects/[id]/audit-trail/page.tsx`
A print-optimized audit trail page.

Print CSS in a `<style>` tag:
```css
@media print {
  .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
  .print-page { page-break-after: always; }
}
```

Page content:
- "Download PDF" button (no-print class, calls window.print())
- Professional layout: MeritLayer header, project details, all sections
- White background, black text when printed
- Sections: Summary | Compliance Items table | Permits | Documents | Inspections

### 2. Deadline Forecasting — `src/components/deadline-forecast.tsx`
A component that shows AI-powered deadline risk assessment for a project.

Logic (no actual AI needed — deterministic rules):
- Pull all compliance items with due dates
- Calculate: days remaining, completion rate, velocity (items completed per week based on created_at vs updated_at)
- Forecast: "At current pace, you'll complete X% by the deadline"
- Risk level: 
  - 🟢 Low: >80% complete OR >30 days remaining with >50% done
  - 🟡 Medium: <50% complete with <30 days remaining
  - 🔴 High: <30% complete with <14 days remaining OR past due items

UI:
- Risk gauge (simple colored badge + icon)
- "Projected completion: X%" 
- Days remaining counter
- Key insight text: "You have 12 items remaining and 18 days. At your current pace of 2 items/week, you may miss this deadline."
- Recommended actions list

Wire into project detail page as a new card in the overview tab.

### 3. More Permit Guides (Phase 3 completion)
New public pages for permit types not yet covered:

**`src/app/(public)/permits/boston/building-permit/page.tsx`**
Full building permit guide for Boston ISD:
- What it is, when required, timeline (4-8 weeks typical)
- Required documents: stamped plans, structural calcs, energy compliance (IECC), deed, survey
- Key contacts: Boston ISD, 1010 Massachusetts Ave
- Fees: Use the fee schedule from the calculator
- Common rejections and how to avoid them
- Pro tips for Boston specifically

**`src/app/(public)/permits/boston/article-85-demolition/page.tsx`**
Article 85 Demolition Delay:
- What triggers it (structures >50 years old)
- The 18-month delay clock
- Exemptions
- BPDA review process

**`src/app/(public)/permits/boston/certificate-of-occupancy/page.tsx`**
Certificate of Occupancy guide:
- Final inspection sequence
- Required sign-offs
- Common delays
- Temporary CO vs permanent CO

**Update `src/app/(public)/permits/page.tsx`** to list these new permit types.

### 4. Wire Deadline Forecast into project page
In `src/app/(dashboard)/projects/[id]/page.tsx`:
- Import DeadlineForecast component
- Add it to the Overview tab (first tab) as a card below the existing content
- Surgical addition only

## Constraints  
- New files for all new pages/components
- Surgical edits only for project page + permits index
- Must pass `npm run build`
- Dark theme throughout (except print styles which flip to white)
- Follow existing component patterns
