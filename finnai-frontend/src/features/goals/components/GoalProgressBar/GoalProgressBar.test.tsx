import { render, screen } from "@testing-library/react";

import { GoalProgressBar } from "./GoalProgressBar";

describe("GoalProgressBar", () => {
  it("exposes progressbar with percent", () => {
    render(<GoalProgressBar currentCents={5000} targetCents={10000} />);
    const bar = screen.getByRole("progressbar", { name: /Progresso 50%/ });
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });
});
