import { render, screen } from "@testing-library/react";

import { LoginContent } from "@/app/(auth)/login/login-content";

describe("LoginContent", () => {
  it("renders Google sign in CTA", () => {
    render(<LoginContent />);
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo de volta/i)).toBeInTheDocument();
  });
});
