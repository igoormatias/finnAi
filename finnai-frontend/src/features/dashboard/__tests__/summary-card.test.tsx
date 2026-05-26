import { render, screen } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { describe, expect, it } from "vitest";

import { SummaryCard } from "@/features/dashboard/components/summary-card";

describe("SummaryCard", () => {
  it("renders formatted value", () => {
    render(
      <SummaryCard title="Saldo" valueCents={150000} icon={Wallet} variant="primary" />
    );
    expect(screen.getByText("Saldo")).toBeInTheDocument();
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(
      <SummaryCard title="Saldo" valueCents={0} icon={Wallet} loading />
    );
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
