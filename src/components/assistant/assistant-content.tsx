"use client";

import * as React from "react";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Review my resume for ATS compatibility",
  "Improve this cover letter paragraph",
  "Give me common HR interview questions",
  "Give me technical interview questions for this role",
  "Help me write a follow-up email to a recruiter",
  "Correct the grammar in this text",
];

export function AssistantContent() {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (content: string) => {
    if (!content.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Could not reach the assistant. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((p) => (
          <Button key={p} variant="secondary" size="sm" onClick={() => send(p)}>
            {p}
          </Button>
        ))}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Bot className="h-10 w-10 text-muted-foreground/50" />
              <p>Ask about resumes, cover letters, interview prep, or job search strategy.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {m.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
              {error.includes("not configured") && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Add an <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> environment variable to enable
                  this feature (see README).
                </p>
              )}
            </div>
          )}
        </CardContent>
        <div className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            className="min-h-11 flex-1 resize-none"
            placeholder={user ? "Ask the AI assistant anything about your job search…" : "Sign in to use the assistant"}
            value={input}
            disabled={!user}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button onClick={() => send(input)} disabled={!user || loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
