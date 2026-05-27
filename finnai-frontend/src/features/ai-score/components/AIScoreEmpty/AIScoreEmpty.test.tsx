import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AIScoreEmpty } from "./AIScoreEmpty";

describe("AIScoreEmpty", () => {
  it("shows CTA and triggers generate", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<AIScoreEmpty onGenerate={onGenerate} canGenerate />);
    await user.click(screen.getByRole("button", { name: /Gerar meu score/i }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });
});
