import styles from "./HomeCalculator.module.css";

export type CalculatorMode = "arb" | "ev";

const PANEL_CONTENT = {
  arb: {
    title: "How arbitrage works",
    description:
      "Arbitrage happens when two sportsbooks price the same event differently enough that betting both sides locks in a profit, no matter which outcome wins.",
    keyPoints: [
      "You need 4 odds (2 books × 2 outcomes) plus your total stake.",
      "The calculator takes the best price for Team A and the best price for Team B, even if they come from different books.",
      "It's an arbitrage when the two implied probabilities add up to less than 100%.",
      "Your stake is split so the payout is the same whichever team wins.",
    ],
    example:
      "Book 1 has Team A at +120 and Team B at -140. Book 2 has Team A at -130 and Team B at +105. The best prices are Team A +120 (Book 1) and Team B +105 (Book 2). With a $100 stake, bet $48.24 on Team A and $51.76 on Team B. Either team wins and you're paid $106.12, a guaranteed $6.12 profit (6.12% ROI).",
  },
  ev: {
    title: "How EV works",
    description:
      "Expected value (EV) is what a bet is worth on average over many repeats. A positive EV means you'd expect to profit in the long run; a negative EV means you'd expect to lose.",
    keyPoints: [
      "You only need 1 sportsbook: its odds for both outcomes, plus your stake.",
      "The calculator removes the sportsbook's margin (the vig) to estimate each side's fair win probability.",
      "EV = (win chance × profit if it wins) − (loss chance × stake).",
      "With a single book's own prices, EV is at or below zero by design. It shows what the margin costs you, not a hidden edge.",
    ],
    example:
      "A book offers Team A at +150 and Team B at -170. Those prices carry a 2.96% margin, so the fair win chances are 38.8% for Team A and 61.2% for Team B. A $100 bet on Team A has an EV of -$2.88 (-2.88%), so it's not a positive EV bet.",
  },
} as const;

const ScalesIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v18M8 21h8M5 7h14" />
    <path d="M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7zM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7z" />
  </svg>
);

const TrendIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M5 17v-4M10 17v-6M15 17v-3M20 17V9" />
    <path d="M4 10l5-5 4 3 6-5M15 3h4v4" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0b2239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function CalculatorInfoPanel({ mode }: { mode: CalculatorMode }) {
  const content = PANEL_CONTENT[mode];
  return (
    <aside className={styles.card} aria-labelledby="calc-info-title">
      <div className={styles.infoHead}>
        <span className={styles.infoIcon}>{mode === "arb" ? <ScalesIcon /> : <TrendIcon />}</span>
        <div>
          <h3 id="calc-info-title" className={styles.infoTitle}>
            {content.title}
          </h3>
          <p className={styles.infoText}>{content.description}</p>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h4>Key points</h4>
        <ul className={styles.keyPoints}>
          {content.keyPoints.map((point) => (
            <li key={point}>
              <span className={styles.check}>
                <CheckIcon />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.infoBox}>
        <h4>Worked example</h4>
        <p className={styles.infoText}>{content.example}</p>
      </div>
    </aside>
  );
}
