/**
 * @jest-environment node
 */
import { GET } from "@/app/api/budgets/status/route";
import { POST } from "@/app/api/budgets/route";
import { DELETE } from "@/app/api/budgets/[id]/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => ({
  getBudgetStatus: jest.fn(),
  upsertBudget: jest.fn(),
  deleteBudget: jest.fn(),
}));

const { getServerSession } = jest.requireMock("next-auth") as { getServerSession: jest.Mock };
const { getBudgetStatus, upsertBudget, deleteBudget } = jest.requireMock("@/server/db") as {
  getBudgetStatus: jest.Mock;
  upsertBudget: jest.Mock;
  deleteBudget: jest.Mock;
};

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };

const mockStatus = {
  id: 1,
  category: "Food",
  limit: 300,
  spent: 120,
  remaining: 180,
  percentUsed: 40,
  isOverBudget: false,
};

afterEach(() => jest.clearAllMocks());

// ── GET /api/budgets/status ───────────────────────────────────────────────────
describe("GET /api/budgets/status", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/budgets/status");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with budget statuses", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getBudgetStatus.mockResolvedValueOnce([mockStatus]);
    const req = new Request("http://localhost/api/budgets/status?month=6&year=2026");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].category).toBe("Food");
  });

  it("passes month and year from query params", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getBudgetStatus.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/budgets/status?month=3&year=2025");
    await GET(req);
    expect(getBudgetStatus).toHaveBeenCalledWith(1, 2025, 3);
  });

  it("defaults to current month/year when params are absent", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getBudgetStatus.mockResolvedValueOnce([]);
    const req = new Request("http://localhost/api/budgets/status");
    await GET(req);
    const now = new Date();
    expect(getBudgetStatus).toHaveBeenCalledWith(1, now.getFullYear(), now.getMonth() + 1);
  });
});

// ── POST /api/budgets ──────────────────────────────────────────────────────────
describe("POST /api/budgets", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/budgets", { method: "POST", body: "{}" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 201 with the saved budget", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    upsertBudget.mockResolvedValueOnce({ id: 1, category: "Food", limitAmount: 300, month: 6, year: 2026 });
    const req = new Request("http://localhost/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "Food", limitAmount: 300, month: 6, year: 2026 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.category).toBe("Food");
    expect(body.limitAmount).toBe(300);
  });

  it("returns 400 when required fields are missing", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "Food" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── DELETE /api/budgets/[id] ────────────────────────────────────────────────
describe("DELETE /api/budgets/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/budgets/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(401);
  });

  it("returns 204 on success", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteBudget.mockResolvedValueOnce({ count: 1 });
    const req = new Request("http://localhost/api/budgets/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(204);
  });

  it("calls deleteBudget with the correct id and userId", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteBudget.mockResolvedValueOnce({ count: 1 });
    const req = new Request("http://localhost/api/budgets/42", { method: "DELETE" });
    await DELETE(req, { params: { id: "42" } });
    expect(deleteBudget).toHaveBeenCalledWith(42, 1);
  });
});
