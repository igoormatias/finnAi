import { render, screen } from "@testing-library/react";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Sem dados" description="Adicione transações" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Sem dados")).toBeInTheDocument();
    expect(screen.getByText("Adicione transações")).toBeInTheDocument();
  });
});
