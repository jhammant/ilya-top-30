import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerSupabase } from "@/lib/supabase";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      status: string;
      customer_id: number;
      variant_id: number;
      user_email?: string;
      urls?: {
        customer_portal: string;
      };
    };
  };
}

function verifySignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = hmac.update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("x-signature");

  if (!signature) {
    console.error("No signature provided");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Verify webhook signature
  if (!verifySignature(body, signature)) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload: LemonSqueezyWebhookPayload = JSON.parse(body);
  const eventName = payload.meta.event_name;
  const supabase = createServerSupabase();

  console.log(`Received Lemon Squeezy webhook: ${eventName}`);

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_resumed": {
        const subscriptionId = payload.data.id;
        const customerId = payload.data.attributes.customer_id.toString();
        const userId = payload.meta.custom_data?.user_id;

        if (userId) {
          const { error } = await supabase
            .from("user_profiles")
            .update({
              lemonsqueezy_customer_id: customerId,
              subscription_id: subscriptionId,
              subscription_status: "active",
              daily_question_limit: 100,
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_id", userId);

          if (error) {
            console.error("Error updating user profile:", error);
          } else {
            console.log(`Subscription activated for user ${userId}`);
          }
        }
        break;
      }

      case "subscription_updated": {
        const subscriptionId = payload.data.id;
        const status = payload.data.attributes.status;

        // Map Lemon Squeezy status to our status
        const mappedStatus =
          status === "active" ? "active" :
          status === "past_due" ? "past_due" :
          status === "paused" ? "cancelled" :
          status === "cancelled" ? "cancelled" : "free";

        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: mappedStatus,
            daily_question_limit: mappedStatus === "active" ? 100 : 5,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating subscription:", error);
        } else {
          console.log(`Subscription ${subscriptionId} updated to ${mappedStatus}`);
        }
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const subscriptionId = payload.data.id;

        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "cancelled",
            daily_question_limit: 5,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscriptionId);

        if (error) {
          console.error("Error cancelling subscription:", error);
        } else {
          console.log(`Subscription ${subscriptionId} cancelled`);
        }
        break;
      }

      case "subscription_payment_failed": {
        const subscriptionId = payload.data.id;

        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating payment status:", error);
        } else {
          console.log(`Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      case "subscription_payment_success": {
        const subscriptionId = payload.data.id;

        // Ensure subscription is active after successful payment
        const { error } = await supabase
          .from("user_profiles")
          .update({
            subscription_status: "active",
            daily_question_limit: 100,
            updated_at: new Date().toISOString(),
          })
          .eq("subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating payment status:", error);
        } else {
          console.log(`Payment successful for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
