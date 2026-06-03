import { NextRequest, NextResponse } from "next/server";
import { listPublicProductOffers } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await listPublicProductOffers(id);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
