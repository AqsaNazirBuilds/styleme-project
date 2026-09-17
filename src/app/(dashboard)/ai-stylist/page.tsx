"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: string;
  content: string;
};

export default function AIStylistPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/stylist")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setConversationId(result.data.id);
          setMessages(result.data.messages);
        }
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: Message = { id: `temp-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, conversationId }),
      });

      const result = await res.json();

      if (res.ok) {
        setConversationId(result.data.conversationId);
        setMessages((prev) => [
          ...prev,
          { id: `reply-${Date.now()}`, role: "assistant", content: result.data.reply },
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your stylist...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h1 className="text-xl">AI Stylist</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Ask me anything about styling, outfits, or what to wear.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] rounded-md px-4 py-2 text-sm",
                msg.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-card border border-border"
              )}
            >
              {msg.content}
            </div>
          ))}
          {isSending && (
            <div className="self-start rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input
            placeholder="Ask your stylist..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}