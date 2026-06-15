import { render, screen } from "@testing-library/react";
import { SummaryCards } from "@/components/dashboard/SummaryCards";

describe("SummaryCards", () => {
  const props = {
    totalIncome: 7700,
    totalExpenses: 1345.98,
    balance: 6354.02,
  };

  it("renders all three card titles", () => {
    render(<SummaryCards {...props} />);
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("Balance")).toBeInTheDocument();
  });

  it("applies white text to income amount", () => {
    render(<SummaryCards {...props} />);
    const income = screen.getByText(/7\.700|7,700/);
    expect(income).toHaveClass("text-white");
  });

  it("applies white text to expenses amount", () => {
    render(<SummaryCards {...props} />);
    const expense = screen.getByText(/1\.345|1,345/);
    expect(expense).toHaveClass("text-white");
  });

  it("applies indigo gradient when balance is positive", () => {
    render(<SummaryCards {...props} />);
    const balance = screen.getByText(/6\.354|6,354/);
    expect(balance.closest(".rounded-2xl")).toHaveClass("from-indigo-500");
  });

  it("applies red gradient when balance is negative", () => {
    render(
      <SummaryCards totalIncome={100} totalExpenses={500} balance={-400} />
    );
    const balance = screen.getByText(/400/);
    expect(balance.closest(".rounded-2xl")).toHaveClass("from-orange-400");
  });
});
