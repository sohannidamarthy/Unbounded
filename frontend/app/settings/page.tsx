"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "../components/DashboardShell";
import { SportsbookLogo } from "../components/sportsbookMeta";

const STORAGE_KEY = "unbounded.settings";

const BET_TYPES = ["Moneyline", "Spread", "Total", "Alt line", "Player prop"] as const;
const SPORTS = ["Basketball", "Football", "Baseball", "Soccer", "Hockey", "Tennis"] as const;
const SPORTSBOOKS = [
  "FanDuel",
  "DraftKings",
  "BetMGM",
  "Caesars",
  "ESPN BET",
  "Fanatics",
  "BetRivers",
  "Bet365",
] as const;
const ODDS_FORMATS = ["American", "Decimal", "Fractional"] as const;

type Settings = {
  betTypes: string[];
  sports: string[];
  sportsbooks: string[];
  oddsFormat: (typeof ODDS_FORMATS)[number];
  defaultStake: string;
  minEdge: string;
  liveAlerts: boolean;
  emailDigest: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  betTypes: ["Moneyline", "Spread", "Total"],
  sports: ["Basketball", "Football", "Baseball"],
  sportsbooks: ["FanDuel", "DraftKings", "BetMGM", "Caesars"],
  oddsFormat: "American",
  defaultStake: "100",
  minEdge: "2.0",
  liveAlerts: true,
  emailDigest: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<Settings>) });
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  const toggleIn = (key: "betTypes" | "sports" | "sportsbooks", value: string) => {
    setSettings((current) => {
      const list = current[key];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
    setSavedAt(null);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSavedAt(null);
  };

  return (
    <DashboardShell>
      <section className="account-page">
        <header className="account-page-header">
          <div>
            <p className="account-eyebrow">Account</p>
            <h1>Settings</h1>
            <p className="account-subtitle">
              Set your betting preferences once. They&apos;re remembered and applied
              across your boards, calculator, and daily bets.
            </p>
          </div>
          <div className="settings-save-bar">
            {savedAt ? <span className="settings-saved-flag">Saved at {savedAt}</span> : null}
            <button type="button" className="ghost" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="primary pulse-on-hover" onClick={handleSave} disabled={!hydrated}>
              Save preferences
            </button>
          </div>
        </header>

        <div className="settings-grid">
          <article className="settings-card">
            <h2>Bet types</h2>
            <p>Which markets should the boards prioritize for you?</p>
            <div className="settings-chip-row">
              {BET_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`settings-chip${settings.betTypes.includes(type) ? " is-active" : ""}`}
                  aria-pressed={settings.betTypes.includes(type)}
                  onClick={() => toggleIn("betTypes", type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </article>

          <article className="settings-card">
            <h2>Sports</h2>
            <p>Focus your feed on the sports you actually bet.</p>
            <div className="settings-chip-row">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  className={`settings-chip${settings.sports.includes(sport) ? " is-active" : ""}`}
                  aria-pressed={settings.sports.includes(sport)}
                  onClick={() => toggleIn("sports", sport)}
                >
                  {sport}
                </button>
              ))}
            </div>
          </article>

          <article className="settings-card settings-card--wide">
            <h2>Preferred sportsbooks</h2>
            <p>Select the books you hold accounts with, like in signup.</p>
            <div className="settings-book-grid">
              {SPORTSBOOKS.map((book) => (
                <button
                  key={book}
                  type="button"
                  className={`settings-book${settings.sportsbooks.includes(book) ? " is-active" : ""}`}
                  aria-pressed={settings.sportsbooks.includes(book)}
                  onClick={() => toggleIn("sportsbooks", book)}
                >
                  <SportsbookLogo sportsbook={book} size={22} />
                  <span>{book}</span>
                </button>
              ))}
            </div>
          </article>

          <article className="settings-card">
            <h2>Defaults</h2>
            <label className="settings-field">
              <span>Default stake ($)</span>
              <input
                type="number"
                min="1"
                value={settings.defaultStake}
                onChange={(event) => {
                  setSettings((c) => ({ ...c, defaultStake: event.target.value }));
                  setSavedAt(null);
                }}
              />
            </label>
            <label className="settings-field">
              <span>Minimum edge / ROI (%)</span>
              <input
                type="number"
                step="0.1"
                value={settings.minEdge}
                onChange={(event) => {
                  setSettings((c) => ({ ...c, minEdge: event.target.value }));
                  setSavedAt(null);
                }}
              />
            </label>
            <label className="settings-field">
              <span>Odds format</span>
              <select
                value={settings.oddsFormat}
                onChange={(event) => {
                  setSettings((c) => ({ ...c, oddsFormat: event.target.value as Settings["oddsFormat"] }));
                  setSavedAt(null);
                }}
              >
                {ODDS_FORMATS.map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </label>
          </article>

          <article className="settings-card">
            <h2>Notifications</h2>
            <label className="settings-switch">
              <span>
                <strong>Live opportunity alerts</strong>
                <small>Ping me when a high-value live bet appears.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.liveAlerts}
                onChange={(event) => {
                  setSettings((c) => ({ ...c, liveAlerts: event.target.checked }));
                  setSavedAt(null);
                }}
              />
            </label>
            <label className="settings-switch">
              <span>
                <strong>Daily email digest</strong>
                <small>Top bets of the day delivered each morning.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.emailDigest}
                onChange={(event) => {
                  setSettings((c) => ({ ...c, emailDigest: event.target.checked }));
                  setSavedAt(null);
                }}
              />
            </label>
          </article>
        </div>
      </section>
    </DashboardShell>
  );
}
