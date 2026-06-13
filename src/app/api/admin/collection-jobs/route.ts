import { getAdminPasswordFromRequest } from "@/lib/admin";
import { logApiError, safeApiErrorMessage } from "@/lib/api-errors";
import { clearAdminDataCache } from "@/lib/data";
import { requireAdminPassword } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";
import { stableId } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  jobType: z.enum(["all", "source", "official_prices", "api_models"]).default("source"),
  sourceIds: z.array(z.string().min(1)).optional(),
  officialMode: z.enum(["weekly_full", "fx_only"]).optional(),
  priority: z.number().int().min(0).max(100).default(10),
  maxAttempts: z.number().int().min(1).max(5).default(1),
});

export async function POST(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));

    const supabase = getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase 尚未配置，无法创建采集任务。");

    const payload = schema.parse(await request.json());
    const now = new Date().toISOString();

    const sourceIds = payload.jobType === "all" || payload.jobType === "official_prices" || payload.jobType === "api_models"
      ? [null]
      : Array.from(new Set(payload.sourceIds || [])).filter(Boolean);

    if (payload.jobType === "source" && !sourceIds.length) {
      return Response.json({ ok: false, message: "请选择要重采的渠道。" }, { status: 400 });
    }

    const sourceById = new Map<string, { id: string; name: string }>();
    if (payload.jobType === "source") {
      const { data, error } = await supabase
        .from("sources")
        .select("id,name")
        .in("id", sourceIds as string[]);

      if (error) throw error;
      for (const row of data || []) {
        sourceById.set(String(row.id), { id: String(row.id), name: String(row.name || row.id) });
      }
    }

    const rows = sourceIds.map((sourceId) => {
      const source = sourceId ? sourceById.get(sourceId) : null;
      const result = payload.jobType === "official_prices" && payload.officialMode
        ? { officialMode: payload.officialMode }
        : null;
      return {
        id: stableId("collection-job", payload.jobType, sourceId || "all", payload.officialMode || "default", now),
        job_type: payload.jobType,
        source_id: sourceId,
        source_name: source?.name || collectionJobFallbackName(payload.jobType, sourceId, payload.officialMode),
        status: "pending",
        priority: payload.priority,
        attempts: 0,
        max_attempts: payload.maxAttempts,
        requested_by: "admin",
        result,
        created_at: now,
        updated_at: now,
      };
    });

    const { data, error } = await supabase
      .from("collection_jobs")
      .insert(rows)
      .select("*");

    if (error) throw error;

    clearAdminDataCache();

    return Response.json({
      ok: true,
      jobCount: data?.length || rows.length,
      jobs: data || rows,
    });
  } catch (error) {
    logApiError("admin collection jobs", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "创建采集任务失败。") },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

function collectionJobFallbackName(
  jobType: "all" | "source" | "official_prices" | "api_models",
  sourceId: string | null,
  officialMode?: "weekly_full" | "fx_only",
): string | null {
  if (jobType === "all") return "全部渠道";
  if (jobType === "official_prices") return officialMode === "fx_only" ? "官方地区价汇率刷新" : "官方地区价周全量";
  if (jobType === "api_models") return "API 模型";
  return sourceId;
}
