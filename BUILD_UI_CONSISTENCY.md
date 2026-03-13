# Task: Full UI Consistency Pass — MeritLayer

## Problem
The site has two conflicting themes. The dashboard and homepage are correctly dark (`#080D1A` background, white text, teal `#14B8A6` accents, Plus Jakarta Sans). But several public-facing pages are still in an old light theme.

## Design System (apply everywhere)
- **Background:** `#080D1A` (body/page), `#0D1525` (cards), `#060B17` (sidebar/nav)
- **Text:** `#F1F5F9` (primary), `#94A3B8` (secondary/muted), `#64748B` (tertiary)
- **Accent:** `#14B8A6` (teal — CTAs, links, highlights)
- **Borders:** `rgba(255,255,255,0.06)`
- **Font:** Plus Jakarta Sans (already loaded via `--font-jakarta` CSS var)
- **Card style:** `bg-[#0D1525] border border-white/6 rounded-xl`

## Fixes Required

### 1. Fix public tool pages — dark theme
Convert these pages from light to dark theme:
- `src/app/(public)/tools/zoning-lookup/page.tsx`
- `src/app/(public)/tools/soft-costs-calculator/page.tsx`
- `src/app/(public)/tools/adu-eligibility/page.tsx`

Replace all:
- `bg-white` → `bg-[#0D1525]`
- `bg-gray-50`, `bg-gray-100` → `bg-[#111827]`
- `text-gray-900` → `text-white`
- `text-gray-600`, `text-gray-500` → `text-[#94A3B8]`
- `text-gray-400` → `text-[#64748B]`
- `text-blue-600`, `text-blue-700` → `text-[#14B8A6]`
- `bg-blue-50`, `bg-blue-100` → `bg-[rgba(20,184,166,0.1)]`
- `text-blue-500` → `text-[#14B8A6]`
- `border-gray-200`, `border-gray-300` → `border-white/10`
- `bg-orange-50`, `text-orange-700` → use amber equivalents on dark: `bg-amber-900/30 text-amber-400`
- `bg-red-50`, `text-red-700` → `bg-red-900/30 text-red-400`
- `bg-green-50`, `text-green-700` → `bg-green-900/30 text-green-400`
- Input fields: add `bg-[#111827] border-white/10 text-white placeholder:text-[#64748B]`
- Select fields: add `bg-[#111827] border-white/10 text-white`
- Wrap page backgrounds: outer div should have `style={{ background: '#080D1A', minHeight: '100vh', color: '#F1F5F9' }}`

### 2. Fix all permit guide detail pages — dark theme
These pages are all light-themed and need the same treatment. The pages are in:
- `src/app/(public)/permits/boston/` — all subdirectories (zba-variance, article-80-review, article-85-demolition, building-permit, certificate-of-occupancy, adu-permit)
- `src/app/(public)/permits/cambridge/` — all subdirectories
- `src/app/(public)/permits/somerville/` — all subdirectories
- `src/app/(public)/permits/brookline/` — all subdirectories
- `src/app/(public)/permits/massachusetts/` — all subdirectories

Same color substitutions as above. The `<main>` wrapper should have the dark background applied, not just relying on the layout.

Also check `src/app/(public)/permits/page.tsx` — the permits INDEX page. If it has any light-mode classes, convert them too.

### 3. Fix the public layout wrapper
Check `src/app/(public)/layout.tsx` (if it exists) or `src/app/(public)/permits/layout.tsx`. Add dark background to the layout level:
```tsx
<div style={{ background: '#080D1A', minHeight: '100vh', color: '#F1F5F9' }}>
  {children}
</div>
```

### 4. Fix broken sidebar nav links
The dashboard sidebar has "Zoning Lookup" and "ADU Tools" pointing to wrong routes.

Find `src/app/(dashboard)/layout.tsx` — update the navigation array:
- "Zoning Lookup" href should be `/tools/zoning-lookup` (not `/zoning`)
- "ADU Tools" href should be `/tools/adu-eligibility` (not `/adu-tools`)

### 5. Fix stuck project detail page skeleton
The project detail page at `src/app/(dashboard)/projects/[id]/page.tsx` is showing a permanent loading skeleton.

Read the file and find the issue. Likely the tRPC query is failing silently. Add proper error handling:
```tsx
const { data: project, isLoading, error } = trpc.projects.getById.useQuery({ id });
if (isLoading) return <LoadingSkeleton />;
if (error || !project) return <div>Project not found</div>;
```
Make sure the error state renders something useful instead of being stuck in skeleton state forever.

### 6. Custom 404 page
Create `src/app/not-found.tsx` with a styled dark theme 404 page:
```tsx
export default function NotFound() {
  return (
    <div style={{ background: '#080D1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#14B8A6', lineHeight: 1 }}>404</h1>
        <p style={{ color: '#94A3B8', marginTop: '1rem', marginBottom: '2rem' }}>Page not found</p>
        <a href="/" style={{ background: '#14B8A6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>Go Home</a>
      </div>
    </div>
  );
}
```

## Working directory
`/Users/openclaw/.openclaw/workspace/ventures/permitiq`

## When done
Run `npm run build` to confirm no TypeScript errors. Report what was changed.
