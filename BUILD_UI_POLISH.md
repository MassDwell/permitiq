# MeritLayer UI Polish — Full Dark Theme Redesign

Transform MeritLayer from plain white SaaS to premium dark-theme product. Reference aesthetic: Linear, Vercel dashboard, Raycast.

## Color System (implement in tailwind.config.ts + globals.css)

CSS variables to add to globals.css:
```
--background: 222 47% 7%;           /* #0A0F1E */
--card: 217 33% 12%;                /* #111827 */
--card-foreground: 210 40% 98%;
--popover: 217 33% 12%;
--popover-foreground: 210 40% 98%;
--primary: 173 80% 40%;             /* #14B8A6 teal */
--primary-foreground: 222 47% 7%;
--secondary: 239 84% 67%;           /* #6366F1 indigo */
--secondary-foreground: 210 40% 98%;
--muted: 217 33% 17%;
--muted-foreground: 215 20% 65%;
--accent: 173 80% 40%;
--accent-foreground: 222 47% 7%;
--border: 217 33% 17%;
--input: 217 33% 17%;
--ring: 173 80% 40%;
```

Set dark mode as default (not user-toggled). In globals.css, apply these vars directly to :root (not just .dark). Also add `dark` class to html element in the root layout.

## Tailwind Config
Add to tailwind.config.ts colors:
- brand: { teal: '#14B8A6', navy: '#0A0F1E', indigo: '#6366F1' }

## Sidebar (src/components/layout/sidebar.tsx or similar)

Find the sidebar component and redesign it:
- Background: bg-[#0A0F1E] or bg-background
- Top: Logo area — "M" icon (teal square with white M letterform) + "MeritLayer" text in white, font-semibold
- Nav items: icon + label, default text-muted-foreground
- Active item: teal left border (border-l-2 border-primary), text-primary, bg-primary/10
- Hover: bg-white/5 transition
- Bottom: user avatar (Clerk UserButton) + name + plan badge (e.g. "Starter" pill in indigo)
- Divider lines: border-white/10

For the logo mark, create a simple SVG inline: a rounded square with gradient from teal to indigo containing a white "M" letterform. Export as src/components/ui/logo.tsx.

## Dashboard Page Polish

Stats cards:
- Dark card: bg-card border border-white/10 rounded-xl p-6
- Icon: small colored circle (teal/indigo/amber/red) with relevant Lucide icon
- Label: text-xs uppercase tracking-wider text-muted-foreground
- Number: text-3xl font-bold tabular-nums
- Add subtle hover: hover:border-white/20 transition

Project list cards:
- Similar dark card treatment
- Project name: text-lg font-semibold
- Address: text-sm text-muted-foreground
- Status badge: rounded-full pill
  - "Needs Attention" → bg-amber-500/20 text-amber-400 border border-amber-500/30
  - "On Track" → bg-teal-500/20 text-teal-400 border border-teal-500/30
  - "Complete" → bg-green-500/20 text-green-400 border border-green-500/30
- Compliance score progress bar: bg-white/10 with teal fill, rounded-full
- Arrow/chevron icon on right for navigation
- Hover: border-white/20 with slight translateY(-1px) shadow

## Project Detail Page Polish

Header section:
- Project name: text-2xl font-bold tracking-tight
- Status badge: prominent, pill style (see above)
- Address + created date: text-sm text-muted-foreground with icons

Stat cards (compliance score, requirements met, pending, overdue):
- Each card: specific icon + color
  - Compliance Score: shield icon, teal
  - Requirements Met: check-circle, green
  - Pending: clock, amber
  - Overdue: alert-triangle, red
- Numbers: large + bold with color matching icon

Tabs:
- Style: border-b border-white/10, tab items with padding
- Active: border-b-2 border-primary text-primary
- Inactive: text-muted-foreground hover:text-foreground
- Count badges on tabs: small rounded bg-white/10

## Compliance Checklist Table

- Table container: rounded-xl border border-white/10 overflow-hidden
- Header row: bg-white/5 text-xs uppercase tracking-wider text-muted-foreground
- Body rows: hover:bg-white/5 transition border-b border-white/5
- Status pills:
  - Met: bg-green-500/20 text-green-400
  - Pending: bg-amber-500/20 text-amber-400
  - Not Met: bg-red-500/20 text-red-400
- AI reasoning expand: chevron icon, smooth height transition
- Source citation: small teal tag with external link icon

## Upload Zone

- Border: border-2 border-dashed border-white/20 rounded-xl
- Drag over state: border-primary bg-primary/5
- Icon: teal Upload icon (Lucide)
- Text: "Drop files here or click to upload" text-foreground
- Sub-text: text-muted-foreground text-sm
- Button: bg-primary text-primary-foreground hover:bg-primary/90

## Buttons

Primary: bg-primary (teal) text-primary-foreground rounded-lg font-medium
Outline: border border-white/20 text-foreground hover:bg-white/5
Destructive: bg-red-500/20 text-red-400 border border-red-500/30

## Document Cards

- bg-card border border-white/10 rounded-lg
- File icon: colored by type (PDF = red, image = blue)
- "Processed" badge: green pill
- Action buttons: subtle icon buttons with hover states

## Logo Component (src/components/ui/logo.tsx)

Create a React component that renders the MeritLayer logo mark:
- A rounded square (12x12 or 10x10) with gradient from teal (#14B8A6) to indigo (#6366F1)
- White "M" letterform inside (font-bold, text-white)
- Next to it: "MeritLayer" in font-semibold text-foreground
- Accept a `size` prop: "sm" | "md" | "lg"
- Accept a `showText` prop (default true)

Example usage: <Logo size="md" /> in sidebar

## Marketing Pages (/, /pricing, /permits/*)

Landing page hero:
- Full dark background with subtle radial gradient mesh (teal at top-right, indigo at bottom-left, very subtle)
- Hero headline: text-5xl font-bold tracking-tight
- Sub: text-xl text-muted-foreground
- CTA button: teal with subtle glow (box-shadow: 0 0 20px rgba(20,184,166,0.3))

Pricing cards:
- All dark cards
- Popular plan: border-primary with teal glow
- Price: large, bold, teal

## Clerk Auth Pages

Add appearance prop to ClerkProvider in layout:
```
appearance={{
  variables: {
    colorBackground: '#0A0F1E',
    colorInputBackground: '#111827',
    colorInputText: '#F9FAFB',
    colorText: '#F9FAFB',
    colorTextSecondary: '#9CA3AF',
    colorPrimary: '#14B8A6',
    colorDanger: '#EF4444',
    borderRadius: '0.5rem',
  },
  elements: {
    card: 'bg-[#111827] border border-white/10 shadow-2xl',
    headerTitle: 'text-white',
    socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
    formFieldInput: 'bg-[#111827] border-white/10 text-white',
    footerActionLink: 'text-teal-400',
  }
}}
```

## Implementation Order
1. globals.css — dark CSS vars (replaces current light theme vars)
2. tailwind.config.ts — brand colors
3. Root layout — add dark class to html, Clerk appearance
4. Logo component
5. Sidebar redesign
6. Stat cards / dashboard
7. Project detail page
8. Compliance table
9. Upload zone
10. Document cards
11. Buttons global styles
12. Marketing pages

## Notes
- Use cn() utility throughout
- Keep all existing functionality working
- Don't change any tRPC/API logic — UI only
- Test that dark mode looks right on both dashboard and marketing pages
- Commit when done
