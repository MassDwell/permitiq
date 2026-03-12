import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
  "/pricing",
]);

export default clerkMiddleware(async (auth, req) => {
  // Clear stale Clerk dev-instance cookies that cause redirect loops
  // Dev cookies contain "clerk_db_jwt" or "__clerk_db_jwt" with a dev FAPI
  const hasStaleDev = [...req.cookies.getAll()].some(
    (c) =>
      (c.name.includes("__clerk") || c.name.includes("__client")) &&
      c.value.includes("clerk.accounts.dev")
  );

  if (hasStaleDev) {
    const response = NextResponse.redirect(req.nextUrl);
    // Clear all Clerk cookies
    [...req.cookies.getAll()]
      .filter((c) => c.name.startsWith("__clerk") || c.name.startsWith("__client"))
      .forEach((c) => {
        response.cookies.delete(c.name);
      });
    return response;
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
