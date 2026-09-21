"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "./container/Container";
import Header from "./header/Header";
import ThemeToggle from "./theme-toggle/ThemeToggle";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type MarketingChromeProps = {
  children: React.ReactNode;
};

export function MarketingChrome({ children }: MarketingChromeProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const homeHref = isAuthenticated ? "/dashboard" : "/";
  const [menuOpen, setMenuOpen] = useState(false);


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

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menuOpen');
    } else {
      document.body.classList.remove('menuOpen');
    }

    return () => {
      document.body.classList.remove('menuOpen');
    };
  }, [menuOpen]);

  return (
    <div className="site marketing-page">
      <header>
        <div className="siteHeader">
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
          <nav className="navLinks">
            <div className="navClose">
              <span>Menu items</span>
              <button
                onClick={() => setMenuOpen(false)}
                type="button"
                aria-label="Close menu"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <a href="/">Home</a>
            <a href="/arbitrage">Arbitrage</a>
            <a href="/positive-ev">Positive EV</a>
            <a href="/tools">Tools</a>
            <a href="/tutorials">Discover</a>
          </nav>
          <div className="headerActions">
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
          
          {/* <ThemeToggle /> */}

          <button
            className={`hamburger ${menuOpen ? `menuOpen active` : ""}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* <Header hiddenLinks={["pricing"]} /> */}

      {children}
      {/* The real footer is rendered globally by LayoutWrapper.tsx (every
          route except /auth), so nothing renders here. */}
    </div>
  );
}
