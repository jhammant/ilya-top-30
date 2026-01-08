import Stripe from "stripe";

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Price ID for the $9/month subscription (you'll create this in Stripe dashboard)
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID!;

// Create a Stripe checkout session for subscription
export async function createCheckoutSession(
  customerId: string,
  customerEmail: string,
  userId: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: SUBSCRIPTION_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancelled`,
    metadata: {
      userId: userId,
    },
    subscription_data: {
      metadata: {
        userId: userId,
      },
    },
  });

  return session.url!;
}

// Create a Stripe billing portal session for managing subscription
export async function createBillingPortalSession(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return session.url;
}

// Create or get Stripe customer
export async function getOrCreateStripeCustomer(
  email: string,
  clerkId: string
): Promise<string> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      clerkId: clerkId,
    },
  });

  return customer.id;
}
