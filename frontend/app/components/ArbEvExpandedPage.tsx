"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { DashboardHeader } from "./DashboardHeader";
import { ALL_BET_TYPES, BET_TYPE_LABELS, BET_TYPE_OPTIONS, type BetType } from "./betTypeConfig";
import { DraggableBetCalculatorPopup } from "./DraggableBetCalculatorPopup";
import { SEO_PAGES } from "./seoData";
import {
  ARBEV_BOOK_OPTIONS,
  getSportsbookMeta,
  SportsbookLogo,
} from "./sportsbookMeta";

type ArbEvView = "arb" | "ev";
type Sport = "Basketball" | "Football" | "Baseball" | "Soccer";
type Book = (typeof ARBEV_BOOK_OPTIONS)[number];
type PageFilterMenu = "sports" | "books" | "betTypes" | null;
type TutorialCategory = "all" | "concepts" | "execution" | "risk" | "tools" | "math" | "strategy";

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
  betType?: BetType;
  legs?: LiveBetLeg[];
};

type LiveBetLeg = {
  outcome_key: string;
  book: string;
  odds_decimal: number;
  odds_american?: number | string;
  line?: number | string | null;
  bet_url?: string;
};

type LiveArbPayload = {
  arb_id?: string;
  sport?: string;
  league?: string;
  event_id?: string;
  event_name?: string;
  start_time_ms?: number;
  market_key?: string;
  line?: number | string | null;
  roi?: number;
  roi_raw?: number;
  legs?: LiveBetLeg[];
};

type ArbEvTableRow = {
  id: string;
  start: string;
  sport: Sport;
  league: string;
  match: string;
  betType: BetType;
  netProfit: string;
  roi: number;
  legs: LiveBetLeg[];
  books: string[];
};

type LiveEvPayload = {
  ev_id?: string;
  sport?: string;
  league?: string;
  event_id?: string;
  event_name?: string;
  start_time_ms?: number;
  market_key?: string;
  selection?: string;
  book?: string;
  odds_decimal?: number;
  odds_american?: number;
  line?: number | string | null;
  bet_url?: string;
  edge?: number;
  expected_value?: number;
};

const sportOptions: Sport[] = ["Basketball", "Football", "Baseball", "Soccer"];
const bookOptions: Book[] = [...ARBEV_BOOK_OPTIONS];

const pageConfigs = {
  arb: {
    heroKicker: "Arbitrage Control Room",
    heroTitle: "Find clean two-way and multi-way arbitrage windows faster.",
    heroDescription:
      "Built for operators who care about timing, payout balance, and execution discipline. This page is tuned around live arbitrage workflow instead of a generic board shell.",
    panelTitle: "Arbitrage control board",
    panelDescription: "Track daily arbitrage opportunities, verify the matchup, and keep your preferred execution settings tight.",
    stats: [
      {
        label: "Live arbs tracked",
        value: "148",
        detail: "Across books with current filters and saved stacks.",
      },
      {
        label: "Median lock window",
        value: "42 sec",
        detail: "Average time before one side starts drifting.",
      },
      {
        label: "Best board mix",
        value: "NBA + MLB",
        detail: "Highest steady conversion today.",
      },
    ],
    cards: [
      {
        title: "Execution lanes",
        body: "Two-way arb, three-way arb, and ladder structures each move differently once the market tightens.",
      },
      {
        title: "Pressure checks",
        body: "Use the event drawer to validate both sides before the edge disappears.",
      },
      {
        title: "Book preference",
        body: "Keep the combinations you trust visible and cut down wasted clicks.",
      },
    ],
    tutorialCategories: [
      { value: "all", label: "All" },
      { value: "concepts", label: "Concepts" },
      { value: "execution", label: "Execution" },
      { value: "risk", label: "Risk" },
      { value: "tools", label: "Tools" },
    ] as Array<{ value: TutorialCategory; label: string }>,
    tutorials: [
      { path: "/what-is-arbitrage-betting", category: "concepts" as TutorialCategory },
      { path: "/how-to-arbitrage-bet", category: "execution" as TutorialCategory },
      { path: "/arbitrage-strategies", category: "execution" as TutorialCategory },
      { path: "/risk-free-betting", category: "risk" as TutorialCategory },
      { path: "/is-arbitrage-legal", category: "risk" as TutorialCategory },
      { path: "/arbitrage-software", category: "tools" as TutorialCategory },
    ],
  },
  ev: {
    heroKicker: "Positive EV Decision Desk",
    heroTitle: "Separate real value from noisy prices with a sharper EV workflow.",
    heroDescription:
      "This page leans into expected-value decision making: probability translation, model confidence, and cleaner candidate-bet review instead of a generic shared board.",
    panelTitle: "Positive EV decision board",
    panelDescription: "Track daily positive EV looks, keep preferred filters active, and review candidate bets with the calculator flow close by.",
    stats: [
      {
        label: "Candidate +EV bets",
        value: "0",
        detail: "Waiting for live or seeded EV opportunities.",
      },
      {
        label: "Best edge cluster",
        value: "Waiting",
        detail: "Updates when EV rows are loaded.",
      },
      {
        label: "Model confidence",
        value: "Waiting",
        detail: "Populates from live candidate rows.",
      },
    ],
    cards: [
      {
        title: "Price translation",
        body: "Convert the board into probabilities fast enough that strong value stands out immediately.",
      },
      {
        title: "Selection discipline",
        body: "Use EV type filters to keep your process consistent instead of chasing everything green.",
      },
      {
        title: "Review loop",
        body: "Fold what you learn back into your preferred settings so the board keeps improving.",
      },
    ],
    tutorialCategories: [
      { value: "all", label: "All" },
      { value: "concepts", label: "Concepts" },
      { value: "math", label: "Math" },
      { value: "execution", label: "Execution" },
      { value: "strategy", label: "Strategy" },
    ] as Array<{ value: TutorialCategory; label: string }>,
    tutorials: [
      { path: "/what-is-positive-ev", category: "concepts" as TutorialCategory },
      { path: "/positive-ev/how-to-find-value-bets", category: "execution" as TutorialCategory },
      { path: "/positive-ev/implied-probability-explained", category: "math" as TutorialCategory },
      { path: "/positive-ev/expected-value-formula", category: "math" as TutorialCategory },
      { path: "/positive-ev/ev-betting-strategy", category: "strategy" as TutorialCategory },
    ],
  },
} as const;

function getSelectionLabel(
  selections: readonly string[],
  allOptions: readonly string[],
  allLabel: string,
  emptyLabel: string
) {
  if (selections.length === 0) {
    return emptyLabel;
  }
  if (selections.length === allOptions.length) {
    return allLabel;
  }
  return selections[0];
}

function mapSportLabel(sport?: string): Sport {
  const normalized = (sport ?? "").toLowerCase();
  if (normalized.includes("nba") || normalized.includes("ncaab") || normalized.includes("basketball")) {
    return "Basketball";
  }
  if (normalized.includes("nfl") || normalized.includes("ncaaf") || normalized.includes("football")) {
    return "Football";
  }
  if (normalized.includes("mlb") || normalized.includes("baseball")) {
    return "Baseball";
  }
  return "Soccer";
}

function mapMarketToBetType(marketKey?: string): BetType {
  const normalized = (marketKey ?? "").toLowerCase();
  if (normalized.includes("prop")) {
    return "player-prop";
  }
  if (normalized.includes("spread")) {
    return "spread";
  }
  if (normalized.includes("total")) {
    return normalized.includes("alt") ? "alt-line" : "total";
  }
  if (normalized.includes("alt")) {
    return "alt-line";
  }
  return "moneyline";
}

function formatTeamName(name: string): string {
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function decimalToAmerican(decimal: number) {
  if (!Number.isFinite(decimal) || decimal <= 1) {
    return "--";
  }
  if (decimal >= 2) {
    return `+${Math.round((decimal - 1) * 100)}`;
  }
  return `${Math.round(-100 / (decimal - 1))}`;
}

function formatStartTime(timestamp?: number) {
  if (!timestamp) {
    return "TBD";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function mapEvPayloadToRow(ev: LiveEvPayload): ArbEvTableRow {
  const selection = ev.selection ?? "EV selection";
  const edge = ev.edge ?? ev.expected_value ?? 0;
  const oddsDecimal = Number(ev.odds_decimal || 0);
  const leg: LiveBetLeg = {
    outcome_key: selection,
    book: ev.book ?? "Sportsbook",
    odds_decimal: oddsDecimal || 1,
    odds_american: ev.odds_american,
    line: ev.line,
    bet_url: ev.bet_url,
  };

  return {
    id: ev.ev_id ?? `${ev.event_id ?? "ev"}-${selection}`,
    start: formatStartTime(ev.start_time_ms),
    sport: mapSportLabel(ev.sport),
    league: ev.league ?? (ev.sport ?? "EV").toUpperCase(),
    match: `${ev.event_name ?? "Event"} - ${selection}`,
    betType: mapMarketToBetType(ev.market_key),
    netProfit: `+${(edge * 100).toFixed(1)}% EV`,
    roi: edge,
    legs: [leg],
    books: [leg.book],
  };
}

function mapArbPayloadToRow(arb: LiveArbPayload): ArbEvTableRow {
  const roi = Number(arb.roi ?? arb.roi_raw ?? 0);
  const legs = Array.isArray(arb.legs) ? arb.legs : [];
  const eventName = arb.event_name || arb.event_id || "Live event";
  const legSummary = legs
    .slice(0, 2)
    .map((leg) => `${leg.outcome_key} (${decimalToAmerican(Number(leg.odds_decimal))})`)
    .join(" vs. ");
  const marketSuffix = arb.line != null ? ` ${arb.line}` : "";

  return {
    id: arb.arb_id ?? `${arb.event_id ?? "arb"}-${arb.market_key ?? "market"}`,
    start: formatStartTime(arb.start_time_ms),
    sport: mapSportLabel(arb.sport),
    league: arb.league ?? (arb.sport ?? "Arb").toUpperCase(),
    match: legSummary || `${eventName}${marketSuffix}`,
    betType: mapMarketToBetType(arb.market_key),
    netProfit: `+${(roi * 100).toFixed(2)}%`,
    roi,
    legs,
    books: legs.map((leg) => leg.book),
  };
}

export function ArbEvExpandedPage({ initialView }: ArbEvExpandedPageProps) {
  const pageConfig = pageConfigs[initialView];
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
  const [liveArbRows, setLiveArbRows] = useState<ArbEvTableRow[]>([]);
  const [liveEvRows, setLiveEvRows] = useState<ArbEvTableRow[]>([]);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([...sportOptions]);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([...bookOptions]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<BetType[]>([...ALL_BET_TYPES]);
  const [draftSports, setDraftSports] = useState<Sport[]>([...sportOptions]);
  const [draftBooks, setDraftBooks] = useState<Book[]>([...bookOptions]);
  const [draftBetTypes, setDraftBetTypes] = useState<BetType[]>([...ALL_BET_TYPES]);
  const [openPageFilter, setOpenPageFilter] = useState<PageFilterMenu>(null);
  const [filterNotification, setFilterNotification] = useState<string | null>(null);
  const [selectedTutorialCategory, setSelectedTutorialCategory] =
    useState<TutorialCategory>("all");
  const [selectedTutorialPaths, setSelectedTutorialPaths] = useState<string[]>(
    pageConfig.tutorials.slice(0, 2).map((item) => item.path)
  );
  const [activeTutorialPath, setActiveTutorialPath] = useState<string>(
    pageConfig.tutorials[0]?.path ?? ""
  );
  const pageFiltersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setArbEvView(initialView);
    setBetCalculatorMode(initialView);
    setSelectedTutorialCategory("all");
    setSelectedTutorialPaths(pageConfigs[initialView].tutorials.slice(0, 2).map((item) => item.path));
    setActiveTutorialPath(pageConfigs[initialView].tutorials[0]?.path ?? "");
  }, [initialView]);

  useEffect(() => {
    if (window.location.hash === "#bet-calculator") {
      setIsBetCalculatorOpen(true);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    async function loadRows() {
      try {
        const [arbResponse, evResponse] = await Promise.all([
          fetch(`${apiBase}/v1/arbs?sport=all&limit=100`, { cache: "no-store" }),
          fetch(`${apiBase}/v1/evs?sport=all&limit=100`, { cache: "no-store" }),
        ]);
        if (!arbResponse.ok || !evResponse.ok) {
          throw new Error("Board API request failed");
        }
        const arbPayload = (await arbResponse.json()) as { arbs?: LiveArbPayload[] };
        const evPayload = (await evResponse.json()) as { evs?: LiveEvPayload[] };
        if (!isCancelled) {
          setLiveArbRows((arbPayload.arbs ?? []).map(mapArbPayloadToRow));
          setLiveEvRows((evPayload.evs ?? []).map(mapEvPayloadToRow));
        }
      } catch {
        if (!isCancelled) {
          setLiveArbRows([]);
          setLiveEvRows([]);
        }
      }
    }

    loadRows();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!openPageFilter) {
      return;
    }

    const resetDrafts = () => {
      setDraftSports([...selectedSports]);
      setDraftBooks([...selectedBooks]);
      setDraftBetTypes([...selectedBetTypes]);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!pageFiltersRef.current?.contains(event.target as Node)) {
        resetDrafts();
        setOpenPageFilter(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetDrafts();
        setOpenPageFilter(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPageFilter, selectedBetTypes, selectedBooks, selectedSports]);

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
    betType,
    legs,
  }: {
    id: string;
    board: "Arbitrage" | "EV";
    start: string;
    sport: string;
    league: string;
    match: string;
    betType?: BetType;
    legs?: LiveBetLeg[];
  }): EventPopout => {
    const parsed = parseMatchup(match);
    const firstLeg = legs?.[0];
    const secondLeg = legs?.[1];
    return {
      id,
      board,
      start,
      sport,
      league,
      match,
      teamA: firstLeg?.outcome_key ?? parsed.teamA,
      teamB: secondLeg?.outcome_key ?? parsed.teamB,
      oddsA: firstLeg ? decimalToAmerican(Number(firstLeg.odds_decimal)) : parsed.oddsA,
      oddsB: secondLeg ? decimalToAmerican(Number(secondLeg.odds_decimal)) : parsed.oddsB,
      betType,
      legs,
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

    const openBetLeg = (leg: LiveBetLeg) => {
      const fallbackHref = getSportsbookMeta(leg.book).siteHref;
      const href = leg.bet_url || fallbackHref;
      if (href && href !== "#") {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    };

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
              <span>
                {eventPopout.legs?.[0] ? (
                  <SportsbookLogo sportsbook={eventPopout.legs[0].book} size={22} />
                ) : null}
                {eventPopout.teamA}
              </span>
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
              <span>
                {eventPopout.legs?.[1] ? (
                  <SportsbookLogo sportsbook={eventPopout.legs[1].book} size={22} />
                ) : null}
                {eventPopout.teamB}
              </span>
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
          {eventPopout.legs?.length ? (
            <div className="dashboard-event-popout-actions">
              {eventPopout.legs.map((leg) => (
                <button
                  type="button"
                  className="dashboard-event-popout-btn"
                  key={`${eventPopout.id}-${leg.book}-${leg.outcome_key}`}
                  onClick={() => openBetLeg(leg)}
                >
                  Bet {leg.outcome_key} at {leg.book}
                </button>
              ))}
            </div>
          ) : null}
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

  const isCurrentTabTracked =
    arbEvView === "arb" ? arbTabProfitTracker : evTabProfitTracker;
  const activePageConfig = pageConfigs[arbEvView];
  const activeStats =
    arbEvView === "arb"
      ? [
          {
            label: "Live arbs tracked",
            value: String(liveArbRows.length),
            detail: "Synced from the same backend feed as the dashboard.",
          },
          {
            label: "Best edge",
            value: liveArbRows.length
              ? `${(Math.max(...liveArbRows.map((row) => row.roi)) * 100).toFixed(2)}%`
              : "Waiting",
            detail: "Highest visible arb edge with current filters.",
          },
          {
            label: "Top sport",
            value: liveArbRows[0]?.sport ?? "Waiting",
            detail: "Sport with the strongest visible opportunity.",
          },
        ]
      : [
          {
            label: "Candidate +EV bets",
            value: String(liveEvRows.length),
            detail: "Synced from the same backend feed as the dashboard.",
          },
          {
            label: "Best edge",
            value: liveEvRows.length
              ? `${(Math.max(...liveEvRows.map((row) => row.roi)) * 100).toFixed(1)}% EV`
              : "Waiting",
            detail: "Highest visible EV edge with current filters.",
          },
          {
            label: "Top sport",
            value: liveEvRows[0]?.sport ?? "Waiting",
            detail: "Sport with the strongest visible EV candidate.",
          },
        ];
  const tutorialCards = activePageConfig.tutorials
    .map((item) => {
      const seoPage = SEO_PAGES[item.path];
      if (!seoPage) {
        return null;
      }
      return {
        ...item,
        title: seoPage.title,
        eyebrow: seoPage.eyebrow,
        excerpt: seoPage.heroDescription,
        summary: seoPage.description,
        takeaway: seoPage.pricingDescription,
        links: seoPage.relatedLinks.slice(0, 3),
      };
    })
    .filter(Boolean) as Array<{
    path: string;
    category: TutorialCategory;
    title: string;
    eyebrow: string;
    excerpt: string;
    summary: string;
    takeaway: string;
    links: Array<{ href: string; title: string; description: string }>;
  }>;
  const visibleTutorialCards = tutorialCards.filter(
    (item) =>
      selectedTutorialCategory === "all" || item.category === selectedTutorialCategory
  );
  const activeTutorial =
    tutorialCards.find((item) => item.path === activeTutorialPath) ??
    visibleTutorialCards[0] ??
    tutorialCards[0];
  const allSportsSelected = selectedSports.length === sportOptions.length;
  const allBooksSelected = selectedBooks.length === bookOptions.length;
  const allBetTypesSelected = selectedBetTypes.length === ALL_BET_TYPES.length;
  const sportFilterLabel = getSelectionLabel(
    selectedSports,
    sportOptions,
    "All sports",
    "Pick sports"
  );
  const hasSportChanges =
    draftSports.length !== selectedSports.length ||
    draftSports.some((sport) => !selectedSports.includes(sport));
  const hasBookChanges =
    draftBooks.length !== selectedBooks.length ||
    draftBooks.some((book) => !selectedBooks.includes(book));
  const hasBetTypeChanges =
    draftBetTypes.length !== selectedBetTypes.length ||
    draftBetTypes.some((betType) => !selectedBetTypes.includes(betType));
  const betTypeFilterLabel = getSelectionLabel(
    selectedBetTypes,
    ALL_BET_TYPES,
    "All bets",
    "Pick bets"
  );
  const activeBoardRows = arbEvView === "ev" ? liveEvRows : liveArbRows;
  const filteredRows = activeBoardRows.filter(
    (row) =>
      selectedSports.includes(row.sport) &&
      selectedBetTypes.includes(row.betType) &&
      (allBooksSelected ||
        !row.books.length ||
        row.books.some((book) => selectedBooks.includes(book as Book)))
  );

  const toggleDraftSport = (sport: Sport) => {
    setDraftSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport]
    );
  };

  const toggleDraftBook = (book: Book) => {
    setDraftBooks((current) =>
      current.includes(book)
        ? current.filter((item) => item !== book)
        : [...current, book]
    );
  };

  const toggleDraftBetType = (betType: BetType) => {
    setDraftBetTypes((current) =>
      current.includes(betType)
        ? current.filter((item) => item !== betType)
        : [...current, betType]
    );
  };

  const openFilterMenu = (menu: Exclude<PageFilterMenu, null>) => {
    setDraftSports([...selectedSports]);
    setDraftBooks([...selectedBooks]);
    setDraftBetTypes([...selectedBetTypes]);
    setOpenPageFilter((current) => (current === menu ? null : menu));
  };

  const saveFilterChanges = (menu: Exclude<PageFilterMenu, null>) => {
    if (menu === "sports") {
      setSelectedSports([...draftSports]);
    } else if (menu === "books") {
      setSelectedBooks([...draftBooks]);
    } else {
      setSelectedBetTypes([...draftBetTypes]);
    }
    setOpenPageFilter(null);
    setFilterNotification("Set these filter settings for all bets?");
  };

  const toggleTutorialSelection = (path: string) => {
    setSelectedTutorialPaths((current) =>
      current.includes(path)
        ? current.filter((item) => item !== path)
        : [...current, path]
    );
  };


  return (
    <div className="site dashboard-page arb-ev-page">
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />

      <main className="arb-ev-page-main">
        <div className="arb-ev-page-shell">
          <section
            className={`arb-ev-specialization arb-ev-specialization--${arbEvView}`}
            aria-label={
              arbEvView === "arb"
                ? "Arbitrage page overview"
                : "Positive EV page overview"
            }
          >
            <div className="arb-ev-specialization-hero">
              <div className="arb-ev-specialization-copy">
                <span className="arb-ev-specialization-kicker">
                  {activePageConfig.heroKicker}
                </span>
                <h1>{activePageConfig.heroTitle}</h1>
                <p>{activePageConfig.heroDescription}</p>
              </div>
              <div className="arb-ev-specialization-cards">
                {activePageConfig.cards.map((card) => (
                  <article
                    className="arb-ev-specialization-card"
                    key={`${arbEvView}-${card.title}`}
                  >
                    <strong>{card.title}</strong>
                    <p>{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="arb-ev-specialization-stats">
              {activeStats.map((stat) => (
                <article
                  className="arb-ev-specialization-stat"
                  key={`${arbEvView}-${stat.label}`}
                >
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.detail}</p>
                </article>
              ))}
            </div>
          </section>

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
                <h3>
                  {activePageConfig.panelTitle}
                </h3>
                <p>{activePageConfig.panelDescription}</p>
              </div>
              <div
                className={
                  arbEvView === "arb"
                    ? "dashboard-arb-controls"
                    : "dashboard-ev-controls"
                }
                ref={pageFiltersRef}
              >
                <label
                  className={`${
                    arbEvView === "arb" ? "dashboard-arb-field" : "dashboard-ev-field"
                  } dashboard-page-filter-field`}
                >
                  <span>Date</span>
                  <input type="date" />
                </label>
                <div className="dashboard-top-filters dashboard-top-filters--page">
                  <div className="dashboard-top-filter dashboard-top-filter--page">
                    <span>Sport</span>
                    <button
                      type="button"
                      className={`dashboard-filter-trigger${
                        openPageFilter === "sports" ? " is-open" : ""
                      }`}
                      aria-haspopup="dialog"
                      aria-expanded={openPageFilter === "sports"}
                      onClick={() => openFilterMenu("sports")}
                    >
                      <span className="dashboard-filter-trigger-label">
                        {sportFilterLabel}
                      </span>
                      {!allSportsSelected && selectedSports.length > 1 ? (
                        <span className="dashboard-filter-trigger-count">
                          +{selectedSports.length - 1}
                        </span>
                      ) : null}
                      <span className="dashboard-filter-trigger-icon" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {openPageFilter === "sports" ? (
                      <div className="dashboard-filter-menu" role="dialog" aria-label="Sport filter">
                        <div className="dashboard-filter-menu-actions">
                          <button
                            type="button"
                            onClick={() => setDraftSports([...sportOptions])}
                          >
                            Select all
                          </button>
                          <button type="button" onClick={() => setDraftSports([])}>
                            Clear
                          </button>
                        </div>
                        <div className="dashboard-filter-menu-options">
                          {sportOptions.map((sport) => {
                            const isSelected = draftSports.includes(sport);
                            return (
                              <button
                                key={sport}
                                type="button"
                                className={`dashboard-filter-option${
                                  isSelected ? " is-selected" : ""
                                }`}
                                aria-pressed={isSelected}
                                onClick={() => toggleDraftSport(sport)}
                              >
                                <span className="dashboard-filter-option-check" aria-hidden="true">
                                  {isSelected ? "✓" : ""}
                                </span>
                                <span>{sport}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="dashboard-filter-menu-footer">
                          <button
                            type="button"
                            className="dashboard-filter-save"
                            disabled={!hasSportChanges}
                            onClick={() => saveFilterChanges("sports")}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="dashboard-top-filter dashboard-top-filter--page">
                    <span>Books</span>
                    <button
                      type="button"
                      className={`dashboard-filter-trigger dashboard-filter-trigger--books${
                        openPageFilter === "books" ? " is-open" : ""
                      }`}
                      aria-haspopup="dialog"
                      aria-expanded={openPageFilter === "books"}
                      onClick={() => openFilterMenu("books")}
                    >
                      <span className="dashboard-filter-trigger-label">All books</span>
                      <span className="dashboard-filter-trigger-icon" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {openPageFilter === "books" ? (
                      <div className="dashboard-filter-menu" role="dialog" aria-label="Books filter">
                        <div className="dashboard-filter-menu-actions">
                          <button
                            type="button"
                            onClick={() => setDraftBooks([...bookOptions])}
                          >
                            Select all
                          </button>
                          <button type="button" onClick={() => setDraftBooks([])}>
                            Clear
                          </button>
                        </div>
                        <div className="dashboard-filter-menu-options">
                          {bookOptions.map((book) => {
                            const isSelected = draftBooks.includes(book);
                            const bookMeta = getSportsbookMeta(book);
                            return (
                              <div
                                key={book}
                                className={`dashboard-filter-option-card${
                                  isSelected ? " is-selected" : ""
                                }`}
                              >
                                <button
                                  type="button"
                                  className={`dashboard-filter-option dashboard-filter-option--book${
                                    isSelected ? " is-selected" : ""
                                  }`}
                                  aria-pressed={isSelected}
                                  onClick={() => toggleDraftBook(book)}
                                >
                                  <span className="dashboard-filter-option-check" aria-hidden="true">
                                    {isSelected ? "✓" : ""}
                                  </span>
                                  <SportsbookLogo sportsbook={book} size={24} />
                                  <span>{book}</span>
                                </button>
                                <a
                                  className="dashboard-filter-option-link"
                                  href={bookMeta.siteHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${book} website`}
                                  title={`Open ${book}`}
                                >
                                  ↗
                                </a>
                              </div>
                            );
                          })}
                        </div>
                        <div className="dashboard-filter-menu-footer">
                          <button
                            type="button"
                            className="dashboard-filter-save"
                            disabled={!hasBookChanges}
                            onClick={() => saveFilterChanges("books")}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="dashboard-top-filter dashboard-top-filter--page">
                    <span>Bet type</span>
                    <button
                      type="button"
                      className={`dashboard-filter-trigger${
                        openPageFilter === "betTypes" ? " is-open" : ""
                      }`}
                      aria-haspopup="dialog"
                      aria-expanded={openPageFilter === "betTypes"}
                      onClick={() => openFilterMenu("betTypes")}
                    >
                      <span className="dashboard-filter-trigger-label">
                        {betTypeFilterLabel}
                      </span>
                      {!allBetTypesSelected && selectedBetTypes.length > 1 ? (
                        <span className="dashboard-filter-trigger-count">
                          +{selectedBetTypes.length - 1}
                        </span>
                      ) : null}
                      <span className="dashboard-filter-trigger-icon" aria-hidden="true">
                        ▾
                      </span>
                    </button>
                    {openPageFilter === "betTypes" ? (
                      <div className="dashboard-filter-menu" role="dialog" aria-label="Bet type filter">
                        <div className="dashboard-filter-menu-actions">
                          <button
                            type="button"
                            onClick={() => setDraftBetTypes([...ALL_BET_TYPES])}
                          >
                            Select all
                          </button>
                          <button type="button" onClick={() => setDraftBetTypes([])}>
                            Clear
                          </button>
                        </div>
                        <div className="dashboard-filter-menu-options">
                          {BET_TYPE_OPTIONS.map((option) => {
                            const isSelected = draftBetTypes.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                className={`dashboard-filter-option${
                                  isSelected ? " is-selected" : ""
                                }`}
                                aria-pressed={isSelected}
                                onClick={() => toggleDraftBetType(option.value)}
                              >
                                <span className="dashboard-filter-option-check" aria-hidden="true">
                                  {isSelected ? "✓" : ""}
                                </span>
                                <span>{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="dashboard-filter-menu-footer">
                          <button
                            type="button"
                            className="dashboard-filter-save"
                            disabled={!hasBetTypeChanges}
                            onClick={() => saveFilterChanges("betTypes")}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
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
                <span role="columnheader">Net profit</span>
              </div>
              {filteredRows.length === 0 ? (
                <div className="dashboard-bet-type-empty" role="row">
                  No bets match the current sport and bet-type filters.
                </div>
              ) : null}
              {filteredRows.map((row) => {
                const rowId = `${arbEvView}-${row.id}`;
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
                            betType: row.betType,
                            legs: row.legs,
                          })
                        )
                      }
                    >
                      <span className="dashboard-arb-cell dashboard-arb-cell--time">
                        {row.start}
                      </span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--sport">
                        {row.sport}
                      </span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--league">
                        {row.league}
                      </span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--match">
                        <span>{row.match}</span>
                        <span className="dashboard-bet-type-badge">
                          {BET_TYPE_LABELS[row.betType]}
                        </span>
                      </span>
                      <span className="dashboard-arb-cell dashboard-arb-cell--net">
                        {row.netProfit}
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

          <section
            className={`arb-ev-tutorial-lab arb-ev-tutorial-lab--${arbEvView}`}
            aria-label={
              arbEvView === "arb"
                ? "Arbitrage tutorials"
                : "Positive EV tutorials"
            }
          >
            <div className="arb-ev-tutorial-lab-head">
              <div>
                <span className="arb-ev-tutorial-lab-kicker">
                  Interactive tutorial lab
                </span>
                <h2>
                  {arbEvView === "arb"
                    ? "Build your arbitrage learning stack"
                    : "Build your positive EV learning stack"}
                </h2>
                <p>
                  Select the tutorials you want, preview the education content,
                  and move through the SEO-backed guides directly from here.
                </p>
              </div>
            </div>

            <div className="arb-ev-tutorial-filters" role="tablist" aria-label="Tutorial categories">
              {activePageConfig.tutorialCategories.map((category) => (
                <button
                  key={`${arbEvView}-${category.value}`}
                  type="button"
                  className={`arb-ev-tutorial-filter${
                    selectedTutorialCategory === category.value ? " is-active" : ""
                  }`}
                  aria-pressed={selectedTutorialCategory === category.value}
                  onClick={() => setSelectedTutorialCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="arb-ev-tutorial-grid">
              <div className="arb-ev-tutorial-stack">
                {visibleTutorialCards.map((tutorial) => {
                  const isSelected = selectedTutorialPaths.includes(tutorial.path);
                  const isActive = activeTutorial?.path === tutorial.path;
                  return (
                    <article
                      key={tutorial.path}
                      className={`arb-ev-tutorial-card${
                        isActive ? " is-active" : ""
                      }${isSelected ? " is-selected" : ""}`}
                    >
                      <button
                        type="button"
                        className="arb-ev-tutorial-card-main"
                        onClick={() => setActiveTutorialPath(tutorial.path)}
                      >
                        <span>{tutorial.eyebrow}</span>
                        <strong>{tutorial.title}</strong>
                        <p>{tutorial.summary}</p>
                      </button>
                      <div className="arb-ev-tutorial-card-actions">
                        <button
                          type="button"
                          className={`arb-ev-tutorial-select${
                            isSelected ? " is-selected" : ""
                          }`}
                          onClick={() => toggleTutorialSelection(tutorial.path)}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                        <a href={tutorial.path}>Open page</a>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="arb-ev-tutorial-spotlight">
                {activeTutorial ? (
                  <>
                    <div className="arb-ev-tutorial-spotlight-head">
                      <span>{activeTutorial.eyebrow}</span>
                      <strong>{activeTutorial.title}</strong>
                      <p>{activeTutorial.excerpt}</p>
                    </div>
                    <div className="arb-ev-tutorial-spotlight-copy">
                      <div>
                        <span>SEO summary</span>
                        <p>{activeTutorial.summary}</p>
                      </div>
                      <div>
                        <span>Why it matters on this page</span>
                        <p>{activeTutorial.takeaway}</p>
                      </div>
                    </div>
                    <div className="arb-ev-tutorial-spotlight-links">
                      {activeTutorial.links.map((link) => (
                        <a
                          key={`${activeTutorial.path}-${link.href}`}
                          className="arb-ev-tutorial-link"
                          href={link.href}
                        >
                          <strong>{link.title}</strong>
                          <p>{link.description}</p>
                        </a>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      {filterNotification ? (
        <div className="dashboard-filter-notification" role="status" aria-live="polite">
          <span>{filterNotification}</span>
          <div className="dashboard-filter-notification-actions">
            <button type="button" onClick={() => setFilterNotification(null)}>
              OK
            </button>
            <button type="button" onClick={() => setFilterNotification(null)}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

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
