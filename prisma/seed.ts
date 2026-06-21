import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, TransactionType } from "../generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/categories";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const i = TransactionType.income;
const e = TransactionType.expense;

const transactions = [
  // ── APRIL 2026 ────────────────────────────────────────────────────────────
  { amount: 3500.00, type: i, category: "Salary",        date: new Date("2026-04-01"), note: "Monthly salary - April" },
  { amount: 850.00,  type: e, category: "Rent",          date: new Date("2026-04-02"), note: "April rent" },
  { amount: 98.00,   type: e, category: "Utilities",     date: new Date("2026-04-03"), note: "Gas & electricity" },
  { amount: 38.00,   type: e, category: "Transport",     date: new Date("2026-04-04"), note: "Monthly transit pass" },
  { amount: 14.99,   type: e, category: "Subscriptions", date: new Date("2026-04-05"), note: "Netflix" },
  { amount: 9.99,    type: e, category: "Subscriptions", date: new Date("2026-04-05"), note: "Spotify" },
  { amount: 54.30,   type: e, category: "Food",          date: new Date("2026-04-06"), note: "Weekly groceries" },
  { amount: 12.50,   type: e, category: "Food",          date: new Date("2026-04-08"), note: "Lunch at work" },
  { amount: 22.00,   type: e, category: "Transport",     date: new Date("2026-04-10"), note: "Uber to airport" },
  { amount: 300.00,  type: i, category: "Freelance",     date: new Date("2026-04-12"), note: "Landing page project" },
  { amount: 48.90,   type: e, category: "Food",          date: new Date("2026-04-13"), note: "Weekly groceries" },
  { amount: 35.00,   type: e, category: "Entertainment", date: new Date("2026-04-14"), note: "Cinema + drinks" },
  { amount: 89.99,   type: e, category: "Health",        date: new Date("2026-04-15"), note: "Gym membership" },
  { amount: 18.00,   type: e, category: "Food",          date: new Date("2026-04-16"), note: "Coffee & snacks" },
  { amount: 51.20,   type: e, category: "Food",          date: new Date("2026-04-20"), note: "Weekly groceries" },
  { amount: 15.00,   type: e, category: "Transport",     date: new Date("2026-04-21"), note: "Taxi home" },
  { amount: 29.99,   type: e, category: "Subscriptions", date: new Date("2026-04-22"), note: "Adobe Creative Cloud" },
  { amount: 62.00,   type: e, category: "Food",          date: new Date("2026-04-25"), note: "Dinner out with friends" },
  { amount: 200.00,  type: i, category: "Freelance",     date: new Date("2026-04-28"), note: "Logo design" },
  { amount: 44.00,   type: e, category: "Food",          date: new Date("2026-04-27"), note: "Weekly groceries" },

  // ── MAY 2026 ──────────────────────────────────────────────────────────────
  { amount: 3500.00, type: i, category: "Salary",        date: new Date("2026-05-01"), note: "Monthly salary - May" },
  { amount: 850.00,  type: e, category: "Rent",          date: new Date("2026-05-02"), note: "May rent" },
  { amount: 112.00,  type: e, category: "Utilities",     date: new Date("2026-05-03"), note: "Electricity, water & internet" },
  { amount: 38.00,   type: e, category: "Transport",     date: new Date("2026-05-04"), note: "Monthly transit pass" },
  { amount: 14.99,   type: e, category: "Subscriptions", date: new Date("2026-05-05"), note: "Netflix" },
  { amount: 9.99,    type: e, category: "Subscriptions", date: new Date("2026-05-05"), note: "Spotify" },
  { amount: 29.99,   type: e, category: "Subscriptions", date: new Date("2026-05-05"), note: "Adobe Creative Cloud" },
  { amount: 62.40,   type: e, category: "Food",          date: new Date("2026-05-05"), note: "Weekly groceries" },
  { amount: 24.90,   type: e, category: "Food",          date: new Date("2026-05-07"), note: "Dinner at restaurant" },
  { amount: 500.00,  type: i, category: "Freelance",     date: new Date("2026-05-10"), note: "Web design project" },
  { amount: 18.50,   type: e, category: "Transport",     date: new Date("2026-05-12"), note: "Uber rides" },
  { amount: 55.00,   type: e, category: "Food",          date: new Date("2026-05-13"), note: "Weekly groceries" },
  { amount: 45.00,   type: e, category: "Entertainment", date: new Date("2026-05-14"), note: "Concert tickets" },
  { amount: 89.99,   type: e, category: "Health",        date: new Date("2026-05-15"), note: "Gym membership" },
  { amount: 43.20,   type: e, category: "Food",          date: new Date("2026-05-18"), note: "Lunch + coffee" },
  { amount: 200.00,  type: i, category: "Freelance",     date: new Date("2026-05-20"), note: "Logo design gig" },
  { amount: 29.00,   type: e, category: "Transport",     date: new Date("2026-05-21"), note: "Fuel top-up" },
  { amount: 58.80,   type: e, category: "Food",          date: new Date("2026-05-24"), note: "Weekly groceries" },
  { amount: 149.00,  type: e, category: "Health",        date: new Date("2026-05-26"), note: "Dentist appointment" },
  { amount: 32.00,   type: e, category: "Food",          date: new Date("2026-05-28"), note: "Brunch with colleague" },

  // ── JUNE 2026 (current month) ─────────────────────────────────────────────
  { amount: 3500.00, type: i, category: "Salary",        date: new Date("2026-06-01"), note: "Monthly salary - June" },
  { amount: 850.00,  type: e, category: "Rent",          date: new Date("2026-06-02"), note: "June rent" },
  { amount: 105.00,  type: e, category: "Utilities",     date: new Date("2026-06-02"), note: "Electricity & water" },
  { amount: 38.00,   type: e, category: "Transport",     date: new Date("2026-06-03"), note: "Monthly transit pass" },
  { amount: 14.99,   type: e, category: "Subscriptions", date: new Date("2026-06-03"), note: "Netflix" },
  { amount: 9.99,    type: e, category: "Subscriptions", date: new Date("2026-06-03"), note: "Spotify" },
  { amount: 29.99,   type: e, category: "Subscriptions", date: new Date("2026-06-03"), note: "Adobe Creative Cloud" },
  { amount: 78.50,   type: e, category: "Food",          date: new Date("2026-06-04"), note: "Weekly groceries (price hike)" },
  { amount: 42.00,   type: e, category: "Food",          date: new Date("2026-06-05"), note: "Dinner out" },
  { amount: 750.00,  type: i, category: "Freelance",     date: new Date("2026-06-06"), note: "App redesign project" },
  { amount: 55.00,   type: e, category: "Transport",     date: new Date("2026-06-07"), note: "Fuel + parking" },
  { amount: 89.99,   type: e, category: "Health",        date: new Date("2026-06-08"), note: "Gym membership" },
  { amount: 68.00,   type: e, category: "Food",          date: new Date("2026-06-09"), note: "Weekly groceries" },
  { amount: 120.00,  type: e, category: "Entertainment", date: new Date("2026-06-10"), note: "Summer festival tickets" },
  { amount: 38.50,   type: e, category: "Food",          date: new Date("2026-06-11"), note: "Lunch + coffee this week" },
];

// Monthly spending limits per category. June 2026 is the current month and
// mirrors the seeded spend (Entertainment is intentionally over budget for the
// demo); May 2026 gives some history for month navigation.
const budgets = [
  // ── JUNE 2026 (current month) ──────────────────────────────────────────────
  { category: "Rent",          limitAmount: 850, month: 6, year: 2026 },
  { category: "Food",          limitAmount: 300, month: 6, year: 2026 },
  { category: "Transport",     limitAmount: 100, month: 6, year: 2026 },
  { category: "Entertainment", limitAmount: 100, month: 6, year: 2026 },
  { category: "Subscriptions", limitAmount: 60,  month: 6, year: 2026 },
  { category: "Utilities",     limitAmount: 120, month: 6, year: 2026 },
  { category: "Health",        limitAmount: 100, month: 6, year: 2026 },

  // ── MAY 2026 (history) ─────────────────────────────────────────────────────
  { category: "Rent",          limitAmount: 850, month: 5, year: 2026 },
  { category: "Food",          limitAmount: 250, month: 5, year: 2026 },
  { category: "Entertainment", limitAmount: 50,  month: 5, year: 2026 },
];

// Recurring templates for the demo user. nextRunDate is in early July 2026 so
// they show up as "upcoming" without immediately generating transactions.
const recurring = [
  { amount: 3500.0, type: i, category: "Salary",        frequency: "monthly" as const, nextRunDate: new Date("2026-07-01"), note: "Monthly salary" },
  { amount: 850.0,  type: e, category: "Rent",          frequency: "monthly" as const, nextRunDate: new Date("2026-07-02"), note: "Monthly rent" },
  { amount: 14.99,  type: e, category: "Subscriptions", frequency: "monthly" as const, nextRunDate: new Date("2026-07-05"), note: "Netflix" },
  { amount: 89.99,  type: e, category: "Health",        frequency: "monthly" as const, nextRunDate: new Date("2026-07-08"), note: "Gym membership" },
];

async function main() {
  console.log("Seeding database…");

  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.create({
    data: { email: "demo@fintrack.app", passwordHash, name: "Demo User" },
  });

  for (const tx of transactions) {
    await prisma.transaction.create({ data: { ...tx, userId: demoUser.id } });
  }

  // Backfill default categories for every user that has none.
  const users = await prisma.user.findMany({ select: { id: true } });
  let backfilled = 0;
  for (const u of users) {
    const count = await prisma.category.count({ where: { userId: u.id } });
    if (count === 0) {
      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: u.id })),
      });
      backfilled++;
    }
  }

  for (const b of budgets) {
    await prisma.budget.create({ data: { ...b, userId: demoUser.id } });
  }

  for (const r of recurring) {
    await prisma.recurringTransaction.create({ data: { ...r, userId: demoUser.id } });
  }

  console.log(`Created demo user: demo@fintrack.app / demo1234`);
  console.log(`Seeded ${transactions.length} transactions across April–June 2026.`);
  console.log(`Seeded default categories for ${backfilled} user(s).`);
  console.log(`Seeded ${budgets.length} budgets (May & June 2026).`);
  console.log(`Seeded ${recurring.length} recurring templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
