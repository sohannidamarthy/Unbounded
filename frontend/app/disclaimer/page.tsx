import { MarketingChrome } from "../components/MarketingChrome";

export default function DisclaimerPage() {
  return (
    <MarketingChrome>
      <main className="legal-page-main">
        <section className="legal-panel">
          <span className="billing-eyebrow">Disclaimer</span>
          <h1>Responsible betting disclaimer</h1>
          <p>
            Unbounded is for adults 21+ where permitted by law. Use the product
            for education, tracking, and workflow organization only.
          </p>
          <div className="legal-copy">
            <h2>No bet placement</h2>
            <p>
              Unbounded does not place bets for users. If you choose to act on
              a line, you leave Unbounded and use the sportsbook directly.
            </p>
            <h2>Risk warning</h2>
            <p>
              Sports betting involves financial risk. Only wager what you can
              afford to lose, and seek help if betting stops being recreational.
            </p>
            <h2>Data timing</h2>
            <p>
              Odds, limits, boosts, availability, and withdrawal policies can
              change without notice. Always verify details on the sportsbook.
            </p>
          </div>
        </section>
      </main>
    </MarketingChrome>
  );
}
