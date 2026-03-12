import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion, type ChatMessage } from "@/lib/claude";

const PRODUCT_SELECTOR_SYSTEM_PROMPT = `You are a NetApp Solutions Engineer AI assistant specializing in storage product selection. Your job is to help field sales reps identify the right NetApp product for a customer's workload.

Product portfolio knowledge:
- AFX: Disaggregated NVMe, NAS+S3 only, 128-node clusters, 4TB/s, 1+EB scale, AI/ML/HPC/EDA workloads, REQUIRES ONTAP 9.17.1+
- AFF A-Series (A20-A1K): Unified all-flash, all protocols, mission-critical enterprise, sub-100µs latency, up to 24-node clusters
- AFF C-Series (C30-C80): QLC NVMe, capacity-optimized, ~2ms read latency, unified protocols, workload consolidation
- ASA r2: Block-only (FCP/iSCSI/NVMe-oF), SAN-optimized, databases/VMware block, symmetric active-active
- FAS (FAS50-FAS90): Hybrid flash+HDD, backup/retention/secondary storage

RESPONSE FORMAT: Always respond with:
1. A 2-sentence recommendation with product name bolded
2. A structured JSON block wrapped in \`\`\`json markers: {"recommended": string, "confidence": "high"|"med"|"low", "reasons": string[], "alternatives": string[], "next_steps": string[]}
3. A clarifying question to refine further

If the workload needs >1 PB capacity + NAS + AI/GPU access, ALWAYS recommend AFX and explain disaggregated architecture benefits.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = (await request.json()) as {
      messages: ChatMessage[];
      context?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured. Please set it in your .env.local file." },
        { status: 500 }
      );
    }

    let systemPrompt = PRODUCT_SELECTOR_SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nAdditional context: ${context}`;
    }

    const content = await createChatCompletion(messages, systemPrompt);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please check your API key configuration." },
      { status: 500 }
    );
  }
}
