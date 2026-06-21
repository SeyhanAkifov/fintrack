# FinTrack 💰

A personal finance tracker built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma + SQLite**, and **Tailwind CSS**. Track income and expenses, set monthly budgets, automate recurring transactions, and visualize where your money goes.

## Features

- **Authentication** — email + password sign-up/sign-in (NextAuth v4, JWT sessions, bcrypt hashing).
- **Transactions** — full CRUD with filters (category, type, date range) and CSV export.
- **Budgets** — monthly spending limits per category with progress bars and over-budget alerts.
- **Custom categories** — create your own categories with a name, color, and icon (built-in icon picker). Renaming cascades to existing data; in-use categories are protected from deletion.
- **Recurring transactions** — automate rent, salary, subscriptions (weekly/monthly). Due entries post automatically on app load (catch-up generation, no cron needed) and surface in an "Upcoming Payments" widget.
- **CSV import** — upload a bank statement, map columns (handles `,`/`;` delimiters and US/DE number & date formats), get auto-suggested categories, review, and bulk-import. Duplicate rows are skipped automatically.
- **Dashboard** — income/expense/balance summary, expenses-by-category pie chart, balance-over-time line chart, month-over-month spending insights, budget health, and upcoming recurring payments.
- **Profile** — change your display name and password (current-password verified) from a dedicated profile page.
- **Dark mode** — toggle in the navbar, persisted to `localStorage`, with no flash on load.
- **Responsive** — mobile-friendly navigation with a hamburger menu.

## Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------ |
| Framework    | Next.js 14 (App Router), React 18, TypeScript                |
| Styling      | Tailwind CSS                                                  |
| Database     | SQLite via `better-sqlite3` + `@prisma/adapter-better-sqlite3` |
| ORM          | Prisma 7 (client generated to `./generated`)                 |
| Auth         | NextAuth v4 (Credentials provider, JWT)                      |
| Charts       | Recharts                                                      |
| Testing      | Jest + React Testing Library (unit/API), Playwright (E2E)    |

## Getting started

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    (DATABASE_URL points at the local SQLite file)
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'NEXTAUTH_SECRET="change-me-to-a-random-string"' >> .env
echo 'NEXTAUTH_URL="http://localhost:3000"' >> .env

# 3. Set up the database
npx prisma db push      # apply the schema to SQLite
npx prisma generate     # generate the Prisma client into ./generated

# 4. Seed demo data (optional but recommended)
npx tsx prisma/seed.ts

# 5. Start the dev server
npm run dev             # http://localhost:3000
```

### Demo login

After seeding, sign in with:

- **Email:** `demo@fintrack.app`
- **Password:** `demo1234`

> ⚠️ The seed script **wipes all existing users** and recreates only the demo user with sample transactions, budgets, categories, and recurring templates. New accounts you register get the 10 default categories but no sample data.

## Scripts

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm test             # Run unit/API tests (Jest)
npm test -- __tests__/components/SummaryCards.test.tsx  # Run a single test file

npm run test:e2e     # Run Playwright E2E tests (needs: npx playwright install)
npm run test:e2e:ui  # Playwright UI mode

npx prisma db push       # Apply schema changes to SQLite (no migration files)
npx prisma generate      # Regenerate the Prisma client after schema changes
npx tsx prisma/seed.ts   # Seed/reset the database
```

> Always run `npx prisma generate` after editing `prisma/schema.prisma`. The generated client lives in `generated/` (gitignored) — not in `node_modules`.

## Testing

```bash
npm test             # Jest (jsdom for components, node env for API routes)
npm run test:e2e     # Playwright — run `npx playwright install` once to download browsers
```


## License

Private / personal project.
