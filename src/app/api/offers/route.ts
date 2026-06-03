import { NextRequest, NextResponse } from "next/server";
import { listPublicOffers } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const minPrice = parseNumberParam(params.get("min"));
  const maxPrice = parseNumberParam(params.get("max"));

  const result = await listPublicOffers({
    query: params.get("q"),
    platform: params.get("platform"),
    productType: params.get("type"),
    stock: params.get("stock"),
    sort: params.get("sort"),
    minPrice,
    maxPrice,
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function parseNumberParam(value: string | null): number | null {
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
