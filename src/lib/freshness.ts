import type { EffectiveOfferStatus, FreshnessStatus, RawOffer } from "./types";

const MINUTE = 60_000;

export function freshnessFields(input: {
  method: "aibijia_json" | "browser" | "http" | "manual";
  status: RawOffer["status"];
  verifiedAt: string;
}) {
  const priorityByMethod = {
    manual: 95,
    browser: 90,
    http: 85,
    aibijia_json: 40,
  } satisfies Record<string, number>;
  const confidenceByMethod = {
    manual: 0.95,
    browser: 0.9,
    http: 0.85,
    aibijia_json: 0.55,
  } satisfies Record<string, number>;
  const staleMinutesByMethod = {
    manual: 240,
    browser: 240,
    http: 240,
    aibijia_json: 30,
  } satisfies Record<string, number>;

  const sourcePriority = priorityByMethod[input.method];
  const freshnessStatus: FreshnessStatus = "fresh";
  const effectiveStatus: EffectiveOfferStatus =
    input.status === "out_of_stock"
      ? "unavailable"
      : sourcePriority >= 70
        ? "available"
        : "low_confidence";

  return {
    source_status: input.status,
    effective_status: effectiveStatus,
    freshness_status: freshnessStatus,
    verified_at: input.verifiedAt,
    expires_at: new Date(
      new Date(input.verifiedAt).getTime() + staleMinutesByMethod[input.method] * MINUTE,
    ).toISOString(),
    source_priority: sourcePriority,
    confidence: confidenceByMethod[input.method],
  };
}
