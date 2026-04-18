"use client";

import { useEffect, useState } from "react";

import { DashboardHeader } from "./DashboardHeader";
import { DraggableBetCalculatorPopup } from "./DraggableBetCalculatorPopup";
import { LeaderboardHub } from "./LeaderboardHub";

export function LeaderboardHubPage() {
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<"arb" | "ev">("arb");
  const [betCalculatorStake, setBetCalculatorStake] = useState("100");
  const [betCalculatorOddsA, setBetCalculatorOddsA] = useState("");
  const [betCalculatorOddsB, setBetCalculatorOddsB] = useState("");

  useEffect(() => {
    if (window.location.hash === "#bet-calculator") {
      setIsBetCalculatorOpen(true);
    }
  }, []);

  return (
    <div className="site dashboard-page leaderboard-page">
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />

      <main className="leaderboard-page-main">
        <div className="leaderboard-page-shell">
          <LeaderboardHub standalone />
        </div>
      </main>

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
