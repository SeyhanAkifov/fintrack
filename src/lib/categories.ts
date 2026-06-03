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
