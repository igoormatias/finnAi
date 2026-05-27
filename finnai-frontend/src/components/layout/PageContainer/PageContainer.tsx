import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const pageContainerVariants = cva("mx-auto w-full space-y-6", {
  variants: {
    size: {
      default: "max-w-6xl",
      wide: "max-w-[1400px]",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type PageContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof pageContainerVariants>;

/** Standard page spacing contract for app routes */
export const PageContainer = ({ children, className, size, ...props }: PageContainerProps) => {
  return (
    <div className={cn(pageContainerVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
};
