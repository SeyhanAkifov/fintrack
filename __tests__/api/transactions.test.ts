/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/transactions/route";
import { GET as GET_ONE, PUT, DELETE } from "@/app/api/transactions/[id]/route";
import { GET as GET_SUMMARY } from "@/app/api/transactions/summary/route";

jest.mock("@/server/db", () => ({
  getTransactions: jest.fn(),
  createTransaction: jest.fn(),
  getTransactionById: jest.fn(),
  updateTransaction: jest.fn(),
  deleteTransaction: jest.fn(),
  getSummary: jest.fn(),
}));

jest.mock("@/server/auth", () => ({ authOptions: {} }));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const {
  getTransactions,
  createTransaction,
  getTransactionById,
  deleteTransaction,
  getSummary,
} = jest.requireMock("@/server/db");

const { getServerSession } = jest.requireMock("next-auth");

const mockTransaction = {
  id: 1,
  amount: 50,
  type: "expense",
  category: "Food",
  date: new Date("2026-05-15"),
  note: "lunch",
  createdAt: new Date("2026-05-15"),
};

beforeEach(() => {
  getServerSession.mockResolvedValue({ user: { id: "1", email: "test@test.com" } });
});

afterEach(() => jest.clearAllMocks());

// ── GET /api/transactions ──────────────────────────────────────────────────
describe("GET /api/transactions", () => {
  it("returns 200 with transaction list", async () => {
    getTransactions.mockResolvedValueOnce([mockTransaction]);
    const req = new Request("http://localhost/api/transactions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].category).toBe("Food");
  });

  it("passes category filter to db", async () => {
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions?category=Food");
    await GET(req);
    expect(getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ category: "Food" }),
      1
    );
  });

  it("returns 200 with empty array when no results", async () => {
    getTransactions.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

// ── POST /api/transactions ─────────────────────────────────────────────────
describe("POST /api/transactions", () => {
  it("returns 201 with created transaction on valid body", async () => {
    createTransaction.mockResolvedValueOnce(mockTransaction);
    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 50,
        type: "expense",
        category: "Food",
        date: "2026-05-15T00:00:00.000Z",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe("Food");
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 50 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── GET /api/transactions/[id] ─────────────────────────────────────────────
describe("GET /api/transactions/[id]", () => {
  it("returns 200 with the transaction", async () => {
    getTransactionById.mockResolvedValueOnce(mockTransaction);
    const req = new Request("http://localhost/api/transactions/1");
    const res = await GET_ONE(req, { params: { id: "1" } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(1);
  });

  it("returns 404 when transaction is not found", async () => {
    getTransactionById.mockRejectedValueOnce(new Error("Not found"));
    const req = new Request("http://localhost/api/transactions/999");
    const res = await GET_ONE(req, { params: { id: "999" } });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/transactions/[id] ─────────────────────────────────────────
describe("DELETE /api/transactions/[id]", () => {
  it("returns 204 on success", async () => {
    deleteTransaction.mockResolvedValueOnce({ count: 1 });
    const req = new Request("http://localhost/api/transactions/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(204);
  });

  it("returns 404 when transaction does not exist", async () => {
    deleteTransaction.mockRejectedValueOnce(new Error("Not found"));
    const req = new Request("http://localhost/api/transactions/999", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "999" } });
    expect(res.status).toBe(404);
  });
});

// ── GET /api/transactions/summary ─────────────────────────────────────────
describe("GET /api/transactions/summary", () => {
  it("returns totalIncome, totalExpenses, balance", async () => {
    getSummary.mockResolvedValueOnce({
      totalIncome: 7700,
      totalExpenses: 1345.98,
      balance: 6354.02,
    });

    const res = await GET_SUMMARY();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalIncome).toBe(7700);
    expect(body.totalExpenses).toBe(1345.98);
    expect(body.balance).toBeCloseTo(6354.02);
  });
});
