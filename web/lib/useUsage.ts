"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface UsageData {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}

export function useUsage() {
  const { isSignedIn, isLoaded } = useUser();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!isSignedIn) {
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to fetch usage");
      }
    } catch (err) {
      setError("Failed to fetch usage");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const recordUsage = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) return false;

    try {
      const res = await fetch("/api/usage", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUsage((prev) =>
          prev
            ? { ...prev, remaining: data.remaining }
            : { allowed: true, remaining: data.remaining, limit: data.limit }
        );
        return true;
      } else {
        const data = await res.json();
        setError(data.reason || data.error);
        if (data.remaining !== undefined) {
          setUsage({
            allowed: false,
            remaining: data.remaining,
            limit: data.limit,
            reason: data.reason,
          });
        }
        return false;
      }
    } catch (err) {
      setError("Failed to record usage");
      return false;
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchUsage();
    }
  }, [isLoaded, fetchUsage]);

  return {
    usage,
    loading: loading || !isLoaded,
    error,
    isSignedIn,
    isPro: usage?.limit === 100,
    canAsk: usage?.allowed ?? false,
    remaining: usage?.remaining ?? 0,
    limit: usage?.limit ?? 0,
    fetchUsage,
    recordUsage,
  };
}
