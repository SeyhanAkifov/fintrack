/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/transactions/route";
import { GET as GET_ONE, PUT, DELETE } from "@/app/api/transactions/[id]/route";
import { GET as GET_SUMMARY } from "@/app/api/transactions/summary/route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

const { prisma } = jest.requireMock("@/lib/prisma");

const mockTransaction = {
  id: 1,
  amount: 50,
  type: "expense",
  category: "Food",
  date: new Date("2026-05-15"),
  note: "lunch",
  createdAt: new Date("2026-05-15"),
};

afterEach(() => jest.clearAllMocks());

// ── GET /api/transactions ──────────────────────────────────────────────────
describe("GET /api/transactions", () => {
  it("returns 200 with transaction list", async () => {
    prisma.transaction.findMany.mockResolvedValueOnce([mockTransaction]);
    const req = new Request("http://localhost/api/transactions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].category).toBe("Food");
  });

  it("passes category filter to prisma", async () => {
    prisma.transaction.findMany.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions?category=Food");
    await GET(req);
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: "Food" }) })
    );
  });

  it("returns 200 with empty array when no results", async () => {
    prisma.transaction.findMany.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/transactions");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

// ── POST /api/transactions ─────────────────────────────────────────────────
describe("POST /api/transactions", () => {
  it("returns 201 with created transaction on valid body", async () => {
    prisma.transaction.create.mockResolvedValueOnce(mockTransaction);
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
    prisma.transaction.findUniqueOrThrow.mockResolvedValueOnce(mockTransaction);
    const req = new Request("http://localhost/api/transactions/1");
    const res = await GET_ONE(req, { params: { id: "1" } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(1);
  });

  it("returns 404 when transaction is not found", async () => {
    prisma.transaction.findUniqueOrThrow.mockRejectedValueOnce(new Error("Not found"));
    const req = new Request("http://localhost/api/transactions/999");
    const res = await GET_ONE(req, { params: { id: "999" } });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/transactions/[id] ─────────────────────────────────────────
describe("DELETE /api/transactions/[id]", () => {
  it("returns 204 on success", async () => {
    prisma.transaction.delete.mockResolvedValueOnce(mockTransaction);
    const req = new Request("http://localhost/api/transactions/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(204);
  });

  it("returns 404 when transaction does not exist", async () => {
    prisma.transaction.delete.mockRejectedValueOnce(new Error("Not found"));
    const req = new Request("http://localhost/api/transactions/999", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "999" } });
    expect(res.status).toBe(404);
  });
});

// ── GET /api/transactions/summary ─────────────────────────────────────────
describe("GET /api/transactions/summary", () => {
  it("returns totalIncome, totalExpenses, balance", async () => {
    prisma.transaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 7700 } })
      .mockResolvedValueOnce({ _sum: { amount: 1345.98 } });

    const res = await GET_SUMMARY();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalIncome).toBe(7700);
    expect(body.totalExpenses).toBe(1345.98);
    expect(body.balance).toBeCloseTo(6354.02);
  });
});
