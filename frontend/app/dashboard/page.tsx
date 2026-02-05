"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const showSidebar = isAuthReady && isAuthenticated;
  const [betIncrease, setBetIncrease] = useState("25");
  const [expandedPanel, setExpandedPanel] = useState<
    | null
    | "live"
    | "leaderboard"
    | "arb-ev"
    | "withdrawal"
    | "tools"
    | "chat"
  >(null);
  const [arbEvView, setArbEvView] = useState<"arb" | "ev">("arb");
  const [activeSport, setActiveSport] = useState("Basketball");
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [arbWays, setArbWays] = useState("2-way");
  const [favoriteArb, setFavoriteArb] = useState("No");
  const [evIncludeLimits, setEvIncludeLimits] = useState("On");
  const [evType, setEvType] = useState("+EV");
  const [favoriteEv, setFavoriteEv] = useState("No");
  const [withdrawalSpeed, setWithdrawalSpeed] = useState("Instant");
  const [withdrawalMethod, setWithdrawalMethod] = useState("Bank");
  const [withdrawalAuto, setWithdrawalAuto] = useState("Yes");
  const [chatFilter, setChatFilter] = useState("All");
  const isLiveExpanded = expandedPanel === "live";
  const isLeaderboardExpanded = expandedPanel === "leaderboard";
  const isArbEvExpanded = expandedPanel === "arb-ev";
  const isWithdrawalExpanded = expandedPanel === "withdrawal";
  const isToolsExpanded = expandedPanel === "tools";
  const isChatExpanded = expandedPanel === "chat";
  const chatFilters = ["All", "Tutorials", "Guides", "Videos"];
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

  const sportOptions = ["Basketball", "Football", "Baseball", "Soccer"];
  const filterOptions = ["Trending", "High payout", "Live now"];
  const payoutMultiplier = {
    Basketball: 1.92,
    Football: 2.28,
    Baseball: 2.05,
    Soccer: 2.4,
  } as const;

  const liveData = {
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
  } as const;

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    setIsAuthReady(true);
    const handleStorage = () => {
      setIsAuthenticated(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    router.push("/");
  };

  return (
    <div className="site dashboard-page">
      <header className="site-header">
        <div className="brand">
          <a className="brand-home-link" href="/" aria-label="Unbounded home">
            <Image
              src="/unbounded.jpeg"
              alt="Unbounded logo"
              width={56}
              height={56}
              priority
            />
          </a>
          <a className="brand-text brand-home-link" href="/">
            <span>Unbounded</span>
          </a>
          {isAuthReady && !isAuthenticated ? (
            <div className="guest-badge">
              <div className="guest-avatar" aria-hidden="true" />
              <span>Guest</span>
            </div>
          ) : null}
        </div>
        <nav className="nav-links">
          <a href="#arbitrage-bets">Arbitrage Bets</a>
          <a href="#ev-bets">EV Bets</a>
          <a href="#profit-tracker">Profit Tracker</a>
          <a href="#bet-calculator">Bet Calculator</a>
          <a href="#tools">Tools</a>
        </nav>
        <div className="header-actions header-actions--split">
          {isAuthReady ? (
            isAuthenticated ? (
              <>
                <div className="account-menu">
                  <button
                    className="primary header-primary pulse-on-hover"
                    type="button"
                    aria-haspopup="menu"
                  >
                    Account
                  </button>
                  <div className="account-dropdown" role="menu">
                    <button
                      className="account-dropdown-item"
                      type="button"
                      role="menuitem"
                    >
                      My plan
                    </button>
                    <button
                      className="account-dropdown-item"
                      type="button"
                      role="menuitem"
                    >
                      Notifications
                    </button>
                    <button
                      className="account-dropdown-item"
                      type="button"
                      role="menuitem"
                    >
                      Settings
                    </button>
                    <button
                      className="account-dropdown-item"
                      type="button"
                      role="menuitem"
                    >
                      Referrals
                    </button>
                    <button
                      className="account-dropdown-item"
                      type="button"
                      role="menuitem"
                      onClick={handleLogoutClick}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <a className="primary header-primary pulse-on-hover" href="/auth">
                Log in / Sign up
              </a>
            )
          ) : (
            <div className="header-actions-placeholder" aria-hidden="true" />
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <div
          className={`dashboard-layout${
            showSidebar ? "" : " dashboard-layout--compact"
          }${expandedPanel ? " dashboard-layout--expanded" : ""}`}
        >
          {showSidebar ? (
            <aside className="dashboard-sidebar" aria-label="My bets">
              <div className="dashboard-sidebar-title">My bets</div>
              <div className="dashboard-sidebar-items">
                <a className="dashboard-sidebar-item" href="#">
                  Tutorials
                </a>
                <a className="dashboard-sidebar-item" href="#">
                  Bet Validator
                </a>
                <a className="dashboard-sidebar-item" href="#">
                  Daily Bets
                </a>
                <a className="dashboard-sidebar-item" href="#">
                  Your live ROI
                </a>
                <a className="dashboard-sidebar-item" href="#">
                  Chats
                </a>
                <a className="dashboard-sidebar-item" href="#">
                  Withdrawals
                </a>
              </div>
            </aside>
          ) : null}
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
                  className="dashboard-panel-controls"
                  onClick={(event) => event.stopPropagation()}
                >
                  <label className="dashboard-input">
                    <span>Bet value</span>
                    <div className="dashboard-input-field">
                      <span>$</span>
                      <input
                        type="number"
                        min="0"
                        value={betIncrease}
                        onChange={(event) => setBetIncrease(event.target.value)}
                      />
                    </div>
                  </label>
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
                      if (!expandedPanel) {
                        setExpandedPanel("live");
                      }
                    }}
                  >
                    +
                  </button>
                )}
              </div>
              <div className="dashboard-panel-body">
                {!isLiveExpanded ? (
                  <div className="dashboard-live-grid">
                    <div className="dashboard-live-card">
                      <div className="dashboard-live-title">Warriors vs Suns</div>
                      <div className="dashboard-live-meta">Spread: -3.5</div>
                      <div className="dashboard-live-odds">Odds: -115</div>
                    <div className="dashboard-live-payout">
                      Estimated payout:{" "}
                      <span className="payout-amount">
                        $
                        {(
                          Math.max(0, Number(betIncrease || 0)) *
                          1.87
                        ).toFixed(2)}
                      </span>
                    </div>
                    </div>
                    <div className="dashboard-live-card">
                      <div className="dashboard-live-title">Chiefs vs Bills</div>
                      <div className="dashboard-live-meta">Moneyline</div>
                      <div className="dashboard-live-odds">Odds: +145</div>
                    <div className="dashboard-live-payout">
                      Estimated payout:{" "}
                      <span className="payout-amount">
                        $
                        {(
                          Math.max(0, Number(betIncrease || 0)) *
                          2.45
                        ).toFixed(2)}
                      </span>
                    </div>
                    </div>
                    <div className="dashboard-live-card">
                      <div className="dashboard-live-title">Dodgers vs Mets</div>
                      <div className="dashboard-live-meta">Over 7.5</div>
                      <div className="dashboard-live-odds">Odds: +105</div>
                    <div className="dashboard-live-payout">
                      Estimated payout:{" "}
                      <span className="payout-amount">
                        $
                        {(
                          Math.max(0, Number(betIncrease || 0)) *
                          2.05
                        ).toFixed(2)}
                      </span>
                    </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="dashboard-live-expanded"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {(() => {
                      const sportData =
                        liveData[activeSport as keyof typeof liveData];
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
                        {sportOptions.map((sport) => (
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
                          {(
                            Math.max(0, Number(betIncrease || 0)) *
                            payoutMultiplier[activeSport as keyof typeof payoutMultiplier]
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div className="dashboard-live-showcase">
                      <div className="dashboard-live-board">
                        <div className="dashboard-live-board-header">
                          <span>Matchups</span>
                          <span>Odds</span>
                          <span>Edge</span>
                          <span>Payout</span>
                        </div>
                        {activeBoard.map((row) => (
                          <div className="dashboard-live-board-row" key={row.matchup}>
                            <span>{row.matchup}</span>
                            <span>{row.odds}</span>
                            <span>{row.edge}</span>
                            <span>
                              <span className="payout-amount">
                                $
                                {(
                                  Math.max(0, Number(betIncrease || 0)) *
                                  (payoutMultiplier[
                                    activeSport as keyof typeof payoutMultiplier
                                  ] +
                                    row.payoutBoost)
                                ).toFixed(2)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="dashboard-live-cards">
                        {activeCards.map((card) => (
                          <div className="dashboard-live-card" key={card.title}>
                            <div className="dashboard-live-title">{card.title}</div>
                            <div className="dashboard-live-meta">
                              {activeSport} • {card.meta}
                            </div>
                            <div className="dashboard-live-odds">Odds: {card.odds}</div>
                            <div className="dashboard-live-payout">
                              Estimated payout:{" "}
                              <span className="payout-amount">
                                $
                                {(
                                  Math.max(0, Number(betIncrease || 0)) *
                                  (payoutMultiplier[
                                    activeSport as keyof typeof payoutMultiplier
                                  ] +
                                    card.payoutBoost)
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </section>
            <section
              className={`dashboard-leaderboard dashboard-expandable${
                isLeaderboardExpanded ? " is-expanded" : ""
              }`}
              aria-label="Leaderboard top earners"
            >
              <div className="dashboard-leaderboard-header">
                <div className="dashboard-arb-header-left">
                  <h3>Leaderboard top earners</h3>
                  <p>Rolling 24-hour earnings across live slips.</p>
                </div>
                <span className="dashboard-leaderboard-pill">Updated 5m ago</span>
              </div>
              {isLeaderboardExpanded ? (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label="Close leaderboard"
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
                  aria-label="Expand leaderboard"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!expandedPanel) {
                      setExpandedPanel("leaderboard");
                    }
                  }}
                >
                  +
                </button>
              )}
              <div className="dashboard-leaderboard-table">
                <div className="dashboard-leaderboard-row header">
                  <span>Rank</span>
                  <span>Player</span>
                  <span>Sport</span>
                  <span>Win rate</span>
                  <span>Earnings</span>
                </div>
                {[
                  {
                    rank: "01",
                    name: "NovaSkies",
                    sport: "Basketball",
                    rate: "68%",
                    earnings: "$4,820",
                  },
                  {
                    rank: "02",
                    name: "IceLine",
                    sport: "Football",
                    rate: "64%",
                    earnings: "$4,120",
                  },
                  {
                    rank: "03",
                    name: "CoastEdge",
                    sport: "Soccer",
                    rate: "61%",
                    earnings: "$3,760",
                  },
                  {
                    rank: "04",
                    name: "SignalForge",
                    sport: "Baseball",
                    rate: "59%",
                    earnings: "$3,210",
                  },
                  {
                    rank: "05",
                    name: "HighRoller",
                    sport: activeSport,
                    rate: "57%",
                    earnings: "$2,980",
                  },
                ].map((entry) => (
                  <div className="dashboard-leaderboard-row" key={entry.rank}>
                    <span>{entry.rank}</span>
                    <span>{entry.name}</span>
                    <span>{entry.sport}</span>
                    <span>{entry.rate}</span>
                    <span>{entry.earnings}</span>
                  </div>
                ))}
              </div>
              {isLeaderboardExpanded ? (
                <div
                  className="dashboard-leaderboard-expanded"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="dashboard-leaderboard-cards">
                    <div className="dashboard-leaderboard-card">
                      <span>Biggest streak</span>
                      <strong>11 wins</strong>
                      <p>NovaSkies • +$1,420</p>
                    </div>
                    <div className="dashboard-leaderboard-card">
                      <span>Fastest climb</span>
                      <strong>+7 ranks</strong>
                      <p>IceLine • +$860</p>
                    </div>
                    <div className="dashboard-leaderboard-card">
                      <span>Hot sport</span>
                      <strong>Basketball</strong>
                      <p>62% win rate</p>
                    </div>
                  </div>
                  <div className="dashboard-leaderboard-feed">
                    <div className="dashboard-leaderboard-feed-row">
                      <span>CoastEdge hit +210 live ML</span>
                      <span>+$420</span>
                    </div>
                    <div className="dashboard-leaderboard-feed-row">
                      <span>SignalForge 4-leg parlay</span>
                      <span>+$610</span>
                    </div>
                    <div className="dashboard-leaderboard-feed-row">
                      <span>HighRoller sweep</span>
                      <span>+$390</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
            <section
              id="arbitrage-bets"
              className={`${
                arbEvView === "arb" ? "dashboard-arb" : "dashboard-ev"
              } dashboard-expandable${isArbEvExpanded ? " is-expanded" : ""}`}
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
                      arbEvView === "arb"
                        ? "dashboard-arb-field"
                        : "dashboard-ev-field"
                    }
                  >
                    <span>Date</span>
                    <input type="date" />
                  </label>
                  <label
                    className={
                      arbEvView === "arb"
                        ? "dashboard-arb-field"
                        : "dashboard-ev-field"
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
                      arbEvView === "arb"
                        ? "dashboard-arb-field"
                        : "dashboard-ev-field"
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
              {isArbEvExpanded ? (
                <button
                  className="dashboard-panel-close"
                  type="button"
                  aria-label={`Close ${arbEvView === "arb" ? "arbitrage" : "EV"} bets`}
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
                  aria-label={`Expand ${arbEvView === "arb" ? "arbitrage" : "EV"} bets`}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!expandedPanel) {
                      setExpandedPanel("arb-ev");
                    }
                  }}
                >
                  +
                </button>
              )}
              {arbEvView === "arb" ? (
                <>
                  <div className="dashboard-arb-body">
                    <div className="dashboard-arb-left">
                      <div className="dashboard-arb-limit">
                        <span>Include bet limits</span>
                        <div className="dashboard-arb-toggle-group">
                          <button
                            type="button"
                            className="dashboard-arb-toggle is-active"
                          >
                            On
                          </button>
                          <button
                            type="button"
                            className="dashboard-arb-toggle is-off"
                          >
                            Off
                          </button>
                        </div>
                      </div>
                      <div className="dashboard-arb-metric">
                        <span>Arb ways</span>
                        <div className="dashboard-arb-ways">
                          <button
                            type="button"
                            className={`dashboard-arb-way${
                              arbWays === "2-way" ? " is-active" : ""
                            }`}
                            onClick={() => setArbWays("2-way")}
                          >
                            2-way
                          </button>
                          <button
                            type="button"
                            className={`dashboard-arb-way${
                              arbWays === "3-way" ? " is-active" : ""
                            }`}
                            onClick={() => setArbWays("3-way")}
                          >
                            3-way
                          </button>
                          <button
                            type="button"
                            className={`dashboard-arb-way${
                              arbWays === "4-way" ? " is-active" : ""
                            }`}
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
                  {isArbEvExpanded ? (
                    <div
                      className="dashboard-arb-expanded"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="dashboard-arb-grid">
                        <div className="dashboard-arb-card">
                          <span>Live arb feed</span>
                          <strong>12 alerts</strong>
                          <p>2-way + 3-way mixes ready.</p>
                        </div>
                        <div className="dashboard-arb-card">
                          <span>Best books combo</span>
                          <strong>Primebook + Jetline</strong>
                          <p>Avg ROI: 2.8%</p>
                        </div>
                        <div className="dashboard-arb-card">
                          <span>Stake guard</span>
                          <strong>Auto-capped</strong>
                          <p>Max per arb: $250</p>
                        </div>
                      </div>
                      <div className="dashboard-arb-list">
                        <div className="dashboard-arb-list-row">
                          <span>Northbridge FC vs Harbor</span>
                          <span>ROI 3.1%</span>
                          <span>2-way</span>
                        </div>
                        <div className="dashboard-arb-list-row">
                          <span>Skyline Kings spread</span>
                          <span>ROI 2.4%</span>
                          <span>3-way</span>
                        </div>
                        <div className="dashboard-arb-list-row">
                          <span>Prairie Owls ML</span>
                          <span>ROI 2.9%</span>
                          <span>2-way</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
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
                            className={`dashboard-ev-way${
                              evType === "+EV" ? " is-active" : ""
                            }`}
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
                  {isArbEvExpanded ? (
                    <div
                      className="dashboard-ev-expanded"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="dashboard-ev-grid">
                        <div className="dashboard-ev-card">
                          <span>Model confidence</span>
                          <strong>82%</strong>
                          <p>Edge ≥ 3% on 9 slips.</p>
                        </div>
                        <div className="dashboard-ev-card">
                          <span>Top edge</span>
                          <strong>+5.6%</strong>
                          <p>Skyline Kings O 218.5</p>
                        </div>
                        <div className="dashboard-ev-card">
                          <span>Fast EV mix</span>
                          <strong>6 picks</strong>
                          <p>Avg payout: +165</p>
                        </div>
                      </div>
                      <div className="dashboard-ev-list">
                        <div className="dashboard-ev-list-row">
                          <span>Harbor Jets ML</span>
                          <span>Edge +4.1%</span>
                          <span>Odds +138</span>
                        </div>
                        <div className="dashboard-ev-list-row">
                          <span>Northbridge -0.5</span>
                          <span>Edge +3.6%</span>
                          <span>Odds +118</span>
                        </div>
                        <div className="dashboard-ev-list-row">
                          <span>Comets -1.5</span>
                          <span>Edge +4.3%</span>
                          <span>Odds +128</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
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
                    if (!expandedPanel) {
                      setExpandedPanel("withdrawal");
                    }
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
                    if (!expandedPanel) {
                      setExpandedPanel("tools");
                    }
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
                      if (!expandedPanel) {
                        setExpandedPanel("chat");
                      }
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

      <footer className="site-footer">
        <div>
          <strong>Unbounded</strong>
        </div>
        <div className="footer-links">
          <a href="#">Contact</a>
          <a href="#">Terms and services</a>
          <a href="#">Blog</a>
          <a href="#">About</a>
        </div>
      </footer>
    </div>
  );
}
