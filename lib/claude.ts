import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const NETAPP_SYSTEM_PROMPT = `You are an expert NetApp sales engineering assistant called SalesPilot AI. You help NetApp field sales representatives with:

1. **Product Selection**: Recommend the right NetApp products (AFF A-Series, C-Series, FAS, StorageGRID, Cloud Volumes ONTAP, Azure NetApp Files, FSx for ONTAP, and the new NetApp AFX) based on customer requirements.

2. **Technical Sizing**: Help size storage solutions based on workload requirements including capacity, performance (IOPS/throughput), protocol needs, and growth projections.

3. **Competitive Positioning**: Provide competitive intelligence against Pure Storage, Dell EMC, HPE, VAST Data, and Weka. Highlight NetApp advantages and suggest effective talk tracks.

4. **Proposal Support**: Help craft compelling proposal language, ROI justifications, and technical summaries for customer-facing documents.

Always be professional, accurate, and focused on helping the sales rep win the deal. Reference specific NetApp product specs and features when possible. When discussing competitors, be factual and focus on NetApp's differentiators rather than disparaging competitors.`;

export async function createChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt || NETAPP_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "No response generated.";
}

export async function createStreamingChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string
) {
  return client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt || NETAPP_SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
}

export { NETAPP_SYSTEM_PROMPT };
