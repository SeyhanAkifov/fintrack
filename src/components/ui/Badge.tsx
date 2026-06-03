import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types";

interface BadgeProps {
  variant: TransactionType;
  className?: string;
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variant === "income"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700",
        className
      )}
    >
      {variant === "income" ? "Income" : "Expense"}
    </span>
  );
}
