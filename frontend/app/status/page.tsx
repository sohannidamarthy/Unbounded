import { MarketingChrome } from "../components/MarketingChrome";

export default function StatusPage() {
  return (
    <MarketingChrome>
      <main className="legal-page-main">
        <section className="legal-panel">
          <span className="billing-eyebrow">Status</span>
          <h1>Platform status</h1>
          <p>
            Current public status for the Unbounded marketing site, account
            flow, dashboard, and data feeds.
          </p>
          <div className="status-grid">
            {[
              "Marketing site",
              "Account signup and login",
              "Arbitrage feed",
              "Positive EV feed",
              "Profit tracker",
              "Newsletter and waitlist",
            ].map((item) => (
              <article className="status-card" key={item}>
                <span className="status-dot" aria-hidden="true" />
                <div>
                  <strong>{item}</strong>
                  <p>Operational</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </MarketingChrome>
  );
}
