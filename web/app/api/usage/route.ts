import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { canAskQuestion, incrementUsage, getUserProfile, createUserProfile } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

// GET: Check if user can ask a question (usage status)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await canAskQuestion(userId);
    return NextResponse.json(usage);
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}

// POST: Increment usage count (called after successful AI response)
export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user profile
    let profile = await getUserProfile(userId);
    if (!profile) {
      const email = user.emailAddresses[0]?.emailAddress || "";
      profile = await createUserProfile(userId, email);
    }

    if (!profile) {
      return NextResponse.json({ error: "Failed to get profile" }, { status: 500 });
    }

    // Check if allowed
    const usage = await canAskQuestion(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: usage.reason, ...usage },
        { status: 429 }
      );
    }

    // Increment usage
    await incrementUsage(profile.id);

    return NextResponse.json({
      success: true,
      remaining: usage.remaining - 1,
      limit: usage.limit,
    });
  } catch (error) {
    console.error("Usage increment error:", error);
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    );
  }
}
