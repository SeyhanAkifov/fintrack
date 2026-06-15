/**
 * @jest-environment node
 */
import { GET } from "@/app/api/transactions/export/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => ({ getTransactions: jest.fn() }));

const { getServerSession } = jest.requireMock("next-auth") as { getServerSession: jest.Mock };
const { getTransactions } = jest.requireMock("@/server/db") as { getTransactions: jest.Mock };

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };

const mockTransactions = [
  {
    id: 1,
    amount: 45.5,
    type: "expense",
    category: "Food",
    date: new Date("2026-06-15"),
    note: "Lunch",
    createdAt: new Date("2026-06-15"),
  },
  {
    id: 2,
    amount: 3000,
    type: "income",
    category: "Salary",
    date: new Date("2026-06-01"),
    note: null,
    createdAt: new Date("2026-06-01"),
  },
];

afterEach(() => jest.clearAllMocks());

describe("GET /api/transactions/export", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/transactions/export");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns CSV with correct header and rows", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce(mockTransactions);
    const req = new Request("http://localhost/api/transactions/export");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="transactions.csv"');

    const lines = (await res.text()).split("\n");
    expect(lines[0]).toBe("ID,Date,Type,Category,Amount,Note");
    expect(lines[1]).toBe("1,2026-06-15,expense,Food,45.5,Lunch");
    expect(lines[2]).toBe("2,2026-06-01,income,Salary,3000,");
  });

  it("uses transactions-YYYY-MM.csv filename when month param provided", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions/export?month=2026-06");
    const res = await GET(req);
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="transactions-2026-06.csv"');
  });

  it("converts month param to from/to date range", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions/export?month=2026-06");
    await GET(req);
    expect(getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ from: "2026-06-01", to: "2026-06-30" }),
      1
    );
  });

  it("handles February in a leap year correctly", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions/export?month=2024-02");
    await GET(req);
    expect(getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ from: "2024-02-01", to: "2024-02-29" }),
      1
    );
  });

  it("passes category and type filters through", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions/export?category=Food&type=expense");
    await GET(req);
    expect(getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Food", type: "expense" }),
      1
    );
  });

  it("escapes notes containing commas and double quotes", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockResolvedValueOnce([
      {
        id: 3,
        amount: 20,
        type: "expense",
        category: "Food",
        date: new Date("2026-06-10"),
        note: 'Cafe "Luna", coffee',
        createdAt: new Date("2026-06-10"),
      },
    ]);
    const req = new Request("http://localhost/api/transactions/export");
    const text = await (await GET(req)).text();
    expect(text).toContain('"Cafe ""Luna"", coffee"');
  });

  it("returns 500 when getTransactions throws", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getTransactions.mockRejectedValueOnce(new Error("DB error"));
    const req = new Request("http://localhost/api/transactions/export");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
