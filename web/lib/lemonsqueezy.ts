import { supabase } from "./supabase";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY!;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
const LEMONSQUEEZY_VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3782";

interface LemonSqueezyCustomer {
  id: string;
  attributes: {
    email: string;
    name: string;
  };
}

interface LemonSqueezySubscription {
  id: string;
  attributes: {
    status: string;
    customer_id: number;
    variant_id: number;
    urls: {
      customer_portal: string;
      update_payment_method: string;
    };
  };
}

// Create a checkout URL for a user
export async function createCheckoutUrl(
  userId: string,
  email: string
): Promise<string> {
  // Lemon Squeezy checkout URL with prefilled data
  const checkoutUrl = new URL(
    `https://ilya-top-30.lemonsqueezy.com/checkout/buy/${LEMONSQUEEZY_VARIANT_ID}`
  );

  // Add custom data to track the user
  checkoutUrl.searchParams.set("checkout[custom][user_id]", userId);
  checkoutUrl.searchParams.set("checkout[email]", email);
  checkoutUrl.searchParams.set("checkout[success_url]", `${APP_URL}/account?success=true`);

  return checkoutUrl.toString();
}

// Get customer portal URL for managing subscription
export async function getCustomerPortalUrl(
  subscriptionId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to get subscription:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.data.attributes.urls.customer_portal;
  } catch (error) {
    console.error("Error getting customer portal URL:", error);
    return null;
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Handle subscription created/activated
export async function handleSubscriptionCreated(
  userId: string,
  subscriptionId: string,
  customerId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({
      subscription_status: "active",
      subscription_id: subscriptionId,
      lemonsqueezy_customer_id: customerId,
      daily_question_limit: 100, // Pro limit
    })
    .eq("clerk_id", userId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

// Handle subscription cancelled
export async function handleSubscriptionCancelled(
  subscriptionId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({
      subscription_status: "cancelled",
      daily_question_limit: 5, // Back to free limit
    })
    .eq("subscription_id", subscriptionId);

  if (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

// Handle subscription payment failed
export async function handlePaymentFailed(
  subscriptionId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_profiles")
    .update({
      subscription_status: "past_due",
    })
    .eq("subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

// Get subscription status from Lemon Squeezy
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data.attributes.status;
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return null;
  }
}
