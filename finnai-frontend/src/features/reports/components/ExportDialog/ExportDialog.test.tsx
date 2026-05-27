import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ExportDialog } from "./ExportDialog";

vi.mock("../../services/reports-service", () => {
  return {
    exportTransactions: vi.fn().mockResolvedValue({
      filename: "transactions_export.csv",
      blob: new Blob(["a,b"], { type: "text/csv" }),
    }),
  };
});

vi.mock("../../utils/download-blob", () => {
  return { downloadBlob: vi.fn() };
});

describe("ExportDialog", () => {
  it("exports CSV and triggers download", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ExportDialog
        open
        onOpenChange={onOpenChange}
        slug="family-1"
        defaultStartDate={new Date("2026-01-01T00:00:00.000Z")}
        defaultEndDate={new Date("2026-01-31T23:59:59.999Z")}
      />
    );

    await user.click(screen.getByRole("button", { name: "Exportar" }));

    const { exportTransactions } = await import("../../services/reports-service");
    const { downloadBlob } = await import("../../utils/download-blob");

    expect(exportTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "family-1",
        format: "csv",
      })
    );
    expect(downloadBlob).toHaveBeenCalledWith(
      "transactions_export.csv",
      expect.any(Blob)
    );
  });
});

