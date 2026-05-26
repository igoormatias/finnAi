import { afterEach, describe, expect, it, vi } from "vitest";

import { listTransactions } from "@/features/finance/services/transactions-service";

describe("transactions service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds query params for listTransactions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: 0, items: [], limit: 20, offset: 0 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await listTransactions("familia-silva", {
      limit: 20,
      offset: 40,
      sort: "newest",
      type: "expense",
      search: "café",
      recurring: true,
    });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/proxy/workspaces/familia-silva/transactions");
    expect(url).toContain("limit=20");
    expect(url).toContain("offset=40");
    expect(url).toContain("type=expense");
    expect(url).toContain("recurring=true");
  });
});

