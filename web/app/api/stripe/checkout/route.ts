import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCheckoutSession, getOrCreateStripeCustomer } from "@/lib/stripe";
import { getUserProfile, createUserProfile } from "@/lib/supabase";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Get or create user profile in Supabase
    let profile = await getUserProfile(userId);
    if (!profile) {
      profile = await createUserProfile(userId, email);
    }

    if (!profile) {
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    // Already subscribed?
    if (profile.subscription_status === "active") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
    }

    // Get or create Stripe customer
    const customerId = profile.stripe_customer_id || await getOrCreateStripeCustomer(email, userId);

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(customerId, email, profile.id);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
