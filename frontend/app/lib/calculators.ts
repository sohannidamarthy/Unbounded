export const MAX_STAKE = 1_000_000_000;

export type ParsedOdds = { decimal: number; american: number };
export type OddsParseResult =
  | { ok: true; odds: ParsedOdds }
  | { ok: false; error: string };

const NUMBER_PATTERN = /^[+-]?\d+(\.\d+)?$/;

export const americanToDecimal = (american: number) =>
  american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american);

export const decimalToAmerican = (decimal: number) =>
  decimal >= 2 ? Math.round((decimal - 1) * 100) : Math.round(-100 / (decimal - 1));

export const formatAmerican = (american: number) =>
  american > 0 ? `+${american}` : `${american}`;

/**
 * Accepts American (+110, -120, 110) or decimal (1.90, 2) odds.
 * A leading sign or an integer >= 100 means American; anything else is decimal.
 */
export function parseOdds(raw: string): OddsParseResult {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Enter odds." };
  if (!NUMBER_PATTERN.test(text)) {
    return { ok: false, error: "Use American (+110) or decimal (1.90) odds." };
  }

  const value = Number(text);
  const hasSign = text.startsWith("+") || text.startsWith("-");
  const isInteger = !text.includes(".");

  if (hasSign || (isInteger && Math.abs(value) >= 100)) {
    if (!isInteger || Math.abs(value) < 100) {
      return { ok: false, error: "American odds must be a whole number of 100 or more, like +110 or -120." };
    }
    return { ok: true, odds: { american: value, decimal: americanToDecimal(value) } };
  }

  if (value <= 1) {
    return { ok: false, error: "Decimal odds must be greater than 1.00." };
  }
  return { ok: true, odds: { decimal: value, american: decimalToAmerican(value) } };
}

export function parseStake(raw: string): { ok: true; stake: number } | { ok: false; error: string } {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Enter a stake." };
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0) return { ok: false, error: "Stake must be greater than 0." };
  if (value > MAX_STAKE) return { ok: false, error: "Stake is too large." };
  return { ok: true, stake: value };
}

/* ---------------- Arbitrage ---------------- */

export const ARB_FIELDS = ["a1", "b1", "a2", "b2", "stake"] as const;
export type ArbField = (typeof ARB_FIELDS)[number];
export type ArbInput = Record<ArbField, string>;
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type ArbitrageResult = {
  hasArbitrage: boolean;
  /** Sum of implied probabilities of the best price on each side. < 1 means arbitrage. */
  impliedTotal: number;
  /** Positive = margin the books keep (no arb); negative = arbitrage edge. */
  marginPct: number;
  sideA: { book: 1 | 2; odds: ParsedOdds; stake: number };
  sideB: { book: 1 | 2; odds: ParsedOdds; stake: number };
  totalStake: number;
  guaranteedPayout: number;
  guaranteedProfit: number;
  roiPct: number;
};

export type ArbitrageOutcome =
  | { ok: true; result: ArbitrageResult }
  | { ok: false; errors: FieldErrors<ArbField> };

/** Stake is the total amount split across the best available price for each team. */
export function calculateArbitrage(input: ArbInput): ArbitrageOutcome {
  const errors: FieldErrors<ArbField> = {};
  const parsed: Partial<Record<"a1" | "b1" | "a2" | "b2", ParsedOdds>> = {};

  for (const key of ["a1", "b1", "a2", "b2"] as const) {
    const r = parseOdds(input[key]);
    if (r.ok) parsed[key] = r.odds;
    else errors[key] = r.error;
  }
  const stakeResult = parseStake(input.stake);
  if (!stakeResult.ok) errors.stake = stakeResult.error;

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const { a1, b1, a2, b2 } = parsed as Record<"a1" | "b1" | "a2" | "b2", ParsedOdds>;
  const stake = (stakeResult as { ok: true; stake: number }).stake;

  const bestA = a1.decimal >= a2.decimal ? { book: 1 as const, odds: a1 } : { book: 2 as const, odds: a2 };
  const bestB = b1.decimal >= b2.decimal ? { book: 1 as const, odds: b1 } : { book: 2 as const, odds: b2 };

  const impliedA = 1 / bestA.odds.decimal;
  const impliedB = 1 / bestB.odds.decimal;
  const impliedTotal = impliedA + impliedB;
  const stakeA = (stake * impliedA) / impliedTotal;
  const stakeB = stake - stakeA;
  const guaranteedPayout = stakeA * bestA.odds.decimal;
  const guaranteedProfit = guaranteedPayout - stake;

  return {
    ok: true,
    result: {
      hasArbitrage: impliedTotal < 1,
      impliedTotal,
      marginPct: (impliedTotal - 1) * 100,
      sideA: { ...bestA, stake: stakeA },
      sideB: { ...bestB, stake: stakeB },
      totalStake: stake,
      guaranteedPayout,
      guaranteedProfit,
      roiPct: (guaranteedProfit / stake) * 100,
    },
  };
}

/* ---------------- Positive EV ---------------- */

export const EV_FIELDS = ["a", "b", "stake"] as const;
export type EvField = (typeof EV_FIELDS)[number];
export type EvInput = Record<EvField, string>;

export type EvSide = {
  odds: ParsedOdds;
  impliedProb: number;
  /** Win probability used for EV (no-vig fair probability unless overridden). */
  winProb: number;
  profitIfWin: number;
  ev: number;
  evPct: number;
  isPositive: boolean;
};

export type EvResult = {
  sideA: EvSide;
  sideB: EvSide;
  stake: number;
  /** Bookmaker margin baked into the two prices, in percent. */
  vigPct: number;
};

export type EvOutcome =
  | { ok: true; result: EvResult }
  | { ok: false; errors: FieldErrors<EvField> };

const evSide = (odds: ParsedOdds, winProb: number, stake: number): EvSide => {
  const profitIfWin = stake * (odds.decimal - 1);
  const ev = winProb * profitIfWin - (1 - winProb) * stake;
  return {
    odds,
    impliedProb: 1 / odds.decimal,
    winProb,
    profitIfWin,
    ev,
    evPct: (ev / stake) * 100,
    isPositive: ev > 1e-9,
  };
};

/**
 * EV = P(win) * profit - P(lose) * stake, for each side.
 * Without an explicit probability, P(win) is the no-vig fair probability
 * derived from the two prices. `probA` (0-1) overrides Team A's chance, and
 * Team B gets the complement.
 */
export function calculateEV(input: EvInput, probA?: number): EvOutcome {
  const errors: FieldErrors<EvField> = {};
  const a = parseOdds(input.a);
  const b = parseOdds(input.b);
  const s = parseStake(input.stake);
  if (!a.ok) errors.a = a.error;
  if (!b.ok) errors.b = b.error;
  if (!s.ok) errors.stake = s.error;
  if (!a.ok || !b.ok || !s.ok) return { ok: false, errors };

  const impliedA = 1 / a.odds.decimal;
  const impliedB = 1 / b.odds.decimal;
  const total = impliedA + impliedB;
  const winA = probA ?? impliedA / total;

  return {
    ok: true,
    result: {
      sideA: evSide(a.odds, winA, s.stake),
      sideB: evSide(b.odds, 1 - winA, s.stake),
      stake: s.stake,
      vigPct: (total - 1) * 100,
    },
  };
}

export const formatUsd = (value: number) => {
  const cents = Math.round(value * 100);
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
