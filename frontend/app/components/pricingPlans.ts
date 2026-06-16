export type PricingPlan = {
  name: "Select" | "Premium" | "Executive";
  monthlyPrice: string;
  annualPrice: string;
  annualMonthlyEquivalent: string;
  tag: string;
  description: string;
  features: string[];
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Select",
    monthlyPrice: "0.99",
    annualPrice: "323.89",
    annualMonthlyEquivalent: "29.99",
    tag: "Tier one",
    description:
      "Core access for learning the workflow, tracking bets, and testing basic market edges.",
    features: [
      "Moneyline arbitrage access",
      "Limited +EV opportunities and live odds coverage",
      "Profit calculator",
      "Public leaderboard and top bets feed",
      "Validator and manual entry tool",
      "Sports and league selector",
      "Founders Circle waitlist updates",
      "Newsletter-only mode included",
      "7-day free trial"
    ]
  },
  {
    name: "Premium",
    monthlyPrice: "3.33",
    annualPrice: "1079.89",
    annualMonthlyEquivalent: "99.99",
    tag: "Most popular",
    description:
      "Full access for active bettors who want sharper boards, cleaner signals, and fewer tabs.",
    features: [
      "All arbitrage opportunities and +EV bets",
      "Live odds",
      "Profit calculator",
      "Public leaderboard with leaders' bets",
      "Validator and manual entry",
      "Fastest withdrawal methods by sportsbook",
      "Sports and league selector",
      "Friction score",
      "Community-enabled bet flagging and trust scoring",
      "No ads or pop-ups",
      "Daily top bets and recommendations",
      "Top earners recommendations",
      "Reduced first-month price"
    ]
  },
  {
    name: "Executive",
    monthlyPrice: "6.66",
    annualPrice: "2159.89",
    annualMonthlyEquivalent: "199.99",
    tag: "Best annual value",
    description:
      "Priority access for operators who want the highest-signal workflow and earliest feature drops.",
    features: [
      "Everything in Premium",
      "AI bet recommendations and AI smart parlay builder",
      "Time-to-decay meter",
      "Historical odds",
      "Predictive line movement signals",
      "AI confidence score per bet",
      "Private Executive leaderboard",
      "Priority Founders Circle feature previews",
      "Executive-only opportunities and more"
    ]
  }
];
