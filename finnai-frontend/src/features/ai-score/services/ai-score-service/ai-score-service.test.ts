import { afterEach, describe, expect, it, vi } from "vitest";

import { getScore, regenerateScore } from "./ai-score-service";

describe("ai-score-service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls get score endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        workspace_id: "w1",
        score: 80,
        label: "Ok",
        summary: "S",
        strengths: [],
        weaknesses: [],
        tips: [],
        badges: [],
        generated_at: "2026-01-01T00:00:00Z",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getScore("familia");
    expect(result.score).toBe(80);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/proxy/workspaces/familia/ai/score");
  });

  it("calls regenerate endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ status: "pending", debounced: false }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await regenerateScore("familia");
    expect(result.status).toBe("pending");
    expect(fetchMock.mock.calls[0][0]).toContain("/api/proxy/workspaces/familia/ai/regenerate");
  });
});
