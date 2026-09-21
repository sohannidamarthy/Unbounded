import { useState } from "react";
import {
  ArbField,
  ArbInput,
  calculateArbitrage,
  formatAmerican,
  formatUsd,
} from "../../lib/calculators";
import OddsField from "./OddsField";
import styles from "./HomeCalculator.module.css";

const EMPTY: ArbInput = { a1: "", b1: "", a2: "", b2: "", stake: "" };

export default function ArbitrageForm() {
  const [values, setValues] = useState<ArbInput>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: ArbField) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Derived from the current inputs so results can never go stale after an edit.
  const outcome = submitted ? calculateArbitrage(values) : null;
  const errors = outcome && !outcome.ok ? outcome.errors : {};
  const result = outcome && outcome.ok ? outcome.result : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <h3 className={styles.formTitle}>Arbitrage Calculator</h3>
      <p className={styles.formSubtitle}>Enter the odds from two different sportsbooks for both outcomes.</p>

      <div className={styles.grid}>
        <OddsField
          id="arb-a1"
          label="Book 1 – Team A Odds"
          hint="(e.g. +110, 1.90)"
          placeholder="Enter odds"
          value={values.a1}
          onChange={setField("a1")}
          error={errors.a1}
          required
        />
        <OddsField
          id="arb-b1"
          label="Book 1 – Team B Odds"
          hint="(e.g. -110, 1.91)"
          placeholder="Enter odds"
          value={values.b1}
          onChange={setField("b1")}
          error={errors.b1}
          required
        />
        <OddsField
          id="arb-a2"
          label="Book 2 – Team A Odds"
          hint="(e.g. +120, 2.10)"
          placeholder="Enter odds"
          value={values.a2}
          onChange={setField("a2")}
          error={errors.a2}
          required
        />
        <OddsField
          id="arb-b2"
          label="Book 2 – Team B Odds"
          hint="(e.g. -120, 1.83)"
          placeholder="Enter odds"
          value={values.b2}
          onChange={setField("b2")}
          error={errors.b2}
          required
        />
      </div>

      <div className={styles.fullRow}>
        <OddsField
          id="arb-stake"
          label="Total stake"
          hint="(total amount to split across both bets)"
          placeholder="Enter stake amount"
          value={values.stake}
          onChange={setField("stake")}
          error={errors.stake}
          inputMode="decimal"
          required
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn}>
          Calculate Arbitrage
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={() => {
            setValues(EMPTY);
            setSubmitted(false);
          }}
        >
          Reset
        </button>
      </div>

      <div aria-live="polite">
        {!result && <p className={styles.helper}>Enter all 4 odds and a stake to see arbitrage results.</p>}
        {result && (
          <div className={styles.results}>
            <div className={`${styles.verdict} ${result.hasArbitrage ? styles.good : styles.bad}`}>
              {result.hasArbitrage
                ? `Arbitrage found: ${formatUsd(result.guaranteedProfit)} guaranteed profit (${result.roiPct.toFixed(2)}% ROI)`
                : `No arbitrage: the best prices leave a ${result.marginPct.toFixed(2)}% margin for the books`}
            </div>
            <div className={styles.resultRow}>
              <span>
                Team A: bet at Book {result.sideA.book} ({formatAmerican(result.sideA.odds.american)} /{" "}
                {result.sideA.odds.decimal.toFixed(2)})
              </span>
              <strong>{formatUsd(result.sideA.stake)}</strong>
            </div>
            <div className={styles.resultRow}>
              <span>
                Team B: bet at Book {result.sideB.book} ({formatAmerican(result.sideB.odds.american)} /{" "}
                {result.sideB.odds.decimal.toFixed(2)})
              </span>
              <strong>{formatUsd(result.sideB.stake)}</strong>
            </div>
            <div className={styles.resultRow}>
              <span>Total stake</span>
              <strong>{formatUsd(result.totalStake)}</strong>
            </div>
            <div className={styles.resultRow}>
              <span>Payout either way</span>
              <strong>{formatUsd(result.guaranteedPayout)}</strong>
            </div>
            <div className={styles.resultRow}>
              <span>{result.hasArbitrage ? "Guaranteed profit" : "Result either way"}</span>
              <strong className={result.hasArbitrage ? styles.goodText : styles.badText}>
                {formatUsd(result.guaranteedProfit)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
