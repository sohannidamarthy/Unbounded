"use client";

import { useMemo, useState } from "react";

export const ARBEV_BOOK_OPTIONS = [
  "FanDuel",
  "DraftKings",
  "BetMGM",
  "Caesars",
] as const;

const SPORTSBOOK_META: Record<
  string,
  {
    siteHref: string;
    logoDomain: string;
    shortLabel: string;
  }
> = {
  Bet365: {
    siteHref: "https://www.bet365.com",
    logoDomain: "bet365.com",
    shortLabel: "B365",
  },
  BetMGM: {
    siteHref: "https://sports.betmgm.com",
    logoDomain: "betmgm.com",
    shortLabel: "BM",
  },
  BetRivers: {
    siteHref: "https://www.betrivers.com",
    logoDomain: "betrivers.com",
    shortLabel: "BR",
  },
  Betfair: {
    siteHref: "https://www.betfair.com",
    logoDomain: "betfair.com",
    shortLabel: "BF",
  },
  Caesars: {
    siteHref: "https://www.caesars.com/sportsbook-and-casino",
    logoDomain: "caesars.com",
    shortLabel: "CZ",
  },
  DraftKings: {
    siteHref: "https://sportsbook.draftkings.com",
    logoDomain: "draftkings.com",
    shortLabel: "DK",
  },
  "ESPN BET": {
    siteHref: "https://espnbet.com",
    logoDomain: "espnbet.com",
    shortLabel: "EB",
  },
  Fanatics: {
    siteHref: "https://sportsbook.fanatics.com",
    logoDomain: "fanatics.com",
    shortLabel: "FA",
  },
  FanDuel: {
    siteHref: "https://www.fanduel.com",
    logoDomain: "fanduel.com",
    shortLabel: "FD",
  },
  "Hard Rock Bet": {
    siteHref: "https://hardrock.bet",
    logoDomain: "hardrock.bet",
    shortLabel: "HR",
  },
  Ladbrokes: {
    siteHref: "https://www.ladbrokes.com",
    logoDomain: "ladbrokes.com",
    shortLabel: "LB",
  },
  Neds: {
    siteHref: "https://www.neds.com.au",
    logoDomain: "neds.com.au",
    shortLabel: "ND",
  },
  "Paddy Power": {
    siteHref: "https://www.paddypower.com",
    logoDomain: "paddypower.com",
    shortLabel: "PP",
  },
  PointsBet: {
    siteHref: "https://pointsbet.com",
    logoDomain: "pointsbet.com",
    shortLabel: "PB",
  },
  Sportsbet: {
    siteHref: "https://www.sportsbet.com.au",
    logoDomain: "sportsbet.com.au",
    shortLabel: "SB",
  },
  TAB: {
    siteHref: "https://www.tab.com.au",
    logoDomain: "tab.com.au",
    shortLabel: "TAB",
  },
  "William Hill": {
    siteHref: "https://www.williamhill.com",
    logoDomain: "williamhill.com",
    shortLabel: "WH",
  },
};

const fallbackMeta = {
  siteHref: "#",
  logoDomain: "",
  shortLabel: "SB",
};

export function getSportsbookMeta(name: string) {
  return SPORTSBOOK_META[name] ?? fallbackMeta;
}

function getLogoCandidates(logoDomain: string) {
  if (!logoDomain) {
    return [];
  }

  return [
    `https://logo.clearbit.com/${logoDomain}?size=128`,
    `https://www.google.com/s2/favicons?domain=${logoDomain}&sz=128`,
  ];
}

function getInitials(name: string) {
  const compact = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, "").charAt(0))
    .join("")
    .toUpperCase();

  return compact || "SB";
}

type SportsbookLogoProps = {
  sportsbook: string;
  size?: number;
  className?: string;
};

export function SportsbookLogo({
  sportsbook,
  size = 26,
  className = "",
}: SportsbookLogoProps) {
  const meta = getSportsbookMeta(sportsbook);
  const sources = useMemo(() => getLogoCandidates(meta.logoDomain), [meta.logoDomain]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const activeSource = sources[sourceIndex];

  return (
    <span
      className={`sportsbook-logo${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {activeSource ? (
        <img
          src={activeSource}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setSourceIndex((current) => {
              if (current + 1 < sources.length) {
                return current + 1;
              }
              return sources.length;
            });
          }}
        />
      ) : (
        <span className="sportsbook-logo-fallback">{getInitials(sportsbook)}</span>
      )}
    </span>
  );
}
