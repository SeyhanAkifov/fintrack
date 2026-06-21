/**
 * @jest-environment node
 */
import { POST } from "@/app/api/transactions/import/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => ({
  bulkCreateTransactions: jest.fn(),
}));

const { getServerSession } = jest.requireMock("next-auth") as {
  getServerSession: jest.Mock;
};
const { bulkCreateTransactions } = jest.requireMock("@/server/db") as {
  bulkCreateTransactions: jest.Mock;
};

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };

afterEach(() => jest.clearAllMocks());

describe("POST /api/transactions/import", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const req = new Request("http://localhost/api/transactions/import", {
      method: "POST",
      body: JSON.stringify({ rows: [] }),
    });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 400 when rows is not an array", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/transactions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: "nope" }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 201 with the import result", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    bulkCreateTransactions.mockResolvedValueOnce({ created: 2, skipped: 1, invalid: 0 });
    const req = new Request("http://localhost/api/transactions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rows: [
          { amount: 50, type: "expense", category: "Food", date: "2026-05-15T00:00:00.000Z" },
          { amount: 20, type: "expense", category: "Food", date: "2026-05-16T00:00:00.000Z" },
        ],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.created).toBe(2);
    expect(body.skipped).toBe(1);
  });
});
