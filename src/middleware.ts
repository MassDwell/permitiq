import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/api/upload(.*)",
  "/pricing",
  "/permits(.*)",
  "/tools(.*)",        // AUDIT-FIX: public tools were gated behind auth
  "/share(.*)",        // AUDIT-FIX: share links require no auth
  "/invite(.*)",       // AUDIT-FIX: invite links require no auth
  "/offline",          // AUDIT-FIX: offline page must be accessible without auth
  "/manifest.json",    // AUDIT-FIX: PWA manifest was 404ing (middleware intercepted it)
  "/sw.js",            // AUDIT-FIX: service worker must be public
  "/sitemap.xml",
  "/robots.txt",
  "/api/spots-remaining", // AUDIT-FIX: public pricing endpoint
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// AUDIT-FIX: Removed hardcoded fallback Clerk ID — fail-closed (deny admin if env var not set)
const ADMIN_CLERK_ID = process.env.ADMIN_CLERK_ID;

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    await auth.protect();
    const { userId } = await auth();
    // AUDIT-FIX: deny admin if env var not configured (fail-closed)
    if (!ADMIN_CLERK_ID || userId !== ADMIN_CLERK_ID) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
