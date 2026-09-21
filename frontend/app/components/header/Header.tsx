"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  {
    id: "home",
    label: "Home",
    href: "/",
  },
  {
    id: "arbitrage",
    label: "Arbitrage",
    href: "/arbitrage",
  },
  {
    id: "value-bets",
    label: "Value Bets",
    href: "/positive-ev",
  },
  {
    id: "tools",
    label: "Tools",
    href: "/tools",
  },
  {
    id: "tutorials",
    label: "Discover",
    href: "/tutorials",
  },
  {
    id: "pricing",
    label: "Pricing",
    href: "#pricing",
  },
];

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type HeaderProps = {
  hiddenLinks?: string[];
};

const Header = ({ hiddenLinks = [] }: HeaderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /*
   * Filter navigation links based on hiddenLinks
   */
  const visibleNavLinks = NAV_LINKS.filter(
    (link) => !hiddenLinks.includes(link.id)
  );

  /*
   * Authentication
   */
  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    setIsAuthReady(true);

    const handleStorage = () => {
      setIsAuthenticated(
        Boolean(localStorage.getItem(TOKEN_STORAGE_KEY))
      );
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /*
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  /*
   * Add/remove menu-open class on body
   */
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  /*
   * Close menu when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        menuOpen &&
        !target.closest(`.${styles.navLinks}`) &&
        !target.closest(`.${styles.hamburger}`)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  /*
   * Close menu when clicking a navigation link
   */
  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.siteHeader}>
      <div className={styles.headerContainer}>

        {/* Brand */}
        <div className={styles.brand}>
          <Image
            src="/unbounded.jpeg"
            alt="Unbounded logo"
            width={56}
            height={56}
            priority
          />

          <Link
            className={`${styles.brandText} ${styles.brandHomeLink}`}
            href="/"
          >
            <span>Unbounded</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={`navLinks ${styles.navLinks}`}>

          {/* Mobile menu header */}
          <div className={styles.navClose}>
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

          {/* Navigation links */}
          {visibleNavLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header actions */}
        <div className={styles.headerActions}>
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
                  <Link
                    className="account-dropdown-item"
                    role="menuitem"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>

                  <Link
                    className="account-dropdown-item"
                    role="menuitem"
                    href="/dashboard?panel=settings"
                  >
                    Settings
                  </Link>

                  <Link
                    className="account-dropdown-item"
                    role="menuitem"
                    href="/billing"
                  >
                    Billing &amp; payments
                  </Link>

                  <Link
                    className="account-dropdown-item"
                    role="menuitem"
                    href="/tutorials"
                  >
                    Discover
                  </Link>

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
              <Link
                className="primary header-primary pulse-on-hover"
                href="/auth"
              >
                Log in
              </Link>
            )
          ) : (
            <div
              className="header-actions-placeholder"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? `${styles.menuOpen} ${styles.active}` : ""}`}
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
  );
};

export default Header;