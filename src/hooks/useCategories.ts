"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      setCategories(await res.json());
    } catch {
      setError("Could not load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  // name -> { color, icon } lookup for rendering swatches/icons.
  const byName = useMemo(
    () =>
      new Map(categories.map((c) => [c.name, { color: c.color, icon: c.icon }])),
    [categories]
  );

  return { categories, byName, isLoading, error, refetch: fetch_ };
}
