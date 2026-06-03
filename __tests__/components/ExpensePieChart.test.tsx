import { render, screen } from "@testing-library/react";
import { ExpensePieChart } from "@/components/dashboard/ExpensePieChart";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("ExpensePieChart", () => {
  it("renders the chart when data is provided", () => {
    const data = [
      { category: "Food", total: 200, percentage: 50 },
      { category: "Rent", total: 200, percentage: 50 },
    ];
    render(<ExpensePieChart data={data} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("shows empty state message when data is empty", () => {
    render(<ExpensePieChart data={[]} />);
    expect(screen.getByText(/no expense data/i)).toBeInTheDocument();
  });
});
