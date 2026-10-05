"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type LeaderboardBoardId = "top-earners" | "win-streaks" | "roi-leaders" | "climb-watch";


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


type LeaderboardEntry = {
  rank: string;
  name: string;
  focus: string;
  rate: string;
  value: string;
};

type LeaderboardMetric = {
  icon?: ReactNode;
  iconClass?: string;
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
      { icon: <Icon01 />, iconClass: "metric-icon-01", label: "Biggest streak", value: "11 wins", detail: "NovaSkies • +$1,420" },
      { icon: <Icon02 />, iconClass: "metric-icon-02", label: "Best close rate", value: "68%", detail: "Top 20 tracked bettors" },
      { icon: <Icon03 />, iconClass: "metric-icon-03", label: "Hottest market", value: "NBA live", detail: "Avg +$412 this session" },
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

const Overall = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.6123 13.3125C9.61232 14.8159 10.1347 16.0898 11.1787 17.1338C12.223 18.1778 13.4969 18.7002 15 18.7002C16.5031 18.7002 17.777 18.1778 18.8213 17.1338C19.8653 16.0898 20.3877 14.8159 20.3877 13.3125V3.6123H9.6123V13.3125ZM15 6.8877C15.8904 6.8877 16.652 7.20473 17.2861 7.83887C17.9203 8.473 18.2373 9.23459 18.2373 10.125C18.2373 11.0154 17.9203 11.777 17.2861 12.4111C16.652 13.0453 15.8904 13.3623 15 13.3623C14.1096 13.3623 13.348 13.0453 12.7139 12.4111C12.0797 11.777 11.7627 11.0154 11.7627 10.125C11.7627 9.23459 12.0797 8.473 12.7139 7.83887C13.348 7.20473 14.1096 6.8877 15 6.8877ZM3.6123 8.5C3.6123 9.7405 4.02639 10.8063 4.85352 11.6973C5.68046 12.588 6.70783 13.1058 7.93555 13.25L7.9502 13.252V6.8623H3.6123V8.5ZM22.0498 13.252L22.0645 13.25C23.2922 13.1058 24.3195 12.588 25.1465 11.6973C25.9736 10.8063 26.3877 9.7405 26.3877 8.5V6.8623H22.0498V13.252ZM14.2002 20.2646L14.1895 20.2627C12.7604 20.0066 11.5095 19.4087 10.4375 18.4697C9.36571 17.5308 8.62825 16.3666 8.22461 14.9775L8.24316 14.9727L8.21387 14.9688L7.89551 14.9248C6.3164 14.677 4.96007 13.9884 3.82617 12.8584C2.61708 11.6534 2.0127 10.2007 2.0127 8.5V6.875C2.0127 6.443 2.17341 6.06682 2.49512 5.74512C2.81682 5.42341 3.193 5.2627 3.625 5.2627H7.9502V2.0127H22.0498V5.2627H26.375C26.807 5.2627 27.1832 5.42341 27.5049 5.74512C27.8266 6.06682 27.9873 6.443 27.9873 6.875V8.5C27.9873 10.2007 27.3829 11.6534 26.1738 12.8584C24.9644 14.0637 23.502 14.766 21.7861 14.9678L21.7842 14.9492L21.7754 14.9775C21.3717 16.3666 20.6343 17.5308 19.5625 18.4697C18.4905 19.4087 17.2396 20.0066 15.8105 20.2627L15.7998 20.2646V26.3877H20.8623V27.9873H9.1377V26.3877H14.2002V20.2646Z" fill="currentColor" stroke="currentColor" stroke-width="0.025" />
  </svg>
);

const privateGroups = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5002 16.6667C17.8013 16.6667 19.6668 14.8012 19.6668 12.5C19.6668 10.1989 17.8013 8.33337 15.5002 8.33337C13.199 8.33337 11.3335 10.1989 11.3335 12.5C11.3335 14.8012 13.199 16.6667 15.5002 16.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M21.3332 25C21.3332 23.4529 20.7186 21.9691 19.6246 20.8752C18.5307 19.7812 17.0469 19.1666 15.4998 19.1666C13.9527 19.1666 12.469 19.7812 11.375 20.8752C10.2811 21.9691 9.6665 23.4529 9.6665 25H21.3332Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M22.1668 13.3333C22.8771 13.3333 23.5755 13.1518 24.1958 12.8059C24.8162 12.4601 25.3378 11.9614 25.7112 11.3572C26.0846 10.7531 26.2974 10.0635 26.3293 9.35395C26.3612 8.64443 26.2112 7.93853 25.8936 7.30328C25.576 6.66802 25.1012 6.1245 24.5145 5.72433C23.9277 5.32416 23.2484 5.08062 22.541 5.01684C21.8337 4.95305 21.1217 5.07115 20.4728 5.3599C19.8239 5.64865 19.2596 6.09848 18.8335 6.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M22.9998 21.6667H27.9998C27.9998 20.1196 27.3853 18.6359 26.2913 17.5419C25.1973 16.448 23.7136 15.8334 22.1665 15.8334" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12.1665 6.66667C11.7404 6.09848 11.1761 5.64865 10.5272 5.3599C9.87828 5.07115 9.16635 4.95305 8.45898 5.01684C7.75161 5.08062 7.07229 5.32416 6.48553 5.72433C5.89876 6.1245 5.42402 6.66802 5.10639 7.30328C4.78876 7.93853 4.63879 8.64443 4.67072 9.35395C4.70264 10.0635 4.9154 10.7531 5.28879 11.3572C5.66219 11.9614 6.18382 12.4601 6.80415 12.8059C7.42449 13.1518 8.12293 13.3333 8.83317 13.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8.83333 15.8334C7.28624 15.8334 5.80251 16.448 4.70854 17.5419C3.61458 18.6359 3 20.1196 3 21.6667H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const inviteOnly = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.7994 12.8C16.2295 12.8 18.1994 10.8301 18.1994 8.4C18.1994 5.96995 16.2295 4 13.7994 4C11.3694 4 9.39941 5.96995 9.39941 8.4C9.39941 10.8301 11.3694 12.8 13.7994 12.8Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M25.9 12.8H23.7M23.7 12.8H21.5M23.7 12.8V10.6M23.7 12.8V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M22.5972 21.6C22.6 21.4194 22.6 21.2359 22.6 21.05C22.6 18.3161 18.6601 16.1 13.8 16.1C8.93989 16.1 5 18.3161 5 21.05C5 23.7838 5 26 13.8 26C16.2541 26 18.0238 25.8276 19.3 25.5197" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);
const Cash24h = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4.5C20.7993 4.5 25.5 9.20137 25.5 15C25.5 20.7993 20.7993 25.5 15 25.5C9.2007 25.5 4.5 20.7993 4.5 15C4.5 9.20137 9.20073 4.5 15 4.5ZM15 4.875C9.40808 4.875 4.875 9.40882 4.875 15C4.875 20.5919 9.40811 25.125 15 25.125C20.5919 25.125 25.125 20.5919 25.125 15C25.125 9.40882 20.5919 4.875 15 4.875ZM15.1875 22.375V22.75H14.8125V22.375H15.1875ZM9.8252 19.6963L9.58008 19.9424L9.33398 19.6963L9.58008 19.4512L9.8252 19.6963ZM20.2129 19.6592L19.9473 19.9248L19.6826 19.6592L19.9473 19.3945L20.2129 19.6592ZM15 7.25C15.104 7.25 15.1875 7.33345 15.1875 7.4375V15.0166C15.1874 15.1196 15.1043 15.2031 15 15.2031H8.8125C8.70818 15.2031 8.62506 15.1196 8.625 15.0166C8.625 14.9123 8.70942 14.8281 8.8125 14.8281H14.8125V7.4375C14.8125 7.33378 14.8963 7.25 15 7.25ZM22.75 14.8125V15.1875H22.375V14.8125H22.75ZM9.95605 9.72168L9.69043 9.98633L9.42578 9.72168L9.69043 9.45605L9.95605 9.72168ZM20.374 9.6875L20.1279 9.93262L19.8828 9.6875L20.1289 9.44141L20.374 9.6875Z" stroke="currentColor" />
  </svg>
);

const lockedIn = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 19C5 16.1716 5 14.7574 5.87868 13.8787C6.75736 13 8.17157 13 11 13H19C21.8284 13 23.2426 13 24.1213 13.8787C25 14.7574 25 16.1716 25 19C25 21.8284 25 23.2426 24.1213 24.1213C23.2426 25 21.8284 25 19 25H11C8.17157 25 6.75736 25 5.87868 24.1213C5 23.2426 5 21.8284 5 19Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M9 13V11C9 7.68629 11.6863 5 15 5C18.3137 5 21 7.68629 21 11V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M11 19H11.009M14.991 19H15M18.991 19H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

const Efficiency = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.8175 5.31348C11.7575 5.31348 9.26807 7.8429 9.26807 10.952C9.26807 14.0612 11.7575 16.5906 14.8175 16.5906C17.8774 16.5906 20.3669 14.0612 20.3669 10.952C20.3669 7.8429 17.8774 5.31348 14.8175 5.31348ZM19.4929 11.3857C19.2764 13.8139 17.2627 15.7231 14.8175 15.7231C12.3723 15.7231 10.3586 13.8139 10.1421 11.3858H11.687V10.5183H10.1421C10.2239 9.60011 10.5626 8.75646 11.0847 8.06197L11.9543 8.94552L12.558 8.3321L11.6621 7.42172C12.3974 6.74255 13.3453 6.29777 14.3906 6.20153V7.77131H15.2444V6.20153C16.2897 6.29777 17.2375 6.74255 17.9728 7.42166L16.7923 8.6212L17.396 9.23461L18.5501 8.06191C19.0723 8.75646 19.411 9.60011 19.4928 10.5182H17.9479V11.3857H19.4929Z" fill="currentColor" />
    <path d="M15.2445 10.8677V8.92761H14.3908V10.8677C13.7346 11.0571 13.2524 11.671 13.2524 12.3975C13.2524 13.2744 13.9546 13.9879 14.8177 13.9879C15.6807 13.9879 16.3829 13.2744 16.3829 12.3975C16.3829 11.671 15.9007 11.0571 15.2445 10.8677ZM14.8177 13.1204C14.4253 13.1204 14.1062 12.7961 14.1062 12.3975C14.1062 11.9989 14.4253 11.6746 14.8177 11.6746C15.21 11.6746 15.5291 11.9989 15.5291 12.3975C15.5291 12.7961 15.21 13.1204 14.8177 13.1204Z" fill="currentColor" />
    <path d="M11.4033 17.4578C9.91255 17.4578 8.69971 18.6901 8.69971 20.2048C8.69971 21.7194 9.91255 22.9517 11.4033 22.9517C12.894 22.9517 14.1068 21.7194 14.1068 20.2048C14.1068 18.6901 12.894 17.4578 11.4033 17.4578ZM11.4033 22.0843C10.5302 22.0843 9.79701 21.4663 9.60372 20.6385H11.6878V19.771H9.60372C9.79701 18.9432 10.5302 18.3252 11.4033 18.3252C12.4233 18.3252 13.2531 19.1684 13.2531 20.2048C13.2531 21.2411 12.4233 22.0843 11.4033 22.0843Z" fill="currentColor" />
    <path d="M18.2333 17.4578C16.7426 17.4578 15.5298 18.6901 15.5298 20.2048C15.5298 21.7194 16.7426 22.9517 18.2333 22.9517C19.7241 22.9517 20.9369 21.7194 20.9369 20.2048C20.9369 18.6901 19.7241 17.4578 18.2333 17.4578ZM20.0329 20.6385C19.8396 21.4663 19.1064 22.0843 18.2333 22.0843C17.2133 22.0843 16.3835 21.2411 16.3835 20.2048C16.3835 19.1684 17.2133 18.3252 18.2333 18.3252C19.1064 18.3252 19.8396 18.9432 20.0329 19.771H17.6642V20.6385H20.0329Z" fill="currentColor" />
    <path d="M22.9289 13.4096V10.3735C22.9289 6.30772 19.6734 3 15.6719 3H13.9644C9.96293 3 6.70751 6.30772 6.70751 10.3735V10.5181H5V14.2771H6.70751V15.7229H5V19.4819H6.70751V19.6265C6.70751 23.6923 9.96293 27 13.9644 27H15.6719C19.6734 27 22.9289 23.6923 22.9289 19.6265V17.1687H24.6364V13.4096H22.9289ZM6.70751 18.6145H5.85375V16.5904H6.70751V18.6145ZM6.70751 13.4096H5.85375V11.3855H6.70751V13.4096ZM22.0751 19.6265C22.0751 23.214 19.2027 26.1325 15.6719 26.1325H15.2451V23.6747H14.3913V26.1325H13.9644C10.4337 26.1325 7.56126 23.214 7.56126 19.6265V10.3735C7.56126 6.78604 10.4337 3.86747 13.9644 3.86747H15.6719C19.2027 3.86747 22.0751 6.78604 22.0751 10.3735V19.6265ZM23.7826 16.3012H22.9289V14.2771H23.7826V16.3012Z" fill="currentColor" />
  </svg>
);


const leaderboardIcons: Record<string, React.ComponentType> = {
  "overall-2026": Overall,
  "houses-ladder": privateGroups,
  "sharp-room": inviteOnly,
  "top-earners": Cash24h,
  "win-streaks": lockedIn,
  "roi-leaders": Efficiency,
  "climb-watch": Efficiency,
};

const getLeaderboardIcon = (boardId: string) => {
  switch (boardId) {
    case "overall-2026":
      return Overall;

    case "houses-ladder":
      return privateGroups;

    case "sharp-room":
      return inviteOnly;

    case "top-earners":
      return Cash24h;

    case "win-streaks":
      return lockedIn;

    case "roi-leaders":
      return Efficiency;

    case "climb-watch":
      return Efficiency;

    default:
      return Overall;
  }
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
        className="dashboard-leaderboard leaderboard-page-panel leaderboard-page-panel--sketch is-expanded "
        aria-label="Leaderboard hub"
      >
        <div className="dashboard-panel">
          <div className="leaderboard-sketch-topline dashboard-panel-header">
            <h2>Past leaderboards</h2>
            <div className="leaderboard-sketch-actions">
              <div className="dashboard-leaderboard-self-toggle leaderboard-sketch-self-toggle">
                <div>
                  <span>Include yourself</span>
                  <p>Add your row to the active board.</p>
                </div>
                <button
                  type="button"
                  className={`dashboard-event-toggle ${includeSelfInOverall ? "is-on" : "is-off"
                    }`}
                  aria-pressed={includeSelfInOverall}
                  aria-label="Include yourself in overall leaderboard"
                  onClick={() => setIncludeSelfInOverall((current) => !current)}
                >
                  <span className="dashboard-event-toggle-label">
                    {includeSelfInOverall ? "ON" : "OFF"}
                  </span>

                  <span
                    className="dashboard-event-toggle-knob"
                    aria-hidden="true"
                  />
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
          <div className="dashboard-panel-body">
            <div className="leaderboard-sketch-header">
              <div>
                <h3>Leaderboards</h3>
                <p>Tap a board once and the strip stays horizontally scrollable like a dock.</p>
              </div>
              <span className="dashboard-leaderboard-pill">
                <i>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.04 11.64L7.2 8.8V4.8H8.8V8.14L11.16 10.5L10.04 11.64ZM7.2 3.2V1.6H8.8V3.2H7.2ZM12.8 8.8V7.2H14.4V8.8H12.8ZM7.2 14.4V12.8H8.8V14.4H7.2ZM1.6 8.8V7.2H3.2V8.8H1.6ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16ZM8 14.4C9.78667 14.4 11.3 13.78 12.54 12.54C13.78 11.3 14.4 9.78667 14.4 8C14.4 6.21333 13.78 4.7 12.54 3.46C11.3 2.22 9.78667 1.6 8 1.6C6.21333 1.6 4.7 2.22 3.46 3.46C2.22 4.7 1.6 6.21333 1.6 8C1.6 9.78667 2.22 11.3 3.46 12.54C4.7 13.78 6.21333 14.4 8 14.4Z" fill="#EAB751" />
                  </svg>
                </i>
                {activeBoard.updated}
              </span>
            </div>

            <div className="leaderboard-sketch-strip-wrap">
              <div className="leaderboard-sketch-strip" role="tablist" aria-label="Leaderboard tabs">
                {featuredStandaloneBoards.map((board) => {
                  const isActive = board.id === activeBoard.id;
                  const Icon = getLeaderboardIcon(board.id);

                  return (
                    <button
                      key={board.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`leaderboard-sketch-tab${isActive ? " is-active" : ""}`}
                      onClick={() => setSelectedBoardId(board.id)}
                    >
                      <i>
                        <Icon />
                      </i>
                      <div>
                        <span>{board.eyebrow}</span>
                        <strong>{board.title}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button type="button" className={`leaderboard-sketch-more${isBoardPickerOpen ? " is-active" : ""}`} aria-label="Show all leaderboards" onClick={() => setIsBoardPickerOpen((current) => !current)}>
                <svg width="4" height="20" viewBox="0 0 4 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18C0 17.45 0.195833 16.9792 0.5875 16.5875C0.979167 16.1958 1.45 16 2 16C2.55 16 3.02083 16.1958 3.4125 16.5875C3.80417 16.9792 4 17.45 4 18C4 18.55 3.80417 19.0208 3.4125 19.4125C3.02083 19.8042 2.55 20 2 20ZM2 12C1.45 12 0.979167 11.8042 0.5875 11.4125C0.195833 11.0208 0 10.55 0 10C0 9.45 0.195833 8.97917 0.5875 8.5875C0.979167 8.19583 1.45 8 2 8C2.55 8 3.02083 8.19583 3.4125 8.5875C3.80417 8.97917 4 9.45 4 10C4 10.55 3.80417 11.0208 3.4125 11.4125C3.02083 11.8042 2.55 12 2 12ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="dashboard-panel">
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

          <div className="leaderboard-sketch-board-head dashboard-panel-header">
            <div>
              <h2>
                <strong>{activeBoard.title}</strong>
                <span>{activeBoard.eyebrow}</span>
              </h2>
              <p>{activeBoard.description}</p>
            </div>
            <div className="leaderboard-sketch-board-highlight">
              <span>Current headline</span>
              <strong>{activeBoard.highlight}</strong>
            </div>
          </div>
          <div className="dashboard-panel-body">

            <div className="leaderboard-sketch-metrics">
              {activeBoard.metrics.map((metric) => (
                <div
                  className="leaderboard-sketch-metric"
                  key={`${activeBoard.id}-${metric.label}`}
                >
                  <div className="leaderboard-sketch-metric-box">
                    <div className={`leaderboard-sketch-metric-icon ${metric.iconClass}`}>{metric.icon}</div>
                    <div>
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </div>
                  </div>
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
                        className={`dashboard-leaderboard-medal${medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
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
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`dashboard-leaderboard${standalone ? " leaderboard-page-panel" : ""}${!standalone ? " dashboard-expandable" : ""
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
                  className={`dashboard-event-toggle${includeSelfInOverall ? " is-on" : " is-off"
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
          <span className="dashboard-leaderboard-pill">
            <i>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.04 11.64L7.2 8.8V4.8H8.8V8.14L11.16 10.5L10.04 11.64ZM7.2 3.2V1.6H8.8V3.2H7.2ZM12.8 8.8V7.2H14.4V8.8H12.8ZM7.2 14.4V12.8H8.8V14.4H7.2ZM1.6 8.8V7.2H3.2V8.8H1.6ZM8 16C6.89333 16 5.85333 15.79 4.88 15.37C3.90667 14.95 3.06 14.38 2.34 13.66C1.62 12.94 1.05 12.0933 0.63 11.12C0.21 10.1467 0 9.10667 0 8C0 6.89333 0.21 5.85333 0.63 4.88C1.05 3.90667 1.62 3.06 2.34 2.34C3.06 1.62 3.90667 1.05 4.88 0.63C5.85333 0.21 6.89333 0 8 0C9.10667 0 10.1467 0.21 11.12 0.63C12.0933 1.05 12.94 1.62 13.66 2.34C14.38 3.06 14.95 3.90667 15.37 4.88C15.79 5.85333 16 6.89333 16 8C16 9.10667 15.79 10.1467 15.37 11.12C14.95 12.0933 14.38 12.94 13.66 13.66C12.94 14.38 12.0933 14.95 11.12 15.37C10.1467 15.79 9.10667 16 8 16ZM8 14.4C9.78667 14.4 11.3 13.78 12.54 12.54C13.78 11.3 14.4 9.78667 14.4 8C14.4 6.21333 13.78 4.7 12.54 3.46C11.3 2.22 9.78667 1.6 8 1.6C6.21333 1.6 4.7 2.22 3.46 3.46C2.22 4.7 1.6 6.21333 1.6 8C1.6 9.78667 2.22 11.3 3.46 12.54C4.7 13.78 6.21333 14.4 8 14.4Z" fill="#EAB751" />
              </svg>
            </i>
            {activeBoard.updated}
          </span>
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
                          className={`dashboard-leaderboard-medal${medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
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
                className={`dashboard-leaderboard-podium-card${medalTone ? ` dashboard-leaderboard-podium-card--${medalTone}` : ""
                  }`}
                key={`${activeBoard.id}-preview-${entry.rank}`}
              >
                <div className="dashboard-leaderboard-podium-head">
                  <span
                    className={`dashboard-leaderboard-medal${medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
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
                  className={`dashboard-leaderboard-medal${medalTone ? ` dashboard-leaderboard-medal--${medalTone}` : ""
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
