import { NextResponse } from "next/server";
import { MARKETING_INSIGHTS } from "@/lib/marketing-data";

export function GET() {
  return NextResponse.json(MARKETING_INSIGHTS, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
