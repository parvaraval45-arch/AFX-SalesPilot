import { NextRequest, NextResponse } from "next/server";
import { calculateAFX, type SizingInputs } from "@/lib/afx-sizing";
import { createChatCompletion } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as SizingInputs;

    if (!input.workloadType || !input.rawCapacityTB) {
      return NextResponse.json(
        { error: "workloadType and rawCapacityTB are required" },
        { status: 400 }
      );
    }

    const config = calculateAFX(input);

    // Generate narrative justification via Claude
    let narrative = "";
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        const prompt = `You are a NetApp solutions architect. Given this AFX sizing result, write exactly 3 sentences justifying this configuration. Be specific about why the component counts were chosen.

Configuration:
- ${config.controllers}x AFX 1K Controllers
- ${config.enclosures}x NX224 Enclosures (${config.drive_size_tb}TB NVMe drives)
- ${config.dx50_nodes}x DX50 Compute Nodes
- Workload: ${input.workloadType}
- Raw Capacity: ${config.raw_tb} TB
- Effective Capacity: ${config.effective_tb} TB
- Peak Throughput: ${config.peak_throughput_gbs} GB/s
- Dedup Ratio: ${config.dedup_ratio}x, Compression: ${config.compress_ratio}x

Write 3 concise sentences. No JSON, no bullet points.`;

        narrative = await createChatCompletion(
          [{ role: "user", content: prompt }],
          "You are a NetApp AFX solutions architect. Be concise and technical."
        );
      }
    } catch {
      narrative = "AI narrative generation unavailable. Review the configuration details above.";
    }

    return NextResponse.json({
      config,
      narrative,
      comparison: config.comparison,
      keystone_estimate: config.keystone_estimate,
    });
  } catch (error) {
    console.error("Sizing API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate sizing" },
      { status: 500 }
    );
  }
}
