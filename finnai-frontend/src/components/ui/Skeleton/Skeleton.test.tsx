import { render } from "@testing-library/react";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with shimmer by default", () => {
    const { container } = render(<Skeleton className="h-4 w-20" />);
    expect(container.firstChild).toHaveClass("skeleton-shimmer");
  });

  it("can disable shimmer", () => {
    const { container } = render(<Skeleton shimmer={false} className="h-4 w-20" />);
    expect(container.firstChild).not.toHaveClass("skeleton-shimmer");
  });
});
