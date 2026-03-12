import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/pricing",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Clear stale Clerk dev-instance cookies that cause redirect loops.
  // Only run this once (check for a cleanup marker to avoid loops).
  if (!req.nextUrl.searchParams.has("_cc")) {
    const staleCookies = [...req.cookies.getAll()].filter(
      (c) =>
        (c.name.startsWith("__clerk") || c.name.startsWith("__client")) &&
        c.value.includes("clerk.accounts.dev")
    );

    if (staleCookies.length > 0) {
      const cleanUrl = new URL(req.url);
      cleanUrl.searchParams.set("_cc", "1");
      const response = NextResponse.redirect(cleanUrl);
      staleCookies.forEach((c) => response.cookies.delete(c.name));
      return response;
    }
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
