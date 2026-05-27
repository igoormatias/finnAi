import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginContent } from "./login-content";

const useSearchParamsMock = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
}));

describe("LoginContent", () => {
  it("renders Google sign in CTA", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    render(<LoginContent />);
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Entrar com Google/i })).toBeInTheDocument();
  });

  it("shows session expired message when error=session_expired", () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("error=session_expired"));
    render(<LoginContent />);
    expect(screen.getByText(/Sua sessão expirou/i)).toBeInTheDocument();
  });
});
