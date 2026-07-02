"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type MarketingChromeProps = {
  children: React.ReactNode;
};

export function MarketingChrome({ children }: MarketingChromeProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const homeHref = isAuthenticated ? "/dashboard" : "/";

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

  const handleLogoutClick = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <div className="site marketing-page">
      <header className="site-header">
        <div className="brand">
          <a className="brand-home-link" href={homeHref} aria-label="Unbounded home">
            <Image
              src="/unbounded.jpeg"
              alt="Unbounded logo"
              width={56}
              height={56}
              priority
            />
          </a>
          <a className="brand-text brand-home-link" href={homeHref}>
            <span>Unbounded</span>
          </a>
        </div>
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/arbitrage">Arbitrage</a>
          <a href="/positive-ev">Positive EV</a>
          <a href="/tools">Tools</a>
          <a href="/tutorials">Discover</a>
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
                  <a className="account-dropdown-item" role="menuitem" href="/dashboard">
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
      {children}
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
              <a href="/billing">Pricing</a>
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
          <span className="footer-copyright">© {new Date().getFullYear()} Unbounded</span>
        </div>
      </footer>
    </div>
  );
}
