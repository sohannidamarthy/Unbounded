"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PricingTierCards } from "./components/PricingTierCards";
import CommonCarousel from "./components/CommonCarousel";
import HowCanWeHelp from "./components/howcanwehelp/HowCanWeHelp";
import Container from "./components/container/Container";
import SectionHeader from "./components/SectionHeader";
import Header from "./components/header/Header";
import StayUpdated from "./components/stay-updated/StayUpdated";
import FoundersCircle from "./components/founders-circle/FoundersCircle";

const TOKEN_STORAGE_KEY = "unbounded.access_token";
const FOUNDERS_CIRCLE_SEATS_TOTAL = 300;
const FOUNDERS_CIRCLE_SEATS_CLAIMED = 214;
const HERO_IMAGES = [
  { src: "/blurred.jpg", label: "Arbitrage betting" },
  { src: "/blurred2.jpg", label: "EV betting" }
];
const SECONDARY_IMAGES = [
  { src: "/blurred3.jpg", label: "Track bets" },
  { src: "/blurred4.jpg", label: "Calculate bets" },
  { src: "/blurred2.jpg", label: "Live arbitrage feed" },
  { src: "/blurred.jpg", label: "EV betting analysis" }
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Scan the boards",
    description:
      "Arbitrage and positive EV boards surface priced-out mismatches across sportsbooks as they open, so you're not tab-hopping between books to spot them yourself."
  },
  {
    title: "Let the calculator flag the edge",
    description:
      "Drop the odds into the calculator below and it converts them to implied probability, checks for arbitrage, and shows the payout on each side before you commit a dollar."
  },
  {
    title: "Log the bet",
    description:
      "Use the validator and manual entry tool to record stake, odds, and book for every position, so decisions are documented the moment you make them, not reconstructed later."
  },
  {
    title: "Track results",
    description:
      "The profit tracker rolls logged bets into running P&L, so you can review what worked without rebuilding a spreadsheet every week."
  }
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
  const [isFoundersCircleSubmitting, setIsFoundersCircleSubmitting] = useState(false);
  const [foundersCircleSubmitted, setFoundersCircleSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const heroImage = HERO_IMAGES[activeHeroIndex];
  const [calcStake, setCalcStake] = useState("");
  const [calcOddsA, setCalcOddsA] = useState("");
  const [calcOddsB, setCalcOddsB] = useState("");
  const [calcMode, setCalcMode] = useState("ev");
  const [showExample, setShowExample] = useState(false);

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
    const holdPct = (invSum - 1) * 100;
    results = {
      type: "arb",
      hasArbitrage,
      arbStakeA: arbStakeA.toFixed(2),
      arbStakeB: arbStakeB.toFixed(2),
      arbNetProfit: arbNetProfit.toFixed(2),
      holdPct: holdPct.toFixed(2),
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

  const handleFoundersCircleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isFoundersCircleSubmitting) {
      return;
    }

    setIsFoundersCircleSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    try {
      const response = await fetch(`${apiBase}/founders-circle/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch (error) {
      // Keep optimistic confirmation even if the request errors.
    } finally {
      setFoundersCircleSubmitted(true);
      setIsFoundersCircleSubmitting(false);
    }
  };

  return (
    <div className="site">
      <header>
        <Container>
          <div className="site-header">
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
          </div>
        </Container>
      </header>

      {/* <Header /> */}

      <main>
        <section className="section hero-section">
          <Container>
            <div className="hero-banner hero-banner-primary">
              <div className="hero-banner-cta">
                <p className="eyebrow">Premium access</p>
                <h2>Unlock sharper market <span>insight.</span></h2>
                <p className="lede">
                  A focused workspace for odds, alerts, and edge tracking. Create
                  an account or explore the pricing tiers to get started.
                </p>
                <div className="hero-banner-actions">
                  <a className="primary header-primary" href="/auth">
                    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 10V7H14V5H17V2H19V5H22V7H19V10H17ZM5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8C6.9 8 5.95833 7.60833 5.175 6.825ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6C8.55 6 9.02083 5.80417 9.4125 5.4125Z" fill="currentColor" />
                    </svg>

                    Create account
                  </a>
                  <a className="ghost" href="#pricing">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 19C9.1385 19 8.79408 18.9324 8.46675 18.7973C8.13925 18.6621 7.84908 18.4668 7.59625 18.2115C7.09358 17.7153 6.6625 17.3907 6.303 17.2375C5.94333 17.0843 5.40392 17.0077 4.68475 17.0077C3.93675 17.0077 3.301 16.746 2.7775 16.2225C2.254 15.699 1.99225 15.0632 1.99225 14.3152C1.99225 13.6026 1.91542 13.0646 1.76175 12.7013C1.60808 12.3379 1.28367 11.9054 0.7885 11.4038C0.530833 11.1461 0.335 10.8538 0.201 10.527C0.067 10.2002 0 9.8585 0 9.502C0 9.1455 0.067 8.80317 0.201 8.475C0.335 8.14683 0.530833 7.85392 0.7885 7.59625C1.28367 7.09808 1.60808 6.66867 1.76175 6.308C1.91542 5.94717 1.99225 5.40608 1.99225 4.68475C1.99225 3.93675 2.254 3.301 2.7775 2.7775C3.301 2.254 3.93675 1.99225 4.68475 1.99225C5.39742 1.99225 5.93542 1.91542 6.29875 1.76175C6.66208 1.60808 7.09458 1.28367 7.59625 0.788499C7.84958 0.533166 8.14017 0.337916 8.468 0.20275C8.79583 0.067583 9.13858 0 9.49625 0C9.85392 0 10.1968 0.0669995 10.525 0.200999C10.8532 0.334999 11.1461 0.530833 11.4038 0.788499C11.9019 1.28367 12.3313 1.60808 12.692 1.76175C13.0528 1.91542 13.5939 1.99225 14.3152 1.99225C15.0632 1.99225 15.699 2.254 16.2225 2.7775C16.746 3.301 17.0077 3.93675 17.0077 4.68475C17.0077 5.39742 17.0846 5.93542 17.2383 6.29875C17.3919 6.66208 17.7163 7.09458 18.2115 7.59625C18.4692 7.85392 18.665 8.14617 18.799 8.473C18.933 8.79983 19 9.1415 19 9.498C19 9.8545 18.933 10.1968 18.799 10.525C18.665 10.8532 18.4692 11.1461 18.2115 11.4038C17.7153 11.9064 17.3907 12.3375 17.2375 12.697C17.0843 13.0567 17.0077 13.5961 17.0077 14.3152C17.0077 15.0632 16.746 15.699 16.2225 16.2225C15.699 16.746 15.0632 17.0077 14.3152 17.0077C13.6026 17.0077 13.0646 17.0846 12.7013 17.2383C12.3379 17.3919 11.9054 17.7163 11.4038 18.2115C11.1509 18.4668 10.8608 18.6621 10.5333 18.7973C10.2059 18.9324 9.8615 19 9.5 19ZM9.50125 17.5C9.65942 17.5 9.81383 17.4677 9.9645 17.403C10.1152 17.3382 10.2418 17.2545 10.3443 17.152C10.9763 16.5135 11.5735 16.0798 12.136 15.851C12.6983 15.6222 13.4247 15.5078 14.3152 15.5078C14.6531 15.5078 14.9363 15.3935 15.165 15.165C15.3935 14.9363 15.5078 14.6531 15.5078 14.3152C15.5078 13.4192 15.6222 12.693 15.851 12.1365C16.0798 11.5802 16.5103 10.9827 17.1423 10.3442C17.3808 10.1058 17.5 9.82433 17.5 9.5C17.5 9.17567 17.384 8.89742 17.152 8.66525C16.5135 8.02692 16.0798 7.4265 15.851 6.864C15.6222 6.30167 15.5078 5.57525 15.5078 4.68475C15.5078 4.34692 15.3935 4.06367 15.165 3.835C14.9363 3.6065 14.6531 3.49225 14.3152 3.49225C13.4099 3.49225 12.6802 3.37942 12.126 3.15375C11.5718 2.92792 10.9748 2.49592 10.3348 1.85775C10.2321 1.75508 10.1054 1.66983 9.95475 1.602C9.80408 1.534 9.6525 1.5 9.5 1.5C9.3475 1.5 9.19433 1.53475 9.0405 1.60425C8.8865 1.67392 8.75825 1.75842 8.65575 1.85775C8.02375 2.48975 7.4265 2.92017 6.864 3.149C6.30167 3.37783 5.57525 3.49225 4.68475 3.49225C4.34692 3.49225 4.06367 3.6065 3.835 3.835C3.6065 4.06367 3.49225 4.34692 3.49225 4.68475C3.49225 5.58725 3.37783 6.31667 3.149 6.873C2.92017 7.4295 2.4865 8.02692 1.848 8.66525C1.616 8.89742 1.5 9.17567 1.5 9.5C1.5 9.82433 1.616 10.1058 1.848 10.3442C2.4865 10.9827 2.92017 11.5812 3.149 12.1395C3.37783 12.6978 3.49225 13.4231 3.49225 14.3152C3.49225 14.6531 3.6065 14.9363 3.835 15.165C4.06367 15.3935 4.34692 15.5078 4.68475 15.5078C5.58792 15.5078 6.31592 15.6222 6.86875 15.851C7.42158 16.0798 8.02042 16.5135 8.66525 17.152C8.76792 17.2545 8.89333 17.3382 9.0415 17.403C9.18983 17.4677 9.34308 17.5 9.50125 17.5ZM11.9345 13.1635C12.2795 13.1635 12.5706 13.0449 12.8077 12.8077C13.0449 12.5706 13.1635 12.2795 13.1635 11.9345C13.1635 11.5893 13.0449 11.296 12.8077 11.0545C12.5706 10.813 12.2795 10.6923 11.9345 10.6923C11.5893 10.6923 11.296 10.813 11.0545 11.0545C10.813 11.296 10.6923 11.5893 10.6923 11.9345C10.6923 12.2795 10.813 12.5706 11.0545 12.8077C11.296 13.0449 11.5893 13.1635 11.9345 13.1635ZM7.01725 13.027L13.027 7.027L11.973 5.973L5.973 11.9827L7.01725 13.027ZM7.9455 7.9455C8.187 7.704 8.30775 7.41067 8.30775 7.0655C8.30775 6.7205 8.187 6.42942 7.9455 6.19225C7.704 5.95508 7.41067 5.8365 7.0655 5.8365C6.7205 5.8365 6.42942 5.95508 6.19225 6.19225C5.95508 6.42942 5.8365 6.7205 5.8365 7.0655C5.8365 7.41067 5.95508 7.704 6.19225 7.9455C6.42942 8.187 6.7205 8.30775 7.0655 8.30775C7.41067 8.30775 7.704 8.187 7.9455 7.9455Z" fill="currentColor" />
                    </svg>

                    View pricing
                  </a>
                </div>
              </div>
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
            </div>
          </Container>
        </section>

        <section className="section tabs-section">
          <Container>
            <div className="hero-banner hero-banner-secondary">
              {/* <div className="hero-banner-label">
                <span>Features</span>
              </div> */}
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
          </Container>
        </section>

        <section className="section calculator-hero">
          <Container>
            <SectionHeader title="Calculate arbitrage and EV directly" />
            <div className="section-header">
              <h2></h2>
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
                      {results.type === "arb" && (
                        <div className="result-row">
                          <span>Book hold:</span>
                          <span id="arb-hold">{results.holdPct}%</span>
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
                <h3>How the math works</h3>
                <div className="calculator-explainer">
                  <p>
                    <strong>Implied probability</strong> is what a price says the
                    market thinks will happen: 1 ÷ decimal odds. American +110
                    converts to 2.10 decimal, or a 47.6% implied chance; -110
                    converts to 1.909 decimal, or 52.4%.
                  </p>
                  <p>
                    <strong>Arbitrage</strong> exists when the implied
                    probabilities on both sides of a bet add up to less than
                    100% &mdash; meaning the two books disagree enough that you
                    can stake both sides and lock in a profit no matter which
                    one wins.
                  </p>
                  {/* <div className="calculator-explainer-example">
                    <span>Worked example</span>
                    <p>
                      Type +110 into Odds A, -110 into Odds B, and 100 into
                      Stake above &mdash; the same numbers preloaded as
                      placeholders &mdash; and switch to Calculate Arb:
                    </p>
                    <ul>
                      <li>47.6% + 52.4% = 100.0% implied &rarr; no arbitrage here (a true arb needs the sum under 100%)</li>
                      <li>Stake splits proportionally across both sides so the payout matches regardless of winner</li>
                      <li>&quot;Book hold&quot; in the results shows how far over 100% the market is priced &mdash; the vig you&apos;re paying</li>
                    </ul>
                  </div> */}
                  <div className="calculator-explainer-example">
                    <span
                      className="worked-example-toggle"
                      onClick={() => setShowExample(!showExample)}
                    >
                      Worked example
                      <span className={`arrow ${showExample ? "open" : ""}`}></span>
                    </span>

                    {showExample && (
                      <>
                        <p>
                          Type +110 into Odds A, -110 into Odds B, and 100 into
                          Stake above &mdash; the same numbers preloaded as
                          placeholders &mdash; and switch to Calculate Arb:
                        </p>

                        <ul>
                          <li>
                            47.6% + 52.4% = 100.0% implied &rarr; no arbitrage here
                            (a true arb needs the sum under 100%)
                          </li>
                          <li>
                            Stake splits proportionally across both sides so the payout
                            matches regardless of winner
                          </li>
                          <li>
                            &quot;Book hold&quot; in the results shows how far over 100%
                            the market is priced &mdash; the vig you&apos;re paying
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                  <p>
                    <strong>Expected value (EV)</strong> is (chance you win ×
                    amount won) − (chance you lose × amount staked). A bet is
                    +EV when your estimate of the true win probability is
                    higher than what the odds imply. The calculator above shows
                    the payout on each side if it wins &mdash; pairing that with
                    your own win-probability estimate is what turns it into a
                    real EV calculation.
                  </p>
                  <div className="calculator-explainer-actions">
                    <button
                      className="primary tiny"
                      onClick={() => {
                        setCalcMode("ev");
                        setCalcStake("");
                        setCalcOddsA("");
                        setCalcOddsB("");
                      }}
                    >
                      Clear inputs
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Container>

        </section>

        <section id="how-it-works" className="section how-it-works">
          <Container>
            <SectionHeader title="How Unbounded works" description="Four steps from a mispriced line to a documented, tracked result." />
            <div className="workflow-steps">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <div key={step.title}>
                  <span>Step {index + 1}</span>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="pricing" className="section pricing-section">
          <Container>
            <SectionHeader title="Pricing plans" description="Choose Select, Premium, or Executive. Select starts at $1.99 per
                day on this page, and annual payment is highlighted because it saves 10% across the year." />
            <PricingTierCards />
          </Container>
        </section>
        <StayUpdated />
        {/* <section className="section">
          <Container>
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
          </Container>
        </section> */}

        <section id="workflow" className="section workflow">
          <Container>
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
                  <span>17 sportsbooks integrated</span>
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
                    <li>Coverage designed around 17 integrated sportsbook workflows</li>
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
          </Container>
        </section>

        <section id="testimonials" className="section testimonials">
          <Container>
            <SectionHeader title="Trusted by founders and operators building sharper workflows"
              description="Early users rely on Unbounded to cut delay, document decisions, and move faster during live windows." />

            {/* <div
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
            </div> */}

            <CommonCarousel
              data={TESTIMONIALS}
              mobileSlides={1}
              tabletSlides={1}
              desktopSlides={2}
              mobileSpaceBetween={16}
              tabletSpaceBetween={20}
              desktopSpaceBetween={24}
              showArrows={false}
              showDots={true}
              autoPlay={true}
              autoPlayDelay={5000}
              renderItem={(testimonial) => (
                <article className="testimonial-card">
                  <div className="testimonial-quote">
                    <p>“{testimonial.quote}”</p>
                  </div>

                  <div className="testimonial-meta">
                    <div className="testimonial-avatar" aria-hidden="true">
                      <span>{testimonial.name.charAt(0)}</span>
                    </div>

                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                  </div>
                </article>
              )}
            />
          </Container>
        </section>

        <section id="team-insights" className="section insights">
          <Container>
            <SectionHeader title="Insights from inside Unbounded"
              description="Notes from the teams building and running the platform day to day, not just the marketing copy." />


            {/* <div className="insights-grid">
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
          </div> */}
            <CommonCarousel
              data={COMPANY_INSIGHTS}
              effect="coverflow"
              coverflowEffect={{
                rotate: 12,
                stretch: 0,
                depth: 220,
                modifier: 1.2,
                slideShadows: false,
              }}
              mobileSpaceBetween={16}
              tabletSpaceBetween={24}
              desktopSpaceBetween={32}
              showArrows={true}
              showDots={true}
              autoPlay={true}
              autoPlayDelay={5000}
              className="insights-carousel"
              renderItem={(insight) => (
                <article className="insight-card">
                  <p className="insight-quote">
                    “{insight.quote}”
                  </p>

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
              )}
            />
          </Container>
        </section>

        {/* <section id="founders-circle" className="section founders-circle-section">
          <Container>
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
                {foundersCircleSubmitted ? (
                  <p className="founders-circle-success" role="status">
                    You&apos;re on the list. We&apos;ll follow up by email if a
                    founder seat opens up for you.
                  </p>
                ) : (
                  <form
                    className="founders-circle-form"
                    onSubmit={handleFoundersCircleSubmit}
                  >
                    <div className="founders-circle-form-row">
                      <input
                        name="firstName"
                        type="text"
                        placeholder="First name"
                        autoComplete="given-name"
                        required
                      />
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Last name"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="email"
                      required
                    />
                    <button
                      className="primary pulse-on-hover"
                      type="submit"
                      disabled={isFoundersCircleSubmitting}
                    >
                      {isFoundersCircleSubmitting
                        ? "Submitting..."
                        : "Apply for a founder seat"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Container>
        </section> */}

        <FoundersCircle />
        <HowCanWeHelp />

      </main>
    </div>
  );
}
