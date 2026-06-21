"use client";

/**
 * useRecurring — client hook to fetch recurring transactions.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { useState, useEffect, useCallback } from "react";
import type { RecurringTransaction } from "@/types";

// Fetches the user's recurring transactions; exposes list, loading, error, refetch.
export function useRecurring(initial: RecurringTransaction[] = []) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recurring");
      if (!res.ok) throw new Error("Failed to fetch");
      setRecurring(await res.json());
    } catch {
      setError("Could not load recurring transactions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { recurring, isLoading, error, refetch: fetch_ };
}
