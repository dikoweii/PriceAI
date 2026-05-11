import { z } from "zod";
import { createSubmission } from "@/lib/admin";

const schema = z.object({
  url: z.string().url().max(2048),
  name: z.string().trim().max(200).optional().nullable(),
  contact: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
});

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message || "提交失败。");
  }
  return "提交失败。";
}

function getErrorStatus(error: unknown, message: string): number {
  if (error instanceof z.ZodError) return 400;
  if (message.includes("刚刚被提交过")) return 409;
  if (message.includes("提交过于频繁")) return 429;
  if (
    message.includes("URL 格式") ||
    message.includes("仅支持") ||
    message.includes("不允许") ||
    message.includes("无法解析")
  ) {
    return 400;
  }
  return 500;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = schema.parse(json);

    if (payload.website) {
      return Response.json({ ok: true });
    }

    const result = await createSubmission({
      url: payload.url,
      name: payload.name ?? null,
      contact: payload.contact ?? null,
      notes: payload.notes ?? null,
      honeypot: null,
      submitterIp: getClientIp(request),
    });

    if ("ignored" in result) {
      return Response.json({ ok: true });
    }
    return Response.json({ ok: true, id: result.id });
  } catch (error) {
    const message = getErrorMessage(error);
    const status = getErrorStatus(error, message);

    if (status >= 500) {
      console.error("[submissions] failed", error);
    }

    return Response.json({ ok: false, message }, { status });
  }
}
