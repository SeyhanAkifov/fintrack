import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTransactions } from "@/server/db";
import type { FilterState, TransactionType } from "@/types";

function toCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function monthToDateRange(month: string): { from: string; to: string } | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const [year, mon] = month.split("-").map(Number);
  const mm = String(mon).padStart(2, "0");
  const lastDay = new Date(year, mon, 0).getDate();
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const userId = Number(session.user.id);

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const range = month ? monthToDateRange(month) : null;

  const filters: FilterState = {
    category: searchParams.get("category"),
    type: searchParams.get("type") as TransactionType | null,
    from: range?.from ?? searchParams.get("from"),
    to: range?.to ?? searchParams.get("to"),
  };

  try {
    const transactions = await getTransactions(filters, userId);

    const header = "ID,Date,Type,Category,Amount,Note";
    const rows = transactions.map((t) =>
      [
        toCsvField(t.id),
        toCsvField(t.date.toISOString().slice(0, 10)),
        toCsvField(t.type),
        toCsvField(t.category),
        toCsvField(t.amount),
        toCsvField(t.note),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");

    const filename = month && range ? `transactions-${month}.csv` : "transactions.csv";

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Failed to export transactions", { status: 500 });
  }
}
