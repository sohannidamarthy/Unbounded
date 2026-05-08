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
    monthlyPrice: "1.99",
    annualPrice: "21.49",
    annualMonthlyEquivalent: "1.79",
    tag: "Tier one",
    description: "Core access for testing the workflow and getting started.",
    features: [
      "Limited market views",
      "Basic tutorials and guides",
      "Starter tracking workflow"
    ]
  },
  {
    name: "Premium",
    monthlyPrice: "13.99",
    annualPrice: "151.09",
    annualMonthlyEquivalent: "12.59",
    tag: "Most popular",
    description: "Full access for active bettors who want faster signals.",
    features: [
      "Live arbitrage and EV boards",
      "Profit tracker access",
      "AI-assisted signal filters"
    ]
  },
  {
    name: "Executive",
    monthlyPrice: "25.99",
    annualPrice: "280.69",
    annualMonthlyEquivalent: "23.39",
    tag: "Best annual value",
    description: "Priority workflow access for heavier operators and teams.",
    features: [
      "Priority line updates",
      "Advanced recap highlights",
      "Team-ready workflow support"
    ]
  }
];
