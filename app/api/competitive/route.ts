import { NextRequest, NextResponse } from "next/server";
import competitorsData from "@/data/competitors.json";
import { createChatCompletion } from "@/lib/claude";

const COMPETITIVE_SYSTEM_PROMPT = `You are a NetApp Solutions Engineer and competitive analyst. Generate a precise battlecard for NetApp AFX vs the specified competitor.

AFX key advantages to emphasize:
- Disaggregated architecture: scale compute (DX50) or capacity (NX224) independently — no competitor offers this for on-premises NAS
- Storage Availability Zone: single shared pool, no manual aggregates
- AIDE: native AI data processing (vectorization, PII redaction, semantic search) with NVIDIA NIM — runs on the storage system itself
- 128-node clusters vs most competitors' 10-24 node limits
- 457 GiB/s with GPUDirect Storage — 33% faster than prior AFF A90 record
- NetApp ecosystem: SnapMirror to cloud, ANF, FSx, GCNV integration
- Keystone STaaS with ~20% partner margin vs Pure's subscription model

Return ONLY valid JSON (no markdown, no code blocks) with this structure:
{"strengths": ["3 AFX strengths vs this competitor"], "watchouts": ["2 honest risk areas when selling against this competitor"], "killer_questions": ["3 discovery questions that expose competitor weaknesses"], "head_to_head": {"Architecture": ["AFX value", "Competitor value"], "Throughput": ["AFX value", "Competitor value"], "Capacity": ["AFX value", "Competitor value"], "Protocols": ["AFX value", "Competitor value"], "AI Integration": ["AFX value", "Competitor value"], "Pricing": ["AFX value", "Competitor value"]}, "win_scenario": "one sentence", "lose_scenario": "one sentence"}

Win scenarios: Large AI clusters needing independent scaling, customers already using ONTAP data services, environments requiring multi-protocol.
Lose scenarios: All-NVMe SAN requirements (use ASA r2 instead), budget-constrained SMB (use AFF C-Series).`;

export async function POST(request: NextRequest) {
  try {
    const { competitor, customer_context } = (await request.json()) as {
      competitor: string;
      customer_context?: string;
    };

    const competitorData = competitorsData.find((c) => c.id === competitor);
    if (!competitorData) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    // Return static data immediately if no API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        competitor: competitorData,
        ai_analysis: null,
      });
    }

    let prompt = `Generate a battlecard for NetApp AFX vs ${competitorData.name}.

Competitor details:
- Category: ${competitorData.category}
- Architecture: ${competitorData.architecture}
- Protocols: ${competitorData.protocols.join(", ")}
- Pricing: ${competitorData.pricing_model}
- AI Tooling: ${competitorData.ai_tooling}
- Strengths: ${competitorData.strengths.join("; ")}
- Weaknesses: ${competitorData.weaknesses.join("; ")}`;

    if (customer_context) {
      prompt += `\n\nCustomer context: ${customer_context}`;
    }

    const response = await createChatCompletion(
      [{ role: "user", content: prompt }],
      COMPETITIVE_SYSTEM_PROMPT
    );

    let ai_analysis = null;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ai_analysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return null
    }

    return NextResponse.json({
      competitor: competitorData,
      ai_analysis,
    });
  } catch (error) {
    console.error("Competitive API error:", error);
    return NextResponse.json(
      { error: "Failed to generate battlecard" },
      { status: 500 }
    );
  }
}

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
