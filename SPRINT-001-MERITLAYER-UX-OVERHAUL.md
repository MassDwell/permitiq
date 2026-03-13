# SPRINT-001: MeritLayer UX & Competitive Parity Overhaul
**Status:** IN PROGRESS  
**Created:** 2026-03-13  
**Owner:** Steve Vettori  
**North Star:** Make MeritLayer feel like a product a Boston developer would trust with permit-critical work  

---

## Why This Sprint Exists

A competitive audit against PermitFlow (funded $90.5M, Accel/Kleiner Perkins, Lennar/Amazon customers) identified 14 critical gaps across conversion, retention, and strategic positioning.

**The core diagnosis:** MeritLayer currently looks like a developer's side project, not a product. A prospect who signs up hits an empty dashboard, can't find where to start, has to manually trigger research, and is surrounded by UI language that reads like database field names.

**The fix:** Three phases targeting conversion-killers first, retention second, strategic moat third.

---

## Phase 1 — Week 1 (Conversion-Critical)
> Items that are actively losing customers TODAY. A prospect who hits any of these bounces before seeing real value.

| CLA | Title | Priority | Effort |
|-----|-------|----------|--------|
| CLA-102 | Landing page: headline, value prop, trust signals rewrite | critical | 2-3 hrs |
| CLA-103 | Kill the empty dashboard — guided 3-step onboarding flow | critical | 1-2 days |
| CLA-104 | Auto-trigger requirements on project creation | critical | 4 hrs |
| CLA-105 | Persistent "Next Action" banner on project page | high | 3 hrs |

### Success Criteria (Phase 1 done when):
- [ ] New user can see real permit requirements within 90 seconds of signing up
- [ ] Landing page headline clearly communicates "permit compliance for Boston developers — automated"
- [ ] Every project page shows "here's what you should do next" without user digging through tabs
- [ ] Requirements auto-populate when a project is created — no button pushing required

---

## Phase 2 — Month 1 (Retention-Critical)
> Items that kill users who make it past onboarding.

| CLA | Title | Priority | Effort |
|-----|-------|----------|--------|
| CLA-106 | Full language audit — rename all UI to contractor vocabulary | high | 1 day |
| CLA-107 | Trust signals: data provenance, security, attribution on landing | high | 3 hrs |
| CLA-108 | Document ↔ requirement linkage — attach docs to specific steps | high | 1-2 days |
| CLA-109 | AHJ submission guide per jurisdiction (Boston ISD, BLC, BPDA) | high | 2 days |
| CLA-110 | Portfolio dashboard redesign — table view with urgency sorting | medium | 1-2 days |
| CLA-111 | Submission tracking + follow-up reminder prompts | medium | 1 day |

### Success Criteria (Phase 2 done when):
- [ ] Every UI label speaks contractor not developer language
- [ ] Each compliance step shows exactly where/how to file with direct AHJ link
- [ ] Documents attach to the specific step they satisfy
- [ ] Portfolio view shows all projects with at-a-glance urgency indicators
- [ ] Users are prompted to follow up with AHJ after 7/14 days of inactivity

---

## Phase 3 — Quarter (Strategic Position)
> Differentiation moves that PermitFlow cannot replicate.

| CLA | Title | Priority | Effort |
|-----|-------|----------|--------|
| CLA-112 | Public REST API + webhooks for permit intelligence | medium | 3 days |
| CLA-113 | Shareable compliance report — PDF/link export | medium | 1 day |
| CLA-114 | Mobile PWA — photo capture + status + push notifications | medium | 3-5 days |
| CLA-115 | Procore integration | low | 6 weeks |

---

## Competitive Context

**PermitFlow benchmark:**  
- $90.5M raised, Accel/Kleiner Perkins  
- 5 AI agents: Intake → Research → Submission → Coordination → Issuance  
- 12M+ data points, 7K+ AHJs, SOC2 + ISO 27001  
- Managed service: they do the work, user supervises  
- Requires sales call — no self-serve  
- Integrations: Procore, Autodesk, ServiceTitan  

**MeritLayer's position:**  
- Self-serve, instant access, transparent pricing  
- Boston/regional depth vs PermitFlow's shallow breadth  
- AI document chat and compliance intelligence (differentiated)  
- Founder pricing locks in early adopters  
- Target: developers PermitFlow is too enterprise to serve  

---

## Language Audit Reference
Full mapping of old → new vocabulary:

| Old (current) | New (correct) |
|---------------|---------------|
| Compliance Items | Permit Steps |
| Research Requirements | Show What's Required |
| Requirement Type | (hide from UI) |
| Article 80 SPR | BPDA Small Project Review |
| Not Applicable | Skip this step |
| In Progress | Working on it |
| Met | Done ✓ |
| Overdue | Past due — action needed |
| Permit Workflow | Permit Tracker |
| Health Score | Permit Readiness |
| Compliance Tab | Requirements Tab |
| Research Requirements button | Find My Requirements |

---

## AHJ Submission Reference Data
(For CLA-109 — hardcoded curated content per jurisdiction)

### Boston ISD (Building / Renovation / New Construction)
- Portal: https://www.boston.gov/departments/inspectional-services
- ePLAN: https://www.boston.gov/departments/inspectional-services/eplan
- In person: 1010 Massachusetts Ave, Boston, MA 02118
- Hours: Mon-Fri 8am-4pm
- Contact: isd@boston.gov | (617) 635-5300

### Boston Landmarks Commission (Article 85 Demo Delay)
- Email: article85@boston.gov
- Portal: https://www.boston.gov/departments/landmarks-commission/how-file-article-85-demolition-review
- Timeline: 30-day review period minimum

### BPDA (Article 80 — SPR/LPR)
- Email: article80inquiries@boston.gov
- Portal: https://www.bostonplans.org/projects/development-review
- SPR contact: Urban Design Division
- LPR timeline: 12-18 months typical

### Cambridge ISD
- Portal: https://www.cambridgema.gov/inspection
- Permit portal: https://cambridgecloud.permitportal.com
- Contact: inspection@cambridgema.gov

### Brookline Building Department
- Portal: https://www.brooklinema.gov/175/Building
- Contact: building@brooklinema.gov | (617) 730-2190

---

## Agent Zones (swarm coordination)
Each agent owns a specific file/component zone to prevent merge conflicts:

| Agent | Zone | Key Files |
|-------|------|-----------|
| LANDING | Marketing/public pages | src/app/page.tsx, src/app/pricing/page.tsx |
| ONBOARD | First-run + project creation | src/components/onboarding-flow.tsx (new), src/server/api/routers/projects.ts, src/app/(dashboard)/dashboard/page.tsx (onboarding section only) |
| PROJECTPAGE | Project detail page | src/app/(dashboard)/projects/[id]/page.tsx, compliance components |
| DASHBOARD | Portfolio overview | src/app/(dashboard)/dashboard/page.tsx (content/table section) |
| BACKEND | Data/logic layer | src/server/api/routers/compliance.ts, src/components/ahj-submission-guide.tsx (new), reminder logic |

---

## Repo & Deploy Context
- **Repo:** /Users/openclaw/.openclaw/workspace/ventures/permitiq
- **Deploy:** Vercel (auto-deploy on main push) → meritlayer.ai
- **DB:** Neon PostgreSQL (prod) — schema changes need `pnpm db:push` + `vercel --prod`
- **Auth:** Clerk
- **AI:** Anthropic Claude (claude-haiku-3-5 for lightweight AI calls in routes)
- **Email:** Resend (resend.com)
- **Stack:** Next.js 14, tRPC, Drizzle ORM, Tailwind, TypeScript

---

## Definition of Done (Full Sprint)
1. A new user signs up → sees onboarding → has permit requirements in <90 seconds
2. Landing page headline test: a contractor can explain what MeritLayer does in one sentence after reading it
3. Every project page shows a "Next Action" at the top — no tab-hunting
4. All UI labels have been replaced with contractor vocabulary
5. Each jurisdiction-specific step shows where/how to file
6. Documents can be attached to specific steps
7. Portfolio view shows all projects with urgency ranking
8. Follow-up prompts fire after 7+ days of no update on an active step

---

*Sprint created by Clawson 2026-03-13 | North star: beat PermitFlow on self-serve experience*
