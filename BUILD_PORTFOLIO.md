# Build: Portfolio Intelligence Dashboard (Phase 2)

## Stack
Next.js 15 App Router, tRPC, Drizzle ORM (Postgres via Neon), Tailwind CSS, dark theme (#080D1A bg, #14B8A6 teal accent). Plus Jakarta Sans font.

## What to Build

### 1. Portfolio Dashboard Page — `src/app/(dashboard)/portfolio/page.tsx`
A dedicated portfolio view showing ALL projects in aggregate. This is separate from the per-project page.

**Sections:**

**A. Portfolio Health Header**
- Total projects count
- Overall compliance score (avg across all projects) as a big number with color: green ≥80%, yellow 50-79%, red <50%
- Active deadlines in next 30 days (count)
- Projects needing attention (compliance < 50%)

**B. Project Grid** (cards, responsive 2-3 col)
Each project card shows:
- Project name + address
- Compliance readiness % (progress bar, color-coded)
- Next deadline (days remaining, red if <14 days)
- Open compliance items count
- Status badge: "On Track" | "Needs Attention" | "Critical"
- Click → navigate to /projects/[id]

**C. Risk Flagging Panel**
List of projects with issues, sorted by urgency:
- 🔴 Critical: deadline <7 days OR compliance <30%
- 🟡 Warning: deadline <30 days OR compliance <60%
- Green = clear
Each row: project name, issue description, days remaining, "View Project" button

**D. Deadline Timeline**
A simple list of upcoming deadlines across ALL projects for next 60 days, sorted by date:
- Date | Project Name | Requirement | Days Remaining
- Color-coded urgency

### 2. tRPC Router additions — add to `src/server/api/routers/projects.ts`
Add a new procedure `getPortfolioStats` that returns:
```typescript
{
  totalProjects: number,
  avgComplianceScore: number,
  deadlinesNext30Days: number,
  projectsNeedingAttention: number,
  projects: Array<{
    id, name, address, complianceScore, nextDeadline, openItems, status
  }>,
  upcomingDeadlines: Array<{
    projectId, projectName, requirement, dueDate, daysRemaining
  }>
}
```
Compliance score = (completed items / total items) * 100, or 0 if no items.
Status = "critical" if score < 30 or deadline < 7d, "attention" if score < 60 or deadline < 30d, else "on-track".

### 3. Add nav link
In `src/app/(dashboard)/layout.tsx`, add "Portfolio" link with a 📊 or grid icon pointing to /portfolio. Add it after "Dashboard" in the nav. Surgical edit only.

## Design
- Match existing dark theme exactly
- Cards: `bg-[#0D1526] border border-white/10 rounded-xl`
- Teal accents for positive metrics
- Red for critical (#EF4444), yellow for warning (#F59E0B), green for on-track (#10B981)
- Skeleton loading states
- Empty state: "Add your first project to see portfolio insights"

## Constraints
- New files only except surgical nav addition in layout.tsx and addding procedure to projects.ts
- Must build cleanly: `npm run build`
- No TypeScript errors
- Use existing tRPC patterns from src/server/api/routers/projects.ts
- Use existing db schema from src/db/schema.ts (compliance_items, documents, projects tables)
