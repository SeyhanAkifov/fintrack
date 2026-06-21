export const CATEGORIES = [
  "Food",
  "Rent",
  "Salary",
  "Transport",
  "Entertainment",
  "Subscriptions",
  "Utilities",
  "Freelance",
  "Health",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * Seed data for the categories every user starts with. Used by the signup
 * route and the seed/backfill script only — UI components read the user's
 * own categories from the database instead.
 */
export const DEFAULT_CATEGORIES: {
  name: string;
  color: string;
  icon: string;
}[] = [
  { name: "Food",          color: "#6366f1", icon: "🍽️" },
  { name: "Rent",          color: "#8b5cf6", icon: "🏠" },
  { name: "Salary",        color: "#10b981", icon: "💰" },
  { name: "Transport",     color: "#f59e0b", icon: "🚌" },
  { name: "Entertainment", color: "#ec4899", icon: "🎬" },
  { name: "Subscriptions", color: "#3b82f6", icon: "🔁" },
  { name: "Utilities",     color: "#f97316", icon: "💡" },
  { name: "Freelance",     color: "#14b8a6", icon: "💻" },
  { name: "Health",        color: "#e11d48", icon: "❤️" },
  { name: "Other",         color: "#84cc16", icon: "📦" },
];

/** Fallback color for any category name without a stored color. */
export const DEFAULT_CATEGORY_COLOR = "#6366f1";
