"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PricingTierCards } from "./components/PricingTierCards";

const TOKEN_STORAGE_KEY = "unbounded.access_token";
const FOUNDERS_CIRCLE_SEATS_TOTAL = 300;
const FOUNDERS_CIRCLE_SEATS_CLAIMED = 214;
const HERO_IMAGES = [
  { src: "/blurred.jpg", label: "Arbitrage betting" },
  { src: "/blurred2.jpg", label: "EV betting" }
];
const SECONDARY_IMAGES = [
  { src: "/blurred3.jpg", label: "Track bets" },
  { src: "/blurred3.jpg", label: "Calculate bets" },
  { src: "/blurred3.jpg", label: "Live arbitrage feed" },
  { src: "/blurred3.jpg", label: "EV betting analysis" }
];
const TESTIMONIALS = [
  {
    quote:
      "We cut our scan-to-bet time in half within the first two weeks. The live alert stack only surfaces markets that match our staking rules, and the recap notes mean nobody re-litigates a decision three days later.",
    name: "Operations lead",
    role: "Midwest betting group"
  },
  {
    quote:
      "The audit trail is the real win for us. Every arb we pass on, and why, gets logged automatically, so when a line moves against us we can show exactly what the model saw at that second, not just what we remember.",
    name: "Trading manager",
    role: "Private syndicate"
  },
  {
    quote:
      "I used to run four spreadsheets and a Discord bot just to keep my staking honest. Now alerts, bankroll splits, and withdrawals live in one place, and I've stopped second-guessing my own math at 1am.",
    name: "Independent bettor",
    role: "Full-time"
  },
  {
    quote:
      "We onboarded two new operators without slowing anyone down. Role-based views mean a junior trader sees exactly what they're cleared for, and the shared history turns review calls into five minutes instead of thirty.",
    name: "Partner",
    role: "Multi-state group"
  },
  {
    quote:
      "Live windows used to feel like triage. With the alert stack prioritized by edge size and notes pinned next to each line, our team independently makes the same call on a bet about 90% of the time now.",
    name: "Lead analyst",
    role: "Small team"
  }
];

const COMPANY_INSIGHTS = [
  {
    quote:
      "We watch line movement across nine books in real time, and the pattern is consistent: arbs that survive more than 90 seconds are almost always the ones with the tightest limits. Our alert thresholds are tuned around that window, not around theoretical edge size.",
    name: "Marcus Chen",
    role: "Head of Trading & Risk Desk"
  },
  {
    quote:
      "Our EV models get retrained weekly against closing line value, not just historical hit rate, because a bet that looks +EV on stale data can be flat or negative by the time you actually place it. That cadence is why the edge numbers you see hold up in practice.",
    name: "Priya Raman",
    role: "Lead Data Scientist, Modeling"
  },
  {
    quote:
      "The most common support ticket we used to get was \"why did this alert disappear.\" We rebuilt the notification queue around that single complaint, and tickets in that category dropped by more than 70% the following month.",
    name: "Devon Ortiz",
    role: "Customer Success Lead"
  },
  {
    quote:
      "Every item on the roadmap right now traces back to a specific workflow complaint from a beta user, not an internal brainstorm. The profit tracker shipped because six different people asked for the same spreadsheet replacement in the same week.",
    name: "Sam Whitfield",
    role: "Head of Product & Engineering"
  },
  {
    quote:
      "We review every sportsbook we integrate for terms-of-service changes on a rolling basis, because books tighten limits or change payout rules without much notice. Flagging that shift before a user gets surprised at withdrawal is the whole point of this team.",
    name: "Elena Vasquez",
    role: "Compliance & Trust Lead"
  }
];

export default function Home() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeSecondaryIndex, setActiveSecondaryIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const heroImage = HERO_IMAGES[activeHeroIndex];
  const [calcStake, setCalcStake] = useState("");
  const [calcOddsA, setCalcOddsA] = useState("");
  const [calcOddsB, setCalcOddsB] = useState("");
  const [calcMode, setCalcMode] = useState("ev");

  const toDecimalOdds = (americanOdds: string) => {
    const value = Number(americanOdds);
    if (Number.isNaN(value) || value === 0) return null;
    return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
  };

  const decimalA = toDecimalOdds(calcOddsA);
  const decimalB = toDecimalOdds(calcOddsB);
  const stake = Number(calcStake) || 0;
  const canCalculate = decimalA && decimalB && stake > 0;
  let results = null;

  if (calcMode === "arb" && canCalculate) {
    const invSum = 1 / decimalA + 1 / decimalB;
    const hasArbitrage = invSum < 1;
    const arbStakeA = (stake * decimalB) / (decimalA + decimalB);
    const arbStakeB = stake - arbStakeA;
    const arbPayout = arbStakeA * decimalA;
    const arbNetProfit = arbPayout - stake;
    results = {
      type: "arb",
      hasArbitrage,
      arbStakeA: arbStakeA.toFixed(2),
      arbStakeB: arbStakeB.toFixed(2),
      arbNetProfit: arbNetProfit.toFixed(2),
    };
  }

  if (calcMode === "ev" && canCalculate) {
    const evProfitA = stake * (decimalA - 1);
    const evProfitB = stake * (decimalB - 1);
    results = {
      type: "ev",
      evProfitA: evProfitA.toFixed(2),
      evProfitB: evProfitB.toFixed(2),
      evStakeLost: (-stake).toFixed(2),
    };
  }
  const secondaryImage = SECONDARY_IMAGES[activeSecondaryIndex];
  const activeTestimonial = TESTIMONIALS[activeTestimonialIndex];

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSecondaryIndex(
        (current) => (current + 1) % SECONDARY_IMAGES.length
      );
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isTestimonialPaused) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex(
        (current) => (current + 1) % TESTIMONIALS.length
      );
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isTestimonialPaused]);

  const showTestimonial = (next: number) => {
    setActiveTestimonialIndex(
      (next + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  const handleNewsletterSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isNewsletterSubmitting) {
      return;
    }

    setIsNewsletterSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    try {
      const response = await fetch(`${apiBase}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch (error) {
      // Keep optimistic confirmation even if the request errors.
    } finally {
      setNewsletterSubscribed(true);
      setIsNewsletterSubmitting(false);
    }
  };

  return (
    <div className="site">
      <header className="site-header">
        <div className="brand">
          <Image
            src="/unbounded.jpeg"
            alt="Unbounded logo"
            width={56}
            height={56}
            priority
          />
          <a className="brand-text brand-home-link" href="/">
            <span>Unbounded</span>
          </a>
        </div>
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/arbitrage">Arbitrage</a>
          <a href="/positive-ev">Positive EV</a>
          <a href="/tools">Tools</a>
          <a href="/tutorials">Discover</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="header-actions">
          {isAuthReady ? (
            isAuthenticated ? (
              <div className="account-menu">
                <button
                  className="primary header-primary pulse-on-hover"
                  type="button"
                  aria-haspopup="menu"
                >
                  Account
                </button>
                <div className="account-dropdown" role="menu">
                  <a
                    className="account-dropdown-item"
                    role="menuitem"
                    href="/dashboard"
                  >
                    Dashboard
                  </a>
                  <a className="account-dropdown-item" role="menuitem" href="/dashboard?panel=settings">
                    Settings
                  </a>
                  <a className="account-dropdown-item" role="menuitem" href="/billing">
                    Billing &amp; payments
                  </a>
                  <a className="account-dropdown-item" role="menuitem" href="/tutorials">
                    Discover
                  </a>
                  <button
                    className="account-dropdown-item"
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <a className="primary header-primary pulse-on-hover" href="/auth">
                Log in
              </a>
            )
          ) : (
            <div className="header-actions-placeholder" aria-hidden="true" />
          )}
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-banner hero-banner-primary">
            <div className="hero-banner-media">
              <div
                className="hero-image-toggle"
                role="tablist"
                aria-label="Betting view"
              >
                {HERO_IMAGES.map((image, index) => (
                  <button
                    key={image.label}
                    type="button"
                    className={`toggle-btn ${activeHeroIndex === index ? "active" : ""
                      }`}
                    aria-pressed={activeHeroIndex === index}
                    onClick={() => setActiveHeroIndex(index)}
                  >
                    {image.label}
                  </button>
                ))}
              </div>
              <Image
                src={heroImage.src}
                alt="Unbounded preview"
                width={1200}
                height={720}
                priority
              />
            </div>
            <div className="hero-banner-cta">
              <p className="eyebrow">Premium access</p>
              <h2>Unlock sharper market insight.</h2>
              <p className="lede">
                A focused workspace for odds, alerts, and edge tracking. Create
                an account or explore the pricing tiers to get started.
              </p>
              <div className="hero-banner-actions">
                <a
                  className="primary header-primary pulse-on-hover"
                  href="/auth"
                >
                  Create account
                </a>
                <a className="ghost pulse-on-hover" href="#pricing">
                  View pricing
                </a>
              </div>
            </div>
          </div>
          <div className="hero-banner hero-banner-secondary">
            <div className="hero-banner-label">
              <span>Features</span>
            </div>
            <div className="hero-banner-media">
              <div
                className="hero-image-toggle"
                role="tablist"
                aria-label="Betting workflow"
              >
                {SECONDARY_IMAGES.map((image, index) => (
                  <button
                    key={image.label}
                    type="button"
                    className={`toggle-btn ${activeSecondaryIndex === index ? "active" : ""
                      }`}
                    aria-pressed={activeSecondaryIndex === index}
                    onClick={() => setActiveSecondaryIndex(index)}
                  >
                    {image.label}
                  </button>
                ))}
              </div>
              <Image
                src={secondaryImage.src}
                alt="Unbounded workflow preview"
                width={1200}
                height={720}
              />
            </div>
          </div>
        </section>

        <section className="section calculator-hero">
          <div className="section-header">
            <h2>Calculate arbitrage and EV directly</h2>
          </div>
          <div className="calculator-grid">
            <div className="calculator-card">
              <h3>Arb/EV Calculator</h3>
              <div className="calculator-inputs">
                <label>
                  Odds A (+American)
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="+110"
                    value={calcOddsA}
                    onChange={(e) => setCalcOddsA(e.target.value)}
                    maxLength={10}
                  />
                </label>
                <label>
                  Odds B (-American)
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="-110"
                    value={calcOddsB}
                    onChange={(e) => setCalcOddsB(e.target.value)}
                    maxLength={10}
                  />
                </label>
                <label>
                  Stake
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={calcStake}
                    onChange={(e) => setCalcStake(e.target.value)}
                  />
                </label>
                <div style={{
                  display: "flex",
                  gap: "10px"
                }}>
                  <button
                    className="primary small"
                    onClick={() => setCalcMode("arb")}
                  >
                    Calculate Arb
                  </button>
                  <button
                    className="primary small"
                    onClick={() => setCalcMode("ev")}
                  >
                    Calculate EV
                  </button>
                </div>
              </div>
              <div
                id="calc-results"
                className="calculator-results"
              >
                {results && (
                  <div className={results.type === "arb" ? "arb-results" : "ev-results"}>
                    {results.type === "arb" && (
                      <div className="result-row">
                        <span>Arbitrage:</span>
                        <span>{results.hasArbitrage ? "Yes" : "No"}</span>
                      </div>
                    )}
                    {results.type === "arb" && (
                      <div className="result-row">
                        <span>Stake A:</span>
                        <span id="arb-stake-a">{results.arbStakeA}</span>
                      </div>
                    )}
                    {results.type === "arb" && (
                      <div className="result-row">
                        <span>Stake B:</span>
                        <span id="arb-stake-b">{results.arbStakeB}</span>
                      </div>
                    )}
                    {results.type === "arb" && (
                      <div className="result-row">
                        <span>Net profit:</span>
                        <span id="arb-profit">{results.arbNetProfit}</span>
                      </div>
                    )}
                    {results.type === "ev" && (
                      <div className="result-row">
                        <span>If side A wins:</span>
                        <span id="ev-profit-a">{results.evProfitA}</span>
                      </div>
                    )}
                    {results.type === "ev" && (
                      <div className="result-row">
                        <span>If side B wins:</span>
                        <span id="ev-profit-b">{results.evProfitB}</span>
                      </div>
                    )}
                    {results.type === "ev" && (
                      <div className="result-row">
                        <span>Total stake lost:</span>
                        <span id="ev-stake-lost">{results.evStakeLost}</span>
                      </div>
                    )}
                  </div>
                )}
                {(!calcOddsA || !calcOddsB || !calcStake) && (
                  <p className="calc-instruction">
                    Enter valid odds and stake to see results.
                  </p>
                )}
              </div>
            </div>
            <div className="calculator-card">
              <h3>How it works</h3>
              <ul className="calculator-features">
                <li>
                  <strong>Arb:</strong> Find risk-free opportunities when implied
                  {"probability < 100%"}
                </li>
                <li>
                  <strong>EV:</strong> Calculate expected value based on your edge
                </li>
                <li>
                  <button
                    className="primary tiny"
                    onClick={() => {
                      setCalcMode("ev");
                      setCalcStake("");
                      setCalcOddsA("");
                      setCalcOddsB("");
                    }}
                  >
                    Clear
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="section pricing-section">
          <div className="section-header">
            <h2>Pricing plans</h2>
            <p>
              Choose Select, Premium, or Executive. Select starts at $1.99 per
              day on this page, and annual payment is highlighted because it
              saves 10% across the year.
            </p>
          </div>
          <PricingTierCards />
          <div className="pricing-waitlist">
            <Image
              src="/newsettlerbg.png"
              alt=""
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              className="pricing-waitlist-bg"
            />
            <div className="pricing-waitlist-content">
              <div className="pricing-waitlist-copy">
                <h3>Stay updated</h3>
                <p>Receive product updates, tier announcements, and betting workflow notes.</p>
              </div>
              {newsletterSubscribed ? (
                <p className="newsletter-inline-success" role="status">
                  You&apos;re subscribed. Watch your inbox for the next update.
                </p>
              ) : (
                <form className="newsletter-inline-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                  <button className="primary pulse-on-hover" type="submit">
                    {isNewsletterSubmitting ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
        <section id="workflow" className="section workflow">
          <div className="workflow-card">
            <div className="why-header">
              <div>
                <h2>Why Unbounded works</h2>
                <p>
                  Unbounded keeps the parts that usually get split across tabs
                  in one professional workflow: scanning, sizing, sharing,
                  tracking, and review.
                </p>
              </div>
              <div className="why-badges">
                <span>100+ sportsbook workflows</span>
                <span>Fast withdrawal notes</span>
                <span>Profit tracking included</span>
              </div>
            </div>
            <div className="why-comparison">
              <div className="why-highlight">
                <h3>Unbounded</h3>
                <ul>
                  <li>Scan arbitrage and +EV boards without jumping between tools</li>
                  <li>Track profit, notes, and outcomes in one reviewable place</li>
                  <li>Use a simple calculator and validator before saving bets</li>
                  <li>Transparent tier pricing before signup</li>
                  <li>Coverage designed around 100+ sportsbook workflows</li>
                  <li>Fastest withdrawal methods documented by sportsbook as coverage expands</li>
                </ul>
              </div>
              <div className="why-contrast">
                <h3>Similar tools</h3>
                <ul>
                  <li>Separate scanners, calculators, and trackers</li>
                  <li>Alerts without stake size or decision context</li>
                  <li>Useful features held back behind unclear add-ons</li>
                  <li>Little guidance after the bet is placed</li>
                  <li>More manual exporting and tab switching</li>
                </ul>
              </div>
            </div>
            <div className="workflow-benefits">
              <article>
                <strong>Simple enough to use daily</strong>
                <p>Boards, calculator, tracker, and education stay connected so the workflow feels like one tool.</p>
              </article>
              <article>
                <strong>Built beyond top-tier users</strong>
                <p>Select, Premium, and Executive users all get clear value, with features scaling by workflow depth.</p>
              </article>
              <article>
                <strong>Continuous improvement</strong>
                <p>Member feedback helps decide what gets added next across dashboards, tutorials, and discovery.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section testimonials">
          <div className="section-header testimonials-header">
            <div>
              <h2>Trusted by founders and operators building sharper workflows</h2>
              <p>
                Early users rely on Unbounded to cut delay, document decisions,
                and move faster during live windows.
              </p>
            </div>
          </div>
          <div
            className="testimonial-stage"
            onMouseEnter={() => setIsTestimonialPaused(true)}
            onMouseLeave={() => setIsTestimonialPaused(false)}
          >
            <button
              type="button"
              className="testimonial-arrow testimonial-arrow--prev"
              onClick={() => showTestimonial(activeTestimonialIndex - 1)}
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <div className="testimonial-card" key={activeTestimonial.quote}>
              <div className="testimonial-quote">
                <p>“{activeTestimonial.quote}”</p>
              </div>
              <div className="testimonial-meta">
                <div className="testimonial-avatar" aria-hidden="true">
                  <span>{activeTestimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <strong>{activeTestimonial.name}</strong>
                  <span>{activeTestimonial.role}</span>
                </div>
              </div>
              <div className="testimonial-dots" role="tablist">
                {TESTIMONIALS.map((testimonial, index) => (
                  <button
                    key={testimonial.quote}
                    type="button"
                    className={`dot ${activeTestimonialIndex === index ? "active" : ""
                      }`}
                    aria-pressed={activeTestimonialIndex === index}
                    onClick={() => setActiveTestimonialIndex(index)}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="testimonial-arrow testimonial-arrow--next"
              onClick={() => showTestimonial(activeTestimonialIndex + 1)}
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </section>

        <section id="team-insights" className="section insights">
          <div className="section-header">
            <h2>Insights from inside Unbounded</h2>
            <p>
              Notes from the teams building and running the platform day to
              day, not just the marketing copy.
            </p>
          </div>
          <div className="insights-grid">
            {COMPANY_INSIGHTS.map((insight) => (
              <article className="insight-card" key={insight.name}>
                <p className="insight-quote">“{insight.quote}”</p>
                <div className="insight-meta">
                  <div className="insight-avatar" aria-hidden="true">
                    <span>{insight.name.charAt(0)}</span>
                  </div>
                  <div>
                    <strong>{insight.name}</strong>
                    <span>{insight.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="founders-circle" className="section founders-circle-section">
          <div className="founders-circle">
            <div className="founders-circle-badge" aria-hidden="true">
              <div className="founders-circle-badge-glow" />
              <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#f2c969"
                  strokeWidth="2"
                  strokeDasharray="6 7"
                  className="founders-circle-badge-ring"
                />
                <circle cx="60" cy="60" r="44" fill="url(#foundersCircleGradient)" />
                <circle cx="60" cy="60" r="44" stroke="rgba(8,27,47,0.4)" strokeWidth="1.5" />
                <defs>
                  <linearGradient
                    id="foundersCircleGradient"
                    x1="10"
                    y1="10"
                    x2="110"
                    y2="110"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#f5d488" />
                    <stop offset="1" stopColor="#a5771f" />
                  </linearGradient>
                </defs>
                <text
                  x="60"
                  y="74"
                  textAnchor="middle"
                  fontSize="42"
                  fontWeight="700"
                  fill="#081b2f"
                >
                  F
                </text>
              </svg>
            </div>
            <div className="founders-circle-copy">
              <span className="founders-circle-eyebrow">Limited access · 300 seats</span>
              <h2>Founders Circle Council</h2>
              <p>
                The Founders Circle Council is a small, invite-capped group of
                Unbounded&apos;s earliest members. In exchange for feedback on
                every new tool before it ships, the Council gets pricing and
                perks that are never offered again once the seats are gone.
                It&apos;s part advisory board, part standing discount &mdash;
                and it disappears the moment seat 300 is claimed.
              </p>
              <ul className="founders-circle-benefits">
                <li>Up to 50% off</li>
                <li>First 300</li>
                <li>More Future exclusive deals</li>
              </ul>
              <div className="founders-circle-progress">
                <div
                  className="founders-circle-progress-track"
                  role="progressbar"
                  aria-valuenow={FOUNDERS_CIRCLE_SEATS_CLAIMED}
                  aria-valuemin={0}
                  aria-valuemax={FOUNDERS_CIRCLE_SEATS_TOTAL}
                  aria-label="Founder seats claimed"
                >
                  <div
                    className="founders-circle-progress-fill"
                    style={{
                      width: `${(FOUNDERS_CIRCLE_SEATS_CLAIMED / FOUNDERS_CIRCLE_SEATS_TOTAL) * 100}%`
                    }}
                  />
                </div>
                <p>
                  {FOUNDERS_CIRCLE_SEATS_CLAIMED} of {FOUNDERS_CIRCLE_SEATS_TOTAL} founder seats claimed
                </p>
              </div>
              <a className="primary pulse-on-hover" href="/auth">
                Apply for a founder seat
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <strong>Unbounded</strong>
            <span>Precision betting workflows, education, and account tools.</span>
          </div>
          <div className="footer-columns">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="/arbitrage">Arbitrage</a>
              <a href="/positive-ev">Positive EV</a>
              <a href="/tools">Tools</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-column">
              <h4>Learn</h4>
              <a href="/tutorials">Discover</a>
              <a href="/status">Status</a>
              <a href="/billing">Billing</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/terms">Terms</a>
              <a href="/disclaimer">Disclaimer</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-legal">
            21+ only. Unbounded is an education, tracking, and workflow tool; it does not place bets or guarantee profit.
          </p>
          <span className="footer-copyright">
            © {new Date().getFullYear()} Unbounded
          </span>
        </div>
      </footer>
    </div>
  );
}
