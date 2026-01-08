import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy";
import { getUserProfile } from "@/lib/supabase";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getUserProfile(userId);

    if (!profile?.subscription_id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    const portalUrl = await getCustomerPortalUrl(profile.subscription_id);

    if (!portalUrl) {
      return NextResponse.json(
        { error: "Failed to get portal URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
