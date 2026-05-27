import * as React from "react";

import { cn } from "@/lib/utils";

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="w-full overflow-auto rounded-2xl border border-border">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
};

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return <thead className={cn("bg-elevated/30", className)} {...props} />;
};

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
};

export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-elevated/25 focus-within:bg-elevated/20",
        className
      )}
      {...props}
    />
  );
};

export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted",
        className
      )}
      {...props}
    />
  );
};

export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => {
  return <td className={cn("p-4 align-middle text-sm text-foreground", className)} {...props} />;
};

export const TableEmpty = ({
  colSpan,
  title = "Nenhum registro encontrado",
  description,
}: {
  colSpan: number;
  title?: string;
  description?: string;
}) => (
  <tr>
    <td colSpan={colSpan} className="p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
    </td>
  </tr>
);
