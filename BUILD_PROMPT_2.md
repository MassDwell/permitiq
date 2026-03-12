Full approval to build. No gates. Continue building MeritLayer (PermitIQ).

## What was just built (already committed):
- Boston Rules Engine (43 rules, jurisdictionRules router)
- ComplianceReadinessScore widget
- SubmissionPrepChecklist component  
- PermitRequirementsPanel with AI research
- Portfolio Risk dashboard section
- Project tabs: Requirements, Submission Prep, Settings

## BUILD LIST — build all of these now:

### 1. AHJ CONTACT DIRECTORY (Phase 3)

Create src/components/ahj-contact-directory.tsx — a reference panel showing official contacts/offices for each jurisdiction.

Hard-code this reference data:

BOSTON ISD (Inspectional Services Department):
  Office: 1010 Massachusetts Ave, Boston, MA 02118
  Phone: (617) 635-5300
  Hours: Mon-Fri 8:30am-4:30pm
  Portal: https://www.boston.gov/departments/inspectional-services
  Online permits: https://aca-prod.accela.com/BOSTON/

BOSTON BPDA (Boston Planning & Development Agency):
  Office: Boston City Hall, 9th Floor, 1 City Hall Square, Boston, MA 02201
  Phone: (617) 722-4300
  Email: info@bostonplans.org
  Portal: https://www.bostonplans.org
  Article 80 submissions: https://www.bostonplans.org/projects/development-review

BOSTON ZBA (Zoning Board of Appeal):
  Office: 1 City Hall Square, Room 801, Boston, MA 02201
  Phone: (617) 635-4775
  Portal: https://www.boston.gov/departments/zoning-board-appeal
  Filing deadline: 10 days before hearing date

CAMBRIDGE INSPECTIONAL SERVICES:
  Office: 831 Massachusetts Ave, Cambridge, MA 02139
  Phone: (617) 349-6100
  Portal: https://www.cambridgema.gov/inspection

NEWTON INSPECTIONAL SERVICES:
  Office: 1000 Commonwealth Ave, Newton, MA 02459
  Phone: (617) 796-1060
  Portal: https://www.newtonma.gov/government/inspectional-services

SOMERVILLE INSPECTIONAL SERVICES:
  Office: 133 Holland St, Somerville, MA 02144
  Phone: (617) 625-6600 x2500
  Portal: https://www.somervillema.gov/departments/inspectional-services

Design: Card layout per jurisdiction. Show the matching jurisdiction prominently, collapse others under "Other Jurisdictions". Include copy-to-clipboard phone button and direct portal links. Add as a section in the Requirements tab on the project detail page, below PermitRequirementsPanel.

### 2. FEE CALCULATOR IMPROVEMENTS (Phase 3)

Look at the existing src/components/permit-fee-calculator.tsx and enhance it with Boston ISD 2024 fee schedule:

- New construction residential: $15 per $1,000 of construction cost (min $100)
- New construction commercial: $15 per $1,000 (min $100)
- Alterations/additions: $12 per $1,000 (min $50)
- Demolition: $0.10 per SF (min $50)
- Electrical: $50 base + $2 per circuit
- Plumbing: $50 base + $15 per fixture
- Gas: $50 base + $25 per appliance
- Mechanical/HVAC: $50 base + $2 per ton of cooling
- ZBA filing fee: $200 base + $100 per variance requested
- Article 80 Small Project: $3,500 flat
- Article 80 Large Project: $10,000 flat + $0.50/SF over 50,000 SF

Show fee breakdown by permit type. Include "Typical timeline" alongside each fee. Wire up to the project jurisdiction so it auto-loads the right fee schedule. Show total estimated fees summary.

### 3. COMPLIANCE SNAPSHOTS + VELOCITY CHART

Add complianceSnapshots table to src/db/schema.ts:

```
complianceSnapshots table columns:
  id: uuid primary key default random
  projectId: uuid not null references projects(id) on delete cascade
  userId: uuid not null references users(id) on delete cascade
  healthScore: integer not null
  totalItems: integer not null
  metItems: integer not null
  snapshotDate: timestamp not null default now
```

Write migration SQL at drizzle/0002_compliance_snapshots.sql.

Add exports for SnapshotType and NewSnapshotType.

Add a takeSnapshot tRPC procedure to the projects router that records current health scores for all user projects. Call it automatically when compliance item status changes.

For the dashboard Compliance Velocity section, improve it:
- Add a sparkline bar chart using inline SVG (no library) — 4 bars showing last 4 weeks of avg health score
- Show "Up +12% this week" or "Down -5% this week" with color coding
- If no snapshot history: show "Upload your first document to start tracking"

### 4. QUICK ACTIONS PANEL

Create src/components/quick-actions-panel.tsx — a top action bar on the project detail page with:
- "Upload Document" button -> opens upload zone
- "Add Compliance Item" button -> opens add compliance dialog
- "Add Permit" button -> opens add permit workflow dialog
- "Export Checklist" button -> triggers download of CSV

Create src/app/api/export/checklist/route.ts:
- GET endpoint with projectId query param
- Returns downloadable CSV with all compliance items, submission requirements, deadlines
- Columns: Type, Description, Status, Deadline, Source, Notes

Add the QuickActionsPanel to the project detail page as a sticky action bar below the project header.

### 5. DOCUMENT PROCESSING STATUS POLLER

Create src/hooks/use-document-processing-poller.ts:
- Takes documentId and enabled flag
- Polls trpc.documents.getStatus every 3 seconds while status is "pending" or "processing"
- Returns: { status, extractedCount, error }
- Stops polling when status is "completed" or "failed"

Check if trpc.documents.getStatus exists in src/server/api/routers/documents.ts. If not, add it:
- Input: { id: string }
- Returns: { id, processingStatus, processingError, extractedData }

Enhance src/components/document-upload-zone.tsx:
- After upload completes (blob uploaded + doc record created), start the poller for the new doc
- Show "Analyzing document with AI..." spinner while processing
- On completion: show success toast "Extracted X compliance requirements"
- On failure: show error toast with "Retry" option that calls the process endpoint again

## IMPLEMENTATION NOTES
- Use existing shadcn components throughout
- Maintain existing code patterns (tRPC hooks, Drizzle queries)
- Write migration SQL for any new schema additions
- Commit all changes when done
- Build systematically: schema changes first, then backend, then frontend
