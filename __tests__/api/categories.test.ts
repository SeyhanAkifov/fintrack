/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/categories/route";
import { DELETE } from "@/app/api/categories/[id]/route";
import { CategoryInUseError } from "@/server/db";

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));
jest.mock("@/server/auth", () => ({ authOptions: {} }));
jest.mock("@/server/db", () => {
  class CategoryInUseError extends Error {
    constructor(public usageCount: number) {
      super("Category is in use");
      this.name = "CategoryInUseError";
    }
  }
  return {
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    CategoryInUseError,
  };
});

const { getServerSession } = jest.requireMock("next-auth") as {
  getServerSession: jest.Mock;
};
const { getCategories, createCategory, deleteCategory } = jest.requireMock(
  "@/server/db"
) as {
  getCategories: jest.Mock;
  createCategory: jest.Mock;
  deleteCategory: jest.Mock;
};

const mockSession = { user: { id: "1", email: "demo@fintrack.app" } };
const mockCategory = { id: 1, name: "Food", color: "#6366f1", icon: "🍽️" };

afterEach(() => jest.clearAllMocks());

describe("GET /api/categories", () => {
  it("returns 401 when not authenticated", async () => {
    getServerSession.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 200 with the category list", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    getCategories.mockResolvedValueOnce([mockCategory]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Food");
  });
});

describe("POST /api/categories", () => {
  it("returns 201 with the created category", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    createCategory.mockResolvedValueOnce(mockCategory);
    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Food", color: "#6366f1", icon: "🍽️" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect((await res.json()).name).toBe("Food");
  });

  it("returns 400 when fields are missing", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Food" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate name", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    createCategory.mockRejectedValueOnce({ code: "P2002" });
    const req = new Request("http://localhost/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Food", color: "#6366f1", icon: "🍽️" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/categories/[id]", () => {
  it("returns 204 when not in use", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteCategory.mockResolvedValueOnce(mockCategory);
    const req = new Request("http://localhost/api/categories/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(204);
  });

  it("returns 409 when the category is in use", async () => {
    getServerSession.mockResolvedValueOnce(mockSession);
    deleteCategory.mockRejectedValueOnce(new CategoryInUseError(3));
    const req = new Request("http://localhost/api/categories/1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "1" } });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/in use/i);
  });
});
