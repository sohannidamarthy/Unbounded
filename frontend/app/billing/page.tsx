import { MarketingChrome } from "../components/MarketingChrome";
import { PricingTierCards } from "../components/PricingTierCards";

export default function BillingPage() {
  return (
    <MarketingChrome>
      <main className="billing-page-main">
        <section className="billing-hero">
          <div>
            <span className="billing-eyebrow">Billing and user payment</span>
            <h1>Pick the tier that matches your workflow.</h1>
            <p>
              Select, Premium, and Executive are available monthly, but annual
              payment gets the better deal with 10% off the overall yearly price.
            </p>
          </div>
          <div className="billing-annual-banner">
            <span>Recommended</span>
            <strong>Pay annually</strong>
            <p>10% off across the full year on every tier.</p>
          </div>
        </section>

        <section className="billing-cadence-panel" aria-label="Billing cadence">
          <div className="billing-cadence-option">
            <span>Monthly</span>
            <strong>Flexible billing</strong>
            <p>Pay month to month at the standard price.</p>
          </div>
          <div className="billing-cadence-option is-recommended">
            <span>Annual</span>
            <strong>Best value</strong>
            <p>Save 10% overall and keep access locked in for the year.</p>
          </div>
        </section>

        <PricingTierCards context="billing" />
      </main>
    </MarketingChrome>
  );
}
