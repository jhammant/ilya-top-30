import { createClient } from "@supabase/supabase-js";

// Database types
export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: "free" | "active" | "cancelled" | "past_due";
  subscription_id: string | null;
  daily_question_limit: number;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  date: string;
  question_count: number;
  created_at: string;
}

export interface CompletedPaper {
  id: string;
  user_id: string;
  paper_id: number;
  completed_at: string;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for API routes)
export const createServerSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper functions
export async function getUserProfile(clerkId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function createUserProfile(
  clerkId: string,
  email: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      clerk_id: clerkId,
      email: email,
      subscription_status: "free",
      daily_question_limit: 5, // Free tier gets 5 questions/day
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
  return data as UserProfile;
}

export async function getTodayUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_records")
    .select("question_count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (error || !data) return 0;
  return data.question_count;
}

export async function incrementUsage(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  // Try to update existing record
  const { data: existing } = await supabase
    .from("usage_records")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("usage_records")
      .update({ question_count: existing.question_count + 1 })
      .eq("id", existing.id);
    return !error;
  } else {
    // Create new record for today
    const { error } = await supabase
      .from("usage_records")
      .insert({
        user_id: userId,
        date: today,
        question_count: 1,
      });
    return !error;
  }
}

export async function canAskQuestion(clerkId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}> {
  const profile = await getUserProfile(clerkId);

  if (!profile) {
    return { allowed: false, remaining: 0, limit: 0, reason: "User not found" };
  }

  const limit = profile.subscription_status === "active" ? 100 : 5;
  const used = await getTodayUsage(profile.id);
  const remaining = Math.max(0, limit - used);

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      reason: profile.subscription_status === "active"
        ? "Daily limit reached. Resets at midnight."
        : "Free tier limit reached. Upgrade for 100 questions/day!",
    };
  }

  return { allowed: true, remaining, limit };
}
