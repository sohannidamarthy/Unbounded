"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TOKEN_STORAGE_KEY = "unbounded.access_token";
const sportOptions = ["Basketball", "Football", "Baseball", "Soccer"] as const;
const bookOptions = ["Primebook", "Skyline", "Jetline", "Northstar"] as const;

type Sport = (typeof sportOptions)[number];
type Book = (typeof bookOptions)[number];
type HeaderFilterMenu = "sports" | "books" | null;

type DashboardHeaderProps = {
  onOpenBetCalculator: () => void;
};

export function DashboardHeader({ onOpenBetCalculator }: DashboardHeaderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [selectedHeaderSports, setSelectedHeaderSports] = useState<Sport[]>([
    ...sportOptions,
  ]);
  const [selectedHeaderBooks, setSelectedHeaderBooks] = useState<Book[]>([
    ...bookOptions,
  ]);
  const [openHeaderFilter, setOpenHeaderFilter] = useState<HeaderFilterMenu>(null);
  const headerFiltersRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!openHeaderFilter) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerFiltersRef.current?.contains(event.target as Node)) {
        setOpenHeaderFilter(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenHeaderFilter(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openHeaderFilter]);

  const getHeaderSelectionLabel = (
    selections: readonly string[],
    allOptions: readonly string[],
    allLabel: string,
    emptyLabel: string
  ) => {
    if (selections.length === 0) {
      return emptyLabel;
    }
    if (selections.length === allOptions.length) {
      return allLabel;
    }
    return selections[0];
  };

  const toggleHeaderSport = (sport: Sport) => {
    setSelectedHeaderSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport]
    );
  };

  const toggleHeaderBook = (book: Book) => {
    setSelectedHeaderBooks((current) =>
      current.includes(book)
        ? current.filter((item) => item !== book)
        : [...current, book]
    );
  };

  const handleLogoutClick = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
    router.push("/");
  };

  const allSportsSelected = selectedHeaderSports.length === sportOptions.length;
  const allBooksSelected = selectedHeaderBooks.length === bookOptions.length;
  const sportFilterLabel = getHeaderSelectionLabel(
    selectedHeaderSports,
    sportOptions,
    "All sports",
    "Pick sports"
  );
  const bookFilterLabel = getHeaderSelectionLabel(
    selectedHeaderBooks,
    bookOptions,
    "All books",
    "Pick books"
  );

  return (
    <header
      className={`site-header dashboard-page-header${
        isHeaderVisible ? "" : " is-hidden"
      }`}
    >
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
      </div>
      <div className="dashboard-header-group">
        <nav className="nav-links">
          <a href="/arbitrage-bets">Arbitrage Bets</a>
          <a href="/ev-bets">EV Bets</a>
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
        </nav>
        <div className="header-actions header-actions--split">
          <div
            ref={headerFiltersRef}
            className="dashboard-top-filters"
            aria-label="Dashboard filters"
          >
            <div className="dashboard-top-filter">
              <span>Sport</span>
              <button
                type="button"
                className={`dashboard-filter-trigger${
                  openHeaderFilter === "sports" ? " is-open" : ""
                }`}
                aria-haspopup="dialog"
                aria-expanded={openHeaderFilter === "sports"}
                onClick={() =>
                  setOpenHeaderFilter((current) =>
                    current === "sports" ? null : "sports"
                  )
                }
              >
                <span className="dashboard-filter-trigger-label">
                  {sportFilterLabel}
                </span>
                {!allSportsSelected && selectedHeaderSports.length > 1 ? (
                  <span className="dashboard-filter-trigger-count">
                    +{selectedHeaderSports.length - 1}
                  </span>
                ) : null}
                <span className="dashboard-filter-trigger-icon" aria-hidden="true">
                  ▾
                </span>
              </button>
              {openHeaderFilter === "sports" ? (
                <div className="dashboard-filter-menu" role="dialog" aria-label="Sport filter">
                  <div className="dashboard-filter-menu-actions">
                    <button
                      type="button"
                      onClick={() => setSelectedHeaderSports([...sportOptions])}
                    >
                      Select all
                    </button>
                    <button type="button" onClick={() => setSelectedHeaderSports([])}>
                      Clear
                    </button>
                  </div>
                  <div className="dashboard-filter-menu-options">
                    {sportOptions.map((sport) => {
                      const isSelected = selectedHeaderSports.includes(sport);
                      return (
                        <button
                          key={sport}
                          type="button"
                          className={`dashboard-filter-option${
                            isSelected ? " is-selected" : ""
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => toggleHeaderSport(sport)}
                        >
                          <span className="dashboard-filter-option-check" aria-hidden="true">
                            {isSelected ? "✓" : ""}
                          </span>
                          <span>{sport}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="dashboard-top-filter">
              <span>Books</span>
              <button
                type="button"
                className={`dashboard-filter-trigger${
                  openHeaderFilter === "books" ? " is-open" : ""
                }`}
                aria-haspopup="dialog"
                aria-expanded={openHeaderFilter === "books"}
                onClick={() =>
                  setOpenHeaderFilter((current) =>
                    current === "books" ? null : "books"
                  )
                }
              >
                <span className="dashboard-filter-trigger-label">
                  {bookFilterLabel}
                </span>
                {!allBooksSelected && selectedHeaderBooks.length > 1 ? (
                  <span className="dashboard-filter-trigger-count">
                    +{selectedHeaderBooks.length - 1}
                  </span>
                ) : null}
                <span className="dashboard-filter-trigger-icon" aria-hidden="true">
                  ▾
                </span>
              </button>
              {openHeaderFilter === "books" ? (
                <div className="dashboard-filter-menu" role="dialog" aria-label="Books filter">
                  <div className="dashboard-filter-menu-actions">
                    <button
                      type="button"
                      onClick={() => setSelectedHeaderBooks([...bookOptions])}
                    >
                      Select all
                    </button>
                    <button type="button" onClick={() => setSelectedHeaderBooks([])}>
                      Clear
                    </button>
                  </div>
                  <div className="dashboard-filter-menu-options">
                    {bookOptions.map((book) => {
                      const isSelected = selectedHeaderBooks.includes(book);
                      return (
                        <button
                          key={book}
                          type="button"
                          className={`dashboard-filter-option${
                            isSelected ? " is-selected" : ""
                          }`}
                          aria-pressed={isSelected}
                          onClick={() => toggleHeaderBook(book)}
                        >
                          <span className="dashboard-filter-option-check" aria-hidden="true">
                            {isSelected ? "✓" : ""}
                          </span>
                          <span>{book}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
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
                    My plan
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Notifications
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
                    Settings
                  </button>
                  <button className="account-dropdown-item" type="button" role="menuitem">
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
            ) : (
              <a className="primary header-primary pulse-on-hover" href="/auth">
                Log in / Sign up
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
