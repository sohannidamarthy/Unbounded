"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DraggableBetCalculatorPopup } from "./DraggableBetCalculatorPopup";

type DashboardShellProps = {
  /** Extra class appended to the root, e.g. an arb/ev theme class. */
  variant?: string;
  children: React.ReactNode;
};

/**
 * Shared chrome for in-dashboard account pages (Settings, Daily Bets,
 * Withdrawals, etc). Provides the dashboard header and bet calculator, and
 * intentionally renders no marketing footer.
 */
export function DashboardShell({ variant = "", children }: DashboardShellProps) {
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<"arb" | "ev">("arb");
  const [betCalculatorStake, setBetCalculatorStake] = useState("100");
  const [betCalculatorOddsA, setBetCalculatorOddsA] = useState("");
  const [betCalculatorOddsB, setBetCalculatorOddsB] = useState("");

  return (
    <div className={`site dashboard-page ${variant}`.trim()}>
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />
      <main className="dashboard-main">{children}</main>
      <DraggableBetCalculatorPopup
        isOpen={isBetCalculatorOpen}
        mode={betCalculatorMode}
        stake={betCalculatorStake}
        oddsA={betCalculatorOddsA}
        oddsB={betCalculatorOddsB}
        onClose={() => setIsBetCalculatorOpen(false)}
        onModeChange={setBetCalculatorMode}
        onStakeChange={setBetCalculatorStake}
        onOddsAChange={setBetCalculatorOddsA}
        onOddsBChange={setBetCalculatorOddsB}
      />
    </div>
  );
}
