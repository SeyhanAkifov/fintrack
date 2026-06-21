"use client";

import { useState, useEffect, useCallback } from "react";
import type { Goal } from "@/types";

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
