"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PricingTierCards } from "./components/PricingTierCards";

const TOKEN_STORAGE_KEY = "unbounded.access_token";
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
      "We cut our scan-to-bet time in half. The live alerts feel tailored instead of noisy.",
    name: "Anonymous",
    role: "Operations lead, Midwest betting group"
  },
  {
    quote:
      "The recap trail keeps our team aligned on why we passed or pressed. That alone is huge.",
    name: "Anonymous",
    role: "Trading manager, private syndicate"
  },
  {
    quote:
      "I finally have one place for alerts, staking, and withdrawals. No more spreadsheet sprawl.",
    name: "Anonymous",
    role: "Independent bettor"
  },
  {
    quote:
      "We added two operators without adding chaos. The audit trail makes reviews painless.",
    name: "Anonymous",
    role: "Partner, multi-state group"
  },
  {
    quote:
      "Live windows used to be frantic. Now the alert stack and notes keep us consistent.",
    name: "Anonymous",
    role: "Lead analyst, small team"
  }
];

export default function Home() {
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [activeSecondaryIndex, setActiveSecondaryIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);
  const [pricingNotified, setPricingNotified] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const heroImage = HERO_IMAGES[activeHeroIndex];
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

  const handleLogoutClick = () => {
    handleLogout();
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
    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex(
        (current) => (current + 1) % TESTIMONIALS.length
      );
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handlePricingSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isPricingSubmitting) {
      return;
    }

    setIsPricingSubmitting(true);
    setPricingNotified(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    try {
      const response = await fetch(`${apiBase}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      event.currentTarget.reset();
      setPricingNotified(true);
      setIsNewsletterOpen(false);
    } catch (error) {
      // Keep optimistic "Notified!" even if the request errors.
    } finally {
      setIsPricingSubmitting(false);
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
          <a href="/tutorials">Tutorials</a>
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
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Settings
                  </button>
                  <a className="account-dropdown-item" role="menuitem" href="/billing">
                    Billing and User payment
                  </a>
                  <a className="account-dropdown-item" role="menuitem" href="/tutorials">
                    Tutorials
                  </a>
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
                A focused workspace for odds, alerts, and edge tracking. Start
                now or enter a promo to upgrade.
              </p>
              <div className="hero-banner-actions">
                <a
                  className="primary header-primary pulse-on-hover"
                  href="/auth"
                >
                  Create account
                </a>
                <a className="ghost pulse-on-hover" href="#">
                  Enter promo code
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

        <section id="pricing" className="section pricing-section">
          <div className="section-header">
            <h2>Pricing plans</h2>
            <p>
              Choose Select, Premium, or Executive. Annual payment is highlighted
              because it saves 10% across the year.
            </p>
          </div>
          <PricingTierCards />
          <div className="pricing-waitlist">
            <div>
              <h3>Stay updated</h3>
              <p>Receive product updates, tier announcements, and betting workflow notes.</p>
            </div>
            <button
              className="primary pulse-on-hover"
              type="button"
              onClick={() => setIsNewsletterOpen(true)}
            >
              Join newsletter
            </button>
          </div>
        </section>
        <section id="workflow" className="section workflow">
          <div className="workflow-card">
            <div className="why-header">
              <div>
                <h2>Why Unbounded?</h2>
                <p>
                  Unbounded keeps your edge in one place, with live markets,
                  automation, and workflows that cut through the noise.
                </p>
              </div>
              <div className="why-badges">
                <span>No hidden fees</span>
                <span>Live betting included</span>
                <span>Withdrawal advice</span>
              </div>
            </div>
            <div className="why-comparison">
              <div className="why-highlight">
                <h3>Unbounded</h3>
                <ul>
                  <li>Unified scan, tag, share, and execution flow</li>
                  <li>AI-assisted signal filters and recap highlights</li>
                  <li>Custom alerts tuned to your edge</li>
                  <li>Transparent pricing with no hidden fees</li>
                  <li>Live betting workflows included</li>
                  <li>Withdrawal guidance built into the process</li>
                </ul>
              </div>
              <div className="why-contrast">
                <h3>Similar tools</h3>
                <ul>
                  <li>Separate tools for scanning and betting</li>
                  <li>Generic alerts without context</li>
                  <li>Extra fees for live betting features</li>
                  <li>Limited withdrawal guidance</li>
                  <li>More toggling between tabs and exports</li>
                </ul>
              </div>
            </div>
            <div className="workflow-steps">
              <div>
                <span>01</span>
                <p>Live sweep with AI-prioritized opportunities</p>
              </div>
              <div>
                <span>02</span>
                <p>Team-ready workflows from alert to action</p>
              </div>
              <div>
                <span>03</span>
                <p>Audit-ready recaps for every decision</p>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section testimonials">
          <div className="section-header testimonials-header">
            <div>
              <h2>Trusted by operators who live the edge</h2>
              <p>
                Sharp bettors rely on Unbounded to cut
                delay, document decisions, and move faster during live windows.
              </p>
            </div>
            <div className="testimonial-controls">
              <button
                type="button"
                className="testimonial-arrow"
                onClick={() =>
                  setActiveTestimonialIndex(
                    (current) =>
                      (current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                  )
                }
                aria-label="Previous testimonial"
              >
                ‹
              </button>
              <button
                type="button"
                className="testimonial-arrow"
                onClick={() =>
                  setActiveTestimonialIndex(
                    (current) => (current + 1) % TESTIMONIALS.length
                  )
                }
                aria-label="Next testimonial"
              >
                ›
              </button>
            </div>
          </div>
          <div className="testimonial-card" key={activeTestimonial.quote}>
            <div className="testimonial-quote">
              <p>“{activeTestimonial.quote}”</p>
            </div>
            <div className="testimonial-meta">
              <div className="testimonial-avatar" aria-hidden="true">
                <span>?</span>
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
        </section>

        <section id="testimonial-gallery" className="section testimonial-gallery">
          <div className="testimonial-images">
            <div className="testimonial-image" aria-hidden="true" />
            <div className="testimonial-image" aria-hidden="true" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>Unbounded</strong>
          <span>Precision betting workflows, education, and account tools.</span>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/arbitrage">Arbitrage</a>
          <a href="/positive-ev">Positive EV</a>
          <a href="/tools">Tools</a>
          <a href="/tutorials">Tutorials</a>
          <a href="/billing">Billing</a>
        </div>
      </footer>
      {isNewsletterOpen ? (
        <div
          className="newsletter-modal-backdrop"
          role="presentation"
          onClick={() => setIsNewsletterOpen(false)}
        >
          <section
            className="newsletter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="newsletter-modal-close"
              type="button"
              aria-label="Close newsletter form"
              onClick={() => setIsNewsletterOpen(false)}
            >
              ×
            </button>
            <span className="billing-eyebrow">Newsletter</span>
            <h2 id="newsletter-title">Get Unbounded updates</h2>
            <p>
              Product updates, tier announcements, and practical betting
              workflow notes.
            </p>
            <form className="pricing-form newsletter-modal-form" onSubmit={handlePricingSubmit}>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
              />
              <button className="primary pulse-on-hover" type="submit">
                {isPricingSubmitting
                  ? "Sending..."
                  : pricingNotified
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
