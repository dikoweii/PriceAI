import {
  getAdminPasswordFromRequest,
  rawOfferInputId,
  recordSourceCollectionResult,
  upsertRawOffers,
  upsertSource,
} from "@/lib/admin";
import { normalizeCollectorKind } from "@/lib/collector-registry";
import { clearPublicDataCache } from "@/lib/data";
import { requireAdminOrCronPassword } from "@/lib/env";
import { pruneOperationalLogs } from "@/lib/operational-logs";
import { getSupabaseServerClient } from "@/lib/supabase";
import { stableId } from "@/lib/utils";
import { z } from "zod";

const offerSchema = z.object({
  sourceId: z.string().min(1).optional(),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceStoreName: z.string().optional(),
  sourceTitle: z.string().min(1),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().optional(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "unknown"]).optional(),
  url: z.string().url(),
  tags: z.array(z.string()).optional(),
  stockCount: z.number().int().nullable().optional(),
});

const crawlLogPayloadSchema = z.object({
  sourceId: z.string().min(1).optional(),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  mode: z.enum(["browser", "http", "manual"]).default("browser"),
  status: z.enum(["success", "partial", "failed"]).default("success"),
  message: z.string().optional(),
  offers: z.array(offerSchema).default([]),
  details: z.record(z.string(), z.unknown()).optional(),
});

const batchSchema = z.object({
  runs: z.array(crawlLogPayloadSchema).min(1).max(50),
  batch: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    requireAdminOrCronPassword(getAdminPasswordFromRequest(request));

    const supabase = getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase 尚未配置，无法保存采集结果。");

    const rawBody = await request.json();
    const isBatch = rawBody && typeof rawBody === "object" && Array.isArray(rawBody.runs);
    const runs = isBatch ? batchSchema.parse(rawBody).runs : [crawlLogPayloadSchema.parse(rawBody)];
    const results = [];
    let shouldClearCache = false;

    for (const run of runs) {
      const result = await saveCrawlLogRun(supabase, run);
      results.push(result);
      shouldClearCache = shouldClearCache || result.shouldClearCache;
    }

    await pruneOperationalLogs(supabase);

    if (shouldClearCache) {
      clearPublicDataCache();
    }

    const totals = aggregateResults(results);
    return Response.json({
      ok: true,
      successCount: totals.successCount,
      writtenCount: totals.writtenCount,
      unchangedCount: totals.unchangedCount,
      runCount: results.length,
      results: isBatch ? results.map(compactResult) : undefined,
    });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "记录采集结果失败。" },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

async function saveCrawlLogRun(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  payload: z.infer<typeof crawlLogPayloadSchema>,
) {
  const startedAt = new Date().toISOString();
  const source = await upsertSource({
    id: payload.sourceId,
    name: payload.sourceName,
    entryUrl: payload.sourceUrl,
    collectionMethod: payload.mode,
    collectorKind: collectorKindFromDetails(payload.details),
    notes: "由采集日志自动维护。",
  });
  const offers = payload.offers.map((offer) => ({
    ...offer,
    sourceId: offer.sourceId || payload.sourceId || source.id,
  }));
  const upsertResult = await upsertRawOffers(offers, { collectionMethod: payload.mode });
  const successCount = upsertResult.receivedCount;
  const finishedAt = new Date().toISOString();
  const seenOfferIds = seenOfferIdsFromDetails(payload.details) || offers.map(rawOfferInputId);
  const fullSnapshot = fullSnapshotFromDetails(payload.details, payload.status);

  const sourceCollectionResult = await recordSourceCollectionResult({
    sourceId: source.id,
    status: payload.status,
    checkedAt: finishedAt,
    message: payload.message || null,
    seenOfferIds,
    fullSnapshot,
  });

  const { error } = await supabase.from("crawl_runs").insert({
    id: stableId(payload.sourceName, payload.sourceUrl, startedAt),
    source_id: source.id,
    source_name: payload.sourceName,
    mode: payload.mode,
    status: payload.status,
    started_at: startedAt,
    finished_at: finishedAt,
    success_count: successCount,
    failure_count: Math.max(0, payload.offers.length - successCount),
    message: payload.message || `采集到 ${successCount} 条报价，写入 ${upsertResult.writtenCount} 条。`,
    details: {
      ...(payload.details || {}),
      writeStats: {
        receivedCount: upsertResult.receivedCount,
        writtenCount: upsertResult.writtenCount,
        unchangedCount: upsertResult.unchangedCount,
      },
    },
  });

  if (error) throw error;

  return {
    sourceId: source.id,
    sourceName: source.name,
    status: payload.status,
    successCount,
    writtenCount: upsertResult.writtenCount,
    unchangedCount: upsertResult.unchangedCount,
    shouldClearCache:
      payload.status !== "success" ||
      upsertResult.writtenCount > 0 ||
      sourceCollectionResult.changedOfferCount > 0,
  };
}

function aggregateResults(results: Array<{ successCount: number; writtenCount: number; unchangedCount: number }>) {
  return results.reduce(
    (totals, result) => ({
      successCount: totals.successCount + result.successCount,
      writtenCount: totals.writtenCount + result.writtenCount,
      unchangedCount: totals.unchangedCount + result.unchangedCount,
    }),
    { successCount: 0, writtenCount: 0, unchangedCount: 0 },
  );
}

function compactResult(result: {
  sourceId: string;
  sourceName: string;
  status: string;
  successCount: number;
  writtenCount: number;
  unchangedCount: number;
}) {
  return {
    sourceId: result.sourceId,
    sourceName: result.sourceName,
    status: result.status,
    successCount: result.successCount,
    writtenCount: result.writtenCount,
    unchangedCount: result.unchangedCount,
  };
}

function collectorKindFromDetails(details: Record<string, unknown> | undefined) {
  return normalizeCollectorKind(details?.collector);
}

function fullSnapshotFromDetails(details: Record<string, unknown> | undefined, status: string): boolean {
  if (typeof details?.fullSnapshot === "boolean") return status === "success" && details.fullSnapshot;
  return status === "success";
}

function seenOfferIdsFromDetails(details: Record<string, unknown> | undefined): string[] | null {
  const value = details?.seenOfferIds;
  if (!Array.isArray(value)) return null;
  return value.map((item) => String(item)).filter(Boolean);
}
