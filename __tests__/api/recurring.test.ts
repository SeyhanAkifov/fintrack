/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/recurring/route";
import { DELETE } from "@/app/api/recurring/[id]/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => ({
  getRecurringTransactions: jest.fn(),
  createRecurringTransaction: jest.fn(),
  updateRecurringTransaction: jest.fn(),
  deleteRecurringTransaction: jest.fn(),
  categoryExists: jest.fn().mockResolvedValue(true),
}));

const { getServerSession } = jest.requireMock("next-auth") as {
  getServerSession: jest.Mock;
};
const {
  getRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransaction,
  categoryExists,
} = jest.requireMock("@/server/db") as {
  getRecurringTransactions: jest.Mock;
  createRecurringTransaction: jest.Mock;
  deleteRecurringTransaction: jest.Mock;
  categoryExists: jest.Mock;
};

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };
const mockRecurring = {
  id: 1,
  amount: 850,
  type: "expense",
  category: "Rent",
  note: "Monthly rent",
  frequency: "monthly",
  nextRunDate: "2026-07-02T00:00:00.000Z",
  active: true,
};

afterEach(() => jest.clearAllMocks());

describe("GET /api/recurring", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with the list", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getRecurringTransactions.mockResolvedValueOnce([mockRecurring]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].category).toBe("Rent");
  });
});

describe("POST /api/recurring", () => {
  it("returns 201 with the created template", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    createRecurringTransaction.mockResolvedValueOnce(mockRecurring);
    const req = new Request("http://localhost/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 850,
        type: "expense",
        category: "Rent",
        frequency: "monthly",
        nextRunDate: "2026-07-02T00:00:00.000Z",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect((await res.json()).category).toBe("Rent");
  });

  it("returns 400 when required fields are missing", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 850 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 on unknown category", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    categoryExists.mockResolvedValueOnce(false);
    const req = new Request("http://localhost/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 850,
        type: "expense",
        category: "Nope",
        frequency: "monthly",
        nextRunDate: "2026-07-02T00:00:00.000Z",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/recurring/[id]", () => {
  it("returns 204 on success", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteRecurringTransaction.mockResolvedValueOnce({ count: 1 });
    const req = new Request("http://localhost/api/recurring/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(204);
  });
});
