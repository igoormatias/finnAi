import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

if (!("scrollIntoView" in Element.prototype)) {
  Object.defineProperty(Element.prototype, "scrollIntoView", { value: () => {} });
}

if (!("hasPointerCapture" in HTMLElement.prototype)) {
  // Radix Select relies on pointer capture APIs which are missing in JSDOM.
  // Polyfill to keep tests stable.
  Object.defineProperties(HTMLElement.prototype, {
    hasPointerCapture: { value: () => false },
    setPointerCapture: { value: () => {} },
    releasePointerCapture: { value: () => {} },
  });
}

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    usePathname: () => "/dashboard",
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
  };
});
vi.mock("next/link", () => {
  return {
    default: ({
      href,
      children,
      ...props
    }: {
      href: unknown;
      children: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      React.createElement(
        "a",
        {
          href:
            typeof href === "string"
              ? href
              : typeof href === "object" && href !== null && "pathname" in href
                ? String((href as { pathname?: unknown }).pathname ?? "")
                : "",
          ...props,
        },
        children
      ),
  };
});

