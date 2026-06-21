"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          primary:
            "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-sm shadow-indigo-200 focus:ring-indigo-500",
          secondary:
            "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm focus:ring-indigo-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700",
          danger:
            "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-sm shadow-rose-200 focus:ring-rose-500",
          ghost:
            "text-gray-500 hover:bg-gray-100 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-800",
        }[variant],
        {
          sm: "text-xs px-2.5 py-1.5 gap-1",
          md: "text-sm px-4 py-2 gap-2",
          lg: "text-base px-5 py-2.5 gap-2",
        }[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
