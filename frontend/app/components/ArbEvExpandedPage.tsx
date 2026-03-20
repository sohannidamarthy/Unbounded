"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardHeader } from "./DashboardHeader";
import { DraggableBetCalculatorPopup } from "./DraggableBetCalculatorPopup";

type ArbEvView = "arb" | "ev";

type ArbEvExpandedPageProps = {
  initialView: ArbEvView;
};

type EventPopout = {
  id: string;
  board: "Arbitrage" | "EV";
  start: string;
  sport: string;
  league: string;
  match: string;
  teamA: string;
  teamB: string;
  oddsA: string;
  oddsB: string;
};

const arbTableRows = [
  {
    start: "12:00 AM CT",
    sport: "Basketball",
    league: "NBA",
    match: "Pacers (+110) vs. Lakers (-110)",
  },
  {
    start: "1:30 AM CT",
    sport: "Basketball",
    league: "NBA",
    match: "Heat (+145) vs. Celtics (-160)",
  },
  {
    start: "3:15 PM CT",
    sport: "Football",
    league: "NFL",
    match: "Wolves (+120) vs. Reapers (-130)",
  },
  {
    start: "6:10 PM CT",
    sport: "Baseball",
    league: "MLB",
    match: "Dodgers (-105) vs. Mets (+102)",
  },
  {
    start: "7:45 PM CT",
    sport: "Soccer",
    league: "MLS",
    match: "Harbor FC (+180) vs. Northbridge (-190)",
  },
] as const;

export function ArbEvExpandedPage({ initialView }: ArbEvExpandedPageProps) {
  const router = useRouter();
  const [arbEvView, setArbEvView] = useState<ArbEvView>(initialView);
  const [arbWays, setArbWays] = useState("2-way");
  const [favoriteArb, setFavoriteArb] = useState("No");
  const [evIncludeLimits, setEvIncludeLimits] = useState("On");
  const [evType, setEvType] = useState("+EV");
  const [favoriteEv, setFavoriteEv] = useState("No");
  const [arbTabProfitTracker, setArbTabProfitTracker] = useState(false);
  const [evTabProfitTracker, setEvTabProfitTracker] = useState(false);
  const [eventPopout, setEventPopout] = useState<EventPopout | null>(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [manualOddsA, setManualOddsA] = useState("");
  const [manualOddsB, setManualOddsB] = useState("");
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<ArbEvView>(initialView);
  const [betCalculatorStake, setBetCalculatorStake] = useState("100");
  const [betCalculatorOddsA, setBetCalculatorOddsA] = useState("");
  const [betCalculatorOddsB, setBetCalculatorOddsB] = useState("");

  useEffect(() => {
    setArbEvView(initialView);
    setBetCalculatorMode(initialView);
  }, [initialView]);

  useEffect(() => {
    if (window.location.hash === "#bet-calculator") {
      setIsBetCalculatorOpen(true);
    }
  }, []);

  const parseMatchup = (match: string, fallbackOdds?: string) => {
    const explicitOddsMatch = match.match(
      /^\s*(.+?)\s*\(([-+]\d+)\)\s+vs\.?\s+(.+?)\s*\(([-+]\d+)\)\s*$/i
    );

    if (explicitOddsMatch) {
      return {
        teamA: explicitOddsMatch[1].trim(),
        oddsA: explicitOddsMatch[2],
        teamB: explicitOddsMatch[3].trim(),
        oddsB: explicitOddsMatch[4],
      };
    }

    const splitMatch = match.split(/\s+vs\.?\s+/i);
    if (splitMatch.length === 2) {
      return {
        teamA: splitMatch[0].trim(),
        oddsA: fallbackOdds ?? "--",
        teamB: splitMatch[1].trim(),
        oddsB: "--",
      };
    }

    return {
      teamA: match,
      oddsA: fallbackOdds ?? "--",
      teamB: "Opponent",
      oddsB: "--",
    };
  };

  const buildEventPopout = ({
    id,
    board,
    start,
    sport,
    league,
    match,
  }: {
    id: string;
    board: "Arbitrage" | "EV";
    start: string;
    sport: string;
    league: string;
    match: string;
  }): EventPopout => {
    const parsed = parseMatchup(match);
    return {
      id,
      board,
      start,
      sport,
      league,
      match,
      teamA: parsed.teamA,
      teamB: parsed.teamB,
      oddsA: parsed.oddsA,
      oddsB: parsed.oddsB,
    };
  };

  const toDecimalOdds = (americanOdds: string) => {
    const value = Number(americanOdds);
    if (Number.isNaN(value) || value === 0) {
      return null;
    }
    return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
  };

  const openEventPopout = (event: EventPopout) => {
    setEventPopout(event);
    setManualEntryMode(false);
    setManualOddsA(event.oddsA);
    setManualOddsB(event.oddsB);
  };

  const activeOddsA = manualEntryMode ? manualOddsA : eventPopout?.oddsA ?? "";
  const activeOddsB = manualEntryMode ? manualOddsB : eventPopout?.oddsB ?? "";
  const calculatedNetProfit = (() => {
    if (!eventPopout) {
      return "0.00";
    }

    const betValue = 25;
    const decimalA = toDecimalOdds(activeOddsA);
    const decimalB = toDecimalOdds(activeOddsB);

    if (betValue <= 0) {
      return "0.00";
    }

    if (decimalA && decimalB) {
      const stakeA = (betValue * decimalB) / (decimalA + decimalB);
      const payout = stakeA * decimalA;
      return (payout - betValue).toFixed(2);
    }

    if (decimalA) {
      return (betValue * (decimalA - 1)).toFixed(2);
    }

    return "0.00";
  })();

  const renderEventDropdown = (rowId: string) => {
    if (!eventPopout || eventPopout.id !== rowId) {
      return null;
    }

    return (
      <div className="dashboard-event-dropdown-row">
        <aside className="dashboard-event-popout" aria-label="Selected event">
          <div className="dashboard-event-popout-head">
            <div>
              <span>{eventPopout.board}</span>
              <strong>{eventPopout.match}</strong>
            </div>
            <button
              type="button"
              aria-label="Close selected event"
              onClick={() => setEventPopout(null)}
            >
              ×
            </button>
          </div>
          <div className="dashboard-event-popout-league-row">
            <div>
              <span>League</span>
              <strong>{eventPopout.league}</strong>
            </div>
            <div className="dashboard-event-popout-net-profit">
              <span>Total net profit</span>
              <strong>${calculatedNetProfit}</strong>
            </div>
          </div>
          <div className="dashboard-event-popout-market">
            <div className="dashboard-event-popout-market-row">
              <span>{eventPopout.teamA}</span>
              {manualEntryMode ? (
                <input
                  value={manualOddsA}
                  onChange={(event) => setManualOddsA(event.target.value)}
                  aria-label={`${eventPopout.teamA} odds`}
                />
              ) : (
                <strong>{eventPopout.oddsA}</strong>
              )}
            </div>
            <div className="dashboard-event-popout-market-row">
              <span>{eventPopout.teamB}</span>
              {manualEntryMode ? (
                <input
                  value={manualOddsB}
                  onChange={(event) => setManualOddsB(event.target.value)}
                  aria-label={`${eventPopout.teamB} odds`}
                />
              ) : (
                <strong>{eventPopout.oddsB}</strong>
              )}
            </div>
          </div>
          <div className="dashboard-event-popout-grid">
            <div>
              <span>Start</span>
              <strong>{eventPopout.start}</strong>
            </div>
            <div>
              <span>Sport</span>
              <strong>{eventPopout.sport}</strong>
            </div>
          </div>
          <div className="dashboard-event-popout-actions">
            <button
              type="button"
              className="dashboard-event-popout-btn"
              onClick={() => setManualEntryMode(true)}
            >
              Manual entry
            </button>
            <button
              type="button"
              className="dashboard-event-popout-btn dashboard-event-popout-btn--primary"
              onClick={() => setManualEntryMode(false)}
            >
              Enter bet
            </button>
          </div>
        </aside>
      </div>
    );
  };

  const navigateToView = (view: ArbEvView) => {
    if (view === arbEvView) {
      return;
    }

    setArbEvView(view);
    router.push(view === "arb" ? "/arbitrage-bets" : "/ev-bets");
  };

  const isCurrentTabTracked =
    arbEvView === "arb" ? arbTabProfitTracker : evTabProfitTracker;

  return (
    <div className="site dashboard-page arb-ev-page">
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />

      <main className="arb-ev-page-main">
        <div className="arb-ev-page-shell">
          <section
            className={`${
              arbEvView === "arb" ? "dashboard-arb" : "dashboard-ev"
            } arb-ev-page-panel`}
            aria-label={arbEvView === "arb" ? "Arbitrage bets per day" : "EV bets per day"}
          >
            <div
              className={
                arbEvView === "arb" ? "dashboard-arb-header" : "dashboard-ev-header"
              }
            >
              <div>
                <div className="dashboard-arb-ev-switch">
                  <div className="dashboard-arb-toggle-group">
                    <button
                      type="button"
                      className={`dashboard-arb-toggle${
                        arbEvView === "arb" ? " is-active" : " is-off"
                      }`}
                      onClick={() => navigateToView("arb")}
                    >
                      Arb
                    </button>
                    <button
                      type="button"
                      className={`dashboard-arb-toggle${
                        arbEvView === "ev" ? " is-active" : " is-off"
                      }`}
                      onClick={() => navigateToView("ev")}
                    >
                      EV
                    </button>
                  </div>
                </div>
                <h3>
                  {arbEvView === "arb"
                    ? "Arbitrage bets per day"
                    : "EV bets per day"}
                </h3>
                <p>
                  {arbEvView === "arb"
                    ? "Track your daily arbitrage bets and settings."
                    : "Track your daily EV bets and settings."}
                </p>
              </div>
              <div
                className={
                  arbEvView === "arb"
                    ? "dashboard-arb-controls"
                    : "dashboard-ev-controls"
                }
              >
                <label
                  className={
                    arbEvView === "arb" ? "dashboard-arb-field" : "dashboard-ev-field"
                  }
                >
                  <span>Date</span>
                  <input type="date" />
                </label>
                <label
                  className={
                    arbEvView === "arb" ? "dashboard-arb-field" : "dashboard-ev-field"
                  }
                >
                  <span>Sport</span>
                  <select defaultValue="All sports">
                    <option>All sports</option>
                    <option>Basketball</option>
                    <option>Football</option>
                    <option>Baseball</option>
                    <option>Soccer</option>
                  </select>
                </label>
                <label
                  className={
                    arbEvView === "arb" ? "dashboard-arb-field" : "dashboard-ev-field"
                  }
                >
                  <span>Books</span>
                  <select defaultValue="All books">
                    <option>All books</option>
                    <option>Primebook</option>
                    <option>Skyline</option>
                    <option>Jetline</option>
                    <option>Northstar</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              className="dashboard-panel-tracker-toggle dashboard-panel-tracker-toggle--corner"
              style={{ position: "absolute", top: 10, right: 20, zIndex: 3 }}
            >
              <span>Add to Profit Tracker</span>
              <button
                type="button"
                className={`dashboard-event-toggle${
                  isCurrentTabTracked ? " is-on" : " is-off"
                }`}
                aria-pressed={isCurrentTabTracked}
                onClick={() => {
                  if (arbEvView === "arb") {
                    setArbTabProfitTracker((prev) => !prev);
                  } else {
                    setEvTabProfitTracker((prev) => !prev);
                  }
                }}
              >
                <span className="dashboard-event-toggle-knob" aria-hidden="true" />
              </button>
            </div>

            <div
              className="dashboard-arb-table is-expanded"
              role="table"
              aria-label={
                arbEvView === "arb" ? "Arbitrage betting board" : "EV betting board"
              }
            >
              <div className="dashboard-arb-row dashboard-arb-row--header" role="row">
                <span role="columnheader">Match starts</span>
                <span role="columnheader">Sport</span>
                <span role="columnheader">League</span>
                <span role="columnheader">Match</span>
              </div>
              {arbTableRows.map((row) => {
                const rowId = `${arbEvView}-${row.start}-${row.match}`;
                return (
                  <Fragment key={rowId}>
                    <div
                      className={`dashboard-arb-row${
                        eventPopout?.id === rowId ? " is-selected" : ""
                      }`}
                      role="row"
                      onClick={() =>
                        openEventPopout(
                          buildEventPopout({
                            id: rowId,
                            board: arbEvView === "arb" ? "Arbitrage" : "EV",
                            start: row.start,
                            sport: row.sport,
                            league: row.league,
                            match: row.match,
                          })
                        )
                      }
                    >
                      <span className="dashboard-arb-cell dashboard-arb-cell--time">
                        {row.start}
                      </span>
                      <span className="dashboard-arb-cell">{row.sport}</span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--league">
                        {row.league}
                      </span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--match">
                        {row.match}
                      </span>
                    </div>
                    {renderEventDropdown(rowId)}
                  </Fragment>
                );
              })}
            </div>

            {arbEvView === "arb" ? (
              <div
                className="dashboard-arb-options"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="dashboard-arb-body">
                  <div className="dashboard-arb-left">
                    <div className="dashboard-arb-limit">
                      <span>Include bet limits</span>
                      <div className="dashboard-arb-toggle-group">
                        <button type="button" className="dashboard-arb-toggle is-active">
                          On
                        </button>
                        <button type="button" className="dashboard-arb-toggle is-off">
                          Off
                        </button>
                      </div>
                    </div>
                    <div className="dashboard-arb-metric">
                      <span>Arb ways</span>
                      <div className="dashboard-arb-ways">
                        <button
                          type="button"
                          className={`dashboard-arb-way${arbWays === "2-way" ? " is-active" : ""}`}
                          onClick={() => setArbWays("2-way")}
                        >
                          2-way
                        </button>
                        <button
                          type="button"
                          className={`dashboard-arb-way${arbWays === "3-way" ? " is-active" : ""}`}
                          onClick={() => setArbWays("3-way")}
                        >
                          3-way
                        </button>
                        <button
                          type="button"
                          className={`dashboard-arb-way${arbWays === "4-way" ? " is-active" : ""}`}
                          onClick={() => setArbWays("4-way")}
                        >
                          4-way
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-arb-right">
                    <div className="dashboard-arb-preference">
                      <div>
                        <span>Favorite arb technique</span>
                        <p>Use my preferred books + sport stacks.</p>
                      </div>
                      <div className="dashboard-arb-actions">
                        <button
                          type="button"
                          className={`dashboard-arb-toggle${
                            favoriteArb === "Yes" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setFavoriteArb("Yes")}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`dashboard-arb-toggle${
                            favoriteArb === "No" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setFavoriteArb("No")}
                        >
                          No
                        </button>
                        <button type="button" className="dashboard-arb-link">
                          Change settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="dashboard-ev-options"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="dashboard-ev-body">
                  <div className="dashboard-ev-left">
                    <div className="dashboard-ev-limit">
                      <span>Include bet limits</span>
                      <div className="dashboard-ev-toggle-group">
                        <button
                          type="button"
                          className={`dashboard-ev-toggle${
                            evIncludeLimits === "On" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setEvIncludeLimits("On")}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          className={`dashboard-ev-toggle${
                            evIncludeLimits === "Off" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setEvIncludeLimits("Off")}
                        >
                          Off
                        </button>
                      </div>
                    </div>
                    <div className="dashboard-ev-metric">
                      <span>EV types</span>
                      <div className="dashboard-ev-ways">
                        <button
                          type="button"
                          className={`dashboard-ev-way${evType === "+EV" ? " is-active" : ""}`}
                          onClick={() => setEvType("+EV")}
                        >
                          +EV
                        </button>
                        <button
                          type="button"
                          className={`dashboard-ev-way${
                            evType === "Boosted" ? " is-active" : ""
                          }`}
                          onClick={() => setEvType("Boosted")}
                        >
                          Boosted
                        </button>
                        <button
                          type="button"
                          className={`dashboard-ev-way${
                            evType === "Alt lines" ? " is-active" : ""
                          }`}
                          onClick={() => setEvType("Alt lines")}
                        >
                          Alt lines
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-ev-right">
                    <div className="dashboard-ev-preference">
                      <div>
                        <span>Favorite EV technique</span>
                        <p>Keep my preferred books + models active.</p>
                      </div>
                      <div className="dashboard-ev-actions">
                        <button
                          type="button"
                          className={`dashboard-ev-toggle${
                            favoriteEv === "Yes" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setFavoriteEv("Yes")}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`dashboard-ev-toggle${
                            favoriteEv === "No" ? " is-active" : " is-off"
                          }`}
                          onClick={() => setFavoriteEv("No")}
                        >
                          No
                        </button>
                        <button type="button" className="dashboard-ev-link">
                          Change settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
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
