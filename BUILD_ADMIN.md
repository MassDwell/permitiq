# BUILD: MeritLayer Admin Console

## Goal
Build a founder admin console at `/admin` for Steve Vettori (the platform owner) to monitor signups, activity, revenue, and system health. It must match the existing MeritLayer dark theme exactly.

## Route Protection
- Gate the entire `/admin` route to a single hardcoded Clerk user ID stored in env var `ADMIN_CLERK_ID`
- Add `ADMIN_CLERK_ID` check in `src/middleware.ts` — redirect non-admins to `/dashboard`
- Also add `ADMIN_CLERK_ID=user_2uXXXXXXXXXXXXXXXXXXXXXX` as a placeholder in `.env.local` with a comment saying "replace with your Clerk user ID from clerk.com dashboard"
- Add to public route matcher exclusion (i.e., `/admin` should be protected, not public)

## Design System (MATCH EXACTLY)
- Font: Plus Jakarta Sans (already loaded via `--font-jakarta` CSS variable)
- Background: `#080D1A` (body/page bg)
- Sidebar bg: `#060B17`
- Card bg: `#111827` with `border border-white/10`
- Primary accent: teal-400 / `#14B8A6`
- Text: `text-white` primary, `text-slate-400` secondary
- Stat card pattern: dark card bg, teal accent numbers, slate labels
- Use Tailwind classes only — no inline styles except where necessary
- Shadcn components: Card, Badge, Table, Tabs — same as rest of app

## Layout
Create `src/app/(admin)/layout.tsx`:
- Same sidebar structure as dashboard layout but with admin nav items
- Sidebar items: Overview, Users, Projects, Documents, Revenue, Activity Feed
- Logo: "MeritLayer Admin" with a small shield or settings icon
- Sidebar bg `#060B17`, active item teal-500 bg

## Pages to Build

### 1. `/admin` — Overview (src/app/(admin)/page.tsx)
Top stat cards row:
- Total Users (count from `users` table)
- New This Week (users.createdAt >= 7 days ago)
- Active Projects (count from `projects` table)
- Documents Processed (count from `documents` where processingStatus = 'completed')
- Failed Docs (count where processingStatus = 'failed') — show in red if > 0
- Founding Members (users where plan != 'starter')

Below stats: two columns
- Left: **Recent Signups** — last 10 users (name/email, plan badge, signup date)
- Right: **Recent Documents** — last 10 uploaded docs (filename, project name, status badge, uploaded date)

### 2. `/admin/users` — Users Table (src/app/(admin)/users/page.tsx)
Full table of all users with columns:
- Name / Email
- Plan (badge: starter=slate, professional=teal, enterprise=purple)
- Signed Up (date)
- Projects (count)
- Docs Uploaded (count)
- Last Active (most recent document or project createdAt, or "Never")

Table is server-rendered. Sort by signup date desc by default.
Add a search input (client-side filter on name/email).

### 3. `/admin/projects` — Projects Table (src/app/(admin)/projects/page.tsx)
Table columns:
- Project Name
- Owner (user email)
- Jurisdiction
- Status
- Documents (count)
- Compliance Items (count, with how many pending)
- Created Date

### 4. `/admin/documents` — Document Processing Monitor (src/app/(admin)/documents/page.tsx)
Table columns:
- Filename
- Project / Owner
- Status badge (pending=yellow, processing=blue, completed=green, failed=red)
- Processing Error (truncated, show full on hover via title attr) — only show if failed
- Uploaded Date
- Processed Date

Failed docs should sort to top. This lets Steve manually spot-check processing failures.

### 5. `/admin/activity` — Activity Feed (src/app/(admin)/activity/page.tsx)
Chronological feed of platform events, newest first:
- User signup events (from users.createdAt)
- Document uploads (from documents.createdAt)
- Project creation (from projects.createdAt)
- Plan upgrades (users where plan != 'starter', sorted by updatedAt if available)

Each feed item: icon (colored by type), description text, timestamp (relative: "2 hours ago").
Limit to last 100 events, merged and sorted by timestamp.

### 6. `/admin/revenue` — Revenue Placeholder (src/app/(admin)/revenue/page.tsx)
Simple page with:
- Note: "Stripe webhook integration coming soon"
- Show current plan distribution from DB: pie/bar chart or stat cards (how many starter / professional / enterprise users)
- Show founding member count
- Placeholder cards for MRR, ARR, Churn Rate with "--" values and "Connect Stripe" CTA

## API / Data Layer
Create `src/server/api/routers/admin.ts`:
- All procedures require admin check: verify `ctx.dbUser.clerkId === process.env.ADMIN_CLERK_ID`
- `getStats` — returns all the counts for overview page
- `getUsers` — full users list with project + doc counts (use SQL joins or subqueries)
- `getProjects` — full projects list with owner email, doc count, compliance item count
- `getDocuments` — all documents with project name + owner email, sorted failed-first
- `getActivity` — merged activity feed (last 100 events)

Register in `src/server/api/root.ts` as `admin: adminRouter`.

## Middleware Update
In `src/middleware.ts`, add `/admin(.*)` to a protected-but-admin-only check:
```typescript
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Inside clerkMiddleware:
if (isAdminRoute(req)) {
  const { userId } = await auth();
  if (userId !== process.env.ADMIN_CLERK_ID) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
```

## Important Notes
- All data fetched server-side where possible (Server Components) for performance
- No skeleton loaders needed — this is an internal tool, simplicity > polish
- Use `db` directly in server components via `import { db } from "@/db"` pattern, OR use tRPC admin router — either is fine
- Reuse existing components: Badge, Card from shadcn, table styles from existing pages
- Do NOT break any existing routes or layouts
- The `(admin)` route group should have its own layout that does NOT include the regular dashboard sidebar
