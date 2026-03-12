# Build: Collaborators System (Phase 4)

## Stack
Next.js 15 App Router, tRPC, Drizzle ORM (Postgres/Neon), Tailwind, dark theme. Clerk for auth.

## What to Build

### 1. DB Schema addition — `src/db/schema.ts`
Add to the existing schema file (append only, don't change existing tables):

```typescript
export const projectMembers = pgTable("project_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id"), // null until invite accepted
  email: text("email").notNull(),
  role: text("role").notNull().default("viewer"), // owner | editor | viewer
  inviteStatus: text("invite_status").notNull().default("pending"), // pending | accepted | declined
  inviteToken: text("invite_token").unique(),
  invitedBy: text("invited_by").notNull(), // userId of who sent invite
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2. DB Migration — `drizzle/0004_collaborators.sql`
```sql
CREATE TABLE IF NOT EXISTS "project_members" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" text,
  "email" text NOT NULL,
  "role" text NOT NULL DEFAULT 'viewer',
  "invite_status" text NOT NULL DEFAULT 'pending',
  "invite_token" text UNIQUE,
  "invited_by" text NOT NULL,
  "invited_at" timestamp DEFAULT now(),
  "accepted_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "project_members_project_idx" ON "project_members"("project_id");
CREATE INDEX IF NOT EXISTS "project_members_email_idx" ON "project_members"("email");
CREATE INDEX IF NOT EXISTS "project_members_token_idx" ON "project_members"("invite_token");
```

### 3. tRPC Router — `src/server/api/routers/collaborators.ts`
Procedures:
- `getByProject(projectId)` → list all members + their roles/status
- `invite({ projectId, email, role })` → create pending invite, generate token, (skip actual email for now — just create the record)
- `updateRole({ memberId, role })` → change role (owner only)
- `remove({ memberId })` → remove collaborator (owner only)
- `acceptInvite({ token })` → set userId from current user, status=accepted, acceptedAt=now (public, no auth check — just token)

Add to `src/server/api/root.ts` - import and add `collaborators: collaboratorsRouter`

### 4. Collaborators Tab — `src/components/collaborators-tab.tsx`
A tab panel component for use in the project detail page.

UI:
- Header: "Team Members" + "Invite Member" button (teal)
- Invite dialog: email input + role dropdown (Editor / Viewer) + Send Invite button
- Members list table:
  - Avatar (initials fallback) | Name/Email | Role badge | Status (Pending/Active) | Actions
  - Owner can change role or remove
  - Pending invites show "Pending" badge + "Copy Invite Link" button
  - Invite link = `https://meritlayer.ai/invite/[token]`
- Role descriptions: Owner = full access, Editor = can upload/update, Viewer = read-only
- Empty state: "Invite your GC, architect, or attorney to collaborate"

### 5. Invite Accept Page — `src/app/invite/[token]/page.tsx`
Public page (no auth required initially):
- Show: "You've been invited to collaborate on [Project Name]"
- Show role being granted
- "Accept Invitation" button → calls acceptInvite tRPC, redirects to /sign-up?redirect=/dashboard
- If already signed in: accept immediately and redirect to /projects/[id]
- If token invalid: show error

### 6. Wire into project page
In `src/app/(dashboard)/projects/[id]/page.tsx`:
- Find the Tabs component
- ADD a new "Team" tab with the CollaboratorsTab component
- Surgical edit only — add one tab trigger and one tab content block

## Constraints
- Follow exact Drizzle patterns from src/db/schema.ts
- Follow exact tRPC patterns from src/server/api/routers/projects.ts
- All new files except surgical additions to schema.ts, root.ts, project page
- Must pass `npm run build`
- Dark theme, teal accents throughout
