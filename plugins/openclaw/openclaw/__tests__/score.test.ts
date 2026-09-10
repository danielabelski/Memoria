import { describe, expect, it } from "vitest";
import plugin from "../index.js";
import { resolveMemorySearchScore } from "../score.js";

describe("memory search scores", () => {
  it("uses the API retrieval score without clamping it", () => {
    expect(resolveMemorySearchScore({ retrieval_score: 3.066, confidence: 0.4 })).toBe(3.066);
  });

  it("falls back to bounded confidence for legacy responses", () => {
    expect(resolveMemorySearchScore({ retrieval_score: null, confidence: 1.4 })).toBe(1);
    expect(resolveMemorySearchScore({ retrieval_score: null, confidence: -0.2 })).toBe(0);
  });

  it("uses an explicit lowest score when the backend did not return one", () => {
    expect(resolveMemorySearchScore({ retrieval_score: null, confidence: null })).toBe(0);
  });

  it("reports API retrieval scores through the memory_search tool", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify([
      {
        memory_id: "high",
        memory_type: "semantic",
        content: "High relevance",
        retrieval_score: 3.066,
      },
      {
        memory_id: "unknown",
        memory_type: "semantic",
        content: "Unknown relevance",
      },
    ]));

    let toolFactory: ((ctx: Record<string, unknown>) => Array<Record<string, any>>) | undefined;
    plugin.register({
      pluginConfig: {
        backend: "api",
        apiUrl: "https://memoria.example.com",
        apiKey: "test-key",
      },
      logger: { info() {}, warn() {} },
      on() {},
      registerTool(factory: typeof toolFactory) { toolFactory = factory; },
      registerCli() {},
      registerService() {},
    } as any);

    try {
      const searchTool = toolFactory!({}).find((tool) => tool.name === "memory_search")!;
      const result = await searchTool.execute("call-1", { query: "relevance", topK: 2 });
      expect(result.details.results[0].score).toBe(3.066);
      expect(result.details.results[1].score).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
