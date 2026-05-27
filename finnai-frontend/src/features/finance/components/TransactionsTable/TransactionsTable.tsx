"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Repeat } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Skeleton } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { Account, Category, Transaction } from "@/features/finance/types/finance-types";
import { formatRelativeDate } from "@/lib/formatters/date";
import { formatCentsBRL } from "@/lib/formatters/money";
import { cn } from "@/lib/utils";

type TableProps = {
  items: Transaction[];
  categories: Category[];
  accounts: Account[];
  isLoading: boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
};

function categoryBadge(category: Category | undefined) {
  if (!category) return <span className="text-muted">—</span>;
  return (
    <Badge
      className="gap-1"
      style={{
        borderColor: `${category.color}55`,
        backgroundColor: `${category.color}1a`,
        color: category.color,
      }}
    >
      {category.name}
    </Badge>
  );
}

export const TransactionsTable = ({
  items,
  categories,
  accounts,
  isLoading,
  onEdit,
  onDelete,
}: TableProps) => {
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        header: "Data",
        accessorKey: "transaction_date",
        cell: ({ row }) => (
          <div className="text-sm text-muted">{formatRelativeDate(row.original.transaction_date)}</div>
        ),
      },
      {
        header: "Descrição",
        accessorKey: "description",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{row.original.description || "—"}</div>
            {row.original.is_recurring && (
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                <Repeat className="h-3.5 w-3.5" />
                {row.original.recurrence_rule ? `Recorrente (${row.original.recurrence_rule})` : "Recorrente"}
              </div>
            )}
          </div>
        ),
      },
      {
        header: "Categoria",
        accessorKey: "category_id",
        cell: ({ row }) =>
          categoryBadge(categories.find((c) => c.id === row.original.category_id)),
      },
      {
        header: "Conta",
        accessorKey: "account_id",
        cell: ({ row }) => {
          const account = accounts.find((a) => a.id === row.original.account_id);
          return <div className="text-sm text-foreground">{account?.name ?? "—"}</div>;
        },
      },
      {
        header: "Valor",
        accessorKey: "amount_cents",
        cell: ({ row }) => (
          <div
            className={cn(
              "text-right font-semibold tabular-nums",
              row.original.type === "income" ? "text-success" : "text-danger"
            )}
          >
            {row.original.type === "income" ? "+" : "-"}
            {formatCentsBRL(row.original.amount_cents)}
          </div>
        ),
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-danger">
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [accounts, categories, onDelete, onEdit]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="bg-surface/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Transações recentes</CardTitle>
        <div className="text-xs text-muted">Atualize seus filtros para encontrar rápido.</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Table className="[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:backdrop-blur-md">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(header.id === "amount_cents" && "text-right")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.id === "amount_cents" && "text-right")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10 text-center text-muted">
                    Sem transações neste período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

