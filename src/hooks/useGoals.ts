"use client";

/**
 * useGoals — client hook to fetch savings goals.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { useState, useEffect, useCallback } from "react";
import type { Goal } from "@/types";

// Fetches the user's savings goals; exposes goals, loading, error, and refetch.
export function useGoals(initial: Goal[] = []) {
  const [goals, setGoals] = useState<Goal[]>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Failed to fetch");
      setGoals(await res.json());
    } catch {
      setError("Could not load goals.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { goals, isLoading, error, refetch: fetch_ };
}
