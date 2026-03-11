import { NextRequest, NextResponse } from "next/server";
import competitorsData from "@/data/competitors.json";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const competitorId = searchParams.get("competitor");

  if (competitorId) {
    const competitor = competitorsData.find((c) => c.id === competitorId);
    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(competitor);
  }

  return NextResponse.json(competitorsData);
}
