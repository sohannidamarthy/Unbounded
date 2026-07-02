"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { SportsbookLogo } from "../components/sportsbookMeta";

type WithdrawalMethod = {
  book: string;
  method: string;
  time: string;
  score: number;
};

const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  { book: "FanDuel", method: "PayPal", time: "Within 1 hour", score: 9.6 },
  { book: "Bet365", method: "PayPal / Card", time: "Within 1 hour", score: 9.2 },
  { book: "DraftKings", method: "PayPal", time: "1 – 2 hours", score: 9.1 },
  { book: "ESPN BET", method: "PayPal", time: "1 – 2 hours", score: 8.9 },
  { book: "BetMGM", method: "Online banking", time: "Same day", score: 8.7 },
  { book: "Caesars", method: "PayPal / Play+", time: "Same day", score: 8.5 },
  { book: "Fanatics", method: "Fanatics Cash / bank", time: "Same day", score: 8.3 },
  { book: "BetRivers", method: "Online banking", time: "12 – 24 hours", score: 8.0 },
  { book: "PointsBet", method: "PayPal / ACH", time: "Same day", score: 7.9 },
  { book: "Hard Rock Bet", method: "Online banking", time: "24 hours", score: 7.6 },
];

const STORAGE_KEY = "unbounded.withdrawal.books";
const ALL_BOOKS = WITHDRAWAL_METHODS.map((row) => row.book);

function scoreTier(score: number) {
  if (score >= 9) return "is-elite";
  if (score >= 8) return "is-strong";
  return "is-fair";
}

export default function WithdrawalsPage() {
  const [selectedBooks, setSelectedBooks] = useState<string[]>(ALL_BOOKS);
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const valid = parsed.filter((book) => ALL_BOOKS.includes(book));
        if (valid.length) {
          setSelectedBooks(valid);
        }
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBooks));
  }, [selectedBooks, hydrated]);

  const toggleBook = (book: string) => {
    setSelectedBooks((current) =>
      current.includes(book)
        ? current.filter((item) => item !== book)
        : [...current, book]
    );
  };

  const filteredChips = useMemo(
    () =>
      ALL_BOOKS.filter((book) =>
        book.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  const rows = useMemo(
    () =>
      WITHDRAWAL_METHODS.filter((row) => selectedBooks.includes(row.book)).sort(
        (a, b) => b.score - a.score
      ),
    [selectedBooks]
  );

  return (
    <DashboardShell>
      <section className="account-page">
        <header className="account-page-header">
          <div>
            <p className="account-eyebrow">Account</p>
            <h1>Withdrawal methods</h1>
            <p className="account-subtitle">
              Compare the fastest payout route for each sportsbook. Pick the
              books you use and Unbounded keeps the grid focused on them.
            </p>
          </div>
        </header>

        <div className="withdrawal-customizer">
          <div className="withdrawal-customizer-head">
            <div>
              <h2>Your sportsbooks</h2>
              <span>{selectedBooks.length} of {ALL_BOOKS.length} selected</span>
            </div>
            <div className="withdrawal-customizer-actions">
              <input
                type="search"
                placeholder="Search sportsbooks"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search sportsbooks"
              />
              <button type="button" className="ghost" onClick={() => setSelectedBooks([...ALL_BOOKS])}>
                Select all
              </button>
              <button type="button" className="ghost" onClick={() => setSelectedBooks([])}>
                Clear
              </button>
            </div>
          </div>
          <div className="withdrawal-chip-grid">
            {filteredChips.map((book) => {
              const active = selectedBooks.includes(book);
              return (
                <button
                  key={book}
                  type="button"
                  className={`withdrawal-chip${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => toggleBook(book)}
                >
                  <SportsbookLogo sportsbook={book} size={22} />
                  <span>{book}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="withdrawal-grid" role="table" aria-label="Withdrawal methods by sportsbook">
          <div className="withdrawal-grid-row withdrawal-grid-row--header" role="row">
            <span role="columnheader">Bookmaker</span>
            <span role="columnheader">Fastest withdrawal method</span>
            <span role="columnheader">Estimated time</span>
            <span role="columnheader">Score</span>
          </div>
          {rows.length === 0 ? (
            <div className="withdrawal-empty">
              Select at least one sportsbook to compare withdrawal methods.
            </div>
          ) : (
            rows.map((row) => (
              <div className="withdrawal-grid-row" role="row" key={row.book}>
                <span className="withdrawal-book" role="cell">
                  <SportsbookLogo sportsbook={row.book} size={28} />
                  <span>{row.book}</span>
                </span>
                <span role="cell">{row.method}</span>
                <span role="cell">{row.time}</span>
                <span role="cell">
                  <span className={`withdrawal-score ${scoreTier(row.score)}`}>
                    {row.score.toFixed(1)}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
        <p className="account-footnote">
          Withdrawal speeds are general guidance and vary by verification status,
          method, and region. Always confirm in your sportsbook account.
        </p>
      </section>
    </DashboardShell>
  );
}
