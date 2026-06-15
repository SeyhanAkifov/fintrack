"use client";

import { useState, useEffect, useCallback } from "react";
import type { BudgetStatus } from "@/types";

export function useBudgets(year: number, month: number) {
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/budgets/status?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setStatuses(await res.json());
    } catch {
      setError("Could not load budgets.");
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { statuses, isLoading, error, refetch: fetch_ };
}
