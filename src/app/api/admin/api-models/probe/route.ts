import { z } from "zod";
import { collectApiModels } from "../../../../../../scripts/collect-api-models.mjs";
import { getAdminPasswordFromRequest } from "@/lib/admin";
import { staticApiModelDataset } from "@/lib/api-models";
import { requireAdminPassword } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  provider: z.string().trim().min(1).default("openrouter"),
  noFetch: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));
    const payload = schema.parse(await request.json().catch(() => ({})));
    const result = await collectApiModels({
      dataset: staticApiModelDataset,
      provider: payload.provider,
      dryRun: true,
      noFetch: payload.noFetch,
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "API 模型试采集失败。";
    return Response.json(
      { ok: false, message },
      { status: error instanceof z.ZodError ? 400 : errorStatus(message) },
    );
  }
}

function errorStatus(message: string): number {
  if (message.includes("未授权")) return 401;
  return 500;
}
