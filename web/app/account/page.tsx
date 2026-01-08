"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  CreditCard,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Crown,
  Calendar,
} from "lucide-react";

interface UsageData {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}

interface SubscriptionData {
  status: "free" | "active" | "cancelled" | "past_due";
  questionsUsedToday: number;
  dailyLimit: number;
}

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUsage();
    }
  }, [isLoaded, user]);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isPro = usage && usage.limit === 100;
  const usedToday = usage ? usage.limit - usage.remaining : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
          Account Settings
        </h1>

        <div className="grid gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.fullName || "User"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              {isPro && (
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold">Pro</span>
                </div>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Sign out
            </button>
          </div>

          {/* Subscription Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Subscription
              </h2>
            </div>

            {isPro ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Pro Plan Active
                    </p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      $9/month • 100 AI questions per day
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      Free Plan
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      5 AI questions per day
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      100 AI questions per day
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Smart Solver with RAG
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Question Generator
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Guided Learning
                    </li>
                  </ul>
                  <button
                    onClick={handleSubscribe}
                    disabled={checkoutLoading}
                    className="w-full py-3 px-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Subscribe for $9/month
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Usage Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Today's Usage
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    AI Questions Used
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {usedToday} / {usage?.limit || 0}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      usage && usage.remaining === 0
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{
                      width: `${usage ? (usedToday / usage.limit) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Resets daily at midnight UTC</span>
              </div>

              {usage && usage.remaining === 0 && !isPro && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    You've used all your free questions today.{" "}
                    <button
                      onClick={handleSubscribe}
                      className="font-semibold underline"
                    >
                      Upgrade to Pro
                    </button>{" "}
                    for 100 questions/day!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
