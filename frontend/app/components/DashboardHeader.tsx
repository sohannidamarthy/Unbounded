"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type DashboardHeaderProps = {
  onOpenBetCalculator: () => void;
};

export function DashboardHeader({ onOpenBetCalculator }: DashboardHeaderProps) {
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const homeHref = "/dashboard";

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

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAccountMenuOpen]);

  const handleLogoutClick = () => {
    setIsAccountMenuOpen(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
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
      <div className="header-actions header-actions--split">
        <div
          ref={accountMenuRef}
          className={`account-menu${isAccountMenuOpen ? " is-open" : ""}`}
        >
          <button
            className="primary header-primary pulse-on-hover"
            type="button"
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            onClick={() => setIsAccountMenuOpen((current) => !current)}
          >
            Account
          </button>
          <div
            className={`account-dropdown${isAccountMenuOpen ? " is-open" : ""}`}
            role="menu"
          >
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/settings"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Settings
            </a>
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/billing"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Billing &amp; payments
            </a>
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/daily-bets"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Daily Bets
            </a>
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/profit-tracker"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Live ROI
            </a>
            <button
              className="account-dropdown-item account-dropdown-item--locked"
              type="button"
              role="menuitem"
              aria-disabled="true"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              <span className="account-lock-icon" aria-hidden="true">🔒</span>
              Group Chats
              <span className="account-soon-badge">Soon</span>
            </button>
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/withdrawals"
              onClick={() => setIsAccountMenuOpen(false)}
            >
              Withdrawals
            </a>
            <a
              className="account-dropdown-item"
              role="menuitem"
              href="/tutorials"
              onClick={() => setIsAccountMenuOpen(false)}
            >
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
      </div>
      <div className="dashboard-header-group">
        <nav className="nav-links">
          <a href="/dashboard">Home</a>
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
      </div>
    </header>
  );
}
