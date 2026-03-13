import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface InvitePageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function InviteReferralPage({ searchParams }: InvitePageProps) {
  const params = await searchParams;
  const ref = params.ref;

  if (ref) {
    const cookieStore = await cookies();
    cookieStore.set("referral_code", ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }

  redirect("/sign-up");
}
