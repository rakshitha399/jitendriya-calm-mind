import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { Flower2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PageHeader } from "@/components/common/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_main/assistant")({
  head: () => ({
    meta: [
      { title: "Ask Jitendriya — AI app guide" },
      { name: "description", content: "Ask the AI-powered guide how to use Jitendriya's meditation, journal, japa counter and more." },
      { property: "og:title", content: "Ask Jitendriya — AI app guide" },
      { property: "og:description", content: "An AI-powered guide to every corner of Jitendriya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantPage,
});

const suggestions = ["How do I use the Japa counter?", "Where is my journal saved?", "Which meditation helps before sleep?", "How are recommendations chosen?"];

function errorText(e: Error) {
  const m = e.message || "";
  if (/402|credit/i.test(m)) return "The assistant has run out of AI credits for now. Please try again later.";
  if (/429|rate/i.test(m)) return "Too many questions at once — please wait a moment and try again.";
  try { return (JSON.parse(m) as { error?: string }).error ?? "Something went wrong. Please try again."; } catch { return m || "Something went wrong. Please try again."; }
}

function AssistantPage() {
  const [transport] = useState(() => new DefaultChatTransport({ api: "/api/assistant" }));
  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({ transport });
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);

  const send = (t: string) => {
    const v = t.trim();
    if (!v || busy) return;
    sendMessage({ text: v });
    setText("");
  };
  const onSubmit = (m: PromptInputMessage) => send(m.text ?? "");

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[480px] flex-col lg:h-[calc(100dvh-5rem)]">
      <PageHeader
        eyebrow="AI-powered guide"
        title="Ask Jitendriya"
        description="Questions about the app — where things are and how they work."
        action={messages.length > 0 ? <Button variant="outline" onClick={() => { stop(); setMessages([]); clearError(); }}><RotateCcw /> New conversation</Button> : undefined}
      />
      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState icon={<Flower2 className="h-8 w-8 text-gold" />} title="How can I help?" description="Try one of these:">
                <div className="flex flex-col items-center gap-3">
                  <Flower2 className="h-8 w-8 text-gold" aria-hidden />
                  <p className="font-serif text-2xl">How can I help?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>{s}</Button>)}
                  </div>
                </div>
              </ConversationEmptyState>
            ) : (
              messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent className={m.role === "user" ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground" : ""}>
                    {m.parts.map((p, i) => (p.type === "text" ? <MessageResponse key={i}>{p.text}</MessageResponse> : null))}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
            {error && <p role="alert" className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorText(error)}</p>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="border-t p-3">
          <PromptInput onSubmit={onSubmit}>
            <PromptInputTextarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about any part of Jitendriya…" aria-label="Your question" maxLength={2000} />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} aria-label={busy ? "Stop" : "Send"} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">AI answers can be mistaken. Your journal is never shared with the assistant.</p>
        </div>
      </div>
    </div>
  );
}
