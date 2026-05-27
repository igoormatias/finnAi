import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspaces/test/dashboard",
}));

vi.mock("@/components/motion", () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../Header", () => ({
  Header: ({ onOpenMobileNav }: { onOpenMobileNav: () => void }) => (
    <button type="button" onClick={onOpenMobileNav}>
      Abrir menu mobile
    </button>
  ),
}));

vi.mock("../Sidebar", () => ({
  Sidebar: () => <nav aria-label="Sidebar desktop">Desktop nav</nav>,
}));

vi.mock("../MobileNavSheet", () => ({
  MobileNavSheet: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Menu mobile">Mobile sheet</div> : null,
}));

describe("AppShell", () => {
  it("uses floating layout padding and renders children", () => {
    const { container } = render(
      <AppShell>
        <p>Conteúdo</p>
      </AppShell>
    );
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    expect(container.querySelector(".min-h-dvh.bg-bg.p-3")).toBeTruthy();
  });
});
