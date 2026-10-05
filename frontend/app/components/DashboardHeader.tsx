"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "./container/Container";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type DashboardHeaderProps = {
  onOpenBetCalculator: () => void;
};

export function DashboardHeader({ onOpenBetCalculator }: DashboardHeaderProps) {
  const router = useRouter();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const homeHref = "/dashboard";

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (isNavMenuOpen) {
        setIsHeaderVisible(true);
        lastScrollY = window.scrollY;
        return;
      }

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
  }, [isNavMenuOpen]);

  useEffect(() => {
    if (isNavMenuOpen) {
      setIsHeaderVisible(true);
    }
  }, [isNavMenuOpen]);

  useEffect(() => {
    if (!isAccountMenuOpen) {
      return;
    }

    const closeAccountMenu = () => setIsAccountMenuOpen(false);

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        closeAccountMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAccountMenu();
      }
    };

    const handleScroll = () => {
      closeAccountMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (isNavMenuOpen) {
      document.body.classList.add("dashboard-nav-open");
    } else {
      document.body.classList.remove("dashboard-nav-open");
    }

    return () => {
      document.body.classList.remove("dashboard-nav-open");
    };
  }, [isNavMenuOpen]);

  useEffect(() => {
    if (!isNavMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !navMenuRef.current?.contains(target) &&
        !(event.target as HTMLElement | null)?.closest?.(
          ".dashboard-nav-hamburger"
        )
      ) {
        setIsNavMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNavMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isNavMenuOpen]);

  const closeNavMenu = () => setIsNavMenuOpen(false);

  const handleLogoutClick = () => {
    setIsAccountMenuOpen(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    router.push("/");
  };

  return (
    <header>
      <Container>
        <div
          className={`site-header dashboard-page-header${
            isHeaderVisible ? "" : " is-hidden"
          }${isNavMenuOpen ? " is-nav-open" : ""}`}
        >
          <div className="brand">
            <a
              className="brand-home-link"
              href={homeHref}
              aria-label="Unbounded home"
            >
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
            <button
              className={`dashboard-nav-hamburger${
                isNavMenuOpen ? " is-open" : ""
              }`}
              type="button"
              aria-label={isNavMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isNavMenuOpen}
              aria-controls="dashboard-primary-nav"
              onClick={() => {
                setIsAccountMenuOpen(false);
                setIsNavMenuOpen((current) => !current);
              }}
            >
              <span />
              <span />
              <span />
            </button>
            <div
              ref={accountMenuRef}
              className={`account-menu${isAccountMenuOpen ? " is-open" : ""}`}
            >
              <button
                className="primary header-primary pulse-on-hover"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                onClick={() => {
                  setIsNavMenuOpen(false);
                  setIsAccountMenuOpen((current) => !current);
                }}
              >
                Account
              </button>
              <div
                className={`account-dropdown${
                  isAccountMenuOpen ? " is-open" : ""
                }`}
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
                  <span className="account-lock-icon" aria-hidden="true">
                    🔒
                  </span>
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
          <div
            ref={navMenuRef}
            className={`dashboard-header-group${
              isNavMenuOpen ? " is-open" : ""
            }`}
            id="dashboard-primary-nav"
          >
            <div className="dashboard-nav-close">
              <span>Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeNavMenu}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
            <nav className="nav-links">
              <a href="/dashboard" onClick={closeNavMenu}>
                Home
              </a>
              <a href="/arbitrage-bets" onClick={closeNavMenu}>
                Arbitrage
              </a>
              <a href="/ev-bets" onClick={closeNavMenu}>
                Positive EV
              </a>
              <a href="/profit-tracker" onClick={closeNavMenu}>
                Profit Tracker
              </a>
              <a
                href="#bet-calculator"
                onClick={(event) => {
                  event.preventDefault();
                  closeNavMenu();
                  onOpenBetCalculator();
                }}
              >
                Bet Calculator
              </a>
              <a href="/leaderboard" onClick={closeNavMenu}>
                Leaderboard
              </a>
            </nav>
          </div>
        </div>
      </Container>
    </header>
  );
}
