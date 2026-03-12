# Pricing Page Build — Founding Member Launch

## Overview
Build a world-class pricing page for MeritLayer with Founding Member mechanic.
This is a PUBLIC marketing page at `/pricing` (no auth required).

## Stripe Price IDs (from .env.local)
- Founder Solo: price_1TAIiZ94ePmNThnDeO2t68pI ($49/mo)
- Founder Developer: price_1TAIia94ePmNThnDTO9Lb7Vo ($99/mo)
- Founder Portfolio: price_1TAIib94ePmNThnDIK80HmLd ($199/mo)
- Regular Solo: price_1TAIiZ94ePmNThnD8A8bjdVn ($149/mo)
- Regular Developer: price_1TAIia94ePmNThnD1mr2KDJT ($349/mo)
- Regular Portfolio: price_1TAIib94ePmNThnDBfqopr9e ($749/mo)

## Files to Create (NEW FILES ONLY — do not edit existing files except where noted)

### 1. `src/app/pricing/page.tsx`
Public marketing pricing page. No auth wrapper needed.

Design requirements:
- Dark theme matching the app (#080D1A background, teal accent #14B8A6)
- Plus Jakarta Sans font (already in layout via CSS variable --font-jakarta)
- Hero section: "Founding Member Pricing" headline with urgency banner
- 3 pricing cards side by side (Solo / Developer / Portfolio)
- Each card shows: founder price LARGE, regular price crossed out, "You save X%" badge
- Feature list per tier (see below)
- Spots counter: "47 of 50 spots remaining" — read from a simple API or hardcode at 47 for now
- Deadline: "Offer ends April 15, 2026"
- CTA button: "Get Founding Member Access" → triggers Stripe checkout
- Annual toggle: show monthly by default, annual = 2 months free (just UI toggle, checkout stays monthly for now)
- FAQ section at bottom
- Nav: Logo + "Sign in" link, no full nav needed

Tier features:
**Solo ($49/mo founder → $149/mo regular)**
- Up to 3 active projects
- AI document extraction (deadlines, compliance items)
- Compliance checklist tracking
- Permit workflow tracker
- Public permit guides
- Soft costs calculator
- Email support

**Developer ($99/mo founder → $349/mo regular)** — Most Popular
- Everything in Solo
- Up to 10 active projects
- 3 team members
- AI permit research with source citations
- Inspection tracker (14-step Boston sequence)
- Comment response assistant
- AHJ contact directory
- Priority email support

**Portfolio ($199/mo founder → $749/mo regular)**
- Everything in Developer
- Unlimited projects
- Unlimited team members
- API access
- White-label option
- Custom AHJ integrations
- Dedicated onboarding call
- Phone + email support

### 2. `src/app/api/checkout/route.ts`
POST endpoint for Stripe checkout session creation.

```typescript
// POST /api/checkout
// Body: { priceId: string, isFounder: boolean }
// Returns: { url: string }
// Creates Stripe checkout session with:
//   - success_url: https://meritlayer.ai/dashboard?welcome=true
//   - cancel_url: https://meritlayer.ai/pricing
//   - mode: 'subscription'
//   - allow_promotion_codes: true
// Auth: use Clerk to get userId if logged in, pass as client_reference_id
// No auth required — guests can checkout too
```

### 3. `src/app/pricing/layout.tsx`
Simple layout wrapper — just renders children, no sidebar.

### 4. Add nav link to existing dashboard layout
In `src/app/(dashboard)/layout.tsx`, find the sidebar nav links and ADD (do not remove anything):
- A link to `/pricing` labeled "Upgrade Plan" with a ⚡ icon
Only add if the file exists and you can safely append to the nav array.

## Design Reference
The app uses these Tailwind classes consistently:
- Background: `bg-[#080D1A]` or style={{ background: '#080D1A' }}
- Cards: `bg-[#0D1526] border border-white/10`
- Teal accent: `text-teal-400`, `bg-teal-500`, `border-teal-500/30`
- Text: `text-[#F1F5F9]` primary, `text-slate-400` secondary
- Buttons: `bg-teal-500 hover:bg-teal-400 text-white font-semibold`

## Constraints
- NEW FILES ONLY for pricing page + checkout API + pricing layout
- For the dashboard layout nav link: surgical addition only, do not rewrite the file
- Build must pass `npm run build` without errors
- No TypeScript errors
- Use `fetch('/api/checkout', ...)` from client, redirect to Stripe URL on success
- Hardcode spots_remaining=47 for now (we'll hook up a real counter later)
