import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCashflow,
  getDashboardOverview,
} from "@/features/dashboard/services/dashboard-service";

describe("dashboard service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("getDashboardOverview calls proxy path", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total_balance_cents: 1000,
        monthly_income_cents: 500,
        monthly_expense_cents: 200,
        savings_cents: 300,
        savings_rate: 0.6,
        transaction_count: 2,
        biggest_expense: null,
        biggest_income: null,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await getDashboardOverview("familia-silva");
    expect(data.total_balance_cents).toBe(1000);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy/workspaces/familia-silva/dashboard/overview",
      expect.any(Object)
    );
  });

  it("getCashflow appends query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ granularity: "daily", points: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await getCashflow("familia-silva", {
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-01-31T00:00:00.000Z",
      granularity: "daily",
    });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("workspaces/familia-silva/dashboard/cashflow");
    expect(url).toContain("start_date=");
    expect(url).toContain("granularity=daily");
  });
});
