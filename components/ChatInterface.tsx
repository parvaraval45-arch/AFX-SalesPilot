"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  context?: string;
  placeholder?: string;
}

export default function ChatInterface({
  context,
  placeholder = "Ask SalesPilot AI...",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please check that your API key is configured and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full border border-netapp-border rounded-lg bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-netapp-muted">
            <Bot size={40} className="mb-3 opacity-50" />
            <p className="text-sm">Ask SalesPilot AI anything about NetApp products,</p>
            <p className="text-sm">sizing, or competitive positioning.</p>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-netapp-surface flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-netapp-blue" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                message.role === "user"
                  ? "bg-netapp-blue text-white"
                  : "bg-netapp-surface text-netapp-dark"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-netapp-blue flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-netapp-surface flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-netapp-blue" />
            </div>
            <div className="bg-netapp-surface rounded-lg px-4 py-3">
              <Loader2 size={16} className="animate-spin text-netapp-blue" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-netapp-border p-4 flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="bg-netapp-blue hover:bg-netapp-blue/90 transition-all duration-150 ease-in-out"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
