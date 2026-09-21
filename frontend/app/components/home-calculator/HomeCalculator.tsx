"use client";

import { useState } from "react";
import Container from "../container/Container";
import ArbitrageForm from "./ArbitrageForm";
import EvForm from "./EvForm";
import CalculatorInfoPanel, { CalculatorMode } from "./CalculatorInfoPanel";
import styles from "./HomeCalculator.module.css";

const TABS: { id: CalculatorMode; label: string }[] = [
  { id: "arb", label: "Arbitrage" },
  { id: "ev", label: "EV" },
];

export default function HomeCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("arb");

  return (
    <Container sectionClassName=" calculator-hero">
      <div className={styles.head}>
        <span className={styles.accent} aria-hidden="true" />
        <h2 className={styles.title}>
          Calculate <em>arbitrage</em> and <em>EV</em> directly
        </h2>
        <p className={styles.lead}>
          Enter the odds from the available sportsbooks and find if there&apos;s a risk-free profit (arbitrage) or a
          positive expected value (EV).
        </p>
      </div>

      <div className={styles.layout}>
        <div className={styles.card}>
          <div className={styles.tabs} role="tablist" aria-label="Calculator type">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`calc-tab-${tab.id}`}
                aria-selected={mode === tab.id}
                aria-controls={`calc-panel-${tab.id}`}
                className={`${styles.tab} ${mode === tab.id ? styles.tabActive : ""}`}
                onClick={() => setMode(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <hr className={styles.divider} />

          {/* Both forms stay mounted so switching tabs keeps what was typed. */}
          <div role="tabpanel" id="calc-panel-arb" aria-labelledby="calc-tab-arb" hidden={mode !== "arb"}>
            <ArbitrageForm />
          </div>
          <div role="tabpanel" id="calc-panel-ev" aria-labelledby="calc-tab-ev" hidden={mode !== "ev"}>
            <EvForm />
          </div>
        </div>

        <CalculatorInfoPanel mode={mode} />
      </div>
    </Container>
  );
}
