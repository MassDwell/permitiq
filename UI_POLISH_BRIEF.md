# MeritLayer UI Polish Brief

## Current State (observed 2026-03-12)
- Plain white/light gray background
- No visual depth or hierarchy
- Sidebar is minimal, no logo treatment
- Stats cards are flat, no color/gradient
- Typography is basic, no weight variation
- Upload zone is dashed outline, feels unfinished
- Color usage: only red/green/yellow on numbers — no brand color

## Design Direction: "Premium Dark SaaS"

Reference: Linear, Vercel dashboard, Raycast — dark theme, subtle gradients, tight typography

### Color System
Primary background: #0A0F1E (near black navy)
Card background: #111827 (dark gray)
Card border: #1F2937 with subtle glow on hover
Accent: #14B8A6 (teal) — primary actions, highlights
Accent secondary: #6366F1 (indigo) — secondary elements
Success: #10B981
Warning: #F59E0B
Danger: #EF4444
Text primary: #F9FAFB
Text secondary: #9CA3AF
Text muted: #4B5563

### Typography
- Use Inter or Geist (already installed via Next.js)
- Page titles: 2xl, font-bold, tracking-tight
- Section headers: lg, font-semibold
- Stat numbers: 3xl, font-bold, tabular-nums
- Labels: xs, uppercase, tracking-wider, text-muted

### Components to Polish

#### Sidebar
- Dark background (#0A0F1E)
- Logo: MeritLayer wordmark with teal M icon
- Active state: teal left border + teal text
- Hover: subtle bg highlight
- Bottom: user avatar with name + plan badge

#### Stat Cards (Dashboard + Project)
- Dark card with subtle border
- Icon in teal/indigo circle
- Large bold number with color coding
- Trend indicator (up/down arrow with %)
- Subtle gradient on card hover

#### Project List Cards
- Dark card, hover state with border glow
- Status badge: colored pill (Needs Attention = amber, On Track = teal, etc.)
- Progress bar with teal fill
- Last updated timestamp

#### Compliance Table
- Alternating row shading (very subtle)
- Status pills with colored backgrounds
- Expandable row for AI reasoning (chevron)
- Source citation link styled as small teal tag

#### Upload Zone
- Dashed border → solid with teal glow on drag-over
- Icon: teal upload icon
- CTA button: teal fill, white text

#### Tabs
- Underline style, teal active indicator
- Subtle count badges on each tab

#### Header / Top Bar
- Project name as breadcrumb
- Status badge prominent
- Last updated time

### Marketing Pages (Landing, Permits, Pricing)
- Hero: dark background with gradient mesh
- CTA buttons: teal with hover glow
- Feature cards: dark with icon + gradient border

## Logo Usage
- Favicon: teal M mark on dark square
- Sidebar: small icon + "MeritLayer" wordmark
- Marketing: full lockup with tagline

## Implementation Notes
- Update globals.css with dark theme CSS vars
- Update tailwind.config with brand colors
- Wrap layout in dark theme (dark class on html)
- Ensure Clerk components match dark theme (appearance prop)
- Use shadcn dark mode variants throughout
