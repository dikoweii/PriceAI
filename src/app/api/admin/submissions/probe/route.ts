import { z } from "zod";
import { probeSource } from "../../../../../../scripts/collect-prices.mjs";
import { getAdminPasswordFromRequest } from "@/lib/admin";
import { requireAdminPassword } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  id: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));
    const payload = schema.parse(await request.json());
    const supabase = getSupabaseServerClient();
    if (!supabase) throw new Error("Supabase 尚未配置。");

    const { data: submission, error } = await supabase
      .from("channel_submissions")
      .select("id,url,name,parsed_title,parsed_meta,status")
      .eq("id", payload.id)
      .maybeSingle();

    if (error) throw error;
    if (!submission) throw new Error("提交记录不存在。");
    if (submission.status !== "pending") throw new Error("该提交已被处理。");

    const meta = asRecord(submission.parsed_meta);
    const result = await probeSource({
      sourceId: stringMeta(meta, "suggested_source_id") || undefined,
      sourceName:
        submission.name ||
        stringMeta(meta, "suggested_source_name") ||
        submission.parsed_title ||
        undefined,
      sourceUrl: submission.url,
      baseUrl: stringMeta(meta, "base_url") || undefined,
      rawOffers: [{ url: submission.url }],
      limit: 12,
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "试采集失败。";
    return Response.json(
      { ok: false, message },
      { status: error instanceof z.ZodError ? 400 : errorStatus(message) },
    );
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringMeta(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function errorStatus(message: string): number {
  if (message.includes("未授权")) return 401;
  if (message.includes("已被处理")) return 409;
  if (message.includes("不存在")) return 404;
  return 500;
}
