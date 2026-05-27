import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "./ConfirmationDialog";

describe("ConfirmationDialog", () => {
  it("requires typing when requiredText is set", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={() => {}}
        title="Excluir workspace?"
        confirmText="Excluir"
        requiredText="Minha Família"
        onConfirm={onConfirm}
      />
    );

    const confirm = screen.getByRole("button", { name: "Excluir" });
    expect(confirm).toBeDisabled();

    await user.type(screen.getByRole("textbox"), "Minha Família");
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
  });
});

