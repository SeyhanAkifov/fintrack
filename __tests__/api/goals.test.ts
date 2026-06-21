/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/goals/route";
import { DELETE } from "@/app/api/goals/[id]/route";
import { POST as CONTRIBUTE } from "@/app/api/goals/[id]/contribute/route";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => ({
  getGoals: jest.fn(),
  createGoal: jest.fn(),
  updateGoal: jest.fn(),
  deleteGoal: jest.fn(),
  contributeToGoal: jest.fn(),
}));

const { getServerSession } = jest.requireMock("next-auth") as { getServerSession: jest.Mock };
const { getGoals, createGoal, deleteGoal, contributeToGoal } = jest.requireMock("@/server/db") as {
  getGoals: jest.Mock;
  createGoal: jest.Mock;
  deleteGoal: jest.Mock;
  contributeToGoal: jest.Mock;
};

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };
const mockGoal = { id: 1, name: "Vacation", targetAmount: 2000, currentAmount: 750, deadline: null, color: "#f59e0b" };

afterEach(() => jest.clearAllMocks());

describe("GET /api/goals", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
  });
  it("returns 200 with goals", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getGoals.mockResolvedValueOnce([mockGoal]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect((await res.json())[0].name).toBe("Vacation");
  });
});

describe("POST /api/goals", () => {
  it("returns 201 with the created goal", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    createGoal.mockResolvedValueOnce(mockGoal);
    const req = new Request("http://localhost/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vacation", targetAmount: 2000 }),
    });
    expect((await POST(req)).status).toBe(201);
  });
  it("returns 400 when target is missing/invalid", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Vacation", targetAmount: 0 }),
    });
    expect((await POST(req)).status).toBe(400);
  });
});

describe("POST /api/goals/[id]/contribute", () => {
  it("returns 200 with the updated goal", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    contributeToGoal.mockResolvedValueOnce({ ...mockGoal, currentAmount: 850 });
    const req = new Request("http://localhost/api/goals/1/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });
    const res = await CONTRIBUTE(req, { params: { id: "1" } });
    expect(res.status).toBe(200);
    expect((await res.json()).currentAmount).toBe(850);
  });
  it("returns 400 for a zero amount", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/goals/1/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 0 }),
    });
    expect((await CONTRIBUTE(req, { params: { id: "1" } })).status).toBe(400);
  });
});

describe("DELETE /api/goals/[id]", () => {
  it("returns 204 on success", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteGoal.mockResolvedValueOnce({ count: 1 });
    const res = await DELETE(new Request("http://localhost/api/goals/1", { method: "DELETE" }), { params: { id: "1" } });
    expect(res.status).toBe(204);
  });
});
