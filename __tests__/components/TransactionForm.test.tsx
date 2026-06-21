import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TransactionForm } from "@/components/transactions/TransactionForm";

jest.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [
      { id: 1, name: "Food", color: "#6366f1", icon: "🍽️" },
      { id: 2, name: "Rent", color: "#8b5cf6", icon: "🏠" },
    ],
    byName: new Map(),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const mockTransaction = {
  id: 1,
  amount: 99.9,
  type: "expense" as const,
  category: "Food",
  date: "2026-05-15T00:00:00.000Z",
  note: "Test note",
  createdAt: "2026-05-15T00:00:00.000Z",
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("TransactionForm — create mode", () => {
  it("renders empty fields", () => {
    render(
      <TransactionForm onSuccess={jest.fn()} onCancel={jest.fn()} />
    );
    expect(screen.getByLabelText(/amount/i)).toHaveValue(null);
    expect(screen.getByRole("button", { name: /add transaction/i })).toBeInTheDocument();
  });

  it("shows validation error when amount is missing", async () => {
    render(
      <TransactionForm onSuccess={jest.fn()} onCancel={jest.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /add transaction/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid positive amount/i)).toBeInTheDocument();
    });
  });

  it("calls fetch with POST on valid submit", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTransaction }),
    });

    const onSuccess = jest.fn();
    render(<TransactionForm onSuccess={onSuccess} onCancel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "2026-05-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add transaction/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({ method: "POST" })
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onCancel when cancel is clicked", () => {
    const onCancel = jest.fn();
    render(<TransactionForm onSuccess={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("TransactionForm — edit mode", () => {
  it("pre-fills fields with transaction data", () => {
    render(
      <TransactionForm
        transaction={mockTransaction}
        onSuccess={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByLabelText(/amount/i)).toHaveValue(99.9);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls fetch with PUT on submit", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockTransaction }),
    });

    const onSuccess = jest.fn();
    render(
      <TransactionForm
        transaction={mockTransaction}
        onSuccess={onSuccess}
        onCancel={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/transactions/${mockTransaction.id}`,
        expect.objectContaining({ method: "PUT" })
      );
    });
  });
});
