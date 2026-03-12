# MeritLayer — Build Batch 3

## ⚠️ STRICT RULES — READ FIRST
1. **DO NOT modify any existing file unless absolutely required**
2. **DO NOT touch schema.ts** — add new schema in a SEPARATE file: src/server/db/schema-members.ts and src/server/db/schema-inspections.ts, then import them in schema.ts with a single line append
3. **DO NOT touch any existing tRPC router** — create new routers and register them in root.ts with a single line append
4. **DO NOT touch any existing page** — add new tabs/pages as new files only; add nav link in layout.tsx ONLY if needed (minimal edit)
5. **DO NOT run database migrations** — only write the schema files and SQL migration files; do NOT run drizzle push or migrate
6. **DO NOT change globals.css, tailwind.config, or any config file**
7. If you are unsure whether touching a file is safe, DO NOT touch it
8. New features must degrade gracefully — if a new API call fails, show an empty state, not a crash
9. Build one feature at a time. Commit after each.

## Context
MeritLayer is an AI-powered construction compliance OS.
Stack: Next.js 15 App Router, TypeScript, tRPC, Drizzle ORM (Postgres/Neon), Clerk auth, Vercel Blob, Anthropic Claude, Resend email.
Repo root: /Users/openclaw/.openclaw/workspace/ventures/permitiq
Dark navy theme (#080D1A bg, #14B8A6 teal, #6366F1 indigo). All layout uses inline styles to match theme.

## What's Already Working (DO NOT TOUCH)
- src/app/(dashboard)/layout.tsx — sidebar nav
- src/app/(dashboard)/dashboard/page.tsx — dashboard
- src/app/(dashboard)/projects/[id]/page.tsx — project detail
- src/server/db/schema.ts — existing tables
- src/server/api/root.ts — tRPC router registry
- src/server/api/routers/* — all existing routers

---

## FEATURE 1: Inspection Tracker

### New schema file: src/server/db/schema-inspections.ts
```typescript
import { pgTable, text, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { projects } from "./schema";

export const inspections = pgTable("inspections", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  inspectionType: text("inspection_type").notNull(), // building, electrical, plumbing, fire, final
  status: text("status").notNull().default("scheduled"), // scheduled, passed, failed, re_inspection, waived
  scheduledDate: date("scheduled_date"),
  completedDate: date("completed_date"),
  inspectorName: text("inspector_name"),
  notes: text("notes"),
  failureReason: text("failure_reason"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### Append to src/server/db/schema.ts (add ONE line at the bottom):
```typescript
export * from "./schema-inspections";
```

### Migration file: drizzle/0003_inspections.sql
```sql
CREATE TABLE IF NOT EXISTS "inspections" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "inspection_type" text NOT NULL,
  "status" text NOT NULL DEFAULT 'scheduled',
  "scheduled_date" date,
  "completed_date" date,
  "inspector_name" text,
  "notes" text,
  "failure_reason" text,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

### New tRPC router: src/server/api/routers/inspections.ts
Procedures:
- `list` — get all inspections for a projectId, ordered by sort_order
- `create` — create one inspection
- `update` — update status, dates, notes, failure_reason by id
- `delete` — delete by id
- `seedBoston` — insert the standard 14-step Boston inspection sequence for a projectId (only if none exist yet)

Boston sequence to seed:
1. Foundation/Footing — building
2. Underground Plumbing — plumbing
3. Underground Electrical — electrical
4. Rough Framing — building
5. Rough Plumbing — plumbing
6. Rough Electrical — electrical
7. Rough HVAC — building
8. Insulation — building
9. Fire Stop — fire
10. Final Building — building
11. Final Plumbing — plumbing
12. Final Electrical — electrical
13. Final Fire — fire
14. Certificate of Occupancy — final

### Append to src/server/api/root.ts (add ONE line):
```typescript
inspections: inspectionsRouter,
```
And the import at the top.

### New page: src/app/(dashboard)/projects/[id]/inspections/page.tsx
- Read projectId from params
- Load inspections via trpc.inspections.list.useQuery({ projectId })
- Show progress bar: X of 14 passed
- If 0 inspections: show "Start with Boston standard sequence" button → calls seedBoston
- Timeline list of inspections with status badges
  - scheduled = gray
  - passed = teal (#14B8A6)
  - failed = red (#EF4444)
  - re_inspection = amber (#F59E0B)
  - waived = slate
- Click row → inline expand with edit form (status dropdown, dates, inspector, notes, failure reason)
- "Add custom inspection" button → small form at bottom
- If all passed: show "🎉 CO Ready" green banner
- Match dark navy inline style theme

### Add link to inspections page:
In src/app/(dashboard)/projects/[id]/page.tsx, find the tab navigation section and add an "Inspections" tab linking to `/projects/${id}/inspections`. This is the ONLY edit to an existing file — add one tab link, nothing else.

---

## FEATURE 2: Comment Response Assistant

### New API route: src/app/api/response-draft/route.ts
- POST handler
- Body: { objectionText: string, projectAddress: string, permitType: string }
- Streams response from Anthropic claude-3-5-sonnet-latest
- System prompt: "You are a construction permit consultant specializing in Massachusetts building regulations (780 CMR). Draft a professional, concise response to the following permit objection. Cite specific code sections (IBC, 780 CMR, or local ordinances). Be persuasive but professional. Format as a formal letter."
- Use the ANTHROPIC_API_KEY env var already configured in the project
- Stream the response back using ReadableStream

### New component: src/components/comment-response-assistant.tsx
Props: { projectAddress: string, defaultPermitType?: string }
- Form: permit type input (text), objection text (textarea, large)
- "Draft Response" button → POST to /api/response-draft, stream result
- Show streaming output in a dark-styled pre/div below the form
- "Copy" button once complete
- "Clear & Try Again" button
- All dark navy inline styles

### New page: src/app/(dashboard)/projects/[id]/response-assistant/page.tsx
- Load project data for address
- Render <CommentResponseAssistant projectAddress={project.address} />
- Add "Response Assistant" tab link to the project tabs (same minimal edit as inspections tab above)

---

## Commit Strategy
After each feature:
```
git add -A && git commit -m "feat: [feature name]"
```

Final push after both features:
```
git push origin main
```

Then notify:
```
openclaw system event --text "Done: Inspection tracker + Comment Response Assistant built for MeritLayer — new files only, nothing broken" --mode now
```
