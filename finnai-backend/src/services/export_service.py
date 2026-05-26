from __future__ import annotations

import csv
import io
from dataclasses import dataclass

from openpyxl import Workbook
from openpyxl.styles import Font

from models.transaction import Transaction


@dataclass(frozen=True)
class ExportFile:
    filename: str
    content_type: str
    content: bytes


class ExportService:
    def export_csv(self, *, rows: list[Transaction], filename_prefix: str) -> ExportFile:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "transaction_date",
                "type",
                "amount_cents",
                "description",
                "notes",
                "account_name",
                "category_name",
            ]
        )
        for tx in rows:
            writer.writerow(
                [
                    tx.transaction_date.isoformat(),
                    tx.type,
                    int(tx.amount_cents),
                    tx.description,
                    tx.notes or "",
                    getattr(tx.account, "name", ""),
                    getattr(tx.category, "name", ""),
                ]
            )

        # UTF-8 with BOM for Excel
        content = output.getvalue().encode("utf-8-sig")
        return ExportFile(
            filename=f"{filename_prefix}.csv",
            content_type="text/csv; charset=utf-8",
            content=content,
        )

    def export_xlsx(self, *, rows: list[Transaction], filename_prefix: str) -> ExportFile:
        wb = Workbook()
        ws = wb.active
        ws.title = "Transactions"

        headers = [
            "Transaction Date",
            "Type",
            "Amount (cents)",
            "Description",
            "Notes",
            "Account",
            "Category",
        ]
        ws.append(headers)
        for cell in ws[1]:
            cell.font = Font(bold=True)

        total_income = 0
        total_expense = 0

        for tx in rows:
            amount = int(tx.amount_cents)
            if tx.type == "income":
                total_income += amount
            elif tx.type == "expense":
                total_expense += amount

            ws.append(
                [
                    tx.transaction_date.isoformat(),
                    tx.type,
                    amount,
                    tx.description,
                    tx.notes or "",
                    getattr(tx.account, "name", ""),
                    getattr(tx.category, "name", ""),
                ]
            )

        ws.append([])
        ws.append(["Totals", "", "", "", "", "", ""])
        ws.append(["Total income (cents)", total_income, "", "", "", "", ""])
        ws.append(["Total expense (cents)", total_expense, "", "", "", "", ""])
        ws.append(["Net (cents)", total_income - total_expense, "", "", "", "", ""])
        ws["A" + str(ws.max_row - 3)].font = Font(bold=True)

        buffer = io.BytesIO()
        wb.save(buffer)
        return ExportFile(
            filename=f"{filename_prefix}.xlsx",
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            content=buffer.getvalue(),
        )
