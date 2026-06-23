import { NextResponse, NextRequest } from "next/server";
import { MARKETING_INSIGHTS } from "@/lib/marketing-data";

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const segment = searchParams.get("segment");
  const industry = searchParams.get("industry");
  const target = searchParams.get("target");
  // For demo, simply return the static data; in real implementation filter accordingly.
  const data = { ...MARKETING_INSIGHTS, filters: { segment, industry, target } };
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
