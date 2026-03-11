import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion, type ChatMessage } from "@/lib/claude";

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

    const systemPrompt = context
      ? `You are SalesPilot AI, a NetApp sales engineering assistant. Context for this conversation: ${context}`
      : undefined;

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
