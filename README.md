# PermitIQ

AI-powered construction compliance & document intelligence platform. Automates permit tracking, deadline management, and regulatory compliance for general contractors and real estate developers.

## What PermitIQ Does

General contractors and developers spend 20-30 hours/week on permit paperwork. They miss deadlines ($5K-$50K fines per violation), fail inspections due to missing docs, and lose institutional knowledge when staff leave.

PermitIQ is the AI brain that:
- **Reads compliance documents** - Upload permits, inspection reports, certificates. AI extracts deadlines, requirements, and conditions automatically.
- **Tracks deadlines** - Never miss a permit deadline with alerts at 7 days, 3 days, and 1 day before due dates.
- **Maps requirements** - Match project docs against required items. See what's met, pending, or overdue at a glance.
- **Alerts you proactively** - Email and in-app notifications before anything falls through the cracks.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **API:** tRPC
- **Database:** Postgres + Drizzle ORM (Neon for hosted Postgres)
- **Auth:** Clerk
- **AI:** Anthropic Claude Sonnet (document processing), Claude Haiku (alerts)
- **File Storage:** Vercel Blob
- **Email:** Resend (deadline alerts)
- **Billing:** Stripe (subscriptions)
- **Deploy:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A Neon Postgres database
- Clerk account
- Anthropic API key
- Vercel Blob storage
- Resend account
- Stripe account

### 1. Clone and Install

```bash
git clone <repository-url>
cd permitiq
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-xxx

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx

# Resend (Email)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=alerts@yourdomain.com

# Stripe Billing
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Database

Push the schema to your database:

```bash
pnpm db:push
```

Seed the jurisdiction rules:

```bash
pnpm seed:jurisdictions
```

Optionally seed demo data:

```bash
pnpm seed
```

### 4. Set Up Clerk Webhook

1. Go to your Clerk Dashboard > Webhooks
2. Add a new endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SECRET`

### 5. Set Up Stripe

1. Create products and prices in Stripe Dashboard:
   - Starter: $999/month
   - Professional: $2,499/month
   - Enterprise: $4,999/month
2. Copy the price IDs to your environment variables
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Scripts

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema directly (dev)
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Seed jurisdiction rules
pnpm seed:jurisdictions

# Seed demo data
pnpm seed
```

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

The `vercel.json` includes a cron job configuration for daily deadline alerts at 7 AM UTC.

## Project Structure

```
permitiq/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── api/              # API routes (tRPC, webhooks, upload, cron)
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Drizzle schema
│   ├── lib/
│   │   ├── ai/               # Claude AI document processor
│   │   ├── trpc/             # tRPC client/server setup
│   │   └── utils.ts          # Utilities
│   └── server/
│       └── api/
│           ├── routers/      # tRPC routers
│           ├── root.ts       # Root router
│           └── trpc.ts       # tRPC setup
├── scripts/
│   ├── seed.ts               # Demo data seeder
│   └── seed-jurisdictions.ts # Jurisdiction rules seeder
├── drizzle.config.ts
├── middleware.ts
└── vercel.json               # Cron job config
```

## Features

### Document Processing
- Drag-and-drop upload (PDF, JPEG, PNG, GIF, WebP)
- AI-powered extraction using Claude Sonnet
- Extracts: document type, permit numbers, deadlines, inspections, requirements, jurisdiction, conditions

### Compliance Dashboard
- Project list with health scores
- Color-coded status (green/yellow/red)
- Upcoming deadlines widget
- Progress tracking

### Project Detail View
- Compliance checklist
- Document library
- Manual requirement entry
- Status updates

### Deadline Alerts
- Daily cron job (7 AM)
- Alerts at 7 days, 3 days, 1 day
- Overdue notifications
- Email via Resend
- In-app notification center

### Jurisdiction Rules
Pre-configured for:
- Massachusetts (General Residential)
- Boston, MA (City-specific)
- Generic Multi-Family Residential

### Billing
- Starter: $999/month (1 project, 100 docs)
- Professional: $2,499/month (5 projects, unlimited)
- Enterprise: $4,999/month (unlimited, custom rules)

## API Routes

- `POST /api/trpc/*` - tRPC endpoints
- `POST /api/upload` - File upload to Vercel Blob
- `POST /api/webhooks/clerk` - Clerk user sync
- `POST /api/webhooks/stripe` - Stripe subscription sync
- `GET /api/cron/deadline-alerts` - Daily deadline check

## License

Proprietary - All rights reserved.
