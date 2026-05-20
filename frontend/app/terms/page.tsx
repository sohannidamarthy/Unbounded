import { MarketingChrome } from "../components/MarketingChrome";

export default function TermsPage() {
  return (
    <MarketingChrome>
      <main className="legal-page-main">
        <section className="legal-panel">
          <span className="billing-eyebrow">Terms</span>
          <h1>Terms and conditions</h1>
          <p>
            By using Unbounded, you agree to use the product only where sports
            betting is legal for you and only if you meet the applicable age
            requirements in your jurisdiction.
          </p>
          <div className="legal-copy">
            <h2>Service scope</h2>
            <p>
              Unbounded provides education, tracking, calculators, account
              workflow tools, and links to third-party sportsbooks. Unbounded
              does not accept wagers, hold funds, place bets, or act as a
              sportsbook.
            </p>
            <h2>User responsibility</h2>
            <p>
              You are responsible for checking sportsbook terms, local laws,
              taxes, account limits, and whether a betting opportunity still
              exists before acting.
            </p>
            <h2>No guaranteed results</h2>
            <p>
              Odds, edges, and examples can change quickly. Past or projected
              performance does not guarantee future profit.
            </p>
          </div>
        </section>
      </main>
    </MarketingChrome>
  );
}
