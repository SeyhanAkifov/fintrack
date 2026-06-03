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
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        {
          primary:
            "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
          secondary:
            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
          danger:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
          ghost:
            "text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
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
