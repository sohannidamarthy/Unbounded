import type { Metadata } from "next";

export type SeoPageDefinition = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  previewLabel: string;
  previewImage: string;
  previewAlt: string;
  previewCaption: string;
  ctaLoggedOutLabel: string;
  ctaLoggedInLabel: string;
  ctaTarget: string;
  relatedLabel: string;
  relatedLinks: Array<{ href: string; title: string; description: string }>;
  testimonials: Array<{ quote: string; name: string; role: string }>;
  pricingLabel: string;
  pricingDescription: string;
};

const arbitrageTestimonials = [
  {
    quote:
      "The arbitrage pages explained the workflow cleanly enough that I knew what to watch before I ever opened the product.",
    name: "Anonymous",
    role: "Independent bettor",
  },
  {
    quote:
      "The examples helped our team align on what counts as a true arb and what should be ignored.",
    name: "Anonymous",
    role: "Small betting group",
  },
  {
    quote:
      "It feels educational first, then naturally points you into the actual scanning workflow.",
    name: "Anonymous",
    role: "Sharp recreational user",
  },
];

const positiveEvTestimonials = [
  {
    quote:
      "The EV pages made the math approachable without dumbing it down. That’s rare.",
    name: "Anonymous",
    role: "Quant-minded bettor",
  },
  {
    quote:
      "I liked that it showed the why first, then the product workflow second.",
    name: "Anonymous",
    role: "Solo bettor",
  },
  {
    quote:
      "It turned a concept I knew vaguely into something I could actually act on.",
    name: "Anonymous",
    role: "Weekend bettor",
  },
];

const toolsTestimonials = [
  {
    quote:
      "The calculators and tracker pages are the easiest path from reading about edge to actually testing your own process.",
    name: "Anonymous",
    role: "Process-focused bettor",
  },
  {
    quote:
      "Good tool pages should feel useful before signup. These do.",
    name: "Anonymous",
    role: "Sports analytics user",
  },
  {
    quote:
      "It’s rare to see tool content and actual product flow line up this closely.",
    name: "Anonymous",
    role: "Private betting team",
  },
];

const tutorialTestimonials = [
  {
    quote:
      "The tutorials pages feel like a proper learning path, not filler content.",
    name: "Anonymous",
    role: "New user",
  },
  {
    quote:
      "I could send someone one link and they’d understand what they needed to study next.",
    name: "Anonymous",
    role: "Team lead",
  },
  {
    quote:
      "It bridges education and product in a way that feels intentional.",
    name: "Anonymous",
    role: "Intermediate bettor",
  },
];

export const SEO_PAGES: Record<string, SeoPageDefinition> = {
  "/arbitrage": {
    path: "/arbitrage",
    title: "Arbitrage Betting Explained",
    description: "Learn what arbitrage betting is, how it works, and how to find risk-controlled opportunities.",
    eyebrow: "Arbitrage Education",
    heroTitle: "Arbitrage Betting Explained",
    heroDescription:
      "Understand the mechanics of sports betting arbitrage, what makes a true arb, and how sharper operators structure the workflow before they place a bet.",
    previewLabel: "Blurred arbitrage board preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage betting board preview",
    previewCaption: "Start finding opportunities with a faster arbitrage workflow.",
    ctaLoggedOutLabel: "Start finding opportunities",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Arbitrage subtopics",
    relatedLinks: [
      {
        href: "/what-is-arbitrage-betting",
        title: "What is arbitrage betting?",
        description: "A plain-language breakdown of arbitrage betting and where the edge comes from.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "A practical walkthrough of finding, sizing, and placing both sides of an arb.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "Different ways bettors structure arbitrage workflows, speed, and execution discipline.",
      },
      {
        href: "/risk-free-betting",
        title: "Risk-free betting",
        description: "Where the phrase fits, where it doesn’t, and what the real risks still are.",
      },
      {
        href: "/is-arbitrage-legal",
        title: "Is arbitrage legal?",
        description: "A practical overview of legality, sportsbook policies, and account limitations.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "What bettors look for in scanners, alerts, and execution tooling.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Start arbitrage faster",
    pricingDescription: "Use the live arbitrage board, filtered scanners, and account workflow once you are ready to move from theory to execution.",
  },
  "/what-is-arbitrage-betting": {
    path: "/what-is-arbitrage-betting",
    title: "What Is Arbitrage Betting?",
    description: "A beginner-friendly explanation of arbitrage betting, how it works, and why sportsbooks create temporary price gaps.",
    eyebrow: "Arbitrage Basics",
    heroTitle: "What Is Arbitrage Betting?",
    heroDescription:
      "Arbitrage betting is the process of taking two or more prices that create a locked-in margin across outcomes. This page explains the concept without the jargon.",
    previewLabel: "Arbitrage concept preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage betting screen",
    previewCaption: "See how pricing gaps become actionable opportunities.",
    ctaLoggedOutLabel: "Learn the workflow",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Keep learning arbitrage",
    relatedLinks: [
      {
        href: "/arbitrage",
        title: "Arbitrage overview",
        description: "Start with the full overview and core workflow.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Move from the concept into the actual process.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "See how different bettors approach arb execution.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Turn concepts into action",
    pricingDescription: "Once the core idea is clear, move into the product flow and start scanning real opportunities.",
  },
  "/how-to-arbitrage-bet": {
    path: "/how-to-arbitrage-bet",
    title: "How To Arbitrage Bet",
    description: "Learn the practical steps to find, validate, and place arbitrage bets with better speed and fewer mistakes.",
    eyebrow: "Arbitrage Workflow",
    heroTitle: "How To Arbitrage Bet",
    heroDescription:
      "A step-by-step look at how sharper bettors find both sides, verify payout balance, and avoid avoidable execution errors.",
    previewLabel: "Execution workflow preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage execution screen",
    previewCaption: "Move from scanning to placement with fewer delays.",
    ctaLoggedOutLabel: "Start learning the process",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Related arbitrage pages",
    relatedLinks: [
      {
        href: "/what-is-arbitrage-betting",
        title: "What is arbitrage betting?",
        description: "Review the concept before execution.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "Compare fast and methodical arb approaches.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "See which tools speed up the process.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Start the real workflow",
    pricingDescription: "Use the actual arbitrage board when you are ready to apply this process live.",
  },
  "/arbitrage-strategies": {
    path: "/arbitrage-strategies",
    title: "Arbitrage Strategies",
    description: "Different arbitrage betting strategies, from simple two-way setups to faster multi-book execution systems.",
    eyebrow: "Arbitrage Strategy",
    heroTitle: "Arbitrage Strategies",
    heroDescription:
      "Not every arbitrage bettor works the same way. Compare common strategy styles, where they fit, and what breaks under pressure.",
    previewLabel: "Strategy preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage strategy interface",
    previewCaption: "Build a process around speed, clarity, and repeatability.",
    ctaLoggedOutLabel: "Explore arb strategies",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "More on arbitrage",
    relatedLinks: [
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Return to the execution walkthrough.",
      },
      {
        href: "/risk-free-betting",
        title: "Risk-free betting",
        description: "Understand where strategy and risk actually meet.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "See which tools fit different strategy types.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Upgrade your arbitrage workflow",
    pricingDescription: "Bring strategy into the live board with filters, calculators, and faster board visibility.",
  },
  "/risk-free-betting": {
    path: "/risk-free-betting",
    title: "Risk-Free Betting",
    description: "What bettors mean by risk-free betting, where that idea holds up, and where execution risk still matters.",
    eyebrow: "Arbitrage Risk",
    heroTitle: "Risk-Free Betting",
    heroDescription:
      "This term gets overused. Learn when locked-in margins are real, what can still go wrong, and why execution quality matters even when pricing looks safe.",
    previewLabel: "Risk control preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage risk management view",
    previewCaption: "Understand the difference between theoretical safety and real execution.",
    ctaLoggedOutLabel: "Learn where the risks are",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Risk and arbitrage topics",
    relatedLinks: [
      {
        href: "/is-arbitrage-legal",
        title: "Is arbitrage legal?",
        description: "See where legal and account-level risks enter the picture.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Execution discipline is what keeps avoidable risk down.",
      },
      {
        href: "/arbitrage",
        title: "Arbitrage overview",
        description: "Go back to the bigger arbitrage framework.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Reduce avoidable execution risk",
    pricingDescription: "See the board faster, validate payouts quicker, and keep your process tighter with the product flow.",
  },
  "/is-arbitrage-legal": {
    path: "/is-arbitrage-legal",
    title: "Is Arbitrage Legal?",
    description: "A practical explanation of arbitrage legality, sportsbook rules, and the difference between lawful betting and account restrictions.",
    eyebrow: "Arbitrage Legality",
    heroTitle: "Is Arbitrage Legal?",
    heroDescription:
      "Arbitrage betting is often legal as a betting activity, but sportsbook policies, limits, and account action still matter. This page separates legal questions from operator behavior.",
    previewLabel: "Policy overview preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred sportsbook policy and arbitrage screen",
    previewCaption: "Understand legality, policy, and practical account risk separately.",
    ctaLoggedOutLabel: "Understand the rules",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Related legal and risk pages",
    relatedLinks: [
      {
        href: "/risk-free-betting",
        title: "Risk-free betting",
        description: "See where theory ends and practical risk begins.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "Compare the strategy side once the policy side is clear.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "Tooling also affects how visible and scalable your process is.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Move from policy questions to execution",
    pricingDescription: "Once the framework is clear, use the board to focus on actual opportunities rather than guesswork.",
  },
  "/arbitrage-software": {
    path: "/arbitrage-software",
    title: "Arbitrage Software",
    description: "What to look for in arbitrage software, from scanners and alerts to calculators and profit tracking.",
    eyebrow: "Arbitrage Tools",
    heroTitle: "Arbitrage Software",
    heroDescription:
      "Good arbitrage software shortens scan-to-bet time, makes validation cleaner, and reduces mistakes under pressure. This page explains what actually matters.",
    previewLabel: "Arbitrage software preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred arbitrage software interface",
    previewCaption: "Scanners, calculators, and tracking should work like one system.",
    ctaLoggedOutLabel: "See what the tooling should do",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Tool-related arbitrage pages",
    relatedLinks: [
      {
        href: "/arbitrage-calculator",
        title: "Arbitrage calculator",
        description: "See how sizing logic fits into execution.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "Tools only help when the strategy is clear.",
      },
      {
        href: "/arbitrage",
        title: "Arbitrage overview",
        description: "Return to the big-picture arbitrage guide.",
      },
    ],
    testimonials: arbitrageTestimonials,
    pricingLabel: "Use the full arbitrage toolset",
    pricingDescription: "Move from software theory into live filters, calculators, and board monitoring.",
  },
  "/positive-ev": {
    path: "/positive-ev",
    title: "Positive EV Betting Explained",
    description: "Learn how positive EV betting works, how value is identified, and how expected value shapes better decision-making.",
    eyebrow: "Positive EV Education",
    heroTitle: "Positive EV Betting Explained",
    heroDescription:
      "Understand what positive expected value means in sports betting, how bettors estimate value, and how to turn the math into a repeatable process.",
    previewLabel: "Positive EV preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred positive EV betting board preview",
    previewCaption: "Find value more consistently with a clearer EV workflow.",
    ctaLoggedOutLabel: "Start learning positive EV",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Positive EV subtopics",
    relatedLinks: [
      {
        href: "/what-is-positive-ev",
        title: "What is positive EV?",
        description: "Start with the core concept and the role of expected value.",
      },
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "Translate expected value into actual bet selection.",
      },
      {
        href: "/positive-ev/ev-betting-strategy",
        title: "EV betting strategy",
        description: "See how disciplined bettors structure positive EV workflows.",
      },
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "The pricing concept that underpins positive EV decisions.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "The formula behind EV and how bettors use it in practice.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "Start finding better value",
    pricingDescription: "Apply the expected-value workflow with filtered boards, calculators, and cleaner visibility into candidate bets.",
  },
  "/what-is-positive-ev": {
    path: "/what-is-positive-ev",
    title: "What Is Positive EV?",
    description: "A plain-language guide to positive EV betting, expected value, and why some bets are mathematically better than others.",
    eyebrow: "Positive EV Basics",
    heroTitle: "What Is Positive EV?",
    heroDescription:
      "Positive EV betting is about placing bets where your estimated win probability is better than the market implies. This page explains the idea simply and clearly.",
    previewLabel: "Expected value concept preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred positive EV concept screen",
    previewCaption: "Expected value starts with understanding market price versus true probability.",
    ctaLoggedOutLabel: "Understand positive EV",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Related positive EV pages",
    relatedLinks: [
      {
        href: "/positive-ev",
        title: "Positive EV overview",
        description: "Go back to the broader positive EV guide.",
      },
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "See how sportsbook odds become probabilities.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "Understand the actual EV calculation behind the concept.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "Move from concept to board",
    pricingDescription: "Once the idea is clear, use the product workflow to spot candidate positive EV bets faster.",
  },
  "/positive-ev/how-to-find-value-bets": {
    path: "/positive-ev/how-to-find-value-bets",
    title: "How To Find Value Bets",
    description: "Learn how bettors identify value bets by comparing price, implied probability, and their own estimate of fair odds.",
    eyebrow: "Value Bet Workflow",
    heroTitle: "How To Find Value Bets",
    heroDescription:
      "Finding value bets means comparing the market’s price to your own estimate of true probability. This page explains what sharp bettors actually look for.",
    previewLabel: "Value bet workflow preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred value betting workflow preview",
    previewCaption: "Use a cleaner process to separate real value from noise.",
    ctaLoggedOutLabel: "Learn how to find value",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Keep learning positive EV",
    relatedLinks: [
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "Start with how prices convert into probability.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "Understand the math behind value-bet selection.",
      },
      {
        href: "/positive-ev/ev-betting-strategy",
        title: "EV betting strategy",
        description: "See how value-bet identification fits into a wider process.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "Scan value faster",
    pricingDescription: "Use the board, calculator, and filters when you’re ready to move from theory into candidate bet selection.",
  },
  "/positive-ev/ev-betting-strategy": {
    path: "/positive-ev/ev-betting-strategy",
    title: "EV Betting Strategy",
    description: "A strategic look at positive EV betting, portfolio thinking, selectivity, and repeatable edge management.",
    eyebrow: "EV Strategy",
    heroTitle: "EV Betting Strategy",
    heroDescription:
      "Positive EV without process turns into random clicking. This page explains how sharper bettors think about selectivity, volume, and review loops.",
    previewLabel: "EV strategy preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred EV strategy interface",
    previewCaption: "Build a process that keeps value clear and execution disciplined.",
    ctaLoggedOutLabel: "Explore EV strategy",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "More positive EV topics",
    relatedLinks: [
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "Value selection is the foundation of strategy.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "The strategy still rests on the math.",
      },
      {
        href: "/positive-ev",
        title: "Positive EV overview",
        description: "Return to the broader EV overview.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "Put EV strategy into practice",
    pricingDescription: "Use the board and tools to build a cleaner positive EV routine instead of a scattered one.",
  },
  "/positive-ev/implied-probability-explained": {
    path: "/positive-ev/implied-probability-explained",
    title: "Implied Probability Explained",
    description: "Learn how implied probability works in sports betting and why it matters for EV, value bets, and price comparison.",
    eyebrow: "Probability Basics",
    heroTitle: "Implied Probability Explained",
    heroDescription:
      "Odds are just prices until you turn them into probabilities. This page explains that conversion and why it matters for positive EV betting.",
    previewLabel: "Probability preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred implied probability screen",
    previewCaption: "Translate prices into probabilities before you judge value.",
    ctaLoggedOutLabel: "Learn implied probability",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Probability and EV topics",
    relatedLinks: [
      {
        href: "/what-is-positive-ev",
        title: "What is positive EV?",
        description: "Return to the core concept.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "See how probability feeds directly into EV.",
      },
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "Use implied probability to evaluate candidate bets.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "See probability in context",
    pricingDescription: "Use the board and calculators once you want to move from the concept into real prices and candidate bets.",
  },
  "/positive-ev/expected-value-formula": {
    path: "/positive-ev/expected-value-formula",
    title: "Expected Value Formula",
    description: "The expected value formula explained for sports betting, with practical context for positive EV decision-making.",
    eyebrow: "EV Math",
    heroTitle: "Expected Value Formula",
    heroDescription:
      "This page breaks down the expected value formula and shows how bettors use it to compare price, risk, and long-run decision quality.",
    previewLabel: "Expected value formula preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred expected value formula interface",
    previewCaption: "See the formula behind value-bet decisions without losing the practical context.",
    ctaLoggedOutLabel: "Understand the formula",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "EV math and process pages",
    relatedLinks: [
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "Probability feeds into every EV calculation.",
      },
      {
        href: "/what-is-positive-ev",
        title: "What is positive EV?",
        description: "Go back to the plain-language EV overview.",
      },
      {
        href: "/positive-ev/ev-betting-strategy",
        title: "EV betting strategy",
        description: "See how the formula fits into a usable workflow.",
      },
    ],
    testimonials: positiveEvTestimonials,
    pricingLabel: "Use EV without spreadsheet sprawl",
    pricingDescription: "Move from formula theory into calculators, boards, and a cleaner positive EV workflow.",
  },
  "/tools": {
    path: "/tools",
    title: "Sports Betting Tools",
    description: "Explore calculators, trackers, and utilities for arbitrage, positive EV, and live bet workflows.",
    eyebrow: "Tools",
    heroTitle: "Sports Betting Tools",
    heroDescription:
      "From calculators to trackers, this section connects educational tool pages to the actual workflow bettors use when they move from idea to execution.",
    previewLabel: "Tools preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred betting tools preview",
    previewCaption: "Calculators and trackers should shorten the path from idea to action.",
    ctaLoggedOutLabel: "Explore the tools",
    ctaLoggedInLabel: "Open dashboard tools",
    ctaTarget: "/dashboard",
    relatedLabel: "Tool pages",
    relatedLinks: [
      {
        href: "/arbitrage-calculator",
        title: "Arbitrage calculator",
        description: "Calculate balanced stakes for arbitrage opportunities.",
      },
      {
        href: "/positive-ev-calculator",
        title: "Positive EV calculator",
        description: "Evaluate expected value and pricing assumptions more cleanly.",
      },
      {
        href: "/tools/profit-tracker",
        title: "Profit tracker",
        description: "Learn how bettors track results across arbitrage, EV, and live bets.",
      },
      {
        href: "/ev-profit-tracker",
        title: "EV profit tracker",
        description: "Track expected value outcomes with more structure.",
      },
      {
        href: "/live-bets-profit-tracker",
        title: "Live bets profit tracker",
        description: "See how real-time decision flows translate into tracking discipline.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Use the real tool workflow",
    pricingDescription: "Open the actual calculators and tracker once you’re ready to stop reading and start working.",
  },
  "/arbitrage-calculator": {
    path: "/arbitrage-calculator",
    title: "Arbitrage Calculator",
    description: "A guide to arbitrage calculators, stake balancing, and why sizing tools matter in real execution.",
    eyebrow: "Calculator",
    heroTitle: "Arbitrage Calculator",
    heroDescription:
      "Arbitrage is not just about finding both sides. It is also about balancing stake size cleanly enough to protect the margin you found.",
    previewLabel: "Arbitrage calculator preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred arbitrage calculator preview",
    previewCaption: "Use stake sizing that supports the edge instead of weakening it.",
    ctaLoggedOutLabel: "See the calculator workflow",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Related tools and arbitrage pages",
    relatedLinks: [
      {
        href: "/tools",
        title: "Tools overview",
        description: "Return to the broader tools hub.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "See where calculators fit in the overall stack.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Put sizing into the wider execution process.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Use the live calculator",
    pricingDescription: "Move from theory into the actual calculator and arbitrage board workflow.",
  },
  "/positive-ev-calculator": {
    path: "/positive-ev-calculator",
    title: "Positive EV Calculator",
    description: "A guide to positive EV calculators, expected value inputs, and how bettors use them in practice.",
    eyebrow: "Calculator",
    heroTitle: "Positive EV Calculator",
    heroDescription:
      "Expected value is easier to trust when the workflow is clear. This page explains what an EV calculator should help you do, and what it should never hide.",
    previewLabel: "Positive EV calculator preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred positive EV calculator preview",
    previewCaption: "Use calculators to make judgment clearer, not noisier.",
    ctaLoggedOutLabel: "Understand the EV calculator",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Related tools and EV pages",
    relatedLinks: [
      {
        href: "/tools",
        title: "Tools overview",
        description: "Go back to the main tools section.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "See the math behind the calculator.",
      },
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "Use the calculator inside a wider value-bet process.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Use the EV calculator live",
    pricingDescription: "Open the actual calculator and positive EV board when you’re ready to work with real prices.",
  },
  "/tools/profit-tracker": {
    path: "/tools/profit-tracker",
    title: "Profit Tracker",
    description: "Learn how profit tracking works for arbitrage, positive EV, and live betting workflows.",
    eyebrow: "Tracking",
    heroTitle: "Profit Tracker",
    heroDescription:
      "Tracking is where edge quality becomes visible over time. This page explains what sharper bettors want from a tracker and why categorizing results matters.",
    previewLabel: "Profit tracker preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred profit tracker preview",
    previewCaption: "A good tracker turns scattered results into a real review loop.",
    ctaLoggedOutLabel: "Learn the tracker workflow",
    ctaLoggedInLabel: "Open profit tracker",
    ctaTarget: "/profit-tracker",
    relatedLabel: "Related tracker pages",
    relatedLinks: [
      {
        href: "/ev-profit-tracker",
        title: "EV profit tracker",
        description: "See how EV-focused tracking differs from general tracking.",
      },
      {
        href: "/live-bets-profit-tracker",
        title: "Live bets profit tracker",
        description: "Real-time workflows need their own review discipline.",
      },
      {
        href: "/tools",
        title: "Tools overview",
        description: "Return to the main tools hub.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Track results in one place",
    pricingDescription: "Use the live tracker when you want your decisions, categories, and outcomes in one reviewable workflow.",
  },
  "/ev-profit-tracker": {
    path: "/ev-profit-tracker",
    title: "EV Profit Tracker",
    description: "How bettors track positive EV decisions, review outcomes, and separate process quality from short-term variance.",
    eyebrow: "Tracking",
    heroTitle: "EV Profit Tracker",
    heroDescription:
      "Tracking positive EV bets is not just about wins and losses. It is also about understanding whether your selection process is holding up over time.",
    previewLabel: "EV tracker preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred EV profit tracker preview",
    previewCaption: "Track the process, not just the outcome.",
    ctaLoggedOutLabel: "Learn EV tracking",
    ctaLoggedInLabel: "Open profit tracker",
    ctaTarget: "/profit-tracker",
    relatedLabel: "Related tracking pages",
    relatedLinks: [
      {
        href: "/tools/profit-tracker",
        title: "Profit tracker",
        description: "Return to the broader tracker overview.",
      },
      {
        href: "/positive-ev/ev-betting-strategy",
        title: "EV betting strategy",
        description: "Good tracking supports strategic review.",
      },
      {
        href: "/positive-ev-calculator",
        title: "Positive EV calculator",
        description: "The calculator and tracker reinforce each other.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Use the live tracker",
    pricingDescription: "Take the review process into the actual tracker once you want real categorization and cleaner performance feedback.",
  },
  "/live-bets-profit-tracker": {
    path: "/live-bets-profit-tracker",
    title: "Live Bets Profit Tracker",
    description: "How live bettors track outcomes, decision quality, and review loops across faster in-play workflows.",
    eyebrow: "Tracking",
    heroTitle: "Live Bets Profit Tracker",
    heroDescription:
      "Live betting moves fast, which makes post-bet review even more important. This page explains the tracking discipline that supports better in-play decisions.",
    previewLabel: "Live bets tracker preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred live bets tracker preview",
    previewCaption: "Fast workflows still need a clean audit trail.",
    ctaLoggedOutLabel: "Learn live tracking",
    ctaLoggedInLabel: "Open profit tracker",
    ctaTarget: "/profit-tracker",
    relatedLabel: "Related tracking pages",
    relatedLinks: [
      {
        href: "/tools/profit-tracker",
        title: "Profit tracker",
        description: "Return to the core tracking guide.",
      },
      {
        href: "/ev-profit-tracker",
        title: "EV profit tracker",
        description: "Compare live tracking and EV tracking priorities.",
      },
      {
        href: "/arbitrage-calculator",
        title: "Arbitrage calculator",
        description: "Tooling and tracking should reinforce the same workflow.",
      },
    ],
    testimonials: toolsTestimonials,
    pricingLabel: "Track live decisions better",
    pricingDescription: "Use the tracker when you want your live workflow and your review loop in the same place.",
  },
  "/tutorials": {
    path: "/tutorials",
    title: "Sports Betting Tutorials",
    description: "Tutorials and educational pages for arbitrage betting, positive EV, and tool workflows.",
    eyebrow: "Tutorials",
    heroTitle: "Sports Betting Tutorials",
    heroDescription:
      "A public learning hub for arbitrage, positive EV, and workflow education before you ever open the product.",
    previewLabel: "Tutorials preview",
    previewImage: "/blurred3.jpg",
    previewAlt: "Blurred tutorials preview",
    previewCaption: "Learn the workflow first, then open the tools when you are ready.",
    ctaLoggedOutLabel: "Start learning",
    ctaLoggedInLabel: "Open dashboard",
    ctaTarget: "/dashboard",
    relatedLabel: "Tutorial collections",
    relatedLinks: [
      {
        href: "/tutorials/arbitrage-education",
        title: "Arbitrage education",
        description: "A curated path through arbitrage educational content.",
      },
      {
        href: "/tutorials/positive-ev-education",
        title: "Positive EV education",
        description: "A curated path through positive EV educational content.",
      },
      {
        href: "/arbitrage",
        title: "Arbitrage overview",
        description: "Jump directly into the arbitrage learning track.",
      },
      {
        href: "/positive-ev",
        title: "Positive EV overview",
        description: "Jump directly into the positive EV learning track.",
      },
      {
        href: "/what-is-arbitrage-betting",
        title: "What is arbitrage betting?",
        description: "Start with the arbitrage basics and core edge concept.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Move from concept into the real arbitrage workflow.",
      },
      {
        href: "/what-is-positive-ev",
        title: "What is positive EV?",
        description: "Learn the expected-value concept in plain language.",
      },
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "See how bettors turn EV into actual bet selection.",
      },
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "Understand the pricing math behind better betting decisions.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "See the formula that powers EV analysis and calculators.",
      },
      {
        href: "/tools",
        title: "Tools overview",
        description: "Browse calculators, trackers, and workflow tooling.",
      },
      {
        href: "/tools/profit-tracker",
        title: "Profit tracker",
        description: "Learn how result tracking fits into arbitrage, EV, and live bet review.",
      },
    ],
    testimonials: tutorialTestimonials,
    pricingLabel: "Move from education into execution",
    pricingDescription: "Use the product when you are ready to turn educational concepts into actual workflows and decisions.",
  },
  "/tutorials/arbitrage-education": {
    path: "/tutorials/arbitrage-education",
    title: "Arbitrage Education",
    description: "A guided arbitrage education track covering basics, strategies, tools, and legality.",
    eyebrow: "Tutorial Path",
    heroTitle: "Arbitrage Education",
    heroDescription:
      "This tutorial track groups the most useful arbitrage pages into one place so learners can move from concept to execution in a clean sequence.",
    previewLabel: "Arbitrage education preview",
    previewImage: "/blurred.jpg",
    previewAlt: "Blurred arbitrage education preview",
    previewCaption: "A structured arbitrage learning path from beginner concepts to execution.",
    ctaLoggedOutLabel: "Start arbitrage education",
    ctaLoggedInLabel: "Open arbitrage board",
    ctaTarget: "/arbitrage-bets",
    relatedLabel: "Arbitrage learning path",
    relatedLinks: [
      {
        href: "/what-is-arbitrage-betting",
        title: "What is arbitrage betting?",
        description: "Begin with the core concept.",
      },
      {
        href: "/how-to-arbitrage-bet",
        title: "How to arbitrage bet",
        description: "Move into the practical workflow.",
      },
      {
        href: "/arbitrage-strategies",
        title: "Arbitrage strategies",
        description: "Compare different strategic approaches.",
      },
      {
        href: "/risk-free-betting",
        title: "Risk-free betting",
        description: "Understand what still needs discipline.",
      },
      {
        href: "/is-arbitrage-legal",
        title: "Is arbitrage legal?",
        description: "Separate legality from account behavior.",
      },
      {
        href: "/arbitrage-software",
        title: "Arbitrage software",
        description: "See what good tooling should do.",
      },
    ],
    testimonials: tutorialTestimonials,
    pricingLabel: "Turn arbitrage education into action",
    pricingDescription: "Once the concepts are clear, open the live arbitrage board and start applying the workflow.",
  },
  "/tutorials/positive-ev-education": {
    path: "/tutorials/positive-ev-education",
    title: "Positive EV Education",
    description: "A guided positive EV education track covering the concept, math, value bets, and strategy.",
    eyebrow: "Tutorial Path",
    heroTitle: "Positive EV Education",
    heroDescription:
      "This learning path keeps the most useful positive EV pages in one sequence, so the concept, math, and practical workflow connect clearly.",
    previewLabel: "Positive EV education preview",
    previewImage: "/blurred2.jpg",
    previewAlt: "Blurred positive EV education preview",
    previewCaption: "A structured path from EV basics into practical value-bet workflow.",
    ctaLoggedOutLabel: "Start positive EV education",
    ctaLoggedInLabel: "Open positive EV board",
    ctaTarget: "/ev-bets",
    relatedLabel: "Positive EV learning path",
    relatedLinks: [
      {
        href: "/what-is-positive-ev",
        title: "What is positive EV?",
        description: "Start with the core expected-value concept.",
      },
      {
        href: "/positive-ev/how-to-find-value-bets",
        title: "How to find value bets",
        description: "Move into identifying candidate bets.",
      },
      {
        href: "/positive-ev/ev-betting-strategy",
        title: "EV betting strategy",
        description: "See how disciplined bettors use the concept.",
      },
      {
        href: "/positive-ev/implied-probability-explained",
        title: "Implied probability explained",
        description: "Understand the pricing foundation.",
      },
      {
        href: "/positive-ev/expected-value-formula",
        title: "Expected value formula",
        description: "See the actual EV math behind the workflow.",
      },
    ],
    testimonials: tutorialTestimonials,
    pricingLabel: "Turn EV education into execution",
    pricingDescription: "Open the positive EV board when you are ready to apply the framework in a live workflow.",
  },
};

export const ROOT_DYNAMIC_SEO_SLUGS = new Set([
  "what-is-arbitrage-betting",
  "how-to-arbitrage-bet",
  "arbitrage-strategies",
  "risk-free-betting",
  "is-arbitrage-legal",
  "arbitrage-software",
  "what-is-positive-ev",
  "arbitrage-calculator",
  "positive-ev-calculator",
  "ev-profit-tracker",
  "live-bets-profit-tracker",
]);

export const POSITIVE_EV_CHILD_SLUGS = new Set([
  "how-to-find-value-bets",
  "ev-betting-strategy",
  "implied-probability-explained",
  "expected-value-formula",
]);

export const TUTORIAL_CHILD_SLUGS = new Set([
  "arbitrage-education",
  "positive-ev-education",
]);

export function buildSeoMetadata(path: string): Metadata {
  const page = SEO_PAGES[path];

  if (!page) {
    return {
      title: "Unbounded",
      description: "Unbounded frontend",
    };
  }

  const title = `${page.title} | Unbounded`;

  return {
    title,
    description: page.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: page.description,
      type: "website",
      images: [
        {
          url: page.previewImage,
          alt: page.previewAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [page.previewImage],
    },
  };
}
