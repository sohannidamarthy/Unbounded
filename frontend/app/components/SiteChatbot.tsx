"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type BetPlay = {
  match: string;
  league: string;
  betType: string;
  legA: { book: string; odds: string; stake: number };
  legB: { book: string; odds: string; stake: number };
  profit: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  plays?: BetPlay[];
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
const BET_TYPES = ["Moneyline", "Spread", "Total", "Player prop", "Alt line"];

const PLAY_TEMPLATES = [
  { match: "Celtics vs. Knicks", league: "NBA", legA: { book: "FanDuel", odds: "+108" }, legB: { book: "DraftKings", odds: "-101" }, roi: 0.031 },
  { match: "Dodgers vs. Padres", league: "MLB", legA: { book: "BetMGM", odds: "+120" }, legB: { book: "Caesars", odds: "-112" }, roi: 0.027 },
  { match: "Man City vs. Arsenal", league: "EPL", legA: { book: "ESPN BET", odds: "+134" }, legB: { book: "Bet365", odds: "-119" }, roi: 0.022 },
];

function buildPlays(betType: string, totalStake: number): BetPlay[] {
  const stake = Number.isFinite(totalStake) && totalStake > 0 ? totalStake : 100;
  return PLAY_TEMPLATES.map((template) => {
    const stakeA = Math.round(stake * 0.52);
    const stakeB = Math.max(0, stake - stakeA);
    return {
      match: template.match,
      league: template.league,
      betType,
      legA: { ...template.legA, stake: stakeA },
      legB: { ...template.legB, stake: stakeB },
      profit: Math.round(stake * template.roi * 100) / 100,
    };
  });
}

export function SiteChatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES);
  const [pendingRoute, setPendingRoute] = useState<{
    href: string;
    label: string;
  } | null>(null);
  const [betType, setBetType] = useState(BET_TYPES[0]);
  const [stake, setStake] = useState("100");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const visibleMessages = useMemo(() => messages.slice(-6), [messages]);

  if (pathname !== "/dashboard") {
    return null;
  }

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

  const handleBetRequest = () => {
    if (isSending) {
      return;
    }
    const stakeNum = Number(stake) || 100;
    const plays = buildPlays(betType, stakeNum);
    setPendingRoute(null);
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: `Find ${betType.toLowerCase()} plays for $${stakeNum} total stake.`,
      },
      {
        role: "assistant",
        content: `Here are ${betType.toLowerCase()} plays sized to your $${stakeNum} stake. Each splits the total across two books to lock the edge:`,
        plays,
      },
    ]);
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
                <span>{message.content}</span>
                {message.plays ? (
                  <div className="site-chatbot-plays">
                    {message.plays.map((play) => (
                      <div className="site-chatbot-play" key={play.match}>
                        <div className="site-chatbot-play-head">
                          <strong>{play.match}</strong>
                          <span>{play.league} · {play.betType}</span>
                        </div>
                        <div className="site-chatbot-play-legs">
                          <span>
                            {play.legA.book} {play.legA.odds}
                            <em>${play.legA.stake}</em>
                          </span>
                          <span>
                            {play.legB.book} {play.legB.odds}
                            <em>${play.legB.stake}</em>
                          </span>
                        </div>
                        <div className="site-chatbot-play-profit">
                          Locked profit ≈ ${play.profit.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
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
            <div className="site-chatbot-action-stack">
              <div className="site-chatbot-bet-builder">
                <label>
                  <span>Bet type</span>
                  <select
                    value={betType}
                    onChange={(event) => setBetType(event.target.value)}
                  >
                    {BET_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Total stake</span>
                  <input
                    type="number"
                    min="1"
                    value={stake}
                    onChange={(event) => setStake(event.target.value)}
                  />
                </label>
                <button type="button" onClick={handleBetRequest} disabled={isSending}>
                  Find plays
                </button>
              </div>
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
