"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilterState, Transaction } from "@/types";

export function useTransactions(filters: FilterState = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = useCallback((f: FilterState) => {
    const params = new URLSearchParams();
    if (f.category) params.set("category", f.category);
    if (f.type) params.set("type", f.type);
    if (f.from) params.set("from", f.from);
    if (f.to) params.set("to", f.to);
    const qs = params.toString();
    return `/api/transactions${qs ? `?${qs}` : ""}`;
  }, []);

  const fetch_ = useCallback(
    async (f: FilterState) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(f));
        if (!res.ok) throw new Error("Failed to fetch");
        const data: Transaction[] = await res.json();
        setTransactions(data);
      } catch {
        setError("Could not load transactions.");
      } finally {
        setIsLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    fetch_(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.type, filters.from, filters.to]);

  const refetch = useCallback(() => fetch_(filters), [fetch_, filters]);

  return { transactions, setTransactions, isLoading, error, refetch };
}
