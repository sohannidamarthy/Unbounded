"use client";

import { useEffect, useState } from "react";

import { DashboardHeader } from "./DashboardHeader";
import { DraggableBetCalculatorPopup } from "./DraggableBetCalculatorPopup";
import { LeaderboardHub } from "./LeaderboardHub";

export function LeaderboardHubPage() {
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<"arb" | "ev">("arb");

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
        onClose={() => setIsBetCalculatorOpen(false)}
        onModeChange={setBetCalculatorMode}
      />
    </div>
  );
}
