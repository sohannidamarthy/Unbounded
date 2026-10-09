"use client";

import { RequireAuth } from "../components/RequireAuth";

import { Fragment, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";

import { ALL_BET_TYPES, BET_TYPE_LABELS, BET_TYPE_OPTIONS, type BetType } from "../components/betTypeConfig";
import { DashboardHeader } from "../components/DashboardHeader";
import { redirectIfUnauthorized } from "../lib/auth";
import { DraggableBetCalculatorPopup } from "../components/DraggableBetCalculatorPopup";
import { SportsbookLogo, getSportsbookMeta } from "../components/sportsbookMeta";

const SAVED_EMAIL_KEY = "unbounded.saved_email";
const TOKEN_STORAGE_KEY = "unbounded.access_token";

type LiveArbLeg = {
  outcome_key: string;
  book: string;
  odds_decimal: number;
  odds_american?: number | string;
  ts_ingested_ms?: number;
  line?: number | string | null;
  market_instance_id?: string;
  bet_url?: string;
};

type SavedBet = {
  id: string;
  savedAt: string;
  sourceId: string;
  board: string;
  matchup: string;
  sport: string;
  league: string;
  betType: string;
  oddsA: string;
  oddsB: string;
  estimatedNet: number;
  legs: LiveArbLeg[];
};

type LiveArbPayload = {
  arb_id: string;
  sport: string;
  league?: string;
  event_id?: string;
  event_name?: string;
  start_time_ms?: number;
  market_key?: string;
  market_instance_id?: string;
  line?: number | string | null;
  roi?: number;
  roi_raw?: number;
  legs?: LiveArbLeg[];
};

type LiveEvPayload = {
  ev_id: string;
  sport?: string;
  league?: string;
  event_id?: string;
  event_name?: string;
  start_time_ms?: number;
  market_key?: string;
  selection?: string;
  line?: number | string | null;
  book?: string;
  odds_decimal?: number;
  odds_american?: number;
  edge?: number;
  expected_value?: number;
  bet_url?: string;
};

type DashboardArbRow = {
  id: string;
  start: string;
  isLive: boolean;
  sport: string;
  league: string;
  match: string;
  betType: BetType;
  netProfit: string;
  roi: number;
  legs: LiveArbLeg[];
  isLiveData: boolean;
};

function decimalToAmerican(decimal: number) {
  if (!Number.isFinite(decimal) || decimal <= 1) {
    return "--";
  }
  if (decimal >= 2) {
    return `+${Math.round((decimal - 1) * 100)}`;
  }
  return `${Math.round(-100 / (decimal - 1))}`;
}

function formatTeamName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatStartTime(startTimeMs?: number) {
  if (!startTimeMs) {
    return "Live";
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(startTimeMs));
}

function isEventLive(startTimeMs?: number) {
  return !startTimeMs || startTimeMs <= Date.now();
}

function mapMarketToBetType(marketKey?: string): BetType {
  const normalized = (marketKey ?? "").toLowerCase();
  if (normalized.includes("prop")) {
    return "player-prop";
  }
  if (normalized.includes("alt")) {
    return "alt-line";
  }
  if (normalized.includes("spread")) {
    return "spread";
  }
  if (normalized.includes("total")) {
    return "total";
  }
  return "moneyline";
}

function sportLabel(value?: string) {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("nba") || normalized.includes("basketball")) {
    return "Basketball";
  }
  if (normalized.includes("nfl") || normalized.includes("football")) {
    return "Football";
  }
  if (normalized.includes("mlb") || normalized.includes("baseball")) {
    return "Baseball";
  }
  if (normalized.includes("soccer") || normalized.includes("mls") || normalized.includes("epl")) {
    return "Soccer";
  }
  return value || "Sports";
}

function mapArbPayloadToRow(arb: LiveArbPayload): DashboardArbRow {
  const roi = Number(arb.roi ?? arb.roi_raw ?? 0);
  const legs = Array.isArray(arb.legs) ? arb.legs : [];
  const eventName = arb.event_name || arb.event_id || "Live event";
  const legSummary = legs
    .slice(0, 2)
    .map((leg) => `${formatTeamName(leg.outcome_key)} (${decimalToAmerican(Number(leg.odds_decimal))})`)
    .join(" vs. ");
  const marketSuffix = arb.line != null ? ` ${arb.line}` : "";

  return {
    id: arb.arb_id,
    start: formatStartTime(arb.start_time_ms),
    isLive: isEventLive(arb.start_time_ms),
    sport: sportLabel(arb.sport),
    league: arb.league || String(arb.sport || "").toUpperCase() || "Live",
    match: legSummary || `${eventName}${marketSuffix}`,
    betType: mapMarketToBetType(arb.market_key),
    netProfit: `+${(roi * 100).toFixed(2)}%`,
    roi,
    legs,
    isLiveData: true,
  };
}

function mapEvPayloadToRow(ev: LiveEvPayload): DashboardArbRow {
  const edge = Number(ev.edge ?? ev.expected_value ?? 0);
  const book = ev.book || "Sportsbook";
  const selection = ev.selection || "EV selection";
  const oddsDecimal = Number(ev.odds_decimal || 0);
  const oddsAmerican =
    ev.odds_american !== undefined
      ? ev.odds_american
      : oddsDecimal
        ? decimalToAmerican(oddsDecimal)
        : undefined;
  const legs: LiveArbLeg[] = [
    {
      outcome_key: selection,
      book,
      odds_decimal: oddsDecimal || 1,
      odds_american: oddsAmerican,
      line: ev.line,
      bet_url: ev.bet_url,
    },
  ];

  return {
    id: ev.ev_id,
    start: formatStartTime(ev.start_time_ms),
    isLive: isEventLive(ev.start_time_ms),
    sport: sportLabel(ev.sport),
    league: ev.league || String(ev.sport || "").toUpperCase() || "EV",
    match: `${ev.event_name || ev.event_id || "EV event"} - ${selection}`,
    betType: mapMarketToBetType(ev.market_key),
    netProfit: `+${(edge * 100).toFixed(1)}% EV`,
    roi: edge,
    legs,
    isLiveData: true,
  };
}

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

const Icon01 = () => (
  <svg
    width="24" height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M19.5 10.5H18.75C18.3358 10.5 18 10.8358 18 11.25C18 11.6642 18.3358 12 18.75 12H19.5C20.0965 12.0007 20.6685 12.2379 21.0903 12.6597C21.5121 13.0815 21.7493 13.6535 21.75 14.25V16.5C21.75 16.9142 22.0858 17.25 22.5 17.25C22.9142 17.25 23.25 16.9142 23.25 16.5V14.25C23.2488 13.2558 22.8534 12.3026 22.1504 11.5996C21.4474 10.8966 20.4942 10.5012 19.5 10.5Z"
      fill="white"
    />

    <path
      d="M18 3C18.445 3 18.88 3.13196 19.25 3.37919C19.62 3.62643 19.9084 3.97783 20.0787 4.38896C20.249 4.8001 20.2936 5.2525 20.2068 5.68895C20.12 6.12541 19.9057 6.52632 19.591 6.84099C19.2763 7.15566 18.8754 7.36995 18.439 7.45677C18.0025 7.54358 17.5501 7.49903 17.139 7.32873C16.7278 7.15843 16.3764 6.87004 16.1292 6.50003C15.882 6.13002 15.75 5.69501 15.75 5.25C15.75 4.65326 15.9871 4.08097 16.409 3.65901C16.831 3.23705 17.4033 3 18 3ZM18 1.5C17.2583 1.5 16.5333 1.71993 15.9166 2.13199C15.2999 2.54404 14.8193 3.12971 14.5355 3.81494C14.2516 4.50016 14.1774 5.25416 14.3221 5.98159C14.4667 6.70902 14.8239 7.3772 15.3483 7.90165C15.8728 8.4261 16.541 8.78325 17.2684 8.92795C17.9958 9.07264 18.7498 8.99838 19.4351 8.71455C20.1203 8.43072 20.706 7.95007 21.118 7.33339C21.5301 6.7167 21.75 5.99168 21.75 5.25C21.75 4.25544 21.3549 3.30161 20.6516 2.59835C19.9484 1.89509 18.9946 1.5 18 1.5Z"
      fill="white"
    />

    <path
      d="M17.25 21.75C17.25 22.1642 16.9142 22.5 16.5 22.5C16.0858 22.5 15.75 22.1642 15.75 21.75V21C15.7493 20.4035 15.5121 19.8315 15.0903 19.4097C14.6685 18.9879 14.0965 18.7507 13.5 18.75H10.5C9.90346 18.7507 9.33155 18.9879 8.90973 19.4097C8.48792 19.8315 8.25066 20.4035 8.25 21V21.75C8.25 22.1642 7.91421 22.5 7.5 22.5C7.08579 22.5 6.75 22.1642 6.75 21.75V21C6.75117 20.0058 7.14664 19.0527 7.84964 18.3496C8.55265 17.6466 9.5058 17.2512 10.5 17.25H13.5C14.4942 17.2512 15.4473 17.6466 16.1504 18.3496C16.8534 19.0527 17.2488 20.0058 17.25 21V21.75Z"
      fill="white"
    />

    <path
      d="M12 9.75C12.445 9.75 12.88 9.88196 13.25 10.1292C13.62 10.3764 13.9084 10.7278 14.0787 11.139C14.249 11.5501 14.2936 12.0025 14.2068 12.439C14.12 12.8754 13.9057 13.2763 13.591 13.591C13.2763 13.9057 12.8754 14.12 12.439 14.2068C12.0025 14.2936 11.5501 14.249 11.139 14.0787C10.7278 13.9084 10.3764 13.62 10.1292 13.25C9.88196 12.88 9.75 12.445 9.75 12C9.75 11.4033 9.98705 10.831 10.409 10.409C10.831 9.98705 11.4033 9.75 12 9.75ZM12 8.25C11.2583 8.25 10.5333 8.46993 9.91661 8.88199C9.29993 9.29404 8.81928 9.87971 8.53545 10.5649C8.25162 11.2502 8.17736 12.0042 8.32205 12.7316C8.46675 13.459 8.8239 14.1272 9.34835 14.6517C9.8728 15.1761 10.541 15.5333 11.2684 15.6779C11.9958 15.8226 12.7498 15.7484 13.4351 15.4645C14.1203 15.1807 14.706 14.7001 15.118 14.0834C15.5301 13.4667 15.75 12.7417 15.75 12C15.75 11.0054 15.3549 10.0516 14.6517 9.34835C13.9484 8.64509 12.9946 8.25 12 8.25Z"
      fill="white"
    />

    <path
      d="M6 11.25C6 10.8358 5.66421 10.5 5.25 10.5H4.5C3.5058 10.5012 2.55265 10.8966 1.84964 11.5996C1.14664 12.3027 0.751171 13.2558 0.75 14.25V16.5C0.75 16.9142 1.08579 17.25 1.5 17.25C1.91421 17.25 2.25 16.9142 2.25 16.5V14.25C2.25066 13.6535 2.48792 13.0815 2.90973 12.6597C3.33155 12.2379 3.90346 12.0007 4.5 12H5.25C5.66421 12 6 11.6642 6 11.25Z"
      fill="white"
    />

    <path
      d="M6 3C6.44501 3 6.88002 3.13196 7.25003 3.37919C7.62004 3.62643 7.90843 3.97783 8.07873 4.38896C8.24903 4.8001 8.29358 5.2525 8.20677 5.68895C8.11995 6.12541 7.90566 6.52632 7.59099 6.84099C7.27632 7.15566 6.87541 7.36995 6.43895 7.45677C6.0025 7.54358 5.5501 7.49903 5.13896 7.32873C4.72783 7.15843 4.37643 6.87004 4.12919 6.50003C3.88196 6.13002 3.75 5.69501 3.75 5.25C3.75 4.65326 3.98705 4.08097 4.40901 3.65901C4.83097 3.23705 5.40326 3 6 3ZM6 1.5C5.25832 1.5 4.5333 1.71993 3.91661 2.13199C3.29993 2.54404 2.81928 3.12971 2.53545 3.81494C2.25162 4.50016 2.17736 5.25416 2.32206 5.98159C2.46675 6.70902 2.8239 7.3772 3.34835 7.90165C3.8728 8.4261 4.54098 8.78325 5.26841 8.92795C5.99584 9.07264 6.74984 8.99838 7.43506 8.71455C8.12029 8.43072 8.70596 7.95007 9.11801 7.33339C9.53007 6.7167 9.75 5.99168 9.75 5.25C9.75 4.25544 9.35491 3.30161 8.65165 2.59835C7.94839 1.89509 6.99456 1.5 6 1.5Z"
      fill="white"
    />
  </svg>
);

const Icon02 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3C9.74168 3 10.4667 3.21993 11.0834 3.63199C11.7001 4.04404 12.1807 4.62971 12.4645 5.31494C12.7484 6.00016 12.8226 6.75416 12.6779 7.48159C12.5333 8.20902 12.1761 8.8772 11.6517 9.40165C11.1272 9.9261 10.459 10.2833 9.73159 10.4279C9.00416 10.5726 8.25016 10.4984 7.56494 10.2145C6.87971 9.93072 6.29404 9.45007 5.88199 8.83339C5.46993 8.2167 5.25 7.49168 5.25 6.75C5.25 5.75544 5.64509 4.80161 6.34835 4.09835C7.05161 3.39509 8.00544 3 9 3ZM9 1.5C7.96165 1.5 6.94661 1.80791 6.08326 2.38478C5.2199 2.96166 4.54699 3.7816 4.14963 4.74091C3.75227 5.70022 3.6483 6.75582 3.85088 7.77422C4.05345 8.79262 4.55346 9.72808 5.28769 10.4623C6.02191 11.1965 6.95738 11.6965 7.97578 11.8991C8.99418 12.1017 10.0498 11.9977 11.0091 11.6004C11.9684 11.203 12.7883 10.5301 13.3652 9.66674C13.9421 8.80339 14.25 7.78835 14.25 6.75C14.25 5.35761 13.6969 4.02226 12.7123 3.03769C11.7277 2.05312 10.3924 1.5 9 1.5Z" fill="white" />
    <path d="M16.5 21.75C16.5 22.1642 16.1642 22.5 15.75 22.5C15.3358 22.5 15 22.1642 15 21.75V18.75C15 17.7554 14.6049 16.8016 13.9017 16.0983C13.1984 15.3951 12.2446 15 11.25 15H6.75C5.75544 15 4.80161 15.3951 4.09835 16.0983C3.39509 16.8016 3 17.7554 3 18.75V21.75C3 22.1642 2.66421 22.5 2.25 22.5C1.83579 22.5 1.5 22.1642 1.5 21.75V18.75C1.5 17.3576 2.05312 16.0223 3.03769 15.0377C4.02226 14.0531 5.35761 13.5 6.75 13.5H11.25C12.6424 13.5 13.9777 14.0531 14.9623 15.0377C15.9469 16.0223 16.5 17.3576 16.5 18.75V21.75Z" fill="white" />
    <path d="M18.75 12.135L17.3363 10.7213C17.0442 10.4292 16.5708 10.4292 16.2787 10.7213C15.9867 11.0133 15.9867 11.4867 16.2787 11.7787L18.75 14.25L23.4713 9.52875C23.7633 9.23673 23.7633 8.76327 23.4713 8.47125C23.1792 8.17923 22.7058 8.17923 22.4138 8.47125L18.75 12.135Z" fill="white" />
  </svg>
)

const Icon03 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 14H16.51M3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7L5 7C3.89543 7 3 6.10457 3 5ZM3 5C3 3.89543 3.89543 3 5 3H17M17 14C17 14.2761 16.7761 14.5 16.5 14.5C16.2239 14.5 16 14.2761 16 14C16 13.7239 16.2239 13.5 16.5 13.5C16.7761 13.5 17 13.7239 17 14Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

const Icon04 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.7691 2.24268C21.6565 2.13075 21.5142 2.05325 21.359 2.0193C21.2038 1.98535 21.0422 1.99636 20.893 2.05103L2.53842 8.71735C2.38012 8.77732 2.24384 8.88397 2.14767 9.02313C2.05151 9.16229 2 9.32738 2 9.49648C2 9.66557 2.05151 9.83066 2.14767 9.96982C2.24384 10.109 2.38012 10.2156 2.53842 10.2756L10.5477 13.4754L13.7514 21.475C13.8116 21.6262 13.9148 21.7564 14.0482 21.8497C14.1817 21.943 14.3395 21.9953 14.5023 22C14.6709 21.9965 14.8345 21.9421 14.9715 21.844C15.1085 21.7458 15.2126 21.6084 15.2699 21.45L21.9443 3.11764C22.0011 2.97021 22.0148 2.80968 21.9838 2.65476C21.9528 2.49985 21.8783 2.35694 21.7691 2.24268ZM14.5023 18.8335L12.1746 13.0005L15.582 9.59718C15.9071 9.27245 15.9071 8.74555 15.582 8.42082C15.2574 8.09665 14.7316 8.09665 14.4071 8.42082L10.9649 11.8589L5.15812 9.50064L19.7834 4.22591L14.5023 18.8335Z" fill="white" />
  </svg>
)

function DashboardPageContent() {
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
    betType?: BetType;
    legs?: LiveArbLeg[];
    isLiveData?: boolean;
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
  const [includeSelfInLeaderboard, setIncludeSelfInLeaderboard] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [liveArbRows, setLiveArbRows] = useState<DashboardArbRow[]>([]);
  const [liveEvRows, setLiveEvRows] = useState<DashboardArbRow[]>([]);
  const [arbFeedStatus, setArbFeedStatus] = useState<"connecting" | "live" | "empty" | "offline">("connecting");
  const [evFeedStatus, setEvFeedStatus] = useState<"connecting" | "live" | "empty" | "offline">("connecting");
  const [savedBetStatus, setSavedBetStatus] = useState("");
  const [savedBets, setSavedBets] = useState<SavedBet[]>([]);
  const [savedBetsOpen, setSavedBetsOpen] = useState(false);
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

  const leaderboardPreviewBoards = [
    {
      className: "leaderboard-card-01",
      icon: <Icon01 />,
      label: "24h cash",
      title: "Top earners",
      highlight: "NovaSkies",
      value: "+$4,820",
    },
    {
      className: "leaderboard-card-02",
      icon: <Icon02 />,
      label: "Locked in",
      title: "Win streaks",
      highlight: "JetPulse",
      value: "13 wins",
    },
    {
      className: "leaderboard-card-03",
      icon: <Icon03 />,
      label: "Efficiency",
      title: "ROI leaders",
      highlight: "SignalMint",
      value: "28.4%",
    },
    {
      className: "leaderboard-card-04",
      icon: <Icon04 />,
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

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    let isMounted = true;

    fetch(`${apiBase}/saved-bets`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    })
      .then((response) => {
        if (redirectIfUnauthorized(response)) {
          throw new Error("Unauthorized");
        }
        if (!response.ok) {
          throw new Error(`Saved bets request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: SavedBet[]) => {
        if (isMounted) {
          setSavedBets(payload);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSavedBetStatus("Could not load saved bets. Please refresh and try again.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    let isMounted = true;

    fetch(`${apiBase}/v1/arbs?sport=all&limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((response) => {
        if (redirectIfUnauthorized(response)) {
          throw new Error("Unauthorized");
        }
        if (!response.ok) {
          throw new Error(`Arb feed request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { arbs?: LiveArbPayload[] }) => {
        if (!isMounted) {
          return;
        }
        const rows = (payload.arbs ?? []).map(mapArbPayloadToRow);
        setLiveArbRows(rows);
        setArbFeedStatus(rows.length ? "live" : "empty");
      })
      .catch(() => {
        if (isMounted) {
          setArbFeedStatus("offline");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    let isMounted = true;

    fetch(`${apiBase}/v1/evs?sport=all&limit=50`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      cache: "no-store",
    })
      .then((response) => {
        if (redirectIfUnauthorized(response)) {
          throw new Error("Unauthorized");
        }
        if (!response.ok) {
          throw new Error(`EV feed request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { evs?: LiveEvPayload[] }) => {
        if (!isMounted) {
          return;
        }
        const rows = (payload.evs ?? []).map(mapEvPayloadToRow);
        setLiveEvRows(rows);
        setEvFeedStatus(rows.length ? "live" : "empty");
      })
      .catch(() => {
        if (isMounted) {
          setEvFeedStatus("offline");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!wsToken) {
      return;
    }
    const wsUrl =
      apiBase.replace(/^http/i, "ws").replace(/\/$/, "") +
      `/ws/arbs?token=${encodeURIComponent(wsToken)}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => setArbFeedStatus((current) => (current === "live" ? "live" : "empty"));
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as LiveArbPayload & { type?: string };
        if (payload.type === "ping" || !payload.arb_id) {
          return;
        }
        const row = mapArbPayloadToRow(payload);
        setLiveArbRows((current) => {
          const next = [row, ...current.filter((item) => item.id !== row.id)];
          return next.slice(0, 50);
        });
        setArbFeedStatus("live");
      } catch {
        setArbFeedStatus("offline");
      }
    };
    socket.onerror = () => setArbFeedStatus("offline");

    return () => {
      socket.close();
    };
  }, []);

  const liveTableRows: {
    start: string;
    sport: string;
    league: string;
    match: string;
    betType: BetType;
    odds: string;
    edge: string;
    netProfit: string;
    payoutBoost: number;
    tags: LiveFilter[];
    legs: LiveArbLeg[];
    isLiveData: boolean;
  }[] = [...liveArbRows, ...liveEvRows].map((row) => {
    const firstLeg = row.legs[0];
    const odds = firstLeg
      ? String(firstLeg.odds_american ?? decimalToAmerican(Number(firstLeg.odds_decimal)))
      : "--";
    const roiPercent = row.roi * 100;
    const tags: LiveFilter[] = [];
    if (row.isLive) {
      tags.push("Live now");
    }
    if (roiPercent >= 5) {
      tags.push("High payout");
    }
    if (roiPercent >= 3) {
      tags.push("Trending");
    }
    if (tags.length === 0) {
      tags.push("Trending");
    }
    return {
      start: row.start,
      sport: row.sport,
      league: row.league,
      match: row.match,
      betType: row.betType,
      odds,
      edge: `${roiPercent.toFixed(1)}%`,
      netProfit: row.netProfit,
      payoutBoost: row.roi,
      tags,
      legs: row.legs,
      isLiveData: row.isLiveData,
    };
  });
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
  const arbTableRows = arbEvView === "arb" ? liveArbRows : liveEvRows;
  const filteredArbRows = arbTableRows.filter(
    (row) =>
      // Arbitrage only surfaces positive net-profit bets.
      (arbEvView !== "arb" || row.roi > 0) &&
      activeArbBetTypes.includes(row.betType)
  );
  const visibleArbRows = filteredArbRows.slice(0, 3);
  const bestArbEdge = liveArbRows.length
    ? `${(Math.max(...liveArbRows.map((row) => row.roi)) * 100).toFixed(2)}%`
    : "Waiting";
  const topArbSport = liveArbRows[0]?.sport ?? "Waiting";
  const bestEvEdge = liveEvRows.length
    ? `${(Math.max(...liveEvRows.map((row) => row.roi)) * 100).toFixed(1)}% EV`
    : "Waiting";
  const topEvSport = liveEvRows[0]?.sport ?? "Waiting";
  const allLiveBetTypesSelected = selectedLiveBetTypes.length === ALL_BET_TYPES.length;
  const allArbBetTypesSelected = activeArbBetTypes.length === ALL_BET_TYPES.length;

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
    betType,
    legs,
    isLiveData,
  }: {
    id: string;
    board: "Live bets" | "Arbitrage" | "EV";
    start: string;
    sport: string;
    league: string;
    match: string;
    odds?: string;
    betType?: BetType;
    legs?: LiveArbLeg[];
    isLiveData?: boolean;
  }): EventPopout => {
    const parsed = parseMatchup(match, odds);
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
      isLiveData,
    };
  };
  const openEventPopout = (event: EventPopout) => {
    setEventPopout(event);
    setManualEntryMode(false);
    setManualOddsA(event.oddsA);
    setManualOddsB(event.oddsB);
    setSavedBetStatus("");
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
    const saveBetToAccount = async () => {
      const savedBet = {
        sourceId: eventPopout.id,
        board: eventPopout.board,
        matchup: eventPopout.match,
        sport: eventPopout.sport,
        league: eventPopout.league,
        betType: eventPopout.betType ?? "moneyline",
        oddsA: activeOddsA,
        oddsB: activeOddsB,
        estimatedNet: Number(calculatedNetProfit),
        legs: eventPopout.legs ?? [],
      };
      setSavedBetStatus("Saving to your account…");
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
        const response = await fetch(`${apiBase}/saved-bets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(savedBet),
        });
        if (redirectIfUnauthorized(response)) {
          return;
        }
        if (!response.ok) {
          throw new Error(`Save failed: ${response.status}`);
        }
        const saved = (await response.json()) as SavedBet;
        setSavedBets((current) => [saved, ...current].slice(0, 100));
        setSavedBetsOpen(true);
        setSavedBetStatus("Saved to your account");
      } catch {
        setSavedBetStatus("Could not save bet. Please try again.");
      }
    };
    const openBetLeg = (leg: LiveArbLeg) => {
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
              onClick={saveBetToAccount}
            >
              Enter bet
            </button>
          </div>
          {savedBetStatus ? (
            <div className="dashboard-event-popout-saved">{savedBetStatus}</div>
          ) : null}
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
        <section className="dashboard-panel dashboard-saved-bets" aria-label="Saved bets">
          <div className="dashboard-panel-header">
            <h2>Saved bets ({savedBets.length})</h2>
            <button
              type="button"
              className="dashboard-panel-close"
              aria-expanded={savedBetsOpen}
              onClick={() => setSavedBetsOpen((open) => !open)}
            >
              {savedBetsOpen ? "Hide" : "Show"}
            </button>
          </div>
          {savedBetsOpen ? (
            <div className="dashboard-panel-body">
              {savedBets.length === 0 ? (
                <p>No saved bets yet. Save one from a bet card to find it here.</p>
              ) : (
                savedBets.map((bet) => (
                  <div className="dashboard-arb-row" key={bet.id}>
                    <span>{bet.matchup}</span>
                    <span>{bet.sport} · {bet.betType}</span>
                    <span>Odds {bet.oddsA} / {bet.oddsB}</span>
                    <span>Est. net ${Number(bet.estimatedNet).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                        const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
                        const response = await fetch(`${apiBase}/saved-bets/${bet.id}`, {
                          method: "DELETE",
                          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                        });
                        if (redirectIfUnauthorized(response)) {
                          return;
                        }
                        if (response.ok) {
                          setSavedBets((current) => current.filter((item) => item.id !== bet.id));
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </section>
        <div
          className={`dashboard-layout${expandedPanel ? " dashboard-layout--expanded" : ""
            }`}
        >
          <section
            className={`dashboard-content${expandedPanel ? " dashboard-content--expanded" : ""
              }`}
            aria-label="Dashboard content"
          >
            <section
              className={`dashboard-panel dashboard-panel--live dashboard-expandable${isLiveExpanded ? " is-expanded" : ""
                }`}
              aria-label="Live bets"
            >
              <div className="dashboard-panel-header">
                <h2>Live bets</h2>
                <div className="dashboard-panel-tracker-toggle dashboard-panel-tracker-toggle--corner">
                  <span>Add to Profit Tracker</span>
                  <button
                    type="button"
                    className={`dashboard-event-toggle ${liveTabProfitTracker ? "is-on" : "is-off"
                      }`}
                    aria-pressed={liveTabProfitTracker}
                    onClick={() => setLiveTabProfitTracker((prev) => !prev)}
                  >
                    <span className="dashboard-event-toggle-label">
                      {liveTabProfitTracker ? "YES" : "NO"}
                    </span>

                    <span
                      className="dashboard-event-toggle-knob"
                      aria-hidden="true"
                    />
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
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.45467 7.2731L-0.000148881 1.81828L1.81813 4.84939e-06L7.27295 5.45483L12.7278 4.84939e-06L14.546 1.81828L9.09122 7.2731L14.546 12.7279L12.7278 14.5462L7.27295 9.09138L1.81813 14.5462L-0.000148881 12.7279L5.45467 7.2731Z" fill="currentColor" />
                    </svg>
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
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.71429 10.2857H0V7.71429H7.71429V0H10.2857V7.71429H18V10.2857H10.2857V18H7.71429V10.2857Z" fill="currentColor" />
                    </svg>

                  </button>
                )}
              </div>
              <div className="dashboard-panel-body">
                <div className="dashboard-bet-type-filter-row">
                  <button
                    type="button"
                    className={`dashboard-bet-type-pill${allLiveBetTypesSelected ? " is-active" : ""
                      }`}
                    onClick={() => setSelectedLiveBetTypes([...ALL_BET_TYPES])}
                  >
                    All bets
                  </button>
                  {BET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={`live-${option.value}`}
                      type="button"
                      className={`dashboard-bet-type-pill${selectedLiveBetTypes.includes(option.value) ? " is-active" : ""
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
                          className={`dashboard-arb-row${eventPopout?.id === `live-${row.start}-${row.match}`
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
                                betType: row.betType,
                                legs: row.legs,
                                isLiveData: row.isLiveData,
                              })
                            )
                          }
                        >
                          <span className="dashboard-arb-cell dashboard-arb-cell--time">
                            {row.tags.includes("Live now") ? (
                              <span className="dashboard-live-time-badge">Live</span>
                            ) : (
                              row.start
                            )}
                          </span>
                          <span className="dashboard-arb-cell dashboard-arb-cell--details">
                            <span className="dashboard-arb-league">{row.league}</span>
                            <span className="dashboard-arb-match">{row.match}</span>
                            <span className="dashboard-arb-sport">{row.sport}</span>
                            <span className="dashboard-net-profit-badge">
                              Net {row.netProfit}
                            </span>
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
                    <div className="dashboard-live-filters">
                      <div className="dashboard-live-tabs">
                        {liveSportTabs.map((sport) => (
                          <button
                            key={sport}
                            type="button"
                            className={`dashboard-live-tab${activeSport === sport ? " is-active" : ""
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
                            className={`dashboard-live-pill${activeFilter === filter ? " is-active" : ""
                              }`}
                            onClick={() => setActiveFilter(filter)}
                          >
                            {filter}
                          </button>
                        ))}
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
                        <span role="columnheader">Net profit</span>
                      </div>
                      {filteredLiveRows.length === 0 ? (
                        <div className="dashboard-bet-type-empty" role="row">
                          No live bets match the current sport, board, and bet-type filters.
                        </div>
                      ) : null}
                      {filteredLiveRows.map((row) => (
                        <Fragment key={`${row.start}-${row.match}`}>
                          <div
                            className={`dashboard-arb-row${eventPopout?.id === `live-${row.start}-${row.match}`
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
                                  betType: row.betType,
                                  legs: row.legs,
                                  isLiveData: row.isLiveData,
                                })
                              )
                            }
                          >
                            <span className="dashboard-arb-cell dashboard-arb-cell--time">
                              {row.tags.includes("Live now") ? (
                                <span className="dashboard-live-time-badge">Live</span>
                              ) : (
                                row.start
                              )}
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
                            <span className="dashboard-arb-cell dashboard-arb-cell--net">
                              {row.netProfit}
                            </span>
                          </div>
                          {renderEventDropdown(`live-${row.start}-${row.match}`)}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section
              className="dashboard-leaderboard dashboard-leaderboard--compact dashboard-expandable dashboard-panel"
              aria-label="Leaderboard preview"
            >
              <div className="dashboard-leaderboard-header dashboard-panel-header">
                <div className="dashboard-arb-header-left">
                  <h2>Leaderboard hub</h2>
                  <p>Quick snapshot of the boards. Open the full hub for rankings and details.</p>
                </div>
                <div className="dashboard-leaderboard-header-actions">
                  <span className="dashboard-leaderboard-pill">Updated 5m ago</span>
                  <div className="dashboard-leaderboard-self-toggle">
                    <div>
                      <span>Include yourself</span>
                      <p>Add your row to the board.</p>
                    </div>
                    <button
                      type="button"
                      className={`dashboard-event-toggle ${includeSelfInLeaderboard ? "is-on" : "is-off"
                        }`}
                      aria-pressed={includeSelfInLeaderboard}
                      aria-label="Include yourself in dashboard leaderboard"
                      onClick={() =>
                        setIncludeSelfInLeaderboard((current) => !current)
                      }
                    >
                      <span className="dashboard-event-toggle-label">
                        {includeSelfInLeaderboard ? "ON" : "OFF"}
                      </span>

                      <span
                        className="dashboard-event-toggle-knob"
                        aria-hidden="true"
                      />
                    </button>
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
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.71429 10.2857H0V7.71429H7.71429V0H10.2857V7.71429H18V10.2857H10.2857V18H7.71429V10.2857Z" fill="currentColor"></path></svg>
                  </button>
                </div>
              </div>
              <div className="dashboard-panel-body">

                <div className="dashboard-leaderboard-mini-grid">
                  {leaderboardPreviewBoards.map((board) => (
                    <div className={`dashboard-leaderboard-mini-card ${board.className}`} key={board.title}>
                      <div className="card-box">
                        <i>{board.icon}</i>
                        <div className="">
                          <span>{board.label}</span>
                          <strong>{board.title}</strong>
                        </div>
                      </div>
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
              </div>
            </section>
            <section
              id="arbitrage-bets"
              className={`${arbEvView === "arb" ? "dashboard-arb" : "dashboard-ev"
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
                        className={`dashboard-arb-toggle${arbEvView === "arb" ? " is-active" : " is-off"
                          }`}
                        onClick={() => setArbEvView("arb")}
                      >
                        Arb
                      </button>
                      <button
                        type="button"
                        className={`dashboard-arb-toggle${arbEvView === "ev" ? " is-active" : " is-off"
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
                      ? arbFeedStatus === "live"
                        ? "Live arb board synced from backend feed."
                        : "Current arb board will switch to live opportunities when the feed publishes."
                      : evFeedStatus === "live"
                        ? "Positive EV board synced from backend feed."
                        : "Positive EV opportunities will appear here when the feed publishes."}
                  </p>
                </div>
                <div className="dashboard-compact-stats">
                  <div className="dashboard-compact-stat">
                    <span>{arbEvView === "arb" ? "Live arbs" : "Live +EV"}</span>
                    <strong>{arbEvView === "arb" ? liveArbRows.length : liveEvRows.length}</strong>
                  </div>
                  <div className="dashboard-compact-stat">
                    <span>Top sport</span>
                    <strong>{arbEvView === "arb" ? topArbSport : topEvSport}</strong>
                  </div>
                  <div className="dashboard-compact-stat">
                    <span>Best edge</span>
                    <strong>{arbEvView === "arb" ? bestArbEdge : bestEvEdge}</strong>
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
                  className={`dashboard-event-toggle${isCurrentTabTracked ? " is-on" : " is-off"
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
                    className={`dashboard-bet-type-pill${allArbBetTypesSelected ? " is-active" : ""
                      }`}
                    onClick={() => setActiveArbEvBetTypes([...ALL_BET_TYPES])}
                  >
                    All bets
                  </button>
                  {BET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={`${arbEvView}-${option.value}`}
                      type="button"
                      className={`dashboard-bet-type-pill${activeArbBetTypes.includes(option.value) ? " is-active" : ""
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
                {visibleArbRows.map((row) => {
                  const rowId = `${arbEvView}-${row.id}`;
                  return (
                    <Fragment key={rowId}>
                      <div
                        className={`dashboard-arb-row${eventPopout?.id === rowId ? " is-selected" : ""
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
                              isLiveData: row.isLiveData,
                            })
                          )
                        }
                      >
                        <span className="dashboard-arb-cell dashboard-arb-cell--time">
                          {row.isLive ? (
                            <span className="dashboard-live-badge">
                              <span className="dashboard-live-dot" aria-hidden="true" />
                              Live
                            </span>
                          ) : (
                            row.start
                          )}
                        </span>
                        <span className="dashboard-arb-cell dashboard-arb-cell--details">
                          <span className="dashboard-arb-league">{row.league}</span>
                          <span className="dashboard-arb-match">{row.match}</span>
                          <span className="dashboard-arb-sport">{row.sport}</span>
                          <span className="dashboard-net-profit-badge">
                            Edge {row.netProfit}
                          </span>
                          <span className="dashboard-bet-type-badge dashboard-bet-type-badge--inline">
                            {BET_TYPE_LABELS[row.betType]}
                          </span>
                        </span>
                      </div>
                      {renderEventDropdown(rowId)}
                    </Fragment>
                  );
                })}
              </div>
            </section>
            <section
              className={`dashboard-withdrawal dashboard-expandable${isWithdrawalExpanded ? " is-expanded" : ""
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
                        className={`dashboard-withdrawal-toggle${withdrawalSpeed === "Instant" ? " is-active" : " is-off"
                          }`}
                        onClick={() => setWithdrawalSpeed("Instant")}
                      >
                        Instant
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${withdrawalSpeed === "Standard" ? " is-active" : " is-off"
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
                        className={`dashboard-withdrawal-way${withdrawalMethod === "Bank" ? " is-active" : ""
                          }`}
                        onClick={() => setWithdrawalMethod("Bank")}
                      >
                        Bank
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-way${withdrawalMethod === "Card" ? " is-active" : ""
                          }`}
                        onClick={() => setWithdrawalMethod("Card")}
                      >
                        Card
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-way${withdrawalMethod === "Crypto" ? " is-active" : ""
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
                        className={`dashboard-withdrawal-toggle${withdrawalAuto === "Yes" ? " is-active" : " is-off"
                          }`}
                        onClick={() => setWithdrawalAuto("Yes")}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`dashboard-withdrawal-toggle${withdrawalAuto === "No" ? " is-active" : " is-off"
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
              className={`dashboard-tools dashboard-expandable${isToolsExpanded ? " is-expanded" : ""
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
              className={`dashboard-panel dashboard-panel--chat dashboard-expandable${isChatExpanded ? " is-expanded" : ""
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
                          className={`dashboard-chat-filter${chatFilter === filter ? " is-active" : ""
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
        onClose={() => setIsBetCalculatorOpen(false)}
        onModeChange={setBetCalculatorMode}
      />

    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardPageContent />
    </RequireAuth>
  );
}
