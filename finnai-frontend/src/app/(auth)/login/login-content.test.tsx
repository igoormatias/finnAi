import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginContent } from "./login-content";

describe("LoginContent", () => {
  it("renders Google sign in CTA", () => {
    render(<LoginContent />);
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Entrar com Google/i })).toBeInTheDocument();
  });
});
