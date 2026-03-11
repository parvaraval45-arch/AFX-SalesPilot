import { NextRequest, NextResponse } from "next/server";
import { calculateSizing, type SizingInput } from "@/lib/afx-sizing";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as SizingInput;

    if (!input.workloadType || !input.capacityTB) {
      return NextResponse.json(
        { error: "workloadType and capacityTB are required" },
        { status: 400 }
      );
    }

    const result = calculateSizing(input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sizing API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate sizing" },
      { status: 500 }
    );
  }
}
