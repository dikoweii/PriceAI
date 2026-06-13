import { getAdminPasswordFromRequest, listOfferFeedback, updateOfferFeedbackStatus } from "@/lib/admin";
import { logApiError, safeApiErrorMessage } from "@/lib/api-errors";
import { clearAdminDataCache, listRawOffersByIds } from "@/lib/data";
import { requireAdminPassword } from "@/lib/env";
import { z } from "zod";

const statusSchema = z.enum(["pending", "resolved", "ignored"]);

const patchSchema = z.object({
  id: z.string().min(1),
  status: statusSchema,
  reviewerNote: z.string().max(500).nullable().optional(),
});

export async function GET(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));
    const { searchParams } = new URL(request.url);
    const status = statusSchema.catch("pending").parse(searchParams.get("status") || "pending");
    const feedback = await listOfferFeedback(status);
    const offers = await listRawOffersByIds(
      feedback
        .map((item) => item.offerId)
        .filter((id): id is string => Boolean(id)),
    );
    return Response.json({ ok: true, feedback, offers });
  } catch (error) {
    logApiError("admin feedback list", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "加载反馈失败。") },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    requireAdminPassword(getAdminPasswordFromRequest(request));
    const payload = patchSchema.parse(await request.json());
    const feedback = await updateOfferFeedbackStatus(payload);
    clearAdminDataCache();
    return Response.json({ ok: true, feedback });
  } catch (error) {
    logApiError("admin feedback update", error);
    return Response.json(
      { ok: false, message: safeApiErrorMessage(error, "处理反馈失败。") },
      { status: error instanceof z.ZodError ? 400 : 500 },
    );
  }
}
