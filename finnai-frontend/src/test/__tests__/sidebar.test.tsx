import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Sidebar } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspaces/familia-silva/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ slug: "familia-silva" }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/workspaces/hooks/use-workspace-slug", () => ({
  useWorkspaceSlugOptional: () => "familia-silva",
}));

vi.mock("@/features/auth/hooks/use-auth", () => ({
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
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls toggle collapse", async () => {
    const user = userEvent.setup();
    const onToggleCollapsed = vi.fn();
    render(<Sidebar collapsed={false} onToggleCollapsed={onToggleCollapsed} />);
    await user.click(screen.getByRole("button", { name: "Colapsar" }));
    expect(onToggleCollapsed).toHaveBeenCalledTimes(1);
  });
});

