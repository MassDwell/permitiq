# Build: Phase 6B — Mobile PWA (Field-First Experience)

## Why This Matters
PermitFlow has ZERO mobile app. Construction happens on job sites. A developer or PM needs to check compliance on their phone while standing in front of a building inspector. MeritLayer should work perfectly on mobile — installable, fast, offline-capable.

## Approach: Progressive Web App (PWA)
No React Native needed. Add PWA capabilities to the existing Next.js app. Install on iPhone/Android home screen, works offline for read operations.

## Stack
Next.js 15 (existing). Add: next-pwa or manual service worker, web manifest.

---

## What to Build

### 1. Web App Manifest — `public/manifest.json`
```json
{
  "name": "MeritLayer",
  "short_name": "MeritLayer",
  "description": "AI-Powered Construction Compliance",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#080D1A",
  "theme_color": "#14B8A6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "shortcuts": [
    {
      "name": "My Projects",
      "url": "/dashboard",
      "description": "View all projects"
    },
    {
      "name": "Zoning Lookup",
      "url": "/tools/zoning-lookup",
      "description": "Look up Boston zoning"
    }
  ]
}
```

### 2. App Icons — generate programmatically
Create `scripts/generate-icons.mjs`:
```javascript
// Generate simple placeholder PNG icons using Canvas API or just create SVG-based icons
// For now, create simple colored square icons with "ML" text
// Write to public/icon-192.png and public/icon-512.png
// Use the sharp npm package if available, otherwise create a simple script note
```

Actually — skip programmatic generation. Instead create `public/icon-192.svg` and `public/icon-512.svg` as SVG files with this content:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="32" fill="#080D1A"/>
  <rect x="16" y="16" width="160" height="160" rx="24" fill="#0F172A"/>
  <text x="96" y="115" font-family="system-ui,sans-serif" font-size="72" font-weight="800" fill="#14B8A6" text-anchor="middle">ML</text>
</svg>
```

Then in the manifest, reference the SVG files:
```json
"icons": [
  { "src": "/icon-192.svg", "sizes": "192x192", "type": "image/svg+xml" },
  { "src": "/icon-512.svg", "sizes": "512x512", "type": "image/svg+xml" }
]
```

### 3. Link manifest in layout — `src/app/layout.tsx`
Add to the `<head>` metadata (Next.js way):
```typescript
export const metadata: Metadata = {
  // existing fields...
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MeritLayer',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // prevent zoom on form inputs on iOS
  },
};
```

Also add to the `<html>` tag or `<head>` in layout:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="MeritLayer" />
<link rel="apple-touch-icon" href="/icon-192.svg" />
```

### 4. Service Worker — `public/sw.js`
Simple offline-first service worker:
```javascript
const CACHE_NAME = 'meritlayer-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
  // Network first for API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('/trpc/')) {
    return; // Let it fail naturally if offline
  }
  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('/offline'));
    })
  );
});
```

### 5. Register SW — `src/app/layout.tsx`
Add a client component to register the service worker:

Create `src/components/pwa-register.tsx`:
```typescript
'use client';
import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);
  return null;
}
```

Import and add `<PWARegister />` to the body in layout.tsx.

### 6. Offline Page — `src/app/offline/page.tsx`
Simple page shown when offline:
```
📡 You're offline
Your project data will sync when you reconnect.
[View Cached Projects]  ← links to /dashboard
```
Dark theme, centered, teal accent.

### 7. Mobile-Optimized Bottom Nav — `src/components/mobile-nav.tsx`
A fixed bottom navigation bar shown ONLY on mobile (hidden on desktop):

```
[🏠 Home] [📋 Projects] [🔍 Zoning] [📊 Portfolio]
```

CSS: `fixed bottom-0 left-0 right-0 md:hidden` — only shows on mobile.
Links: /dashboard | /dashboard (projects) | /tools/zoning-lookup | /portfolio

Wire into `src/app/(dashboard)/layout.tsx` — add MobileNav below the main content, surgical addition only.

### 8. Camera Document Upload — `src/components/camera-capture.tsx`
A mobile-specific upload button that opens the device camera directly:

```typescript
'use client';
// A button that triggers <input type="file" accept="image/*" capture="environment" />
// When user takes photo → converts to File object → passes to the existing upload flow
// Shows: "📷 Scan Document" button (visible only on mobile)
// On click: triggers hidden file input with camera capture
// After capture: calls onFileSelected(file) prop
```

Add to `src/components/document-upload-zone.tsx` — surgical addition of the camera button below the existing drop zone, hidden on desktop (`md:hidden`).

---

## Constraints
- New files: manifest.json, sw.js, icon SVGs, offline page, mobile nav, camera capture, PWARegister
- Surgical edits only: layout.tsx (manifest meta + PWARegister), dashboard layout (mobile nav), document-upload-zone (camera button)
- Must pass `npm run build`
- Zero TypeScript errors
- All mobile UI hidden on desktop (`md:hidden` / `lg:hidden`)
