import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";

import { DateInput } from "@/components/ui";

describe("DateInput", () => {
  it("renders a native date input with containment classes", () => {
    render(<DateInput aria-label="Data da transação" />);
    const input = screen.getByLabelText("Data da transação");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveClass("date-input", "w-full", "min-w-0", "max-w-full");
  });

  it("forwards ref to the underlying input", () => {
    function RefHost() {
      const ref = useRef<HTMLInputElement>(null);
      return <DateInput ref={ref} aria-label="Data com ref" defaultValue="2026-06-16" />;
    }

    render(<RefHost />);
    const input = screen.getByLabelText("Data com ref") as HTMLInputElement;
    expect(input.value).toBe("2026-06-16");
  });
});
