# Task: Add "In Progress" Status + Inline Notes to Compliance Checklist

## Context
The compliance checklist at `/projects/[id]` currently has statuses: pending, met, overdue, not_applicable.
The `notes` field already exists on `complianceItems` DB table and in the `update` mutation.
Steve wants to mark items as "In Progress" and add a note explaining what's happening (e.g., "Submitted water cut and cap application to Boston Water & Sewer").

## Changes Required

### 1. DB Migration — add `in_progress` to the enum
Create file `drizzle/0007_in_progress_status.sql`:
```sql
ALTER TYPE "compliance_status" ADD VALUE 'in_progress';
```

Run the migration:
```bash
cd /Users/openclaw/.openclaw/workspace/ventures/permitiq
npx drizzle-kit push
```

If `drizzle-kit push` fails, use:
```bash
npx drizzle-kit generate
```
and then apply manually via the DB URL in `.env.local`.

### 2. Update schema.ts — add in_progress to enum
In `src/db/schema.ts`, find:
```ts
export const complianceStatusEnum = pgEnum("compliance_status", ["pending", "met", "overdue", "not_applicable"]);
```
Change to:
```ts
export const complianceStatusEnum = pgEnum("compliance_status", ["pending", "in_progress", "met", "overdue", "not_applicable"]);
```

### 3. Update tRPC router — accept in_progress
In `src/server/api/routers/compliance.ts`, find the `update` procedure input:
```ts
status: z.enum(["pending", "met", "overdue", "not_applicable"]).optional(),
```
Change to:
```ts
status: z.enum(["pending", "in_progress", "met", "overdue", "not_applicable"]).optional(),
```

### 4. Update project page — compliance checklist UX

In `src/app/(dashboard)/projects/[id]/page.tsx`:

#### 4a. Add `in_progress` badge to `getStatusBadge()`
```tsx
case "in_progress":
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">In Progress</span>;
```

#### 4b. Add state for inline notes editing
Near the other useState hooks, add:
```tsx
const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
const [noteText, setNoteText] = useState<string>("");
```

#### 4c. Add status dropdown per item
Replace the current `<Checkbox>` + single click behavior with a richer control.
Keep the checkbox for toggling met/pending, but add a **status dropdown** next to the badge.

Add a `<select>` or use a simple button group for status. Easiest approach — a small `<select>` that shows the current status and calls `handleStatusChange` on change:

```tsx
<select
  value={item.status}
  onChange={(e) => handleStatusChange(item.id, e.target.value)}
  className="text-xs rounded px-2 py-0.5 font-medium border cursor-pointer"
  style={{
    background: '#0D1525',
    borderColor: 'rgba(255,255,255,0.1)',
    color: item.status === 'met' ? '#4ade80'
      : item.status === 'in_progress' ? '#60a5fa'
      : item.status === 'overdue' ? '#f87171'
      : item.status === 'not_applicable' ? '#6b7280'
      : '#fbbf24',
  }}
>
  <option value="pending">Pending</option>
  <option value="in_progress">In Progress</option>
  <option value="met">Met</option>
  <option value="overdue">Overdue</option>
  <option value="not_applicable">N/A</option>
</select>
```

Place this INSTEAD of `{getStatusBadge(item.status)}` inside the checklist item header row.
Keep the checkbox but make it toggle between met and (in_progress or pending) based on current state.

Update the checkbox `onCheckedChange` to handle in_progress too:
```tsx
onCheckedChange={(checked) =>
  handleStatusChange(item.id, checked ? "met" : (item.status === "in_progress" ? "in_progress" : "pending"))
}
```
Actually keep it simple — checkbox checked = met, unchecked = pending.

#### 4d. Add inline notes UI below each item

Replace the current notes display:
```tsx
{item.notes && (
  <p className="text-sm text-muted-foreground mt-2">
    {item.notes}
  </p>
)}
```

With a full inline edit UI:
```tsx
{editingNoteId === item.id ? (
  <div className="mt-2 flex gap-2">
    <textarea
      autoFocus
      rows={2}
      value={noteText}
      onChange={(e) => setNoteText(e.target.value)}
      placeholder="Add a note... e.g. Submitted water cut and cap application to BWSC on 3/12"
      className="flex-1 text-sm px-3 py-2 rounded-lg resize-none"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.15)',
        color: '#F1F5F9',
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setEditingNoteId(null);
        }
      }}
    />
    <div className="flex flex-col gap-1">
      <button
        onClick={() => {
          updateItem.mutate({ id: item.id, notes: noteText });
          setEditingNoteId(null);
        }}
        className="text-xs px-3 py-1.5 rounded font-medium bg-[#14B8A6] text-white hover:bg-[#0D9488]"
      >
        Save
      </button>
      <button
        onClick={() => setEditingNoteId(null)}
        className="text-xs px-3 py-1.5 rounded font-medium text-[#64748B] hover:text-white"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <div className="mt-2">
    {item.notes ? (
      <div className="flex items-start gap-2">
        <p className="text-sm flex-1 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', color: '#94A3B8' }}>
          📝 {item.notes}
        </p>
        <button
          onClick={() => { setEditingNoteId(item.id); setNoteText(item.notes ?? ''); }}
          className="text-xs text-[#64748B] hover:text-[#14B8A6] shrink-0 mt-1"
        >
          Edit
        </button>
      </div>
    ) : (
      <button
        onClick={() => { setEditingNoteId(item.id); setNoteText(''); }}
        className="text-xs text-[#475569] hover:text-[#14B8A6] transition-colors flex items-center gap-1"
      >
        + Add note
      </button>
    )}
  </div>
)}
```

#### 4e. Make sure `updateItem` mutation is defined  
Find the existing `handleStatusChange` function and ensure there's also an `updateItem` mutation available:
```tsx
const updateItem = trpc.compliance.update.useMutation({
  onSuccess: () => utils.projects.getById.invalidate({ id: projectId }),
});
```
(It may already be called `updateCompliance` or similar — just reuse whatever mutation is already wired up for status changes.)

### 5. Build and verify
```bash
cd /Users/openclaw/.openclaw/workspace/ventures/permitiq
npm run build
```
Fix any TypeScript errors. Then report what was changed.
