import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient, TransactionType } from "../generated/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const transactions = [
  {
    amount: 3500.0,
    type: TransactionType.income,
    category: "Salary",
    date: new Date("2026-05-01"),
    note: "Monthly salary - May",
  },
  {
    amount: 850.0,
    type: TransactionType.expense,
    category: "Rent",
    date: new Date("2026-05-02"),
    note: "May rent payment",
  },
  {
    amount: 62.4,
    type: TransactionType.expense,
    category: "Food",
    date: new Date("2026-05-03"),
    note: "Weekly grocery run",
  },
  {
    amount: 38.0,
    type: TransactionType.expense,
    category: "Transport",
    date: new Date("2026-05-05"),
    note: "Monthly transit pass",
  },
  {
    amount: 24.9,
    type: TransactionType.expense,
    category: "Food",
    date: new Date("2026-05-07"),
    note: "Dinner at restaurant",
  },
  {
    amount: 500.0,
    type: TransactionType.income,
    category: "Freelance",
    date: new Date("2026-05-10"),
    note: "Web design project payment",
  },
  {
    amount: 14.99,
    type: TransactionType.expense,
    category: "Subscriptions",
    date: new Date("2026-05-11"),
    note: "Netflix monthly",
  },
  {
    amount: 18.5,
    type: TransactionType.expense,
    category: "Transport",
    date: new Date("2026-05-13"),
    note: "Uber rides this week",
  },
  {
    amount: 55.0,
    type: TransactionType.expense,
    category: "Food",
    date: new Date("2026-05-15"),
    note: "Grocery shopping",
  },
  {
    amount: 120.0,
    type: TransactionType.expense,
    category: "Utilities",
    date: new Date("2026-05-16"),
    note: "Electricity and water bill",
  },
  {
    amount: 200.0,
    type: TransactionType.income,
    category: "Freelance",
    date: new Date("2026-05-18"),
    note: "Logo design gig",
  },
  {
    amount: 43.2,
    type: TransactionType.expense,
    category: "Food",
    date: new Date("2026-05-20"),
    note: "Lunch + coffee this week",
  },
  {
    amount: 29.0,
    type: TransactionType.expense,
    category: "Transport",
    date: new Date("2026-05-22"),
    note: "Fuel top-up",
  },
  {
    amount: 89.99,
    type: TransactionType.expense,
    category: "Health",
    date: new Date("2026-05-25"),
    note: "Gym membership",
  },
  {
    amount: 3500.0,
    type: TransactionType.income,
    category: "Salary",
    date: new Date("2026-06-01"),
    note: "Monthly salary - June",
  },
];

async function main() {
  console.log("Seeding transactions...");
  await prisma.transaction.deleteMany();
  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx });
  }
  console.log(`Seeded ${transactions.length} transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
