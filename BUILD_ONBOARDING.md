# Build: Onboarding Flow + Dashboard Improvements

## Why This Matters
PermitFlow requires a sales call to onboard. MeritLayer should be instant and self-serve. A great first-run experience = conversion. A confusing one = churn.

## Stack
Next.js 15, tRPC, dark theme, Tailwind.

---

## Feature 1: Welcome/Onboarding Flow

### 1a. Welcome Page — `src/app/(dashboard)/welcome/page.tsx`
Shown to new users after sign-up (redirect URL /dashboard?welcome=true triggers this OR we check if user has 0 projects and show inline).

Actually: make it a banner component, not a separate page.

### 1b. Welcome Banner Component — `src/components/welcome-banner.tsx`
Show when user has 0 projects. Sits at top of dashboard.

```
╔══════════════════════════════════════════════════════════════╗
║  Welcome to MeritLayer 🎉                                     ║
║  You're 3 steps away from full compliance visibility         ║
║                                                              ║
║  [1] Create your first project      ← button                ║
║  [2] Upload a permit document       ← grayed until step 1   ║
║  [3] Run AI compliance analysis     ← grayed until step 2   ║
║                                                              ║
║  [Create First Project]  [Watch Demo (2 min)]               ║
╚══════════════════════════════════════════════════════════════╝
```

Show progress checkmarks as steps are completed. Dismiss button (X). Store dismissed state in localStorage.

### 1c. Wire into dashboard
In `src/app/(dashboard)/dashboard/page.tsx`, add the WelcomeBanner at the top, shown when projectCount === 0 or not dismissed. Surgical addition.

---

## Feature 2: Project Status Overview Improvements

### 2a. Enhanced Dashboard Stats — improve `src/app/(dashboard)/dashboard/page.tsx`

The dashboard should show more at-a-glance. Replace or augment the existing stats section with:

**Top stat cards row (4 cards):**
- Total Projects (count)
- Items Due This Week (count, red if >0)
- Avg Compliance Score (% across all projects, with color)
- Documents Processed (total count)

**Recent Activity Feed — `src/components/activity-feed.tsx`**
A feed of recent actions across all projects:
- "[Project Name] — New document uploaded (2h ago)"
- "[Project Name] — Compliance item marked complete (5h ago)"
- "[Project Name] — Deadline in 7 days: BPDA submission"
- Shows last 10 events
- Pull from: recent documents (by createdAt), recent compliance item updates (by updatedAt), upcoming deadlines

Wire this into the dashboard page as a new section.

---

## Feature 3: Multi-City Permit Guides (Phase 3 Expansion)

Add permit guides for neighboring cities — this is a major SEO and content moat.

### Cambridge Guides

**`src/app/(public)/permits/cambridge/building-permit/page.tsx`**
- Cambridge ISD process
- 3-6 week typical timeline
- Required docs: stamped plans, energy compliance, deed
- Portal: cambridgema.gov/CDD/permitting
- Special: Cambridge has its own green building requirements (LEED or equivalent)
- Fees: $12/sqft commercial, $8/sqft residential (simplified)

**`src/app/(public)/permits/cambridge/special-permit/page.tsx`**  
- Cambridge Board of Zoning Appeals
- 60-90 day process
- Required: site plan, traffic study if >10 units, community meeting

### Somerville Guides

**`src/app/(public)/permits/somerville/building-permit/page.tsx`**
- Somerville ISD — known for being efficient (avg 2-4 weeks)
- SomerVision zoning (updated 2022)
- Portal: somervillema.gov/departments/isd

### Brookline Guides

**`src/app/(public)/permits/brookline/building-permit/page.tsx`**
- Town of Brookline Building Department
- Strict historical commission review for older structures
- 4-8 week typical
- Special: Brookline has design review for projects >2,500 sqft addition

### Update Permits Index
In `src/app/(public)/permits/page.tsx`:
- Add a "Greater Boston" section with city cards: Boston | Cambridge | Somerville | Brookline | Newton
- Each city card links to its permit guides
- Tag line: "City-specific permit intelligence — not generic national guides"

---

## Constraints
- New files for all permit guides and components
- Surgical edits for dashboard page + permits index
- Must pass `npm run build`
- Match dark theme for dashboard components
- Public permit pages use the (public) layout wrapper
- No TypeScript errors
