import { useState } from "react";
import { calculateEV, EvField, EvInput, EvSide, formatAmerican, formatUsd } from "../../lib/calculators";
import OddsField from "./OddsField";
import styles from "./HomeCalculator.module.css";

const EMPTY: EvInput = { a: "", b: "", stake: "" };

function SideRow({ name, side }: { name: string; side: EvSide }) {
  return (
    <div className={styles.evSide}>
      <div className={styles.resultRow}>
        <span>
          {name} ({formatAmerican(side.odds.american)} / {side.odds.decimal.toFixed(2)}) &middot; win chance{" "}
          {(side.winProb * 100).toFixed(1)}%
        </span>
        <strong className={side.isPositive ? styles.goodText : styles.badText}>
          {side.ev >= 0 ? "+" : ""}
          {formatUsd(side.ev)} ({side.evPct.toFixed(2)}%)
        </strong>
      </div>
      <div className={styles.evNote}>
        {side.isPositive ? "Positive EV" : "Not positive EV"} &middot; profit if it wins {formatUsd(side.profitIfWin)}
      </div>
    </div>
  );
}

export default function EvForm() {
  const [values, setValues] = useState<EvInput>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const setField = (key: EvField) => (value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const outcome = submitted ? calculateEV(values) : null;
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
      <h3 className={styles.formTitle}>EV Calculator</h3>
      <p className={styles.formSubtitle}>
        Enter the odds from one sportsbook for each outcome (one book &times; two outcomes).
      </p>

      <div className={styles.grid}>
        <OddsField
          id="ev-a"
          label="Team A Odds"
          hint="(e.g. +110, 1.90)"
          placeholder="Enter odds"
          value={values.a}
          onChange={setField("a")}
          error={errors.a}
          caps
        />
        <OddsField
          id="ev-b"
          label="Team B Odds"
          hint="(e.g. -110, 1.91)"
          placeholder="Enter odds"
          value={values.b}
          onChange={setField("b")}
          error={errors.b}
          caps
        />
      </div>

      <div className={styles.fullRow}>
        <OddsField
          id="ev-stake"
          label="Stake"
          placeholder="Enter stake amount"
          value={values.stake}
          onChange={setField("stake")}
          error={errors.stake}
          inputMode="decimal"
          caps
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryBtn}>
          Calculate EV
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
        {!result && <p className={styles.helper}>Enter valid odds and stake to see results.</p>}
        {result && (
          <div className={styles.results}>
            <SideRow name="Team A" side={result.sideA} />
            <SideRow name="Team B" side={result.sideB} />
            <div className={styles.resultRow}>
              <span>Bookmaker margin in these prices</span>
              <strong>{result.vigPct.toFixed(2)}%</strong>
            </div>
            <p className={styles.evNote}>
              Win chances are the no-vig fair probabilities implied by the two prices.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
