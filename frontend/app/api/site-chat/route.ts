import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type SiteDestination = {
  title: string;
  href: string;
  description: string;
  keywords: string[];
};

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SITE_DESTINATIONS: SiteDestination[] = [
  {
    title: "Home",
    href: "/",
    description: "Marketing overview, pricing, and product intro.",
    keywords: ["home", "start", "main", "landing"]
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Authenticated command center with live bets, tools, and guides.",
    keywords: ["dashboard", "account", "portal", "live", "command center"]
  },
  {
    title: "Arbitrage",
    href: "/arbitrage",
    description: "Arbitrage education and product overview.",
    keywords: ["arbitrage", "arb", "risk free", "middle"]
  },
  {
    title: "Arbitrage Bets",
    href: "/arbitrage-bets",
    description: "Live arbitrage bet board.",
    keywords: ["arbitrage bets", "arb bets", "live arbs", "arb board"]
  },
  {
    title: "Positive EV",
    href: "/positive-ev",
    description: "Positive expected value education and product overview.",
    keywords: ["positive ev", "ev", "expected value", "plus ev"]
  },
  {
    title: "Positive EV Bets",
    href: "/ev-bets",
    description: "Live positive EV bet board.",
    keywords: ["ev bets", "positive ev bets", "expected value bets"]
  },
  {
    title: "Tools",
    href: "/tools",
    description: "Betting tools hub.",
    keywords: ["tools", "calculator", "utilities", "bet calculator"]
  },
  {
    title: "Profit Tracker",
    href: "/profit-tracker",
    description: "Track bet performance, bankroll, and profit.",
    keywords: ["profit", "tracker", "tracking", "bankroll", "roi"]
  },
  {
    title: "Leaderboard",
    href: "/leaderboard",
    description: "User rankings and performance leaderboard.",
    keywords: ["leaderboard", "rankings", "rank", "top users"]
  },
  {
    title: "Tutorials",
    href: "/tutorials",
    description: "Guides and tutorials.",
    keywords: ["tutorials", "guides", "learn", "education", "help"]
  },
  {
    title: "Auth",
    href: "/auth",
    description: "Sign in and account access.",
    keywords: ["login", "sign in", "auth", "register", "signup"]
  },
  {
    title: "Billing",
    href: "/billing",
    description: "Subscription tiers, annual savings, and user payment options.",
    keywords: [
      "billing",
      "payment",
      "subscription",
      "pricing",
      "select",
      "premium",
      "executive",
      "annual"
    ]
  },
  {
    title: "Waitlist",
    href: "/waitlist",
    description: "Join the waitlist.",
    keywords: ["waitlist", "join", "early access"]
  }
];

const SYSTEM_PROMPT = `You are the Unbounded site assistant. Help users find the right page and answer briefly.

Return only valid JSON in this exact shape:
{
  "reply": "short helpful response",
  "navigateTo": "/path-or-null",
  "label": "Page label or null"
}

Choose navigateTo only when the user clearly asks to go somewhere or asks for a site area. Use null for normal questions. Available destinations:
${SITE_DESTINATIONS.map(
  (page) => `- ${page.title}: ${page.href} - ${page.description}`
).join("\n")}`;

function keywordFallback(message: string) {
  const normalized = message.toLowerCase();
  const scored = SITE_DESTINATIONS.map((destination) => {
    const score = destination.keywords.reduce((total, keyword) => {
      return normalized.includes(keyword) ? total + keyword.length : total;
    }, 0);
    return { destination, score };
  }).sort((a, b) => b.score - a.score);

  const match = scored[0];
  if (!match || match.score === 0) {
    return {
      reply: "I can help you get around Unbounded. Try asking for arbitrage, positive EV, tools, tutorials, profit tracking, or the dashboard.",
      navigateTo: null,
      label: null
    };
  }

  return {
    reply: `I can take you to ${match.destination.title}.`,
    navigateTo: match.destination.href,
    label: match.destination.title
  };
}

function safeParseAssistantJson(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Assistant response was not JSON.");
    }
    return JSON.parse(match[0]);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { messages?: ChatMessage[] }
    | null;
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const sanitizedMessages = messages
    .filter(
      (message): message is ChatMessage =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    )
    .slice(-8);
  const latestUserMessage =
    [...sanitizedMessages].reverse().find((message) => message.role === "user")
      ?.content || "";

  if (!latestUserMessage.trim()) {
    return NextResponse.json(
      { error: "A user message is required." },
      { status: 400 }
    );
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({
      ...keywordFallback(latestUserMessage),
      source: "fallback"
    });
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Unbounded"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...sanitizedMessages
      ],
      temperature: 0.2,
      max_tokens: 220,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const fallback = keywordFallback(latestUserMessage);
    return NextResponse.json({
      ...fallback,
      source: "fallback",
      warning: "OpenRouter request failed."
    });
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    return NextResponse.json({
      ...keywordFallback(latestUserMessage),
      source: "fallback",
      warning: "OpenRouter returned an empty response."
    });
  }

  try {
    const parsed = safeParseAssistantJson(content);
    const destination = SITE_DESTINATIONS.find(
      (page) => page.href === parsed.navigateTo
    );

    return NextResponse.json({
      reply:
        typeof parsed.reply === "string" && parsed.reply.trim()
          ? parsed.reply
          : destination
            ? `I can take you to ${destination.title}.`
            : "I can help you find the right page.",
      navigateTo: destination?.href || null,
      label:
        destination?.title ||
        (typeof parsed.label === "string" ? parsed.label : null),
      source: "openrouter"
    });
  } catch {
    return NextResponse.json({
      ...keywordFallback(latestUserMessage),
      source: "fallback",
      warning: "OpenRouter response could not be parsed."
    });
  }
}
