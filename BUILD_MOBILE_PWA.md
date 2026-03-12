# Build: Phase 6B — Mobile PWA (PermitFlow has ZERO mobile app)

## Why This Matters
Construction happens on job sites. Developers visit sites. Inspectors show up. PermitFlow confirmed no mobile app.
A PWA (Progressive Web App) is installable from the browser, works offline, and uses the device camera.
No App Store submission needed. Ship today, install tomorrow.

## Stack
Next.js 15 (already supports PWA via next-pwa or manifest). Tailwind. No new major deps beyond what's needed for PWA manifest.

---

## Feature 1: PWA Manifest + Service Worker

### 1a. Web App Manifest — `public/manifest.json`
```json
{
  "name": "MeritLayer",
  "short_name": "MeritLayer",
  "description": "AI-powered construction compliance",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#080D1A",
  "theme_color": "#14B8A6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 1b. Generate placeholder icons — `public/icons/`
Create two simple SVG-based placeholder icons (192x192 and 512x512) as PNG files.
Since we can't run canvas in build, create them as simple colored squares with "ML" text using a Node script, OR just create the SVG files and reference them in the manifest with type "image/svg+xml":

Actually, simplest approach: create `public/icons/icon-192.svg` and `public/icons/icon-512.svg` as SVG files:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="32" fill="#080D1A"/>
  <rect x="16" y="16" width="160" height="160" rx="24" fill="#14B8A6"/>
  <text x="96" y="120" font-family="system-ui,sans-serif" font-size="72" font-weight="800" fill="white" text-anchor="middle">M</text>
</svg>
```

Reference them as SVG in manifest (browsers support SVG icons).

### 1c. Add manifest link to layout
In `src/app/layout.tsx`, add to the `<head>` section via Next.js metadata:
```typescript
export const metadata: Metadata = {
  // existing metadata...
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MeritLayer',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};
```

Also add to the `<html>` element's head (via the layout):
```html
<link rel="apple-touch-icon" href="/icons/icon-192.svg" />
<meta name="mobile-web-app-capable" content="yes" />
```

### 1d. Service Worker — `public/sw.js`
Simple offline-capable service worker:
```javascript
const CACHE_NAME = 'meritlayer-v1';
const OFFLINE_URLS = [
  '/',
  '/dashboard',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline'))
    );
  }
});
```

### 1e. Register service worker — add to layout
In `src/app/layout.tsx`, add a client component that registers the SW:

Create `src/components/service-worker-registration.tsx`:
```typescript
'use client';
import { useEffect } from 'react';
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);
  return null;
}
```
Import and add `<ServiceWorkerRegistration />` inside the body in layout.tsx.

### 1f. Offline page — `src/app/offline/page.tsx`
Simple page shown when offline:
```
MeritLayer logo/name
"You're offline"
"Your compliance data is cached. Connect to sync updates."
[Go to Dashboard] button
```

---

## Feature 2: Mobile-Optimized Field View — `src/app/(dashboard)/field/page.tsx`

A simplified mobile-first view accessible at `/field`. Designed for phones on job sites.

### Layout
Full-height, large touch targets, minimal chrome.

### Content:
**Header:** "Field View" + project selector dropdown (select active project)

**Section 1 — Today's Focus:**
Show compliance items due within 7 days for selected project:
- Large cards, one per item
- Requirement name (large text)
- Due date (color-coded: red <3 days, yellow <7 days)
- Status toggle button (big, tap to mark complete)

**Section 2 — Quick Upload:**
Camera-ready document upload:
```
[📷 Capture Document]
Tap to take a photo or choose from gallery
```
Uses `<input type="file" accept="image/*,application/pdf" capture="environment">` for camera access.
On capture, auto-uploads to the project's documents via the existing upload flow.

**Section 3 — Upcoming Inspections:**
List of inspection steps from the permit workflow that are "scheduled" status.
Large tap targets to mark as passed/failed.

**Bottom nav (fixed):**
- 🏠 Dashboard  
- 📋 Projects
- 📷 Field View (active)
- 👤 Profile

### Add "Field View" link to main sidebar nav
In `src/app/(dashboard)/layout.tsx`, add Field View link with a 📱 or 🏗️ icon. Surgical addition.

---

## Feature 3: Install Prompt Banner — `src/components/pwa-install-banner.tsx`

A smart banner that appears on mobile browsers prompting installation.

```typescript
'use client';
// Uses the beforeinstallprompt event
// Shows banner: "Install MeritLayer on your home screen for quick access"
// [Install] [Not now] buttons
// Hides after install or dismiss (stored in localStorage)
// Only shows on mobile (check navigator.userAgent or window.innerWidth < 768)
```

Wire into the dashboard layout — shown once at top of page, dismissible.

---

## Constraints
- New files for manifest, SW, offline page, field view, components
- Surgical edits ONLY for: layout.tsx (metadata + SW registration)
- Must pass `npm run build` with zero TypeScript errors
- Field view must be actually usable on a 375px wide phone screen
- Large tap targets (min 44px height on interactive elements)
- No TypeScript errors
