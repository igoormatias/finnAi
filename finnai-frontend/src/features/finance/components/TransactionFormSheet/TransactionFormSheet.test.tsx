import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Account, Category } from "../../types/finance-types";
import { TransactionFormSheet } from "./TransactionFormSheet";

const categories: Category[] = [
  {
    id: "c1",
    workspace_id: "w1",
    name: "Alimentação",
    type: "expense",
    color: "#35e0a1",
    icon: "tag",
    is_fixed: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "c2",
    workspace_id: "w1",
    name: "Salário",
    type: "income",
    color: "#35e0a1",
    icon: "tag",
    is_fixed: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const accounts: Account[] = [
  {
    id: "a1",
    workspace_id: "w1",
    name: "Nubank",
    type: "checking",
    initial_balance_cents: 0,
    current_balance_cents: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("TransactionFormSheet", () => {
  it("allows selecting category and account", async () => {
    const user = userEvent.setup();
    render(
      <TransactionFormSheet
        open
        onOpenChange={() => {}}
        editing={null}
        presetType={null}
        categories={categories}
        accounts={accounts}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onUpdate={vi.fn().mockResolvedValue(undefined)}
      />
    );

    // Category select
    await user.click(screen.getByRole("combobox", { name: "Selecionar categoria" }));
    const categoryOptions = await screen.findAllByRole("option", { name: "Alimentação" });
    const categoryOption = categoryOptions.find((el) => el.tagName !== "OPTION") ?? categoryOptions[0];
    await user.click(categoryOption);

    // Account select
    await user.click(screen.getByRole("combobox", { name: "Selecionar conta" }));
    const accountOptions = await screen.findAllByRole("option", { name: "Nubank" });
    const accountOption = accountOptions.find((el) => el.tagName !== "OPTION") ?? accountOptions[0];
    await user.click(accountOption);

    expect(screen.getByRole("combobox", { name: "Selecionar categoria" })).toHaveTextContent(
      "Alimentação"
    );
    expect(screen.getByRole("combobox", { name: "Selecionar conta" })).toHaveTextContent("Nubank");
  });

  it("clears fields when the sheet is cancelled", async () => {
    const user = userEvent.setup();
    render(
      <TransactionFormSheet
        open
        onOpenChange={() => {}}
        editing={null}
        presetType="expense"
        categories={categories}
        accounts={accounts}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onUpdate={vi.fn().mockResolvedValue(undefined)}
      />
    );

    const description = screen.getByPlaceholderText("Ex: Starbucks Coffee");
    await user.type(description, "Almoço");
    expect(description).toHaveValue("Almoço");

    await user.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(description).toHaveValue("");
  });

  it("clears fields when reopened after close", async () => {
    const user = userEvent.setup();
    const props = {
      editing: null,
      presetType: null,
      categories,
      accounts,
      onCreate: vi.fn().mockResolvedValue(undefined),
      onUpdate: vi.fn().mockResolvedValue(undefined),
    };

    const { rerender } = render(
      <TransactionFormSheet open onOpenChange={() => {}} {...props} />
    );

    const description = screen.getByPlaceholderText("Ex: Starbucks Coffee");
    await user.type(description, "Mercado");
    expect(description).toHaveValue("Mercado");

    rerender(<TransactionFormSheet open={false} onOpenChange={() => {}} {...props} />);
    rerender(<TransactionFormSheet open onOpenChange={() => {}} {...props} />);

    expect(screen.getByPlaceholderText("Ex: Starbucks Coffee")).toHaveValue("");
  });
});

