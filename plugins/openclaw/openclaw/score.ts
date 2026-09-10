import type { MemoriaMemoryRecord } from "./client.js";

export function resolveMemorySearchScore(
  memory: Pick<MemoriaMemoryRecord, "retrieval_score" | "confidence">,
): number | undefined {
  if (typeof memory.retrieval_score === "number" && Number.isFinite(memory.retrieval_score)) {
    return memory.retrieval_score;
  }
  if (typeof memory.confidence !== "number" || !Number.isFinite(memory.confidence)) {
    return undefined;
  }
  return Math.max(0, Math.min(1, memory.confidence));
}
