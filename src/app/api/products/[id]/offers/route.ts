import { NextRequest, NextResponse } from "next/server";
import { listPublicProductOffers } from "@/lib/data";

export const revalidate = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await listPublicProductOffers(id);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
