# MeritLayer — World-Class Visual Polish

## Reference Bar
Think: Linear, Vercel dashboard, Stripe, Raycast. Clean dark, premium typography, precise spacing, subtle depth.

## Current Problems (from screenshot)
- Dark theme not applying — body/main have no background class
- Typography is flat: all same weight, no hierarchy  
- Stat cards are bare: just a number, no visual weight
- Sidebar feels generic: no depth, no active glow
- Cards have no depth: flat borders, no layering
- No visual accents: no gradients, no glows, no life
- Upload zone looks like a placeholder
- Overall feels like a Bootstrap template, not a premium SaaS

---

## 1. FONT SYSTEM — Replace Inter with Plus Jakarta Sans

In `src/app/layout.tsx`:
```tsx
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});
```
Apply: `className={`${jakarta.variable} font-sans antialiased bg-[#080D1A] text-[#F1F5F9]`}`

In `globals.css`, add to `@theme inline`:
```css
--font-sans: var(--font-jakarta);
```

---

## 2. GLOBAL CSS — Fix Dark Theme & Typography Scale

Replace ALL of `globals.css` with this:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-jakarta);
  --font-mono: var(--font-geist-mono);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --background: #080D1A;
  --foreground: #F1F5F9;
  --card: #0E1525;
  --card-foreground: #F1F5F9;
  --popover: #0E1525;
  --popover-foreground: #F1F5F9;
  --primary: #14B8A6;
  --primary-foreground: #080D1A;
  --secondary: #6366F1;
  --secondary-foreground: #F1F5F9;
  --muted: #1A2235;
  --muted-foreground: #64748B;
  --accent: #14B8A6;
  --accent-foreground: #080D1A;
  --destructive: #EF4444;
  --border: rgba(255,255,255,0.07);
  --input: rgba(255,255,255,0.07);
  --ring: #14B8A6;
  --chart-1: #14B8A6;
  --chart-2: #6366F1;
  --chart-3: #34D399;
  --chart-4: #F59E0B;
  --chart-5: #EF4444;
  --radius: 0.75rem;
  --sidebar: #060B17;
  --sidebar-foreground: #94A3B8;
  --sidebar-primary: #14B8A6;
  --sidebar-primary-foreground: #080D1A;
  --sidebar-accent: #1A2235;
  --sidebar-accent-foreground: #F1F5F9;
  --sidebar-border: rgba(255,255,255,0.05);
  --sidebar-ring: #14B8A6;
}

* {
  border-color: var(--border);
}

body {
  background-color: var(--background);
  color: var(--foreground);
}

/* Premium scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Teal glow utility */
.glow-teal {
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(20, 184, 166, 0.05);
}

.glow-teal-text {
  text-shadow: 0 0 20px rgba(20, 184, 166, 0.4);
}
```

---

## 3. DASHBOARD LAYOUT — Sidebar (`src/app/(dashboard)/layout.tsx`)

Full rewrite:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { LayoutDashboard, Bell, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: unreadCount } = trpc.alerts.getUnreadCount.useQuery();

  return (
    <div className="min-h-screen" style={{ background: '#080D1A' }}>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64" style={{ background: '#060B17', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-5 h-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Logo size="md" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-[#14B8A6] bg-[#14B8A6]/10"
                      : "text-[#64748B] hover:text-[#94A3B8] hover:bg-white/[0.03]"
                  )}
                  style={isActive ? { boxShadow: 'inset 2px 0 0 #14B8A6' } : {}}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#14B8A6]" : "")} />
                  {item.name}
                  {item.name === "Alerts" && unreadCount && unreadCount > 0 ? (
                    <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                      {unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-3 pb-4 space-y-2">
            {/* Plan badge */}
            <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)' }}>
              <p className="text-xs font-medium text-[#14B8A6]">Starter Plan</p>
              <p className="text-xs text-[#475569] mt-0.5">3 active projects</p>
            </div>
            {/* User */}
            <div className="flex items-center gap-3 px-2 py-2">
              <UserButton />
              <p className="text-sm font-medium text-[#94A3B8]">Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 min-h-screen" style={{ background: '#080D1A' }}>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
```

---

## 4. DASHBOARD PAGE — Premium Stat Cards & Project List (`src/app/(dashboard)/dashboard/page.tsx`)

Key visual changes:
- Page header with subtle description text
- Stat cards: large bold number (text-4xl font-bold), colored icon in glowing circle, subtle card background with border
- Project cards: hover lift effect, status dot instead of pill, compliance progress bar
- Empty state illustration placeholder

Stat card pattern (apply to all 4 stats):
```tsx
<div className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-1px]"
  style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
  <div className="flex items-center justify-between mb-4">
    <p className="text-sm font-medium text-[#64748B]">Total Projects</p>
    <div className="h-8 w-8 rounded-lg flex items-center justify-center"
      style={{ background: 'rgba(20,184,166,0.12)', boxShadow: '0 0 12px rgba(20,184,166,0.1)' }}>
      <FolderOpen className="h-4 w-4 text-[#14B8A6]" />
    </div>
  </div>
  <p className="text-4xl font-bold text-[#F1F5F9] tracking-tight">12</p>
  <p className="text-xs text-[#475569] mt-1">+2 this month</p>
</div>
```

Project list row pattern:
```tsx
<div className="flex items-center gap-4 px-4 py-3.5 rounded-lg cursor-pointer transition-all duration-150 hover:bg-white/[0.03]"
  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
  {/* Status dot */}
  <div className="h-2 w-2 rounded-full bg-[#14B8A6] shrink-0" style={{ boxShadow: '0 0 6px rgba(20,184,166,0.6)' }} />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold text-[#F1F5F9] truncate">Project Name</p>
    <p className="text-xs text-[#475569] truncate">123 Main Street, Boston</p>
  </div>
  {/* Compliance mini-bar */}
  <div className="w-20">
    <div className="h-1 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '65%' }} />
    </div>
    <p className="text-xs text-[#475569] text-right mt-0.5">65%</p>
  </div>
  <ChevronRight className="h-4 w-4 text-[#334155] shrink-0" />
</div>
```

---

## 5. PROJECT DETAIL PAGE — Premium Treatment (`src/app/(dashboard)/projects/[id]/page.tsx`)

Header area:
- Large project title (text-2xl font-bold)
- Status badge with colored dot + text
- Breadcrumb with arrow
- Tab bar styled like Linear (border-b, active tab has teal bottom border + text)

Stat cards (4 across):
- Same pattern as dashboard but with color-specific icon backgrounds:
  - Compliance Score: teal (#14B8A6)
  - Requirements Met: emerald (#10B981) 
  - Pending: amber (#F59E0B)
  - Overdue: red (#EF4444)

Compliance checklist items:
```tsx
<div className="flex items-start gap-3 px-4 py-3.5 rounded-lg transition-all hover:bg-white/[0.02]"
  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
  <div className="mt-0.5 h-4 w-4 rounded shrink-0" 
    style={{ background: status === 'met' ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.07)', border: '1px solid', borderColor: status === 'met' ? '#14B8A6' : 'rgba(255,255,255,0.12)' }}>
    {status === 'met' && <Check className="h-3 w-3 text-[#14B8A6]" />}
  </div>
  <div>
    <p className="text-sm font-medium text-[#E2E8F0]">Requirement description</p>
    <p className="text-xs text-[#475569] mt-0.5">Source: SPRA Application §4.2</p>
  </div>
</div>
```

Tab bar:
```tsx
<div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
  <div className="flex px-6 gap-0">
    {tabs.map(tab => (
      <button key={tab} className={cn(
        "px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
        active === tab 
          ? "text-[#14B8A6] border-[#14B8A6]" 
          : "text-[#475569] border-transparent hover:text-[#94A3B8]"
      )}>
        {tab}
      </button>
    ))}
  </div>
</div>
```

---

## 6. LOGO COMPONENT — Clean SVG (`src/components/ui/logo.tsx`)

```tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { mark: 26, text: "text-sm", gap: "gap-2" },
  md: { mark: 32, text: "text-base", gap: "gap-2.5" },
  lg: { mark: 44, text: "text-xl", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const { mark, text, gap } = sizeConfig[size];
  const r = mark * 0.25;

  return (
    <div className={cn("flex items-center", gap, className)}>
      <svg width={mark} height={mark} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#lg)" />
        {/* M letterform as paths */}
        <path d="M8 22V10L13 18L16 13L19 18L24 10V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {showText && (
        <span className={cn("font-bold tracking-tight text-[#F1F5F9]", text)}>
          MeritLayer
        </span>
      )}
    </div>
  );
}
```

---

## 7. LANDING PAGE (`src/app/page.tsx`) 

Premium dark hero with:
- Radial gradient background: `background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.15) 0%, transparent 60%), #080D1A`
- Hero headline: text-6xl font-extrabold, tight tracking, white with teal gradient on key word
- Subheadline: text-xl text-[#64748B], max-w-lg, centered
- CTA button: teal background, glow shadow, rounded-xl, font-semibold
- Feature cards: glass morphism cards, teal icon accents
- Pricing section: popular card gets teal border + subtle glow

Headline pattern:
```tsx
<h1 className="text-6xl font-extrabold tracking-tight leading-[1.1]">
  Permit compliance,{" "}
  <span style={{ background: 'linear-gradient(135deg, #14B8A6, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
    finally solved
  </span>
</h1>
```

CTA button:
```tsx
<button className="px-8 py-4 rounded-xl font-semibold text-[#080D1A] transition-all hover:scale-[1.02]"
  style={{ background: 'linear-gradient(135deg, #14B8A6, #0EA5A5)', boxShadow: '0 0 30px rgba(20,184,166,0.3), 0 4px 15px rgba(0,0,0,0.3)' }}>
  Get started free →
</button>
```

Feature card:
```tsx
<div className="rounded-2xl p-6 transition-all hover:translate-y-[-2px]"
  style={{ background: 'rgba(14,21,37,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}>
  <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
    style={{ background: 'rgba(20,184,166,0.1)', boxShadow: '0 0 15px rgba(20,184,166,0.15)' }}>
    <Icon className="h-5 w-5 text-[#14B8A6]" />
  </div>
  <h3 className="text-base font-semibold text-[#F1F5F9] mb-2">Feature title</h3>
  <p className="text-sm text-[#475569] leading-relaxed">Feature description here.</p>
</div>
```

---

## 8. DOCUMENT UPLOAD ZONE (`src/components/document-upload-zone.tsx`)

Premium upload zone:
```tsx
<div
  className={cn(
    "relative rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer",
    isDragging ? "scale-[1.01]" : "hover:border-[#14B8A6]/40"
  )}
  style={{
    background: isDragging ? 'rgba(20,184,166,0.04)' : 'rgba(255,255,255,0.01)',
    border: `2px dashed ${isDragging ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: isDragging ? '0 0 30px rgba(20,184,166,0.08) inset' : 'none',
  }}
>
  <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4"
    style={{ background: 'rgba(20,184,166,0.1)', boxShadow: '0 0 20px rgba(20,184,166,0.1)' }}>
    <Upload className="h-6 w-6 text-[#14B8A6]" />
  </div>
  <p className="text-sm font-semibold text-[#E2E8F0] mb-1">Drop files here or click to upload</p>
  <p className="text-xs text-[#475569]">PDF, JPEG, PNG, GIF, or WebP — up to 10MB</p>
</div>
```

---

## Implementation Notes

1. Apply ALL changes — don't skip any file
2. Use inline `style` props for precise colors (avoids Tailwind purging)
3. Every background must be explicit — no bg-background (it was broken)
4. Do NOT change any business logic, API calls, tRPC hooks, or data fetching
5. After changes, run: `cd /Users/openclaw/.openclaw/workspace/ventures/permitiq && npx tsc --noEmit 2>&1 | head -30` to verify no TypeScript errors
6. Report each file changed with a one-line summary
