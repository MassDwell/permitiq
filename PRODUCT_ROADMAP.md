# MeritLayer — Product Roadmap (v2)

## Competitive Position
**Biggest competitor:** PermitFlow (enterprise, contractor-facing, $20B+ permitted)  
**Our angle:** Developer/owner-centric compliance OS — the command center for the person writing the checks.

PermitFlow serves builders. MeritLayer serves developers.

---

## Phase 1: Core (IN PROGRESS - March 2026)
- [x] Auth, projects, document upload
- [x] AI document extraction (deadlines, compliance items)
- [ ] Permit requirements research with source citations (in build)
- [ ] AI reasoning transparency per compliance item (in build)

## Phase 2: Portfolio Intelligence (NEXT)
- [ ] Portfolio dashboard — compliance health score per project, roll-up view
- [ ] Submission prep checklist — "You need X docs, you have Y, missing Z"
- [ ] Compliance readiness score (0-100%) per project
- [ ] Risk flagging — projects approaching deadlines with incomplete compliance

## Phase 3: Rules Engine (Moat)
- [ ] Multi-permit rules database (Boston ISD, BPDA, ZBA, Landmarks, DEP)
  - Demo permit ✅
  - Building permit (new construction)
  - ZBA variance/special permit
  - Article 80 Large Project Review
  - Article 85 Demolition Delay
  - BPDA Development Review
  - Certificate of Occupancy
- [ ] AHJ contact directory (Boston-specific)
- [ ] Fee calculator per permit type

## Phase 4: Workflow (Collaboration)
- [ ] **Collaborators** — Invite GC, architect, PM, attorney, investor to a project
  - projectMembers table (projectId, userId, email, role, inviteStatus)
  - Roles: owner | editor | viewer
  - Email invite flow via Clerk (creates account if needed)
  - Permit assignments notify the assigned collaborator
  - Role-based access: owners see everything, editors update/upload, viewers read-only
- [ ] Stamped plans checklist — required-from-professional items with assign + upload slots
- [ ] Inspection tracker (schedule → pass/fail → CO)
- [ ] Comment response assistant (AI drafts responses to permit objections)
- [ ] Document request workflow (request docs from team members with upload link)

## Phase 5: Intelligence (Kill Shots)
- [ ] Permit status scraper (Boston ISD portal live status)
- [ ] Deadline forecasting (AI predicts risk based on current pace)
- [ ] Audit trail PDF export (for lenders, investors, attorneys)
- [ ] Portfolio analytics (historical compliance performance)

---

## Pricing Strategy (vs PermitFlow enterprise rates)
- **Starter:** $99/mo — 3 projects, core compliance tracking
- **Professional:** $249/mo — 10 projects, AI research, team collab
- **Enterprise:** $499/mo — unlimited projects, API, white-label

PermitFlow is invite-only enterprise. We self-serve from day one.

---

## Key Differentiators vs PermitFlow
| Feature | PermitFlow | MeritLayer |
|---------|-----------|------------|
| Target user | Contractors/builders | Developers/owners |
| Pricing | Enterprise ($$$) | Self-serve ($99+) |
| Document intelligence | No | Yes (upload any doc) |
| Portfolio view | No | Yes |
| Source citations | No | Yes |
| Boston-specific rules | Generic | Deep integration |
| Onboarding | Sales call required | Instant |
