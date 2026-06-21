# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm test             # Run all tests
npm test -- __tests__/components/SummaryCards.test.tsx  # Run a single test file

npx prisma db push   # Apply schema changes to SQLite (no migration files)
npx prisma generate  # Regenerate the Prisma client after schema changes
npx tsx prisma/seed.ts  # Seed the database (creates demo@fintrack.app / demo1234)
```

> Always run `prisma generate` after editing `prisma/schema.prisma`. The generated client lives in `generated/` (gitignored) — not in `node_modules`.

## Architecture

### Layer structure
`src/server/` is the backend boundary — guarded by `import "server-only"` in each file. Next.js will abort the build with a hard error if any of these are imported from a client component:
- `src/server/prisma.ts` — Prisma singleton
- `src/server/db.ts` — all database query functions (the only place Prisma is called)
- `src/server/auth.ts` — NextAuth config

`src/lib/` holds shared code safe to import from either layer: `categories.ts` and `utils.ts`.

### Database & ORM
- **SQLite** via `better-sqlite3` with the `@prisma/adapter-better-sqlite3` driver. The Prisma client is **not** the standard npm client — it is generated to `./generated/` and imported from there (`../generated/client`, `../generated/enums`).
- `src/server/prisma.ts` holds the singleton client instance.
- `src/server/db.ts` is the only place that calls Prisma. Every exported function takes a `userId: number` as a required parameter and scopes all queries to that user — never call Prisma directly from pages or API routes.

### Authentication
- **NextAuth v4** with a `CredentialsProvider` (email + bcrypt password). Sessions use the **JWT strategy** — no sessions table in the database.
- Config lives in `src/server/auth.ts` (`authOptions`). The route handler is at `src/app/api/auth/[...nextauth]/route.ts`.
- `src/middleware.ts` protects `/dashboard` and `/transactions` — unauthenticated requests redirect to `/signin`.
- Session type is extended in `src/types/next-auth.d.ts` to include `user.id: string`.
- Every server page and API route calls `getServerSession(authOptions)` and converts `session.user.id` to a number before passing it to `db.ts`.

### API Routes
All routes are under `src/app/api/transactions/`. Each handler checks the session first and returns `401` if absent, then delegates entirely to `src/lib/db.ts`:
- `route.ts` — list (GET) and create (POST)
- `[id]/route.ts` — get, update, delete a single transaction
- `summary/route.ts`, `charts/route.ts`, `insights/route.ts` — aggregated data for the dashboard

### Data Flow (server components vs client)
- Dashboard and Transactions pages are **async server components** that call `db.ts` directly and pass serialized data as props.
- `TransactionList` is a **client component** that re-fetches from the API routes when filters change (via `src/hooks/useTransactions.ts`).
- Charts (`ExpensePieChart`, `BalanceLineChart`) are client components — Recharts requires the browser.

### Key conventions
- `@/*` path alias maps to `src/*`.
- Currency is formatted to **EUR** (German locale) via `src/lib/utils.ts` `formatCurrency()`.
- Categories are a fixed `as const` tuple in `src/lib/categories.ts` — add new categories there, not inline.
- `next.config.js` marks `better-sqlite3`, `@prisma/adapter-better-sqlite3`, and `@prisma/client` as `serverComponentsExternalPackages` so they are not bundled.

### Testing
- Tests live in `__tests__/` and use **Jest + React Testing Library** with jsdom.
- CSS imports are mocked via `__mocks__/styleMock.js`.
- The `@/` alias is resolved in Jest via `moduleNameMapper` in `jest.config.ts`.

### Component & function comment convention
When **creating a new JS/TS component file** (`.tsx`/`.ts` under `src/`), always start it with a file header comment that records the created and modified dates (use today's date in `YYYY-MM-DD`):

```tsx
/**
 * ComponentName — one-line summary of what this component does.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */
```

- On **every later edit** to that file, update the `Modified:` date to the current date (leave `Created:` unchanged).
- For **each function** (components, hooks, handlers, helpers), add a short comment directly above it describing its functionality in one line:

```tsx
// Formats a number as an EUR currency string (German locale).
export function formatCurrency(value: number) { ... }
```

Keep descriptions concise (one line). This applies to new code; when editing existing files, add the header/comments if missing rather than rewriting unrelated code.
