"use client";

import { useEffect, useMemo, useState } from "react";

type LeaderboardBoardId = "top-earners" | "win-streaks" | "roi-leaders" | "climb-watch";

type LeaderboardEntry = {
  rank: string;
  name: string;
  focus: string;
  rate: string;
  value: string;
};

type LeaderboardMetric = {
  label: string;
  value: string;
  detail: string;
};

type LeaderboardBoard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlight: string;
  updated: string;
  valueLabel: string;
  metrics: LeaderboardMetric[];
  entries: LeaderboardEntry[];
  feed: Array<{ label: string; value: string }>;
};

type LeaderboardHubProps = {
  isExpanded?: boolean;
  standalone?: boolean;
  onExpand?: () => void;
  onClose?: () => void;
};

type MedalTone = "gold" | "silver" | "red" | null;
type LeaderboardVisibility = "open" | "closed" | "invite-only";

type CreatedLeaderboard = {
  id: string;
  name: string;
  description: string;
  visibility: LeaderboardVisibility;
  inviteCode: string | null;
  memberCount: number;
  board: LeaderboardBoard;
};

const SAVED_EMAIL_KEY = "unbounded.saved_email";

const leaderboardBoards: LeaderboardBoard[] = [
  {
    id: "top-earners",
    eyebrow: "24h cash",
    title: "Top earners",
    description: "Highest rolling 24-hour net profit across tracked slips.",
    highlight: "NovaSkies +$4,820",
    updated: "Updated 5m ago",
    valueLabel: "24h profit",
    metrics: [
      { label: "Biggest streak", value: "11 wins", detail: "NovaSkies • +$1,420" },
      { label: "Best close rate", value: "68%", detail: "Top 20 tracked bettors" },
      { label: "Hottest market", value: "NBA live", detail: "Avg +$412 this session" },
    ],
    entries: [
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
      {
        rank: "04",
        name: "SignalForge",
        focus: "Baseball props",
        rate: "59%",
        value: "+$3,210",
      },
      {
        rank: "05",
        name: "HighRoller",
        focus: "Mixed board",
        rate: "57%",
        value: "+$2,980",
      },
    ],
    feed: [
      { label: "CoastEdge hit +210 live ML", value: "+$420" },
      { label: "SignalForge landed a 4-leg parlay", value: "+$610" },
      { label: "HighRoller closed a hedge ladder", value: "+$390" },
    ],
  },
  {
    id: "win-streaks",
    eyebrow: "Locked in",
    title: "Win streaks",
    description: "Longest active runs for bettors on tracked boards right now.",
    highlight: "JetPulse 13 straight",
    updated: "Updated 2m ago",
    valueLabel: "Streak",
    metrics: [
      { label: "Longest active", value: "13 wins", detail: "JetPulse • football props" },
      { label: "Median streak", value: "6 wins", detail: "Top 25 board average" },
      { label: "Quick riser", value: "+4 wins", detail: "PrimeRally in the last hour" },
    ],
    entries: [
      {
        rank: "01",
        name: "JetPulse",
        focus: "Football props",
        rate: "72%",
        value: "13 wins",
      },
      {
        rank: "02",
        name: "NorthSignal",
        focus: "NBA spreads",
        rate: "69%",
        value: "10 wins",
      },
      {
        rank: "03",
        name: "PrimeRally",
        focus: "Same-game slips",
        rate: "67%",
        value: "9 wins",
      },
      {
        rank: "04",
        name: "LateSteam",
        focus: "Soccer ML",
        rate: "65%",
        value: "8 wins",
      },
      {
        rank: "05",
        name: "BullMark",
        focus: "MLB totals",
        rate: "63%",
        value: "7 wins",
      },
    ],
    feed: [
      { label: "JetPulse extended the streak on a +118 prop", value: "13th win" },
      { label: "PrimeRally added another boosted same-game slip", value: "9th win" },
      { label: "BullMark cashed a late under 8.5", value: "7th win" },
    ],
  },
  {
    id: "roi-leaders",
    eyebrow: "Efficiency",
    title: "ROI leaders",
    description: "Best return on stake over the current seven-day window.",
    highlight: "SignalMint 28.4% ROI",
    updated: "Updated 7m ago",
    valueLabel: "ROI",
    metrics: [
      { label: "Top ROI", value: "28.4%", detail: "SignalMint over 34 tracked bets" },
      { label: "Most efficient sport", value: "Soccer", detail: "Avg 18.2% board ROI" },
      { label: "Best book mix", value: "3 books", detail: "Top 10 board average" },
    ],
    entries: [
      {
        rank: "01",
        name: "SignalMint",
        focus: "Soccer totals",
        rate: "63%",
        value: "28.4%",
      },
      {
        rank: "02",
        name: "NovaSkies",
        focus: "NBA live",
        rate: "66%",
        value: "24.1%",
      },
      {
        rank: "03",
        name: "IceLine",
        focus: "NFL alt lines",
        rate: "61%",
        value: "22.7%",
      },
      {
        rank: "04",
        name: "HarborStack",
        focus: "MLB props",
        rate: "58%",
        value: "20.9%",
      },
      {
        rank: "05",
        name: "CornerCase",
        focus: "Soccer cards",
        rate: "60%",
        value: "19.8%",
      },
    ],
    feed: [
      { label: "SignalMint cleared another +EV ladder", value: "+3.2% ROI" },
      { label: "HarborStack climbed after a +240 prop hit", value: "+2.1% ROI" },
      { label: "CornerCase moved into the top five", value: "+1.6% ROI" },
    ],
  },
  {
    id: "climb-watch",
    eyebrow: "Momentum",
    title: "Climb watch",
    description: "Fastest movers across all boards during the latest session.",
    highlight: "PrimeRally +8 spots",
    updated: "Updated 1m ago",
    valueLabel: "Position change",
    metrics: [
      { label: "Fastest rise", value: "+8 spots", detail: "PrimeRally in 45 minutes" },
      { label: "Most new entries", value: "6 players", detail: "Entered top 25 today" },
      { label: "Steadiest climb", value: "3 sessions", detail: "SignalForge trending upward" },
    ],
    entries: [
      {
        rank: "01",
        name: "PrimeRally",
        focus: "Same-game slips",
        rate: "67%",
        value: "+8",
      },
      {
        rank: "02",
        name: "SignalForge",
        focus: "MLB props",
        rate: "59%",
        value: "+7",
      },
      {
        rank: "03",
        name: "LateSteam",
        focus: "Soccer ML",
        rate: "65%",
        value: "+6",
      },
      {
        rank: "04",
        name: "JetPulse",
        focus: "Football props",
        rate: "72%",
        value: "+5",
      },
      {
        rank: "05",
        name: "CornerCase",
        focus: "Soccer cards",
        rate: "60%",
        value: "+4",
      },
    ],
    feed: [
      { label: "PrimeRally jumped after two straight live closes", value: "+8 spots" },
      { label: "SignalForge moved into the top ten", value: "+7 spots" },
      { label: "LateSteam rode a late soccer slate", value: "+6 spots" },
    ],
  },
];

const joinableLeaderboards: CreatedLeaderboard[] = [
  {
    id: "overall-2026",
    name: "Overall 2026 Leaderboard",
    description: "The broad seasonal board starting with the overall standings.",
    visibility: "open",
    inviteCode: null,
    memberCount: 548,
    board: {
      id: "overall-2026",
      eyebrow: "Overall",
      title: "Overall 2026 Leaderboard",
      description: "Season-long overall leaderboard across tracked action, momentum, and review quality.",
      highlight: "NovaSkies season lead",
      updated: "Season board",
      valueLabel: "Season total",
      metrics: [
        { label: "Season leader", value: "+$38,420", detail: "NovaSkies across 2026 tracked action" },
        { label: "Cut line", value: "Top 100", detail: "Starts at +$6,440" },
        { label: "Fastest climb", value: "+12 spots", detail: "PrimeRally this week" },
      ],
      entries: [
        { rank: "01", name: "NovaSkies", focus: "All boards", rate: "66%", value: "+$38,420" },
        { rank: "02", name: "SignalMint", focus: "EV and props", rate: "64%", value: "+$34,960" },
        { rank: "03", name: "JetPulse", focus: "Live football", rate: "68%", value: "+$31,780" },
        { rank: "04", name: "IceLine", focus: "Alt lines", rate: "61%", value: "+$28,540" },
        { rank: "05", name: "PrimeRally", focus: "Same-game slips", rate: "63%", value: "+$27,910" },
      ],
      feed: [],
    },
  },
  {
    id: "houses-ladder",
    name: "House Ladder",
    description: "A rolling board for smaller private groups tracking weekly movement.",
    visibility: "closed",
    inviteCode: null,
    memberCount: 72,
    board: {
      id: "houses-ladder",
      eyebrow: "Private groups",
      title: "House Ladder",
      description: "Closed leaderboard for smaller house boards and weekly internal movement.",
      highlight: "CornerCase +5 places",
      updated: "Updated 11m ago",
      valueLabel: "Weekly total",
      metrics: [
        { label: "Current leader", value: "+$8,240", detail: "CornerCase leads this week" },
        { label: "Board size", value: "72 members", detail: "Closed review-only board" },
        { label: "Median ROI", value: "14.2%", detail: "Last seven days" },
      ],
      entries: [
        { rank: "01", name: "CornerCase", focus: "Soccer cards", rate: "62%", value: "+$8,240" },
        { rank: "02", name: "HarborStack", focus: "MLB props", rate: "59%", value: "+$7,910" },
        { rank: "03", name: "BullMark", focus: "Totals mix", rate: "58%", value: "+$7,360" },
        { rank: "04", name: "LateSteam", focus: "Soccer ML", rate: "60%", value: "+$6,940" },
        { rank: "05", name: "PrimeRally", focus: "Same-game slips", rate: "63%", value: "+$6,710" },
      ],
      feed: [],
    },
  },
  {
    id: "sharp-room",
    name: "Sharp Room",
    description: "Invite-only room for tighter sharing and tracked streaks.",
    visibility: "invite-only",
    inviteCode: "SHARP-2026",
    memberCount: 19,
    board: {
      id: "sharp-room",
      eyebrow: "Invite only",
      title: "Sharp Room",
      description: "Invite-only board focused on streak quality and high-conviction slip review.",
      highlight: "JetPulse 9 straight",
      updated: "Invite room",
      valueLabel: "Current run",
      metrics: [
        { label: "Best run", value: "9 wins", detail: "JetPulse active right now" },
        { label: "Members", value: "19", detail: "Invite-only room" },
        { label: "Board ROI", value: "19.1%", detail: "Last 30 days" },
      ],
      entries: [
        { rank: "01", name: "JetPulse", focus: "Football props", rate: "71%", value: "9 wins" },
        { rank: "02", name: "SignalForge", focus: "Baseball props", rate: "64%", value: "7 wins" },
        { rank: "03", name: "NovaSkies", focus: "Live mix", rate: "66%", value: "6 wins" },
        { rank: "04", name: "IceLine", focus: "Alt lines", rate: "61%", value: "5 wins" },
        { rank: "05", name: "HarborStack", focus: "MLB props", rate: "59%", value: "4 wins" },
      ],
      feed: [],
    },
  },
];

const getMedalTone = (rank: string): MedalTone => {
  if (rank === "01") {
    return "gold";
  }
  if (rank === "02") {
    return "silver";
  }
  if (rank === "03") {
    return "red";
  }
  return null;
};

const buildCustomBoard = ({
  id,
  name,
  description,
  visibility,
  memberCount,
}: {
  id: string;
  name: string;
  description: string;
  visibility: LeaderboardVisibility;
  memberCount: number;
}): LeaderboardBoard => ({
  id,
  eyebrow:
    visibility === "invite-only"
      ? "Invite only"
      : visibility === "closed"
        ? "Closed"
        : "Open",
  title: name,
  description:
    description ||
    (visibility === "open"
      ? "Open board ready for broader competition and leaderboard discovery."
      : visibility === "closed"
        ? "Closed board with moderated joining and tighter membership."
        : "Invite-only leaderboard for private groups and selective access."),
  highlight: `${memberCount} member${memberCount === 1 ? "" : "s"}`,
  updated: "Custom board",
  valueLabel: visibility === "invite-only" ? "Current run" : "30d profit",
  metrics: [
    { label: "Members", value: String(memberCount), detail: "Current tracked participants" },
    { label: "Board type", value: visibility, detail: "Privacy and join behavior" },
    { label: "Primary focus", value: "Mixed action", detail: "Custom-created leaderboard" },
  ],
  entries: [
    { rank: "01", name: "You", focus: "Starting entry", rate: "58%", value: visibility === "invite-only" ? "3 wins" : "+$1,420" },
    { rank: "02", name: "SignalForge", focus: "Shared board", rate: "57%", value: visibility === "invite-only" ? "2 wins" : "+$1,160" },
    { rank: "03", name: "PrimeRally", focus: "Shared board", rate: "56%", value: visibility === "invite-only" ? "2 wins" : "+$980" },
    { rank: "04", name: "IceLine", focus: "Shared board", rate: "54%", value: visibility === "invite-only" ? "1 win" : "+$740" },
    { rank: "05", name: "CornerCase", focus: "Shared board", rate: "53%", value: visibility === "invite-only" ? "1 win" : "+$520" },
  ],
  feed: [],
});

const VISIBILITY_OPTIONS: Array<{
  value: LeaderboardVisibility;
  label: string;
  description: string;
}> = [
  {
    value: "open",
    label: "Open",
    description: "Anyone can find the board and join immediately.",
  },
  {
    value: "closed",
    label: "Closed",
    description: "The board is visible, but new members require approval.",
  },
  {
    value: "invite-only",
    label: "Invite-only",
    description: "Only people with the invite code can access the board.",
  },
];

const formatDisplayName = (value: string | null) => {
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
};

const buildInviteCode = (name: string) => {
  const normalized = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${normalized || "BOARD"}-${suffix}`;
};

const getCurrentUserEntry = (
  boardId: LeaderboardBoardId,
  userName: string
): LeaderboardEntry => {
  const baseEntries: Record<LeaderboardBoardId, Omit<LeaderboardEntry, "name">> = {
    "top-earners": {
      rank: "142",
      focus: "Your tracked bets",
      rate: "54%",
      value: "+$1,180",
    },
    "win-streaks": {
      rank: "91",
      focus: "Mixed board",
      rate: "56%",
      value: "4 wins",
    },
    "roi-leaders": {
      rank: "103",
      focus: "Personal blend",
      rate: "55%",
      value: "12.6%",
    },
    "climb-watch": {
      rank: "88",
      focus: "Mixed board",
      rate: "57%",
      value: "+2",
    },
  };

  return {
    ...baseEntries[boardId],
    name: userName,
  };
};

export function LeaderboardHub({
  isExpanded = false,
  standalone = false,
  onExpand,
  onClose,
}: LeaderboardHubProps) {
  const [selectedBoardId, setSelectedBoardId] =
    useState<string>("top-earners");
  const [includeSelfInOverall, setIncludeSelfInOverall] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("You");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdLeaderboards, setCreatedLeaderboards] = useState<CreatedLeaderboard[]>([]);
  const [joinedLeaderboards, setJoinedLeaderboards] = useState<CreatedLeaderboard[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isBoardPickerOpen, setIsBoardPickerOpen] = useState(false);
  const [leaderboardName, setLeaderboardName] = useState("");
  const [leaderboardDescription, setLeaderboardDescription] = useState("");
  const [leaderboardVisibility, setLeaderboardVisibility] =
    useState<LeaderboardVisibility>("open");
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!standalone) {
      return;
    }

    setCurrentUserName(formatDisplayName(window.localStorage.getItem(SAVED_EMAIL_KEY)));
  }, [standalone]);

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCreateModalOpen(false);
        setCreateError(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCreateModalOpen]);

  const allBoards = useMemo(
    () => [
      ...joinableLeaderboards.map((board) => board.board),
      ...leaderboardBoards,
      ...joinedLeaderboards.map((board) => board.board),
      ...createdLeaderboards.map((board) => board.board),
    ],
    [createdLeaderboards, joinedLeaderboards]
  );
  const activeBoard =
    allBoards.find((board) => board.id === selectedBoardId) ??
    allBoards[0];
  const showFullView = isExpanded || standalone;
  const previewEntries = activeBoard.entries.slice(0, 3);
  const visibleEntries = showFullView
    ? activeBoard.entries
    : activeBoard.entries.slice(0, 3);
  const defaultBoardMatch = leaderboardBoards.find(
    (board) => board.id === activeBoard.id
  ) as (LeaderboardBoard & { id: LeaderboardBoardId }) | undefined;
  const currentUserEntry = defaultBoardMatch
    ? getCurrentUserEntry(defaultBoardMatch.id, currentUserName)
    : {
        rank: "47",
        name: currentUserName,
        focus: "Joined board",
        rate: "55%",
        value:
          activeBoard.valueLabel.toLowerCase().includes("run") ||
          activeBoard.valueLabel.toLowerCase().includes("streak")
            ? "2 wins"
            : activeBoard.valueLabel.toLowerCase().includes("roi")
              ? "11.4%"
              : "+$920",
      };
  const inviteCodePreview =
    leaderboardVisibility === "invite-only" && leaderboardName.trim()
      ? buildInviteCode(leaderboardName.trim())
      : null;
  const featuredStandaloneBoards = allBoards.slice(0, Math.min(allBoards.length, 6));

  const handleCreateLeaderboard = () => {
    const trimmedName = leaderboardName.trim();
    const trimmedDescription = leaderboardDescription.trim();

    if (trimmedName.length < 3) {
      setCreateError("Give the leaderboard a name with at least 3 characters.");
      return;
    }

    const inviteCode =
      leaderboardVisibility === "invite-only"
        ? inviteCodePreview || buildInviteCode(trimmedName)
        : null;
    const boardId = `custom-${trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Date.now()}`;

    setCreatedLeaderboards((current) => [
      {
        id: boardId,
        name: trimmedName,
        description: trimmedDescription,
        visibility: leaderboardVisibility,
        inviteCode,
        memberCount: 1,
        board: buildCustomBoard({
          id: boardId,
          name: trimmedName,
          description: trimmedDescription,
          visibility: leaderboardVisibility,
          memberCount: 1,
        }),
      },
      ...current,
    ]);
    setSelectedBoardId(boardId);
    setLeaderboardName("");
    setLeaderboardDescription("");
    setLeaderboardVisibility("open");
    setCreateError(null);
    setIsCreateModalOpen(false);
    setIsBoardPickerOpen(false);
  };

  const handleJoinLeaderboard = (board: CreatedLeaderboard) => {
    setJoinedLeaderboards((current) => {
      if (current.some((item) => item.id === board.id)) {
        return current;
      }
      return [...current, board];
    });
    setSelectedBoardId(board.board.id);
    setJoinCode("");
    setJoinError(null);
    setIsJoinModalOpen(false);
  };

  const handleJoinByCode = () => {
    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) {
      setJoinError("Enter an invite code to join a private leaderboard.");
      return;
    }

    const matchingBoard = joinableLeaderboards.find(
      (board) => board.inviteCode?.toUpperCase() === trimmedCode
    );

    if (!matchingBoard) {
      setJoinError("No leaderboard matches that invite code.");
      return;
    }

    handleJoinLeaderboard(matchingBoard);
  };

  if (standalone) {
    return (
      <section
        className="dashboard-leaderboard leaderboard-page-panel leaderboard-page-panel--sketch is-expanded"
        aria-label="Leaderboard hub"
      >
        <div className="leaderboard-sketch-topline">
          <span>Past leaderboards</span>
          <div className="leaderboard-sketch-actions">
            <div className="dashboard-leaderboard-self-toggle leaderboard-sketch-self-toggle">
              <div>
                <span>Include yourself</span>
                <p>Add your row to the active board.</p>
              </div>
              <button
                type="button"
                className={`dashboard-event-toggle${
                  includeSelfInOverall ? " is-on" : " is-off"
                }`}
                aria-pressed={includeSelfInOverall}
                aria-label="Include yourself in overall leaderboard"
                onClick={() => setIncludeSelfInOverall((current) => !current)}
              >
                <span className="dashboard-event-toggle-knob" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className="dashboard-leaderboard-create"
              onClick={() => {
                setCreateError(null);
                setIsCreateModalOpen(true);
              }}
            >
              Create
            </button>
            <button
              type="button"
              className="dashboard-leaderboard-create leaderboard-sketch-join"
              onClick={() => {
                setJoinError(null);
                setIsJoinModalOpen(true);
              }}
            >
              Join
            </button>
          </div>
        </div>

        <div className="leaderboard-sketch-header">
          <div>
            <h3>Leaderboards</h3>
            <p>Tap a board once and the strip stays horizontally scrollable like a dock.</p>
          </div>
          <span className="dashboard-leaderboard-pill">{activeBoard.updated}</span>
        </div>

        <div className="leaderboard-sketch-strip-wrap">
          <div className="leaderboard-sketch-strip" role="tablist" aria-label="Leaderboard tabs">
            {featuredStandaloneBoards.map((board) => {
              const isActive = board.id === activeBoard.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`leaderboard-sketch-tab${isActive ? " is-active" : ""}`}
                  onClick={() => setSelectedBoardId(board.id)}
                >
                  <span>{board.eyebrow}</span>
                  <strong>{board.title}</strong>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={`leaderboard-sketch-more${isBoardPickerOpen ? " is-active" : ""}`}
            aria-label="Show all leaderboards"
            onClick={() => setIsBoardPickerOpen((current) => !current)}
          >
            ...
          </button>
        </div>

        {isBoardPickerOpen ? (
          <div className="leaderboard-sketch-picker" role="dialog" aria-label="Leaderboard list">
            <div className="leaderboard-sketch-picker-head">
              <div>
                <span>Leaderboard tab / popup</span>
                <strong>Choose from all boards</strong>
              </div>
              <button
                type="button"
                aria-label="Close leaderboard picker"
                onClick={() => setIsBoardPickerOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="leaderboard-sketch-picker-list">
              {allBoards.map((board) => {
                const linkedMeta =
                  joinableLeaderboards.find((item) => item.board.id === board.id) ||
                  joinedLeaderboards.find((item) => item.board.id === board.id) ||
                  createdLeaderboards.find((item) => item.board.id === board.id);
                const isActive = board.id === activeBoard.id;
                return (
                  <button
                    key={`picker-${board.id}`}
                    type="button"
                    className={`leaderboard-sketch-picker-item${isActive ? " is-active" : ""}`}
                    onClick={() => {
                      setSelectedBoardId(board.id);
                      setIsBoardPickerOpen(false);
                    }}
                  >
                    <div>
                      <span>{board.eyebrow}</span>
                      <strong>{board.title}</strong>
                      <p>{board.description}</p>
                    </div>
                    <div className="leaderboard-sketch-picker-meta">
                      {linkedMeta ? (
                        <span
                          className={`leaderboard-created-privacy leaderboard-created-privacy--${linkedMeta.visibility}`}
                        >
                          {linkedMeta.visibility}
                        </span>
                      ) : null}
                      <span>{board.updated}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="leaderboard-sketch-board">
          <div className="leaderboard-sketch-board-head">
            <div>
              <span>{activeBoard.eyebrow}</span>
              <strong>{activeBoard.title}</strong>
              <p>{activeBoard.description}</p>
            </div>
            <div className="leaderboard-sketch-board-highlight">
              <span>Current headline</span>
              <strong>{activeBoard.highlight}</strong>
            </div>
          </div>

          <div className="leaderboard-sketch-metrics">
            {activeBoard.metrics.map((metric) => (
              <div className="leaderboard-sketch-metric" key={`${activeBoard.id}-${metric.label}`}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="dashboard-leaderboard-table leaderboard-sketch-table">
            <div className="dashboard-leaderboard-row header">
              <span>Rank</span>
              <span>Player</span>
              <span>Focus</span>
              <span>Hit rate</span>
              <span>{activeBoard.valueLabel}</span>
            </div>
            {activeBoard.entries.map((entry) => {
              const medalTone = getMedalTone(entry.rank);
              return (
                <div className="dashboard-leaderboard-row" key={`${activeBoard.id}-${entry.rank}`}>
                  <span className="dashboard-leaderboard-rank-cell">
                    <span
                      className={`dashboard-leaderboard-medal${
                        medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </span>
                  <span>{entry.name}</span>
                  <span>{entry.focus}</span>
                  <span>{entry.rate}</span>
                  <span>{entry.value}</span>
                </div>
              );
            })}
            {includeSelfInOverall ? (
              <div className="dashboard-leaderboard-row dashboard-leaderboard-row--self">
                <span className="dashboard-leaderboard-rank-cell">
                  <span className="dashboard-leaderboard-medal dashboard-leaderboard-medal--gold">
                    {currentUserEntry.rank}
                  </span>
                </span>
                <span>{currentUserEntry.name}</span>
                <span>{currentUserEntry.focus}</span>
                <span>{currentUserEntry.rate}</span>
                <span>{currentUserEntry.value}</span>
              </div>
            ) : null}
          </div>
        </div>

        {isCreateModalOpen ? (
          <div
            className="leaderboard-create-backdrop"
            role="presentation"
            onClick={() => {
              setIsCreateModalOpen(false);
              setCreateError(null);
            }}
          >
            <div
              className="leaderboard-create-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Create leaderboard"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="leaderboard-create-head">
                <div>
                  <span>Create leaderboard</span>
                  <strong>Launch a new community board</strong>
                  <p>Pick how people discover and join it before you invite anyone in.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close create leaderboard dialog"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateError(null);
                  }}
                >
                  ×
                </button>
              </div>
              <label className="leaderboard-create-field">
                <span>Name</span>
                <input
                  type="text"
                  placeholder="Friday Night Sharps"
                  value={leaderboardName}
                  onChange={(event) => {
                    setLeaderboardName(event.target.value);
                    setCreateError(null);
                  }}
                />
              </label>
              <label className="leaderboard-create-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  placeholder="A board for tracking late-week edges and closing-line discipline."
                  value={leaderboardDescription}
                  onChange={(event) => setLeaderboardDescription(event.target.value)}
                />
              </label>
              <div className="leaderboard-create-privacy-grid">
                {VISIBILITY_OPTIONS.map((option) => {
                  const isActive = leaderboardVisibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`leaderboard-create-privacy-option${isActive ? " is-active" : ""}`}
                      onClick={() => setLeaderboardVisibility(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <p>{option.description}</p>
                    </button>
                  );
                })}
              </div>
              <div className="leaderboard-create-preview">
                <div>
                  <span>Visibility</span>
                  <strong>
                    {leaderboardVisibility === "open"
                      ? "Open to all members"
                      : leaderboardVisibility === "closed"
                        ? "Closed board with approvals"
                        : "Invite-only access"}
                  </strong>
                </div>
                {leaderboardVisibility === "invite-only" ? (
                  <div className="leaderboard-create-invite">
                    <span>Invite code</span>
                    <strong>{inviteCodePreview || "Create a name to generate one"}</strong>
                  </div>
                ) : null}
              </div>
              {createError ? <div className="field-error">{createError}</div> : null}
              <div className="leaderboard-create-actions">
                <button
                  type="button"
                  className="auth-secondary"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="auth-primary"
                  onClick={handleCreateLeaderboard}
                >
                  Create board
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isJoinModalOpen ? (
          <div
            className="leaderboard-create-backdrop"
            role="presentation"
            onClick={() => {
              setIsJoinModalOpen(false);
              setJoinError(null);
            }}
          >
            <div
              className="leaderboard-create-modal leaderboard-join-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Join leaderboard"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="leaderboard-create-head">
                <div>
                  <span>Create / join</span>
                  <strong>Join an existing leaderboard</strong>
                  <p>Use an invite code or jump into one of the discoverable boards below.</p>
                </div>
                <button
                  type="button"
                  aria-label="Close join leaderboard dialog"
                  onClick={() => {
                    setIsJoinModalOpen(false);
                    setJoinError(null);
                  }}
                >
                  ×
                </button>
              </div>
              <label className="leaderboard-create-field">
                <span>Invite code</span>
                <input
                  type="text"
                  placeholder="SHARP-2026"
                  value={joinCode}
                  onChange={(event) => {
                    setJoinCode(event.target.value);
                    setJoinError(null);
                  }}
                />
              </label>
              <div className="leaderboard-create-actions leaderboard-join-actions">
                <button type="button" className="auth-primary" onClick={handleJoinByCode}>
                  Join with code
                </button>
              </div>
              {joinError ? <div className="field-error">{joinError}</div> : null}
              <div className="leaderboard-join-grid">
                {joinableLeaderboards.map((board) => (
                  <button
                    key={board.id}
                    type="button"
                    className="leaderboard-join-card"
                    onClick={() => handleJoinLeaderboard(board)}
                  >
                    <div className="leaderboard-join-card-head">
                      <span
                        className={`leaderboard-created-privacy leaderboard-created-privacy--${board.visibility}`}
                      >
                        {board.visibility}
                      </span>
                      <strong>{board.name}</strong>
                    </div>
                    <p>{board.description}</p>
                    <div className="leaderboard-created-card-meta">
                      <span>{board.memberCount} members</span>
                      <span>{board.inviteCode || "No code needed"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={`dashboard-leaderboard${standalone ? " leaderboard-page-panel" : ""}${
        !standalone ? " dashboard-expandable" : ""
      }${isExpanded || standalone ? " is-expanded" : ""}`}
      aria-label="Leaderboard hub"
    >
      <div className="dashboard-leaderboard-header">
        <div className="dashboard-arb-header-left">
          <h3>Leaderboard hub</h3>
          <p>Jump between top earners, streaks, ROI leaders, and fastest climbers.</p>
        </div>
        <div className="dashboard-leaderboard-header-actions">
          {standalone ? (
            <>
              <button
                type="button"
                className="dashboard-leaderboard-create"
                onClick={() => {
                  setCreateError(null);
                  setIsCreateModalOpen(true);
                }}
              >
                Create leaderboard
              </button>
              <div className="dashboard-leaderboard-self-toggle">
                <div>
                  <span>Include yourself</span>
                  <p>Add your row to the overall board.</p>
                </div>
                <button
                  type="button"
                  className={`dashboard-event-toggle${
                    includeSelfInOverall ? " is-on" : " is-off"
                  }`}
                  aria-pressed={includeSelfInOverall}
                  aria-label="Include yourself in overall leaderboard"
                  onClick={() => setIncludeSelfInOverall((current) => !current)}
                >
                  <span className="dashboard-event-toggle-knob" aria-hidden="true" />
                </button>
              </div>
            </>
          ) : null}
          <span className="dashboard-leaderboard-pill">{activeBoard.updated}</span>
        </div>
      </div>
      {standalone && createdLeaderboards.length > 0 ? (
        <section className="leaderboard-created-strip" aria-label="Your created leaderboards">
          <div className="leaderboard-created-head">
            <div>
              <span>Your boards</span>
              <strong>Custom leaderboards</strong>
            </div>
            <p>Boards you created appear here with privacy status and access details.</p>
          </div>
          <div className="leaderboard-created-grid">
            {createdLeaderboards.map((board) => (
              <div className="leaderboard-created-card" key={board.id}>
                <div className="leaderboard-created-card-top">
                  <span className={`leaderboard-created-privacy leaderboard-created-privacy--${board.visibility}`}>
                    {board.visibility}
                  </span>
                  <strong>{board.name}</strong>
                </div>
                <p>
                  {board.description ||
                    (board.visibility === "open"
                      ? "Anyone can join this board right away."
                      : board.visibility === "closed"
                        ? "New members need approval before appearing on the board."
                        : "Only invited members can access this board.")}
                </p>
                <div className="leaderboard-created-card-meta">
                  <span>{board.memberCount} member{board.memberCount === 1 ? "" : "s"}</span>
                  {board.inviteCode ? <span>Invite code: {board.inviteCode}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {!standalone ? (
        isExpanded ? (
          <button
            className="dashboard-panel-close"
            type="button"
            aria-label="Close leaderboard hub"
            onClick={(event) => {
              event.stopPropagation();
              onClose?.();
            }}
          >
            ×
          </button>
        ) : (
          <button
            className="dashboard-panel-close"
            type="button"
            aria-label="Expand leaderboard hub"
            onClick={(event) => {
              event.stopPropagation();
              onExpand?.();
            }}
          >
            +
          </button>
        )
      ) : null}
      <div className="dashboard-leaderboard-hub-grid">
        {leaderboardBoards.map((board) => {
          const isActive = board.id === activeBoard.id;
          return (
            <button
              key={board.id}
              type="button"
              className={`dashboard-leaderboard-hub-card${isActive ? " is-active" : ""}`}
              onClick={() => setSelectedBoardId(board.id)}
            >
              <span className="dashboard-leaderboard-hub-eyebrow">{board.eyebrow}</span>
              <strong>{board.title}</strong>
              <p>{board.description}</p>
              <div className="dashboard-leaderboard-hub-preview">
                {board.entries.slice(0, 3).map((entry) => {
                  const medalTone = getMedalTone(entry.rank);
                  return (
                    <div
                      className="dashboard-leaderboard-hub-preview-row"
                      key={`${board.id}-${entry.rank}`}
                    >
                      <span className="dashboard-leaderboard-hub-preview-player">
                        <span
                          className={`dashboard-leaderboard-medal${
                            medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
                          }`}
                        >
                          {entry.rank}
                        </span>
                        <span>{entry.name}</span>
                      </span>
                      <span>{entry.value}</span>
                    </div>
                  );
                })}
              </div>
              <div className="dashboard-leaderboard-hub-meta">
                <span className="dashboard-leaderboard-hub-highlight">
                  {board.highlight}
                </span>
                <span className="dashboard-leaderboard-hub-cta">
                  {isActive ? "Viewing" : "Preview"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="dashboard-leaderboard-active-preview">
        <div className="dashboard-leaderboard-active-copy">
          <span className="dashboard-leaderboard-active-kicker">Selected board</span>
          <strong>{activeBoard.title}</strong>
          <p>{activeBoard.description}</p>
        </div>
        <div className="dashboard-leaderboard-active-podium">
          {previewEntries.map((entry) => {
            const medalTone = getMedalTone(entry.rank);
            return (
              <div
                className={`dashboard-leaderboard-podium-card${
                  medalTone ? ` dashboard-leaderboard-podium-card--${medalTone}` : ""
                }`}
                key={`${activeBoard.id}-preview-${entry.rank}`}
              >
                <div className="dashboard-leaderboard-podium-head">
                  <span
                    className={`dashboard-leaderboard-medal${
                      medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <span className="dashboard-leaderboard-podium-rate">{entry.rate}</span>
                </div>
                <strong>{entry.name}</strong>
                <p>{entry.focus}</p>
                <span className="dashboard-leaderboard-podium-value">{entry.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="dashboard-leaderboard-table">
        <div className="dashboard-leaderboard-row header">
          <span>Rank</span>
          <span>Player</span>
          <span>Focus</span>
          <span>Hit rate</span>
          <span>{activeBoard.valueLabel}</span>
        </div>
        {visibleEntries.map((entry) => {
          const medalTone = getMedalTone(entry.rank);
          return (
            <div className="dashboard-leaderboard-row" key={`${activeBoard.id}-${entry.rank}`}>
              <span className="dashboard-leaderboard-rank-cell">
                <span
                  className={`dashboard-leaderboard-medal${
                    medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
                  }`}
                >
                  {entry.rank}
                </span>
              </span>
              <span>{entry.name}</span>
              <span>{entry.focus}</span>
              <span>{entry.rate}</span>
              <span>{entry.value}</span>
            </div>
          );
        })}
        {standalone && includeSelfInOverall ? (
          <div className="dashboard-leaderboard-row dashboard-leaderboard-row--self">
            <span className="dashboard-leaderboard-rank-cell">
              <span className="dashboard-leaderboard-medal dashboard-leaderboard-medal--gold">
                {currentUserEntry.rank}
              </span>
            </span>
            <span>{currentUserEntry.name}</span>
            <span>{currentUserEntry.focus}</span>
            <span>{currentUserEntry.rate}</span>
            <span>{currentUserEntry.value}</span>
          </div>
        ) : null}
      </div>
      {showFullView ? (
        <div className="dashboard-leaderboard-expanded">
          <div className="dashboard-leaderboard-cards">
            {activeBoard.metrics.map((metric) => (
              <div className="dashboard-leaderboard-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {standalone && isCreateModalOpen ? (
        <div
          className="leaderboard-create-backdrop"
          role="presentation"
          onClick={() => {
            setIsCreateModalOpen(false);
            setCreateError(null);
          }}
        >
          <div
            className="leaderboard-create-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Create leaderboard"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="leaderboard-create-head">
              <div>
                <span>Create leaderboard</span>
                <strong>Launch a new community board</strong>
                <p>Pick how people discover and join it before you invite anyone in.</p>
              </div>
              <button
                type="button"
                aria-label="Close create leaderboard dialog"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError(null);
                }}
              >
                ×
              </button>
            </div>
            <label className="leaderboard-create-field">
              <span>Name</span>
              <input
                type="text"
                placeholder="Friday Night Sharps"
                value={leaderboardName}
                onChange={(event) => {
                  setLeaderboardName(event.target.value);
                  setCreateError(null);
                }}
              />
            </label>
            <label className="leaderboard-create-field">
              <span>Description</span>
              <textarea
                rows={3}
                placeholder="A board for tracking late-week edges and closing-line discipline."
                value={leaderboardDescription}
                onChange={(event) => setLeaderboardDescription(event.target.value)}
              />
            </label>
            <div className="leaderboard-create-privacy-grid">
              {VISIBILITY_OPTIONS.map((option) => {
                const isActive = leaderboardVisibility === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`leaderboard-create-privacy-option${isActive ? " is-active" : ""}`}
                    onClick={() => setLeaderboardVisibility(option.value)}
                  >
                    <strong>{option.label}</strong>
                    <p>{option.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="leaderboard-create-preview">
              <div>
                <span>Visibility</span>
                <strong>
                  {leaderboardVisibility === "open"
                    ? "Open to all members"
                    : leaderboardVisibility === "closed"
                      ? "Closed board with approvals"
                      : "Invite-only access"}
                </strong>
              </div>
              {leaderboardVisibility === "invite-only" ? (
                <div className="leaderboard-create-invite">
                  <span>Invite code</span>
                  <strong>{inviteCodePreview || "Create a name to generate one"}</strong>
                </div>
              ) : null}
            </div>
            {createError ? <div className="field-error">{createError}</div> : null}
            <div className="leaderboard-create-actions">
              <button
                type="button"
                className="auth-secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="auth-primary"
                onClick={handleCreateLeaderboard}
              >
                Create board
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
