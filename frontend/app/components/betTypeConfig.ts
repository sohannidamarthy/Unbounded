export const BET_TYPE_OPTIONS = [
  { value: "moneyline", label: "Moneyline" },
  { value: "spread", label: "Spread" },
  { value: "total", label: "Total" },
  { value: "alt-line", label: "Alt line" },
  { value: "player-prop", label: "Player prop" },
] as const;

export type BetType = (typeof BET_TYPE_OPTIONS)[number]["value"];

export const BET_TYPE_LABELS: Record<BetType, string> = BET_TYPE_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.label;
    return accumulator;
  },
  {} as Record<BetType, string>
);

export const ALL_BET_TYPES = BET_TYPE_OPTIONS.map((option) => option.value) as BetType[];
