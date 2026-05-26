import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("merges tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

