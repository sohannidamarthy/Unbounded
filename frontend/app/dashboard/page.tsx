"use client";

import { Fragment, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

import { ALL_BET_TYPES, BET_TYPE_LABELS, BET_TYPE_OPTIONS, type BetType } from "../components/betTypeConfig";
import { DashboardHeader } from "../components/DashboardHeader";
import { DraggableBetCalculatorPopup } from "../components/DraggableBetCalculatorPopup";

const SAVED_EMAIL_KEY = "unbounded.saved_email";

function formatDisplayName(value: string | null) {
  if (!value) {
    return "You";
  }

  const base = value.split("@")[0]?.trim();
  if (!base) {
    return "You";
  }

  const cleaned = base.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "You";
  }

  return cleaned
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function DashboardPage() {
  const router = useRouter();
  const sportOptions = ["Basketball", "Football", "Baseball", "Soccer"] as const;
  const liveSportTabs = ["All", ...sportOptions] as const;
  const filterOptions = ["Trending", "High payout", "Live now"] as const;
  const chatFilters = ["All", "Tutorials", "Guides", "Videos"] as const;
  type Sport = (typeof sportOptions)[number];
  type LiveSportTab = (typeof liveSportTabs)[number];
  type LiveFilter = (typeof filterOptions)[number];
  type ChatFilter = (typeof chatFilters)[number];
  type EventPopout = {
    id: string;
    board: "Live bets" | "Arbitrage" | "EV";
    start: string;
    sport: string;
    league: string;
    match: string;
    teamA: string;
    teamB: string;
    oddsA: string;
    oddsB: string;
  };
  const liveBetValue = 25;
  const [expandedPanel, setExpandedPanel] = useState<
    | null
    | "live"
    | "withdrawal"
    | "tools"
    | "chat"
  >(null);
  const [arbEvView, setArbEvView] = useState<"arb" | "ev">("arb");
  const [activeSport, setActiveSport] = useState<LiveSportTab>("All");
  const [activeFilter, setActiveFilter] = useState<LiveFilter>("Trending");
  const [selectedLiveBetTypes, setSelectedLiveBetTypes] = useState<BetType[]>([
    ...ALL_BET_TYPES,
  ]);
  const [selectedArbBetTypes, setSelectedArbBetTypes] = useState<BetType[]>([
    ...ALL_BET_TYPES,
  ]);
  const [selectedEvBetTypes, setSelectedEvBetTypes] = useState<BetType[]>([
    ...ALL_BET_TYPES,
  ]);
  const [withdrawalSpeed, setWithdrawalSpeed] = useState("Instant");
  const [withdrawalMethod, setWithdrawalMethod] = useState("Bank");
  const [withdrawalAuto, setWithdrawalAuto] = useState("Yes");
  const [chatFilter, setChatFilter] = useState<ChatFilter>("All");
  const [eventPopout, setEventPopout] = useState<EventPopout | null>(null);
  const [manualEntryMode, setManualEntryMode] = useState(false);
  const [manualOddsA, setManualOddsA] = useState("");
  const [manualOddsB, setManualOddsB] = useState("");
  const [liveTabProfitTracker, setLiveTabProfitTracker] = useState(false);
  const [arbTabProfitTracker, setArbTabProfitTracker] = useState(false);
  const [evTabProfitTracker, setEvTabProfitTracker] = useState(false);
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<"arb" | "ev">("arb");
  const [betCalculatorStake, setBetCalculatorStake] = useState("100");
  const [betCalculatorOddsA, setBetCalculatorOddsA] = useState("");
  const [betCalculatorOddsB, setBetCalculatorOddsB] = useState("");
  const [includeSelfInLeaderboard, setIncludeSelfInLeaderboard] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("You");
  const isLiveExpanded = expandedPanel === "live";
  const isWithdrawalExpanded = expandedPanel === "withdrawal";
  const isToolsExpanded = expandedPanel === "tools";
  const isChatExpanded = expandedPanel === "chat";
  const recommendedGuides = [
    {
      title: "Momentum pivots",
      description: "Spotting late-line shifts before they pop.",
      type: "Guides",
      dropdown: [
        "Momentum pivots deep dive",
        "Late-line shift checklist",
        "Volatility map walkthrough",
        "Video: 3-minute pivot scan",
      ],
    },
    {
      title: "Hedge timing",
      description: "Quick 4-min clip on lock-in timing.",
      type: "Videos",
      dropdown: [
        "Video: Timing the lock-in",
        "Video: Exit laddering",
        "Guide: Hedge trigger points",
        "Video: 90-second recap",
      ],
    },
    {
      title: "Edge stacker",
      description: "Layering small edges into one slip.",
      type: "Tutorials",
      dropdown: [
        "Edge stacker sprint",
        "Risk overlay basics",
        "Video: Stacking in 2 mins",
        "Guide: Slip hygiene",
      ],
    },
    {
      title: "Bankroll pacing",
      description: "Plan week-long pacing for volatility.",
      type: "Guides",
      dropdown: [
        "Bankroll pacing planner",
        "Video: Weekly pacing",
        "Guide: Drawdown limits",
        "Guide: Recovery cadence",
      ],
    },
  ];
  const filteredRecommended =
    chatFilter === "All"
      ? recommendedGuides
      : recommendedGuides.filter((item) => item.type === chatFilter);

  const payoutMultiplier: Record<Sport, number> = {
    Basketball: 1.92,
    Football: 2.28,
    Baseball: 2.05,
    Soccer: 2.4,
  };
  const arbTableRows = [
    {
      start: "12:00 AM CT",
      sport: "Basketball",
      league: "NBA",
      match: "Pacers (+110) vs. Lakers (-110)",
      betType: "moneyline" as BetType,
    },
    {
      start: "1:30 AM CT",
      sport: "Basketball",
      league: "NBA",
      match: "Heat (+145) vs. Celtics (-160)",
      betType: "player-prop" as BetType,
    },
    {
      start: "3:15 PM CT",
      sport: "Football",
      league: "NFL",
      match: "Wolves (+120) vs. Reapers (-130)",
      betType: "spread" as BetType,
    },
    {
      start: "6:10 PM CT",
      sport: "Baseball",
      league: "MLB",
      match: "Dodgers (-105) vs. Mets (+102)",
      betType: "total" as BetType,
    },
    {
      start: "7:45 PM CT",
      sport: "Soccer",
      league: "MLS",
      match: "Harbor FC (+180) vs. Northbridge (-190)",
      betType: "alt-line" as BetType,
    },
  ];
  const leaderboardPreviewBoards = [
    {
      label: "24h cash",
      title: "Top earners",
      highlight: "NovaSkies",
      value: "+$4,820",
    },
    {
      label: "Locked in",
      title: "Win streaks",
      highlight: "JetPulse",
      value: "13 wins",
    },
    {
      label: "Efficiency",
      title: "ROI leaders",
      highlight: "SignalMint",
      value: "28.4%",
    },
    {
      label: "Momentum",
      title: "Climb watch",
      highlight: "PrimeRally",
      value: "+8",
    },
  ] as const;
  const dashboardSelfLeaderboardEntry = {
    rank: "142",
    name: currentUserName,
    focus: "Your tracked bets",
    rate: "54%",
    value: "+$1,180",
  };

  useEffect(() => {
    setCurrentUserName(formatDisplayName(window.localStorage.getItem(SAVED_EMAIL_KEY)));
  }, []);
  const liveTableRows: {
    start: string;
    sport: Sport;
    league: string;
    match: string;
    betType: BetType;
    odds: string;
    edge: string;
    payoutBoost: number;
    tags: LiveFilter[];
  }[] = [
    {
      start: "12:10 PM CT",
      sport: "Basketball",
      league: "NBA",
      match: "Warriors vs Suns",
      betType: "moneyline",
      odds: "-115",
      edge: "+4.8%",
      payoutBoost: 0.12,
      tags: ["Trending", "Live now"],
    },
    {
      start: "12:45 PM CT",
      sport: "Football",
      league: "NFL",
      match: "Chiefs vs Bills",
      betType: "spread",
      odds: "+145",
      edge: "+3.6%",
      payoutBoost: 0.3,
      tags: ["Trending"],
    },
    {
      start: "01:20 PM CT",
      sport: "Baseball",
      league: "MLB",
      match: "Dodgers vs Mets",
      betType: "player-prop",
      odds: "+105",
      edge: "+4.9%",
      payoutBoost: 0.18,
      tags: ["Trending", "High payout"],
    },
    {
      start: "02:05 PM CT",
      sport: "Soccer",
      league: "MLS",
      match: "Northbridge FC vs Harbor",
      betType: "total",
      odds: "+118",
      edge: "+4.7%",
      payoutBoost: 0.22,
      tags: ["Trending"],
    },
    {
      start: "02:40 PM CT",
      sport: "Basketball",
      league: "NBA",
      match: "Kings vs Storm",
      betType: "alt-line",
      odds: "+136",
      edge: "+5.3%",
      payoutBoost: 0.4,
      tags: ["High payout", "Live now"],
    },
    {
      start: "03:10 PM CT",
      sport: "Football",
      league: "NFL",
      match: "Wolves vs Reapers",
      betType: "spread",
      odds: "-108",
      edge: "+4.0%",
      payoutBoost: 0.1,
      tags: ["Live now"],
    },
  ];
  const filteredLiveRows = liveTableRows.filter(
    (row) =>
      (activeSport === "All" || row.sport === activeSport) &&
      selectedLiveBetTypes.includes(row.betType) &&
      row.tags.includes(activeFilter)
  );
  const visibleLiveRows = liveTableRows
    .filter((row) => selectedLiveBetTypes.includes(row.betType))
    .slice(0, 3);
  const activeArbBetTypes = arbEvView === "arb" ? selectedArbBetTypes : selectedEvBetTypes;
  const filteredArbRows = arbTableRows.filter((row) =>
    activeArbBetTypes.includes(row.betType)
  );
  const visibleArbRows = filteredArbRows.slice(0, 3);
  const liveDataSport: Sport =
    activeSport === "All" ? "Basketball" : activeSport;
  const allLiveBetTypesSelected = selectedLiveBetTypes.length === ALL_BET_TYPES.length;
  const allArbBetTypesSelected = activeArbBetTypes.length === ALL_BET_TYPES.length;

  const liveData: Record<
    Sport,
    {
      hero: string;
      board: {
        matchup: string;
        odds: string;
        edge: string;
        payoutBoost: number;
        tags: LiveFilter[];
      }[];
      cards: {
        title: string;
        meta: string;
        odds: string;
        payoutBoost: number;
        tags: LiveFilter[];
      }[];
    }
  > = {
    Basketball: {
      hero: "Skyline Kings vs Harbor Jets",
      board: [
        {
          matchup: "Skyline Kings -3.5",
          odds: "-112",
          edge: "+4.8%",
          payoutBoost: 0.12,
          tags: ["Trending", "Live now"],
        },
        {
          matchup: "Harbor Jets ML",
          odds: "+142",
          edge: "+3.1%",
          payoutBoost: -0.05,
          tags: ["Trending"],
        },
        {
          matchup: "Total O 218.5",
          odds: "+105",
          edge: "+5.4%",
          payoutBoost: 0.22,
          tags: ["High payout", "Live now"],
        },
      ],
      cards: [
        {
          title: "Fourth-quarter surge",
          meta: "3 picks • live",
          odds: "+285",
          payoutBoost: 0.65,
          tags: ["High payout", "Live now"],
        },
        {
          title: "Sharpside sweep",
          meta: "2 picks • pregame",
          odds: "+150",
          payoutBoost: 0.28,
          tags: ["Trending"],
        },
        {
          title: "Rim protectors",
          meta: "4 picks • props",
          odds: "+320",
          payoutBoost: 0.85,
          tags: ["High payout"],
        },
      ],
    },
    Football: {
      hero: "Iron City Wolves vs Gulf Coast Reapers",
      board: [
        {
          matchup: "Wolves -2.5",
          odds: "-108",
          edge: "+4.0%",
          payoutBoost: 0.1,
          tags: ["Trending", "Live now"],
        },
        {
          matchup: "Reapers ML",
          odds: "+125",
          edge: "+3.6%",
          payoutBoost: 0.08,
          tags: ["Trending"],
        },
        {
          matchup: "Total U 45.0",
          odds: "+110",
          edge: "+5.9%",
          payoutBoost: 0.35,
          tags: ["High payout"],
        },
      ],
      cards: [
        {
          title: "Redzone rally",
          meta: "3 picks • live",
          odds: "+310",
          payoutBoost: 0.7,
          tags: ["High payout", "Live now"],
        },
        {
          title: "Prime-time lock",
          meta: "2 picks • pregame",
          odds: "+135",
          payoutBoost: 0.22,
          tags: ["Trending"],
        },
        {
          title: "Defensive grind",
          meta: "4 picks • totals",
          odds: "+295",
          payoutBoost: 0.78,
          tags: ["High payout"],
        },
      ],
    },
    Baseball: {
      hero: "Coastal Comets vs Prairie Owls",
      board: [
        {
          matchup: "Comets -1.5",
          odds: "+128",
          edge: "+4.5%",
          payoutBoost: 0.2,
          tags: ["High payout"],
        },
        {
          matchup: "Owls ML",
          odds: "+112",
          edge: "+3.2%",
          payoutBoost: 0.05,
          tags: ["Trending", "Live now"],
        },
        {
          matchup: "Total O 8.0",
          odds: "-104",
          edge: "+4.9%",
          payoutBoost: 0.18,
          tags: ["Trending"],
        },
      ],
      cards: [
        {
          title: "Bullpen breaker",
          meta: "2 picks • live",
          odds: "+165",
          payoutBoost: 0.3,
          tags: ["Live now"],
        },
        {
          title: "Slugger stack",
          meta: "3 picks • props",
          odds: "+240",
          payoutBoost: 0.55,
          tags: ["High payout"],
        },
        {
          title: "Late innings edge",
          meta: "4 picks • totals",
          odds: "+275",
          payoutBoost: 0.68,
          tags: ["Trending"],
        },
      ],
    },
    Soccer: {
      hero: "Northbridge FC vs Valencia Harbor",
      board: [
        {
          matchup: "Northbridge -0.5",
          odds: "+118",
          edge: "+4.7%",
          payoutBoost: 0.22,
          tags: ["Trending"],
        },
        {
          matchup: "Draw",
          odds: "+210",
          edge: "+5.3%",
          payoutBoost: 0.5,
          tags: ["High payout"],
        },
        {
          matchup: "BTTS Yes",
          odds: "-102",
          edge: "+3.8%",
          payoutBoost: 0.1,
          tags: ["Live now"],
        },
      ],
      cards: [
        {
          title: "Second-half surge",
          meta: "2 picks • live",
          odds: "+175",
          payoutBoost: 0.32,
          tags: ["Live now"],
        },
        {
          title: "Corner chaos",
          meta: "3 picks • props",
          odds: "+255",
          payoutBoost: 0.6,
          tags: ["High payout"],
        },
        {
          title: "Clean sheet blend",
          meta: "4 picks • props",
          odds: "+290",
          payoutBoost: 0.74,
          tags: ["Trending"],
        },
      ],
    },
  };

  const toDecimalOdds = (americanOdds: string) => {
    const value = Number(americanOdds);
    if (Number.isNaN(value) || value === 0) {
      return null;
    }
    return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
  };
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
    odds,
  }: {
    id: string;
    board: "Live bets" | "Arbitrage" | "EV";
    start: string;
    sport: string;
    league: string;
    match: string;
    odds?: string;
  }): EventPopout => {
    const parsed = parseMatchup(match, odds);
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
    const betValue = liveBetValue;
    const decimalA = toDecimalOdds(activeOddsA);
    const decimalB = toDecimalOdds(activeOddsB);
    if (betValue <= 0) {
      return "0.00";
    }
    if (decimalA && decimalB) {
      const stakeA = (betValue * decimalB) / (decimalA + decimalB);
      const stakeB = betValue - stakeA;
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
  const toggleBetTypeSelection = (
    betType: BetType,
    setSelected: Dispatch<SetStateAction<BetType[]>>
  ) => {
    setSelected((current) => {
      if (current.includes(betType)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== betType);
      }
      return [...current, betType];
    });
  };
  const setActiveArbEvBetTypes = (next: BetType[]) => {
    if (arbEvView === "arb") {
      setSelectedArbBetTypes(next);
      return;
    }
    setSelectedEvBetTypes(next);
  };
  const isCurrentTabTracked =
    arbEvView === "arb" ? arbTabProfitTracker : evTabProfitTracker;

  return (
    <div className="site dashboard-page">
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />

      <main className="dashboard-main">
        <div
          className={`dashboard-layout${
            expandedPanel ? " dashboard-layout--expanded" : ""
          }`}
        >
          <section
            className={`dashboard-content${
              expandedPanel ? " dashboard-content--expanded" : ""
            }`}
            aria-label="Dashboard content"
          >
            <section
              className={`dashboard-panel dashboard-panel--live dashboard-expandable${
                isLiveExpanded ? " is-expanded" : ""
              }`}
              aria-label="Live bets"
            >
              <div className="dashboard-panel-header">
                <h2>Live bets</h2>
                <div
                  className="dashboard-panel-tracker-toggle dashboard-panel-tracker-toggle--corner"
                  style={{ position: "absolute", top: 10, right: 46, zIndex: 3 }}
                >
                  <span>Add to Profit Tracker</span>
                  <button
                    type="button"
                    className={`dashboard-event-toggle${
                      liveTabProfitTracker ? " is-on" : " is-off"
                    }`}
                    aria-pressed={liveTabProfitTracker}
                    onClick={() => setLiveTabProfitTracker((prev) => !prev)}
                  >
                    <span className="dashboard-event-toggle-knob" aria-hidden="true" />
                  </button>
                </div>
                {isLiveExpanded ? (
                  <button
                    className="dashboard-panel-close"
                    type="button"
                    aria-label="Close live bets"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedPanel(null);
                    }}
                  >
                    ×
                  </button>
                ) : (
                  <button
                    className="dashboard-panel-close"
                    type="button"
                    aria-label="Expand live bets"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedPanel("live");
                    }}
                  >
                    +
                  </button>
                )}
              </div>
              <div className="dashboard-panel-body">
                <div className="dashboard-bet-type-filter-row">
                  <button
                    type="button"
                    className={`dashboard-bet-type-pill${
                      allLiveBetTypesSelected ? " is-active" : ""
                    }`}
                    onClick={() => setSelectedLiveBetTypes([...ALL_BET_TYPES])}
                  >
                    All bets
                  </button>
                  {BET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={`live-${option.value}`}
                      type="button"
                      className={`dashboard-bet-type-pill${
                        selectedLiveBetTypes.includes(option.value) ? " is-active" : ""
                      }`}
                      onClick={() =>
                        toggleBetTypeSelection(option.value, setSelectedLiveBetTypes)
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {!isLiveExpanded ? (
                  <div
                    className="dashboard-arb-table"
                    role="table"
                    aria-label="Live betting board"
                  >
                    <div
                      className="dashboard-arb-row dashboard-arb-row--header"
                      role="row"
                    >
                      <span role="columnheader">Match starts</span>
                      <span
                        className="dashboard-arb-header-group"
                        role="columnheader"
                      >
                        <span>Sport</span>
                        <span>League</span>
                        <span>Match</span>
                      </span>
                    </div>
                    {visibleLiveRows.length === 0 ? (
                      <div className="dashboard-bet-type-empty" role="row">
                        No live bets match the selected bet types.
                      </div>
                    ) : null}
                    {visibleLiveRows.map((row) => (
                      <Fragment key={`${row.start}-${row.match}`}>
                        <div
                        className={`dashboard-arb-row${
                          eventPopout?.id === `live-${row.start}-${row.match}`
                            ? " is-selected"
                            : ""
                        }`}
                        role="row"
                        key={`${row.start}-${row.match}`}
                        onClick={() =>
                          openEventPopout(
                            buildEventPopout({
                              id: `live-${row.start}-${row.match}`,
                              board: "Live bets",
                              start: row.start,
                              sport: row.sport,
                              league: row.league,
                              match: row.match,
                              odds: row.odds,
                            })
                          )
                        }
                      >
                        <span className="dashboard-arb-cell dashboard-arb-cell--time">
                          {row.start}
                        </span>
                        <span className="dashboard-arb-cell dashboard-arb-cell--details">
                          <span className="dashboard-arb-league">{row.league}</span>
                          <span className="dashboard-arb-match">{row.match}</span>
                          <span className="dashboard-arb-sport">{row.sport}</span>
                          <span className="dashboard-bet-type-badge dashboard-bet-type-badge--inline">
                            {BET_TYPE_LABELS[row.betType]}
                          </span>
                        </span>
                        </div>
                        {renderEventDropdown(`live-${row.start}-${row.match}`)}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <div
                    className="dashboard-live-expanded"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {(() => {
                      const sportData = liveData[liveDataSport];
                      const activeBoard = sportData.board.filter((row) =>
                        row.tags.includes(activeFilter)
                      );
                      const activeCards = sportData.cards.filter((card) =>
                        card.tags.includes(activeFilter)
                      );
                      return (
                        <>
                    <div className="dashboard-live-filters">
                      <div className="dashboard-live-tabs">
                        {liveSportTabs.map((sport) => (
                          <button
                            key={sport}
                            type="button"
                            className={`dashboard-live-tab${
                              activeSport === sport ? " is-active" : ""
                            }`}
                            onClick={() => setActiveSport(sport)}
                          >
                            {sport}
                          </button>
                        ))}
                      </div>
                      <div className="dashboard-live-pill-group">
                        {filterOptions.map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            className={`dashboard-live-pill${
                              activeFilter === filter ? " is-active" : ""
                            }`}
                            onClick={() => setActiveFilter(filter)}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="dashboard-live-hero">
                      <div>
                        <div className="dashboard-live-hero-title">
                          {activeSport} live spotlight
                        </div>
                        <p>
                          {sportData.hero} headline with real-time edges, in-play
                          volatility, and payout previews.
                        </p>
                      </div>
                      <div className="dashboard-live-hero-stat">
                        <span>Est. payout boost</span>
                        <strong>
                          $
                          {(liveBetValue * payoutMultiplier[liveDataSport]).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div
                      className="dashboard-arb-table is-expanded"
                      role="table"
                      aria-label="Expanded live betting board"
                    >
                      <div
                        className="dashboard-arb-row dashboard-arb-row--header"
                        role="row"
                      >
                        <span role="columnheader">Match starts</span>
                        <span role="columnheader">Sport</span>
                        <span role="columnheader">League</span>
                        <span role="columnheader">Match</span>
                      </div>
                      {filteredLiveRows.length === 0 ? (
                        <div className="dashboard-bet-type-empty" role="row">
                          No live bets match the current sport, board, and bet-type filters.
                        </div>
                      ) : null}
                      {filteredLiveRows.map((row) => (
                        <Fragment key={`${row.start}-${row.match}`}>
                          <div
                          className={`dashboard-arb-row${
                            eventPopout?.id === `live-${row.start}-${row.match}`
                              ? " is-selected"
                              : ""
                          }`}
                          role="row"
                          key={`${row.start}-${row.match}`}
                          onClick={() =>
                            openEventPopout(
                              buildEventPopout({
                                id: `live-${row.start}-${row.match}`,
                                board: "Live bets",
                                start: row.start,
                                sport: row.sport,
                                league: row.league,
                                match: row.match,
                                odds: row.odds,
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
                            <span>{row.match}</span>
                            <span className="dashboard-bet-type-badge">
                              {BET_TYPE_LABELS[row.betType]}
                            </span>
                          </span>
                          </div>
                          {renderEventDropdown(`live-${row.start}-${row.match}`)}
                        </Fragment>
                      ))}
                    </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </section>
            <section
              className="dashboard-leaderboard dashboard-leaderboard--compact dashboard-expandable"
              aria-label="Leaderboard preview"
            >
              <div className="dashboard-leaderboard-header">
                <div className="dashboard-arb-header-left">
                  <h3>Leaderboard hub</h3>
                  <p>Quick snapshot of the boards. Open the full hub for rankings and details.</p>
                </div>
                <div className="dashboard-leaderboard-header-actions">
                  <div className="dashboard-leaderboard-self-toggle">
                    <div>
                      <span>Include yourself</span>
                      <p>Add your row to the board.</p>
                    </div>
                    <button
                      type="button"
                      className={`dashboard-event-toggle${
                        includeSelfInLeaderboard ? " is-on" : " is-off"
                      }`}
                      aria-pressed={includeSelfInLeaderboard}
                      aria-label="Include yourself in dashboard leaderboard"
                      onClick={() => setIncludeSelfInLeaderboard((current) => !current)}
                    >
                      <span className="dashboard-event-toggle-knob" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="dashboard-leaderboard-pill">Updated 5m ago</span>
                </div>
              </div>
              <button
                className="dashboard-panel-close"
                type="button"
                aria-label="Open leaderboard page"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push("/leaderboard");
                }}
              >
                +
              </button>
              <div className="dashboard-leaderboard-mini-grid">
                {leaderboardPreviewBoards.map((board) => (
                  <div className="dashboard-leaderboard-mini-card" key={board.title}>
                    <span>{board.label}</span>
                    <strong>{board.title}</strong>
                    <div className="dashboard-leaderboard-mini-card-row">
                      <span>{board.highlight}</span>
                      <span>{board.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dashboard-leaderboard-table dashboard-leaderboard-table--compact">
                <div className="dashboard-leaderboard-row header">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Focus</span>
                  <span>Hit rate</span>
                  <span>24h profit</span>
                </div>
                {[
                  {
                    rank: "01",
                    name: "NovaSkies",
                    focus: "Basketball live",
                    rate: "68%",
                    value: "+$4,820",
                  },
                  {
                    rank: "02",
                    name: "IceLine",
                    focus: "Football alt lines",
                    rate: "64%",
                    value: "+$4,120",
                  },
                  {
                    rank: "03",
                    name: "CoastEdge",
                    focus: "Soccer totals",
                    rate: "61%",
                    value: "+$3,760",
                  },
                ].map((entry) => (
                  <div className="dashboard-leaderboard-row" key={entry.rank}>
                    <span>{entry.rank}</span>
                    <span>{entry.name}</span>
                    <span>{entry.focus}</span>
                    <span>{entry.rate}</span>
                    <span>{entry.value}</span>
                  </div>
                ))}
                {includeSelfInLeaderboard ? (
                  <div className="dashboard-leaderboard-row dashboard-leaderboard-row--self">
                    <span>{dashboardSelfLeaderboardEntry.rank}</span>
                    <span>{dashboardSelfLeaderboardEntry.name}</span>
                    <span>{dashboardSelfLeaderboardEntry.focus}</span>
                    <span>{dashboardSelfLeaderboardEntry.rate}</span>
                    <span>{dashboardSelfLeaderboardEntry.value}</span>
                  </div>
                ) : null}
              </div>
            </section>
            <section
              id="arbitrage-bets"
              className={`${
                arbEvView === "arb" ? "dashboard-arb" : "dashboard-ev"
              } dashboard-expandable dashboard-arb-ev-preview`}
              aria-label={
                arbEvView === "arb" ? "Arbitrage bets per day" : "EV bets per day"
              }
            >
              <span id="ev-bets" aria-hidden="true" />
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
                        onClick={() => setArbEvView("arb")}
                      >
                        Arb
                      </button>
                      <button
                        type="button"
                        className={`dashboard-arb-toggle${
                          arbEvView === "ev" ? " is-active" : " is-off"
                        }`}
                        onClick={() => setArbEvView("ev")}
                      >
                        EV
                      </button>
                  </div>
                  </div>
                  <h3>
                    {arbEvView === "arb"
                      ? "Arbitrage bets per day"
                      : "Positive EV bets"}
                  </h3>
                  <p>
                    {arbEvView === "arb"
                      ? "Three fast looks from the current arb board."
                      : "Three quick positive EV looks from the current board."}
                  </p>
                </div>
                <div className="dashboard-compact-stats">
                  <div className="dashboard-compact-stat">
                    <span>{arbEvView === "arb" ? "Live arbs" : "Live +EV"}</span>
                    <strong>{arbEvView === "arb" ? "18" : "27"}</strong>
                  </div>
                  <div className="dashboard-compact-stat">
                    <span>Top sport</span>
                    <strong>Basketball</strong>
                  </div>
                  <div className="dashboard-compact-stat">
                    <span>Best edge</span>
                    <strong>{arbEvView === "arb" ? "4.8%" : "+6.2%"}</strong>
                  </div>
                </div>
              </div>
              <div
                className="dashboard-panel-tracker-toggle dashboard-panel-tracker-toggle--corner"
                style={{ position: "absolute", top: 10, right: 46, zIndex: 3 }}
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
              <button
                className="dashboard-panel-close"
                type="button"
                aria-label={`Open ${arbEvView === "arb" ? "arbitrage" : "positive EV"} page`}
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(arbEvView === "arb" ? "/arbitrage-bets" : "/ev-bets");
                }}
              >
                +
              </button>
              <div
                className="dashboard-arb-table dashboard-arb-table--compact"
                role="table"
                aria-label={arbEvView === "arb" ? "Arbitrage preview board" : "EV preview board"}
              >
                <div className="dashboard-bet-type-filter-row dashboard-bet-type-filter-row--compact">
                  <button
                    type="button"
                    className={`dashboard-bet-type-pill${
                      allArbBetTypesSelected ? " is-active" : ""
                    }`}
                    onClick={() => setActiveArbEvBetTypes([...ALL_BET_TYPES])}
                  >
                    All bets
                  </button>
                  {BET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={`${arbEvView}-${option.value}`}
                      type="button"
                      className={`dashboard-bet-type-pill${
                        activeArbBetTypes.includes(option.value) ? " is-active" : ""
                      }`}
                      onClick={() => {
                        const setter =
                          arbEvView === "arb" ? setSelectedArbBetTypes : setSelectedEvBetTypes;
                        toggleBetTypeSelection(option.value, setter);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="dashboard-arb-row dashboard-arb-row--header" role="row">
                  <span role="columnheader">Match starts</span>
                  <span
                    className="dashboard-arb-header-group"
                    role="columnheader"
                  >
                    <span>Sport</span>
                    <span>League</span>
                    <span>Match</span>
                  </span>
                </div>
                {visibleArbRows.length === 0 ? (
                  <div className="dashboard-bet-type-empty" role="row">
                    No {arbEvView === "arb" ? "arbitrage" : "positive EV"} bets match the selected bet types.
                  </div>
                ) : null}
                {visibleArbRows.map((row) => (
                  <div className="dashboard-arb-row" role="row" key={`${arbEvView}-${row.start}-${row.match}`}>
                    <span className="dashboard-arb-cell dashboard-arb-cell--time">
                      {row.start}
                    </span>
                    <span className="dashboard-arb-cell dashboard-arb-cell--details">
                      <span className="dashboard-arb-league">{row.league}</span>
                      <span className="dashboard-arb-match">{row.match}</span>
                      <span className="dashboard-arb-sport">{row.sport}</span>
                      <span className="dashboard-bet-type-badge dashboard-bet-type-badge--inline">
                        {BET_TYPE_LABELS[row.betType]}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
            <section
              className={`dashboard-withdrawal dashboard-expandable${
                isWithdrawalExpanded ? " is-expanded" : ""
              }`}
              aria-label="Fastest withdrawal methods"
            >
              <div className="dashboard-withdrawal-header">
                <div>
                  <h3>Fastest withdrawal methods</h3>
                  <p>Route payouts to the quickest rails with low fees.</p>
                </div>
                <div className="dashboard-withdrawal-controls">
                  <label className="dashboard-withdrawal-field">
                    <span>Destination</span>
                    <select defaultValue="Bank account">
                      <option>Bank account</option>
                      <option>Debit card</option>
                      <option>Crypto wallet</option>
                    </select>
                  </label>
                  <label className="dashboard-withdrawal-field">
                    <span>Amount</span>
                    <input type="number" min="0" defaultValue="250" />
                  </label>
                  <label className="dashboard-withdrawal-field">
                    <span>Currency</span>
                    <select defaultValue="USD">
                      <option>USD</option>
                      <option>CAD</option>
                      <option>EUR</option>
                    </select>
                  </label>
                </div>
              </div>
              {isWithdrawalExpanded ? (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label="Close withdrawal methods"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpandedPanel(null);
                  }}
                >
                  ×
                </button>
              ) : (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label="Expand withdrawal methods"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpandedPanel("withdrawal");
                  }}
                >
                  +
                </button>
              )}
              <div className="dashboard-withdrawal-body">
                <div className="dashboard-withdrawal-left">
                  <div className="dashboard-withdrawal-metric">
                    <span>Transfer speed</span>
                    <div className="dashboard-withdrawal-toggle-group">
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${
                          withdrawalSpeed === "Instant" ? " is-active" : " is-off"
                        }`}
                        onClick={() => setWithdrawalSpeed("Instant")}
                      >
                        Instant
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${
                          withdrawalSpeed === "Standard" ? " is-active" : " is-off"
                        }`}
                        onClick={() => setWithdrawalSpeed("Standard")}
                      >
                        Standard
                      </button>
                    </div>
                  </div>
                  <div className="dashboard-withdrawal-metric">
                    <span>Method</span>
                    <div className="dashboard-withdrawal-ways">
                      <button
                        type="button"
                        className={`dashboard-withdrawal-way${
                          withdrawalMethod === "Bank" ? " is-active" : ""
                        }`}
                        onClick={() => setWithdrawalMethod("Bank")}
                      >
                        Bank
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-way${
                          withdrawalMethod === "Card" ? " is-active" : ""
                        }`}
                        onClick={() => setWithdrawalMethod("Card")}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-way${
                          withdrawalMethod === "Crypto" ? " is-active" : ""
                        }`}
                        onClick={() => setWithdrawalMethod("Crypto")}
                      >
                        Crypto
                      </button>
                    </div>
                  </div>
                </div>
                <div className="dashboard-withdrawal-right">
                  <div className="dashboard-withdrawal-preference">
                    <div>
                      <span>Auto-pick fastest route</span>
                      <p>Keep preferred rails on standby for rapid cashout.</p>
                    </div>
                    <div className="dashboard-withdrawal-actions">
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${
                          withdrawalAuto === "Yes" ? " is-active" : " is-off"
                        }`}
                        onClick={() => setWithdrawalAuto("Yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${
                          withdrawalAuto === "No" ? " is-active" : " is-off"
                        }`}
                        onClick={() => setWithdrawalAuto("No")}
                      >
                        No
                      </button>
                      <button type="button" className="dashboard-withdrawal-link">
                        Change settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {isWithdrawalExpanded ? (
                <div
                  className="dashboard-withdrawal-expanded"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="dashboard-withdrawal-grid">
                    <div className="dashboard-withdrawal-card">
                      <span>Instant cashout</span>
                      <strong>12 min avg</strong>
                      <p>Debit rails prioritized.</p>
                    </div>
                    <div className="dashboard-withdrawal-card">
                      <span>Lowest fees</span>
                      <strong>0.9% avg</strong>
                      <p>Bank transfer lanes.</p>
                    </div>
                    <div className="dashboard-withdrawal-card">
                      <span>Largest transfer</span>
                      <strong>$8,200</strong>
                      <p>Approved within 1 hour.</p>
                    </div>
                  </div>
                  <div className="dashboard-withdrawal-list">
                    <div className="dashboard-withdrawal-list-row">
                      <span>Primebook to debit card</span>
                      <span>11 min</span>
                      <span>Fee 1.2%</span>
                    </div>
                    <div className="dashboard-withdrawal-list-row">
                      <span>Skyline to bank account</span>
                      <span>2 hrs</span>
                      <span>Fee 0.6%</span>
                    </div>
                    <div className="dashboard-withdrawal-list-row">
                      <span>Jetline to USDC wallet</span>
                      <span>18 min</span>
                      <span>Fee 1.8%</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
            <section
              className={`dashboard-tools dashboard-expandable${
                isToolsExpanded ? " is-expanded" : ""
              }`}
              aria-label="Tools"
            >
              <div className="dashboard-tools-header">
                <div>
                  <h3>Tools</h3>
                  <p>Quick utilities for validating edges and timing decay.</p>
                </div>
              </div>
              {isToolsExpanded ? (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label="Close tools"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpandedPanel(null);
                  }}
                >
                  ×
                </button>
              ) : (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label="Expand tools"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpandedPanel("tools");
                  }}
                >
                  +
                </button>
              )}
              <div className="dashboard-tools-body">
                <div className="dashboard-tools-list">
                  <div className="dashboard-tools-item">
                    <span>Tool</span>
                    <strong>Arb call scanner</strong>
                    <p>Instant flags for price gaps and stale lines.</p>
                  </div>
                  <div className="dashboard-tools-item">
                    <span>Tool</span>
                    <strong>Bet validator</strong>
                    <p>Check lines, limits, and payout variance.</p>
                  </div>
                  {!isToolsExpanded ? (
                    <div className="dashboard-tools-item is-highlight">
                      <span>New</span>
                      <strong>Time-to-decay predictor AI</strong>
                      <p>Estimate how fast premium erodes before lock-in.</p>
                    </div>
                  ) : null}
                </div>
              </div>
              {isToolsExpanded ? (
                <div
                  className="dashboard-tools-expanded"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="dashboard-tools-decay-panel">
                    <div className="dashboard-tools-decay-header">
                      <div>
                        <span>Time-to-decay predictor</span>
                        <h4>Premium erosion window</h4>
                        <p>Momentum shifts accelerate near expiry.</p>
                      </div>
                      <button type="button" className="dashboard-tools-cta">
                        Run model
                      </button>
                    </div>
                    <div className="dashboard-tools-decay-main">
                      <div className="dashboard-tools-decay-stat">
                        <div>
                          <div className="dashboard-tools-decay-value">6h 24m</div>
                          <p>Next projected theta cliff.</p>
                        </div>
                        <div className="dashboard-tools-decay-badges">
                          <span>ATM: high</span>
                          <span>IV: steady</span>
                          <span>Delta: 0.52</span>
                        </div>
                      </div>
                      <div className="dashboard-tools-decay-visual is-large">
                        <div className="dashboard-tools-decay-labels">
                          <span>Now</span>
                          <span>48h</span>
                        </div>
                        <svg
                          className="dashboard-tools-decay-chart"
                          viewBox="0 0 420 160"
                          role="img"
                          aria-label="Time decay curve"
                        >
                          <defs>
                            <linearGradient
                              id="decayGlowLarge"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="0%"
                            >
                              <stop offset="0%" stopColor="rgba(215, 170, 66, 0.1)" />
                              <stop offset="100%" stopColor="rgba(215, 170, 66, 0.35)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M12 24 C 100 28, 220 55, 300 95 C 345 122, 380 138, 408 150"
                            stroke="rgba(215, 170, 66, 0.9)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            d="M12 24 C 100 28, 220 55, 300 95 C 345 122, 380 138, 408 150 L 408 156 L 12 156 Z"
                            fill="url(#decayGlowLarge)"
                          />
                          <circle cx="300" cy="95" r="6" fill="#d7aa42" />
                          <circle cx="392" cy="144" r="7" fill="#f2d384" />
                        </svg>
                        <div className="dashboard-tools-decay-meta">
                          <span>Slow bleed</span>
                          <span>Acceleration zone</span>
                          <span>Expiry cliff</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
            <section
              className={`dashboard-panel dashboard-panel--chat dashboard-expandable${
                isChatExpanded ? " is-expanded" : ""
              }`}
              aria-label="Chat log"
            >
              <div className="dashboard-panel-header">
                <h2>Tutorials / Guides / Videos</h2>
                {isChatExpanded ? (
                  <button
                    className="dashboard-panel-close"
                    type="button"
                    aria-label="Close chat log"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedPanel(null);
                    }}
                  >
                    ×
                  </button>
                ) : (
                  <button
                    className="dashboard-panel-close"
                    type="button"
                    aria-label="Expand chat log"
                    onClick={(event) => {
                      event.stopPropagation();
                      setExpandedPanel("chat");
                    }}
                  >
                    +
                  </button>
                )}
              </div>
              {!isChatExpanded ? (
                <div className="dashboard-chat-preview">
                  <p>Temporary previews for premium walkthroughs and replays.</p>
                  <div className="dashboard-chat-placeholder-grid">
                    <div className="dashboard-chat-placeholder">
                      <span>Placeholder</span>
                      <strong>Arb scanner recap</strong>
                      <p>Breakdown of today’s best edges.</p>
                    </div>
                    <div className="dashboard-chat-placeholder">
                      <span>Placeholder</span>
                      <strong>Live hedging notes</strong>
                      <p>Protecting profit with late pivots.</p>
                    </div>
                    <div className="dashboard-chat-placeholder">
                      <span>Placeholder</span>
                      <strong>Video drill</strong>
                      <p>Quick 2-min refresher on sizing.</p>
                    </div>
                  </div>
                  <button type="button" className="dashboard-chat-log-button">
                    <span aria-hidden="true">👑</span>
                    Chat log
                  </button>
                </div>
              ) : (
                <div
                  className="dashboard-chat-expanded"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="dashboard-chat-header">
                    <button type="button" className="dashboard-chat-cta">
                      <span aria-hidden="true">👑</span>
                      Chat log
                    </button>
                  </div>
                  <div className="dashboard-chat-filters">
                    <span>Filter</span>
                    <div className="dashboard-chat-filter-group">
                      {chatFilters.map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          className={`dashboard-chat-filter${
                            chatFilter === filter ? " is-active" : ""
                          }`}
                          aria-pressed={chatFilter === filter}
                          onClick={() => setChatFilter(filter)}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="dashboard-chat-recommended">
                    <div className="dashboard-chat-recommended-header">
                      <span>Recommended guides</span>
                      <p>Auto-filled based on your recent activity.</p>
                    </div>
                    <div className="dashboard-chat-recommended-grid">
                      {filteredRecommended.map((item) => (
                        <div key={item.title} className="dashboard-chat-recommended-card">
                          <span>Guide</span>
                          <strong>{item.title}</strong>
                          <p>{item.description}</p>
                          <div className="dashboard-chat-dropdown">
                            <div className="dashboard-chat-dropdown-title">
                              Guides &amp; videos
                            </div>
                            {item.dropdown.map((entry) => (
                              <span key={entry}>{entry}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
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

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>Unbounded</strong>
          <span>Dashboard tools for live betting decisions and review.</span>
        </div>
        <div className="footer-links">
          <a href="/arbitrage-bets">Arbitrage</a>
          <a href="/ev-bets">Positive EV</a>
          <a href="/profit-tracker">Profit Tracker</a>
          <a href="/leaderboard">Leaderboard</a>
          <a href="/billing">Billing</a>
        </div>
      </footer>
    </div>
  );
}
