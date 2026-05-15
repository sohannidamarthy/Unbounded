"use client";

import { useEffect, useMemo, useState } from "react";

import { ALL_BET_TYPES, BET_TYPE_LABELS, BET_TYPE_OPTIONS, type BetType } from "../components/betTypeConfig";
import { DashboardHeader } from "../components/DashboardHeader";
import { DraggableBetCalculatorPopup } from "../components/DraggableBetCalculatorPopup";

type Source = "live" | "arb" | "ev";
type Period = "day" | "week" | "month" | "year";

type ProfitEvent = {
  id: string;
  settledAt: string;
  matchup: string;
  sport: string;
  betType: BetType;
  odds: string;
  net: number;
  categories: Source[];
};

const now = new Date("2026-02-17T00:00:00.000Z");

const events: ProfitEvent[] = [
  {
    id: "evt-001",
    settledAt: "2026-02-16T22:10:00.000Z",
    matchup: "Pacers vs Lakers",
    sport: "Basketball",
    betType: "moneyline",
    odds: "+110",
    net: 50,
    categories: ["live", "arb"],
  },
  {
    id: "evt-002",
    settledAt: "2026-02-16T20:00:00.000Z",
    matchup: "Heat vs Celtics",
    sport: "Basketball",
    betType: "player-prop",
    odds: "+145",
    net: -30,
    categories: ["live", "ev"],
  },
  {
    id: "evt-003",
    settledAt: "2026-02-15T18:40:00.000Z",
    matchup: "Wolves vs Reapers",
    sport: "Football",
    betType: "spread",
    odds: "+120",
    net: 62,
    categories: ["arb"],
  },
  {
    id: "evt-004",
    settledAt: "2026-02-13T14:20:00.000Z",
    matchup: "Dodgers vs Mets",
    sport: "Baseball",
    betType: "total",
    odds: "+105",
    net: 18,
    categories: ["ev"],
  },
  {
    id: "evt-005",
    settledAt: "2026-02-10T03:15:00.000Z",
    matchup: "Chiefs vs Bills",
    sport: "Football",
    betType: "spread",
    odds: "-108",
    net: 40,
    categories: ["live", "arb"],
  },
  {
    id: "evt-006",
    settledAt: "2026-02-07T01:45:00.000Z",
    matchup: "Northbridge FC vs Harbor",
    sport: "Soccer",
    betType: "alt-line",
    odds: "+118",
    net: -22,
    categories: ["live", "ev"],
  },
  {
    id: "evt-007",
    settledAt: "2026-01-27T22:05:00.000Z",
    matchup: "Skyline Kings vs Harbor Jets",
    sport: "Basketball",
    betType: "player-prop",
    odds: "+142",
    net: 90,
    categories: ["arb"],
  },
  {
    id: "evt-008",
    settledAt: "2026-01-16T13:50:00.000Z",
    matchup: "Prime-time lock",
    sport: "Football",
    betType: "moneyline",
    odds: "+135",
    net: 44,
    categories: ["ev"],
  },
  {
    id: "evt-009",
    settledAt: "2025-11-20T08:10:00.000Z",
    matchup: "Slugger stack",
    sport: "Baseball",
    betType: "player-prop",
    odds: "+240",
    net: 75,
    categories: ["live", "ev"],
  },
];

const periodLabels: Record<Period, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

const sourceLabels: Record<Source, string> = {
  live: "Live",
  arb: "Arbitrage",
  ev: "EV",
};

const sourcePriority: Source[] = ["arb", "ev", "live"];

const getPrimarySource = (event: ProfitEvent): Source =>
  sourcePriority.find((source) => event.categories.includes(source)) ?? "live";

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

const toMonthInputValue = (date: Date) => date.toISOString().slice(0, 7);

const toWeekInputValue = (date: Date) => {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
};

const getWeekRange = (weekValue: string) => {
  const [yearValue, weekPart] = weekValue.split("-W");
  const year = Number(yearValue);
  const week = Number(weekPart);
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstThursdayDay = firstThursday.getUTCDay() || 7;
  const monday = new Date(firstThursday);
  monday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDay + 1 + (week - 1) * 7);
  const end = new Date(monday);
  end.setUTCDate(monday.getUTCDate() + 7);
  return { start: monday, end };
};

const getDateRange = (period: Period, value: string) => {
  if (period === "day") {
    const start = new Date(`${value}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 1);
    return { start, end };
  }

  if (period === "week") {
    return getWeekRange(value);
  }

  if (period === "month") {
    const [year, month] = value.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }

  const year = Number(value);
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year + 1, 0, 1)),
  };
};

export default function ProfitTrackerPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [periodValues, setPeriodValues] = useState<Record<Period, string>>({
    day: toDateInputValue(now),
    week: toWeekInputValue(now),
    month: toMonthInputValue(now),
    year: String(now.getUTCFullYear()),
  });
  const [selectedSources, setSelectedSources] = useState<Source[]>([
    "live",
    "arb",
    "ev",
  ]);
  const [selectedBetTypes, setSelectedBetTypes] = useState<BetType[]>([
    ...ALL_BET_TYPES,
  ]);
  const [selectedDotEvent, setSelectedDotEvent] = useState<ProfitEvent | null>(null);
  const [isChartMinimized, setIsChartMinimized] = useState(false);
  const [isTableMinimized, setIsTableMinimized] = useState(false);
  const [isBetCalculatorOpen, setIsBetCalculatorOpen] = useState(false);
  const [betCalculatorMode, setBetCalculatorMode] = useState<"arb" | "ev">("arb");
  const [betCalculatorStake, setBetCalculatorStake] = useState("100");
  const [betCalculatorOddsA, setBetCalculatorOddsA] = useState("");
  const [betCalculatorOddsB, setBetCalculatorOddsB] = useState("");

  const selectedRange = useMemo(
    () => getDateRange(period, periodValues[period]),
    [period, periodValues]
  );

  const inScope = useMemo(
    () =>
      events
        .filter((entry) => {
          const settled = new Date(entry.settledAt);
          return settled >= selectedRange.start && settled < selectedRange.end;
        })
        .filter((entry) =>
          entry.categories.some((category) => selectedSources.includes(category))
        )
        .filter((entry) => selectedBetTypes.includes(entry.betType))
        .sort(
          (a, b) =>
            new Date(a.settledAt).getTime() - new Date(b.settledAt).getTime()
        ),
    [selectedRange, selectedBetTypes, selectedSources]
  );

  const totalNet = useMemo(
    () => inScope.reduce((sum, entry) => sum + entry.net, 0),
    [inScope]
  );
  const latestInScopeEntry = inScope.length > 0 ? inScope[inScope.length - 1] : null;

  const sourceBreakdown = useMemo(() => {
    const base: Record<Source, number> = { live: 0, arb: 0, ev: 0 };
    for (const entry of inScope) {
      for (const category of entry.categories) {
        if (selectedSources.includes(category)) {
          base[category] += entry.net;
        }
      }
    }
    return base;
  }, [inScope, selectedSources]);

  const chartGeometry = useMemo(() => {
    if (inScope.length === 0) {
      return {
        points: [] as Array<{ x: number; y: number; event: ProfitEvent }>,
        linePath: "",
        areaPath: "",
        evLossSegmentPath: "",
        valueMin: 0,
        valueMax: 0,
        plotLeft: 12,
        plotRight: 94,
        plotTop: 3.2,
        plotBottom: 17.8,
      };
    }

    const plotLeft = 12;
    const plotRight = 94;
    const plotTop = 3.2;
    const plotBottom = 17.8;
    const cumulative: number[] = [];
    let running = 0;
    for (const entry of inScope) {
      running += entry.net;
      cumulative.push(running);
    }

    const valueMin = Math.min(...cumulative, 0);
    const valueMax = Math.max(...cumulative, 0);
    const valueRange = valueMax - valueMin || Math.max(Math.abs(valueMax), 1);
    const valuePadding = Math.max(valueRange * 0.12, 10);
    const scaledMin = valueMin - valuePadding;
    const scaledMax = valueMax + valuePadding;

    const normalizeX = (index: number) =>
      inScope.length <= 1
        ? (plotLeft + plotRight) / 2
        : plotLeft + (index / (inScope.length - 1)) * (plotRight - plotLeft);
    const normalizeY = (value: number) =>
      plotBottom -
      ((value - scaledMin) / (scaledMax - scaledMin)) * (plotBottom - plotTop);

    const points = cumulative.map((value, index) => ({
      x: normalizeX(index),
      y: normalizeY(value),
      event: inScope[index],
    }));

    const linePath = points
      .map((point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
      )
      .join(" ");
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${plotBottom.toFixed(2)} L ${points[0].x.toFixed(2)} ${plotBottom.toFixed(2)} Z`
        : "";
    const evLossSegmentPath = points
      .slice(1)
      .map((point, index) => {
        const event = inScope[index + 1];
        if (!event.categories.includes("ev") || event.net >= 0) {
          return "";
        }
        const previous = points[index];
        return `M ${previous.x.toFixed(2)} ${previous.y.toFixed(2)} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      })
      .filter(Boolean)
      .join(" ");

    return {
      points,
      linePath,
      areaPath,
      evLossSegmentPath,
      valueMin,
      valueMax,
      plotLeft,
      plotRight,
      plotTop,
      plotBottom,
    };
  }, [inScope]);
  const axisStartLabel = inScope[0]
    ? new Date(inScope[0].settledAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
    : "Start";
  const axisEndLabel = inScope[inScope.length - 1]
    ? new Date(inScope[inScope.length - 1].settledAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
    : "Now";
  const axisYTopValue = Math.max(chartGeometry.valueMax, 0);
  const axisYBottomValue = Math.min(chartGeometry.valueMin, 0);
  const formatAxisValue = (value: number) =>
    `${value >= 0 ? "+" : "-"}$${Math.abs(Math.round(value))}`;

  const toggleSource = (source: Source) => {
    setSelectedSources((current) => {
      if (current.includes(source)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== source);
      }
      return [...current, source];
    });
  };
  const toggleBetType = (betType: BetType) => {
    setSelectedBetTypes((current) => {
      if (current.includes(betType)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== betType);
      }
      return [...current, betType];
    });
  };
  const allBetTypesSelected = selectedBetTypes.length === ALL_BET_TYPES.length;
  const selectedWindowLabel = (() => {
    if (period === "day") {
      return new Date(`${periodValues.day}T00:00:00.000Z`).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    if (period === "week") {
      return `Week of ${selectedRange.start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    if (period === "month") {
      const [year, month] = periodValues.month.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
    return periodValues.year;
  })();
  useEffect(() => {
    if (window.location.hash === "#bet-calculator") {
      setIsBetCalculatorOpen(true);
    }
  }, []);

  return (
    <div className="site dashboard-page profit-tracker-page">
      <DashboardHeader onOpenBetCalculator={() => setIsBetCalculatorOpen(true)} />

      <main className="profit-tracker-main">
        <div className="profit-tracker-shell">
          <section className="profit-tracker-hero">
            <div>
              <h1>Profit Tracker</h1>
              <p>
                Totals for Live,  Arbitrage, and EV bets over time.
              </p>
            </div>
            <div className="profit-tracker-metrics">
              <div>
                <span>Total Net</span>
                <strong className={totalNet >= 0 ? "is-pos" : "is-neg"}>
                  {totalNet >= 0 ? "+" : "-"}${Math.abs(totalNet).toFixed(2)}
                </strong>
              </div>
              <div>
                <span>Settled Bets</span>
                <strong>{inScope.length}</strong>
              </div>
            </div>
          </section>

          <section className="profit-tracker-controls">
            <div className="profit-tracker-control-group">
              <span>Window</span>
              <div className="profit-tracker-pill-group">
                {(["day", "week", "month", "year"] as Period[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`profit-pill${period === item ? " is-active" : ""}`}
                    onClick={() => setPeriod(item)}
                  >
                    {periodLabels[item]}
                  </button>
                ))}
              </div>
              <div className="profit-window-picker">
                {period === "day" ? (
                  <input
                    type="date"
                    value={periodValues.day}
                    onChange={(event) =>
                      setPeriodValues((current) => ({
                        ...current,
                        day: event.target.value,
                      }))
                    }
                  />
                ) : null}
                {period === "week" ? (
                  <input
                    type="week"
                    value={periodValues.week}
                    onChange={(event) =>
                      setPeriodValues((current) => ({
                        ...current,
                        week: event.target.value,
                      }))
                    }
                  />
                ) : null}
                {period === "month" ? (
                  <input
                    type="month"
                    value={periodValues.month}
                    onChange={(event) =>
                      setPeriodValues((current) => ({
                        ...current,
                        month: event.target.value,
                      }))
                    }
                  />
                ) : null}
                {period === "year" ? (
                  <select
                    value={periodValues.year}
                    onChange={(event) =>
                      setPeriodValues((current) => ({
                        ...current,
                        year: event.target.value,
                      }))
                    }
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : null}
                <strong>{selectedWindowLabel}</strong>
              </div>
            </div>

            <div className="profit-tracker-control-group">
              <span>Sources</span>
              <div className="profit-tracker-pill-group">
                {(["live", "arb", "ev"] as Source[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`profit-pill profit-pill--source profit-pill--${item}${selectedSources.includes(item) ? " is-active" : ""
                      }`}
                    onClick={() => toggleSource(item)}
                  >
                    {sourceLabels[item]}
                  </button>
                ))}
              </div>
            </div>

            <div className="profit-tracker-control-group">
              <span>Bet type</span>
              <div className="profit-tracker-pill-group">
                <button
                  type="button"
                  className={`profit-pill profit-pill--bet-type${
                    allBetTypesSelected ? " is-active" : ""
                  }`}
                  onClick={() => setSelectedBetTypes([...ALL_BET_TYPES])}
                >
                  All bets
                </button>
                {BET_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`profit-pill profit-pill--bet-type${
                      selectedBetTypes.includes(option.value) ? " is-active" : ""
                    }`}
                    onClick={() => toggleBetType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="profit-tracker-chart-card">
            <div className="profit-tracker-chart-head">
              <h2>Net Trend ({periodLabels[period]})</h2>
              {isChartMinimized ? (
                <div className="profit-source-breakdown">
                  <span>Live: {sourceBreakdown.live >= 0 ? "+" : "-"}{Math.abs(sourceBreakdown.live).toFixed(2)}</span>
                  <span>Arb: {sourceBreakdown.arb >= 0 ? "+" : "-"}{Math.abs(sourceBreakdown.arb).toFixed(2)}</span>
                  <span className={sourceBreakdown.ev < 0 ? "is-neg" : undefined}>
                    EV: {sourceBreakdown.ev >= 0 ? "+" : "-"}{Math.abs(sourceBreakdown.ev).toFixed(2)}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                className="profit-section-toggle"
                onClick={() => setIsChartMinimized((prev) => !prev)}
                aria-expanded={!isChartMinimized}
              >
                {isChartMinimized ? "Expand chart" : "Minimize chart"}
              </button>
            </div>
            {!isChartMinimized ? (
              <div className="profit-chart-wrap">
                <svg
                  viewBox="0 0 100 26"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label="Net profit over time"
                  style={{ fontFamily: "inherit" }}
                >
                  <defs>
                    <linearGradient id="profit-area-positive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(98, 215, 137, 0.2)" />
                      <stop offset="100%" stopColor="rgba(98, 215, 137, 0.04)" />
                    </linearGradient>
                    <linearGradient id="profit-area-negative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(242, 120, 112, 0.28)" />
                      <stop offset="100%" stopColor="rgba(242, 120, 112, 0.06)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 12 18.5 L 96 18.5"
                    className="profit-grid-line profit-axis-line"
                    fill="none"
                    stroke="rgba(215, 170, 66, 0.58)"
                    strokeWidth={0.65}
                  />
                  <path
                    d="M 12 2.5 L 12 18.5"
                    className="profit-grid-line profit-axis-line"
                    fill="none"
                    stroke="rgba(215, 170, 66, 0.58)"
                    strokeWidth={0.65}
                  />
                  {chartGeometry.areaPath ? (
                    <path
                      d={chartGeometry.areaPath}
                      className="profit-chart-area"
                      style={{
                        fill:
                          totalNet < 0
                            ? "url(#profit-area-negative)"
                            : "url(#profit-area-positive)",
                      }}
                    />
                  ) : null}
                  <path
                    d={chartGeometry.linePath}
                    className="profit-chart-line"
                    fill="none"
                    stroke="#7de7aa"
                    strokeWidth={0.52}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {chartGeometry.evLossSegmentPath ? (
                    <path
                      d={chartGeometry.evLossSegmentPath}
                      className="profit-chart-line profit-chart-line--loss"
                      fill="none"
                    />
                  ) : null}
                  {chartGeometry.points.map((point) => (
                    <circle
                      key={point.event.id}
                      cx={point.x}
                      cy={point.y}
                      r={selectedDotEvent?.id === point.event.id ? 1.25 : 1.05}
                      className={`profit-chart-dot profit-chart-dot--${getPrimarySource(point.event)}${selectedDotEvent?.id === point.event.id ? " is-active" : ""
                        }`}
                      strokeWidth={0.75}
                      onClick={() => setSelectedDotEvent(point.event)}
                    />
                  ))}
                  <path
                    d={`M ${chartGeometry.plotLeft.toFixed(2)} ${(chartGeometry.plotBottom + 0.1).toFixed(2)} L ${chartGeometry.plotLeft.toFixed(2)} ${(chartGeometry.plotBottom + 0.7).toFixed(2)}`}
                    className="profit-axis-tick"
                    fill="none"
                  />
                  <path
                    d={`M ${chartGeometry.plotRight.toFixed(2)} ${(chartGeometry.plotBottom + 0.1).toFixed(2)} L ${chartGeometry.plotRight.toFixed(2)} ${(chartGeometry.plotBottom + 0.7).toFixed(2)}`}
                    className="profit-axis-tick"
                    fill="none"
                  />
                  <path
                    d={`M ${(chartGeometry.plotLeft - 0.45).toFixed(2)} ${chartGeometry.plotTop.toFixed(2)} L ${(chartGeometry.plotLeft + 0.45).toFixed(2)} ${chartGeometry.plotTop.toFixed(2)}`}
                    className="profit-axis-tick"
                    fill="none"
                  />
                  <path
                    d={`M ${(chartGeometry.plotLeft - 0.45).toFixed(2)} ${chartGeometry.plotBottom.toFixed(2)} L ${(chartGeometry.plotLeft + 0.45).toFixed(2)} ${chartGeometry.plotBottom.toFixed(2)}`}
                    className="profit-axis-tick"
                    fill="none"
                  />
                  <text
                    x={chartGeometry.plotLeft}
                    y="20.3"
                    textAnchor="start"
                    className="profit-axis-label"
                  >
                    {axisStartLabel}
                  </text>
                  <text
                    x={chartGeometry.plotRight}
                    y="20.3"
                    textAnchor="end"
                    className="profit-axis-label"
                  >
                    {axisEndLabel}
                  </text>
                  <text
                    x="4.1"
                    y={chartGeometry.plotTop + 0.35}
                    textAnchor="start"
                    className="profit-axis-label"
                  >
                    {formatAxisValue(axisYTopValue)}
                  </text>
                  <text
                    x="4.1"
                    y={chartGeometry.plotBottom - 0.15}
                    textAnchor="start"
                    className="profit-axis-label"
                  >
                    {formatAxisValue(axisYBottomValue)}
                  </text>
                  <text
                    x="54"
                    y="24.4"
                    textAnchor="middle"
                    className="profit-axis-title"
                    fill="rgba(247, 241, 232, 0.82)"
                    fontSize={2}
                    letterSpacing="0.06em"
                  >
                    Time
                  </text>
                  <text
                    x="2.8"
                    y="10.7"
                    textAnchor="middle"
                    className="profit-axis-title"
                    transform="rotate(-90 2.8 10.7)"
                    fill="rgba(247, 241, 232, 0.82)"
                    fontSize={2}
                    letterSpacing="0.06em"
                  >
                    Net Profit
                  </text>
                </svg>
              </div>
            ) : null}
          </section>

          <section className="profit-tracker-table-card">
            <div className="profit-tracker-table-head">
              <h2>Tracked Bets</h2>
              <button
                type="button"
                className="profit-section-toggle"
                onClick={() => setIsTableMinimized((prev) => !prev)}
                aria-expanded={!isTableMinimized}
              >
                {isTableMinimized ? "Expand bets" : "Minimize bets"}
              </button>
            </div>
            {!isTableMinimized ? (
              <div className="profit-table">
                <div className="profit-row profit-row--header">
                  <span className="profit-row-settled">Settled</span>
                  <span className="profit-row-type">Type</span>
                  <span className="profit-row-bet">Bet</span>
                  <span className="profit-row-result">Odds / Net</span>
                </div>
                {inScope
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <div key={entry.id} className="profit-row">
                      <span className="profit-row-settled">
                        {new Date(entry.settledAt).toLocaleDateString()}
                      </span>
                      <span className="profit-row-type">
                        {entry.categories.join(" / ").toUpperCase()}
                        <em className="profit-row-bet-type">
                          {BET_TYPE_LABELS[entry.betType]}
                        </em>
                      </span>
                      <span className="profit-row-bet">{entry.matchup}</span>
                      <span className="profit-row-result">
                        {entry.odds} Net: {entry.net >= 0 ? "+" : "-"}$
                        {Math.abs(entry.net).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="profit-table-minimized">
                <div>
                  <span>Bets</span>
                  <strong>{inScope.length}</strong>
                </div>
                <div>
                  <span>Net</span>
                  <strong className={totalNet >= 0 ? "is-pos" : "is-neg"}>
                    {totalNet >= 0 ? "+" : "-"}${Math.abs(totalNet).toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span>Latest</span>
                  <strong>
                    {latestInScopeEntry
                      ? new Date(latestInScopeEntry.settledAt).toLocaleDateString()
                      : "No bets"}
                  </strong>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {selectedDotEvent ? (
        <div
          className="profit-dot-modal-backdrop"
          onClick={() => setSelectedDotEvent(null)}
        >
          <aside
            className="profit-dot-modal"
            aria-label="Bet details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profit-dot-modal-head">
              <div>
                <span>Bet details</span>
                <strong>{selectedDotEvent.matchup}</strong>
              </div>
              <button
                type="button"
                aria-label="Close bet details"
                onClick={() => setSelectedDotEvent(null)}
              >
                ×
              </button>
            </div>
            <div className="profit-dot-modal-grid">
              <div>
                <span>Settled</span>
                <strong>{new Date(selectedDotEvent.settledAt).toLocaleString()}</strong>
              </div>
              <div>
                <span>Sport</span>
                <strong>{selectedDotEvent.sport}</strong>
              </div>
              <div>
                <span>Type</span>
                <strong>
                  {selectedDotEvent.categories.join(" / ").toUpperCase()} ·{" "}
                  {BET_TYPE_LABELS[selectedDotEvent.betType]}
                </strong>
              </div>
              <div>
                <span>Odds</span>
                <strong>{selectedDotEvent.odds}</strong>
              </div>
              <div>
                <span>Net</span>
                <strong className={selectedDotEvent.net >= 0 ? "is-pos" : "is-neg"}>
                  {selectedDotEvent.net >= 0 ? "+" : "-"}$
                  {Math.abs(selectedDotEvent.net).toFixed(2)}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
      <DraggableBetCalculatorPopup
        isOpen={isBetCalculatorOpen}
        mode={betCalculatorMode}
        stake={betCalculatorStake}
        oddsA={betCalculatorOddsA}
        oddsB={betCalculatorOddsB}
        disableBackdropBlur
        onClose={() => setIsBetCalculatorOpen(false)}
        onModeChange={setBetCalculatorMode}
        onStakeChange={setBetCalculatorStake}
        onOddsAChange={setBetCalculatorOddsA}
        onOddsBChange={setBetCalculatorOddsB}
      />
    </div>
  );
}
