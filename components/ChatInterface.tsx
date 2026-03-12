"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductRecommendationCard, {
  parseRecommendation,
  getTextWithoutJson,
} from "@/components/ProductRecommendationCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  context?: string;
  placeholder?: string;
  starterPrompts?: string[];
  className?: string;
}

export default function ChatInterface({
  context,
  placeholder = "Describe your customer's workload...",
  starterPrompts,
  className = "",
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
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
    },
    [messages, isLoading, context]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleStarterClick(prompt: string) {
    sendMessage(prompt);
  }

  function renderMessageContent(content: string) {
    const recommendation = parseRecommendation(content);
    const textContent = getTextWithoutJson(content);

    return (
      <>
        {textContent && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{textContent}</p>
        )}
        {recommendation && (
          <ProductRecommendationCard recommendation={recommendation} />
        )}
      </>
    );
  }

  return (
    <div className={`flex flex-col h-full border border-netapp-border rounded-lg bg-white ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-netapp-muted py-12">
            <Bot size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">NetApp Product Advisor</p>
            <p className="text-xs mt-1">
              Describe a workload and I&apos;ll recommend the right product
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
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
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-netapp-blue text-white"
                    : "bg-netapp-surface text-netapp-dark"
                }`}
              >
                {message.role === "assistant"
                  ? renderMessageContent(message.content)
                  : <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                }
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-netapp-blue flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-netapp-surface flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-netapp-blue" />
            </div>
            <div className="bg-netapp-surface rounded-lg px-4 py-3">
              <Loader2 size={16} className="animate-spin text-netapp-blue" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length === 0 && starterPrompts && starterPrompts.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleStarterClick(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-netapp-border text-netapp-muted hover:text-netapp-blue hover:border-netapp-blue transition-all duration-150 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

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
