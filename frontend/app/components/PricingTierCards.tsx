import { PRICING_PLANS } from "./pricingPlans";

type PricingTierCardsProps = {
  context?: "marketing" | "billing";
};

export function PricingTierCards({ context = "marketing" }: PricingTierCardsProps) {
  return (
    <div className={`pricing-grid pricing-grid--${context}`}>
      {PRICING_PLANS.map((plan) => (
        <article
          className={`pricing-card tier-pricing-card tier-pricing-card--${plan.name.toLowerCase()}${
            plan.name === "Premium" ? " featured" : ""
          }`}
          key={plan.name}
        >
          <div className="tier-icon" aria-hidden="true">
            <span />
          </div>
          <div className="pricing-head">
            <h3>{plan.name}</h3>
            <span className="pricing-tag">{plan.tag}</span>
          </div>
          <div className="tier-price-stack">
            <p className="pricing-price">${plan.monthlyPrice}</p>
            <span>per month</span>
          </div>
          <div className="annual-price-callout">
            <div>
              <strong>Pay annually</strong>
              <span>10% off overall price</span>
            </div>
            <p>
              ${plan.annualPrice}/yr
              <span>${plan.annualMonthlyEquivalent}/mo effective</span>
            </p>
          </div>
          <p className="pricing-note">{plan.description}</p>
          <ul className="tier-feature-list">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <a className="primary pulse-on-hover" href="/billing">
            Choose {plan.name}
          </a>
        </article>
      ))}
    </div>
  );
}
