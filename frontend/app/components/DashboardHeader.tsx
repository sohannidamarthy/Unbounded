"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type DashboardHeaderProps = {
  onOpenBetCalculator: () => void;
};

export function DashboardHeader({ onOpenBetCalculator }: DashboardHeaderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
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

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY <= 24) {
        setIsHeaderVisible(true);
        lastScrollY = currentScrollY;
        return;
      }

      if (Math.abs(scrollDelta) < 10) {
        return;
      }

      setIsHeaderVisible(scrollDelta < 0);
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogoutClick = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <header
      className={`site-header dashboard-page-header${
        isHeaderVisible ? "" : " is-hidden"
      }`}
    >
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
      <div className="dashboard-header-group">
        <nav className="nav-links">
          <a href="/arbitrage-bets">Arbitrage</a>
          <a href="/ev-bets">Positive EV</a>
          <a href="/profit-tracker">Profit Tracker</a>
          <a
            href="#bet-calculator"
            onClick={(event) => {
              event.preventDefault();
              onOpenBetCalculator();
            }}
          >
            Bet Calculator
          </a>
          <a
            href="/leaderboard"
          >
            Leaderboard
          </a>
        </nav>
        <div className="header-actions header-actions--split">
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
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Settings
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Billing and User payment
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Daily Bets
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Live ROI
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Group Chats
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Withdrawals
                  </button>
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
              <a className="primary header-primary pulse-on-hover" href="/dashboard">
                Dashboard
              </a>
            )
          ) : (
            <div className="header-actions-placeholder" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
}
