"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply: string;
  navigateTo: string | null;
  label: string | null;
};

const STARTER_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content: "Ask me for arbitrage, EV bets, tools, tutorials, or your dashboard."
  }
];

const SUGGESTIONS = ["Arbitrage bets", "Positive EV", "Profit tracker"];

export function SiteChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [pendingRoute, setPendingRoute] = useState<{
    href: string;
    label: string;
  } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);

  const submitMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];
    setMessages(nextMessages);
    setInput("");
    setPendingRoute(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/site-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || "I can help you find the right page."
        }
      ]);

      if (data.navigateTo) {
        setPendingRoute({
          href: data.navigateTo,
          label: data.label || "Open page"
        });
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I could not reach the assistant. Try asking for a page name."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(input);
  };

  const handleOpen = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  };

  const handleNavigate = () => {
    if (!pendingRoute) {
      return;
    }

    router.push(pendingRoute.href);
    setIsOpen(false);
    setPendingRoute(null);
  };

  return (
    <div className={`site-chatbot${isOpen ? " is-open" : ""}`}>
      {isOpen ? (
        <section className="site-chatbot-panel" aria-label="Site assistant">
          <div className="site-chatbot-header">
            <div>
              <span>Assistant</span>
              <strong>Unbounded</strong>
            </div>
            <button
              type="button"
              className="site-chatbot-icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              x
            </button>
          </div>

          <div className="site-chatbot-messages" aria-live="polite">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content}`}
                className={`site-chatbot-message site-chatbot-message--${message.role}`}
              >
                {message.content}
              </div>
            ))}
            {isSending ? (
              <div className="site-chatbot-message site-chatbot-message--assistant">
                Checking...
              </div>
            ) : null}
          </div>

          {pendingRoute ? (
            <button
              type="button"
              className="site-chatbot-route"
              onClick={handleNavigate}
            >
              Go to {pendingRoute.label}
            </button>
          ) : (
            <div className="site-chatbot-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void submitMessage(suggestion)}
                  disabled={isSending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form className="site-chatbot-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Where do you want to go?"
              aria-label="Ask the site assistant"
            />
            <button type="submit" disabled={isSending || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="site-chatbot-launcher"
          onClick={handleOpen}
          aria-label="Open site assistant"
        >
          Chat
        </button>
      )}
    </div>
  );
}
