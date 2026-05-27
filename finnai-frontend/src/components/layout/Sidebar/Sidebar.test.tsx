import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Sidebar } from "./Sidebar";

vi.mock("@/components/ui/Tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => children,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspaces/familia-silva/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ slug: "familia-silva" }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/workspaces", () => ({
  useWorkspaceSlugOptional: () => "familia-silva",
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

describe("Sidebar", () => {
  it("highlights active route", () => {
    render(<Sidebar collapsed={false} onToggleCollapsed={() => {}} />);
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", "/workspaces/familia-silva/dashboard");
    expect(dashboard.className).toMatch(/text-foreground/);
  });

  it("collapses labels", () => {
    render(<Sidebar collapsed onToggleCollapsed={() => {}} />);
    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveTextContent("");
  });

  it("calls toggle collapse", async () => {
    const user = userEvent.setup();
    const onToggleCollapsed = vi.fn();
    render(<Sidebar collapsed={false} onToggleCollapsed={onToggleCollapsed} />);
    await user.click(screen.getByRole("button", { name: "Colapsar sidebar" }));
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
  });

  it("shows tooltip labels when collapsed", () => {
    render(<Sidebar collapsed onToggleCollapsed={() => {}} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Sair")).toBeInTheDocument();
  });

  it("uses floating sidebar container styles", () => {
    const { container } = render(<Sidebar collapsed={false} onToggleCollapsed={() => {}} />);
    const aside = container.querySelector("aside");
    expect(aside?.className).toMatch(/rounded-2xl/);
    expect(aside?.className).toMatch(/h-\[calc\(100dvh-2rem\)\]/);
  });
});
