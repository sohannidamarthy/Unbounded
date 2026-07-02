"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketingChrome } from "../components/MarketingChrome";
import { PRICING_PLANS } from "../components/pricingPlans";

type PlanName = "Select" | "Premium" | "Executive";
type BillingCycle = "monthly" | "annual";
type BillingTab = "plan" | "billing" | "history";

const PLAN_STORAGE_KEY = "unbounded.plan";
const CYCLE_STORAGE_KEY = "unbounded.plan.cycle";
const PLAN_ORDER: PlanName[] = ["Select", "Premium", "Executive"];

type PendingChange =
  | { type: "switch"; plan: PlanName }
  | { type: "cancel" }
  | null;

const PAYMENT_HISTORY = [
  { date: "Jun 1, 2026", amount: "$13.99", status: "Paid" as const },
  { date: "May 1, 2026", amount: "$13.99", status: "Paid" as const },
  { date: "Apr 1, 2026", amount: "$13.99", status: "Paid" as const },
  { date: "Mar 1, 2026", amount: "$13.99", status: "Paid" as const },
  { date: "Feb 1, 2026", amount: "$0.00", status: "Trial" as const },
];

function renewalDate() {
  const date = new Date();
  date.setDate(date.getDate() + 24);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>("plan");
  const [currentPlan, setCurrentPlan] = useState<PlanName>("Premium");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState<PendingChange>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const storedPlan = localStorage.getItem(PLAN_STORAGE_KEY) as PlanName | null;
    if (storedPlan && PLAN_ORDER.includes(storedPlan)) {
      setCurrentPlan(storedPlan);
    }
    const storedCycle = localStorage.getItem(CYCLE_STORAGE_KEY) as BillingCycle | null;
    if (storedCycle === "monthly" || storedCycle === "annual") {
      setCycle(storedCycle);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PLAN_STORAGE_KEY, currentPlan);
    localStorage.setItem(CYCLE_STORAGE_KEY, cycle);
  }, [currentPlan, cycle, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activePlan = useMemo(
    () => PRICING_PLANS.find((plan) => plan.name === currentPlan) ?? PRICING_PLANS[1],
    [currentPlan]
  );

  const priceLabel =
    cycle === "annual"
      ? `$${activePlan.annualPrice}/yr`
      : `$${activePlan.monthlyPrice}/mo`;

  const confirmPending = () => {
    if (!pending) return;
    if (pending.type === "switch") {
      // Real implementation would redirect to Stripe Checkout / Customer Portal.
      setToast(`Securely redirecting to Stripe to switch to ${pending.plan}…`);
      setCurrentPlan(pending.plan);
    } else {
      setToast("Securely redirecting to Stripe to cancel your subscription…");
    }
    setPending(null);
  };

  const renderPlanTab = () => (
    <div className="billing-tab-panel">
      <div className="subscription-summary">
        <div className="subscription-summary-main">
          <span className="account-eyebrow">Current plan</span>
          <h2>{currentPlan}</h2>
          <p>{activePlan.description}</p>
        </div>
        <dl className="subscription-meta">
          <div>
            <dt>Price</dt>
            <dd>{priceLabel}</dd>
          </div>
          <div>
            <dt>Billing cycle</dt>
            <dd className="is-capitalized">{cycle}</dd>
          </div>
          <div>
            <dt>Renews</dt>
            <dd>{renewalDate()}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd><span className="subscription-status">Active</span></dd>
          </div>
        </dl>
      </div>

      <div className="billing-cycle-toggle" role="tablist" aria-label="Billing cycle">
        <button
          type="button"
          className={`billing-cycle-btn${cycle === "monthly" ? " is-active" : ""}`}
          onClick={() => setCycle("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`billing-cycle-btn${cycle === "annual" ? " is-active" : ""}`}
          onClick={() => setCycle("annual")}
        >
          Annual <span className="billing-cycle-save">−10%</span>
        </button>
      </div>

      <div className="billing-plan-grid">
        {PRICING_PLANS.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const direction =
            PLAN_ORDER.indexOf(plan.name) > PLAN_ORDER.indexOf(currentPlan)
              ? "Upgrade"
              : "Downgrade";
          return (
            <article
              key={plan.name}
              className={`billing-plan-card${isCurrent ? " is-current" : ""}${
                plan.name === "Premium" ? " is-featured" : ""
              }`}
            >
              <div className="billing-plan-head">
                <h3>{plan.name}</h3>
                {isCurrent ? (
                  <span className="billing-plan-badge">Current</span>
                ) : (
                  <span className="pricing-tag">{plan.tag}</span>
                )}
              </div>
              <p className="billing-plan-price">
                {cycle === "annual" ? `$${plan.annualPrice}` : `$${plan.monthlyPrice}`}
                <span>{cycle === "annual" ? "/yr" : "/mo"}</span>
              </p>
              <ul className="billing-plan-features">
                {plan.features.slice(0, 6).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {isCurrent ? (
                <button type="button" className="ghost" disabled>
                  Your current plan
                </button>
              ) : (
                <button
                  type="button"
                  className="primary pulse-on-hover"
                  onClick={() => setPending({ type: "switch", plan: plan.name })}
                >
                  {direction} to {plan.name}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="billing-danger-zone">
        <div>
          <strong>Cancel subscription</strong>
          <p>You&apos;ll keep access until the end of your current billing period.</p>
        </div>
        <button type="button" className="billing-cancel-btn" onClick={() => setPending({ type: "cancel" })}>
          Cancel subscription
        </button>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="billing-tab-panel billing-info-grid">
      <article className="billing-info-card">
        <h3>Payment method</h3>
        <div className="billing-card-line">
          <span className="billing-card-brand">VISA</span>
          <span>•••• •••• •••• 4242</span>
          <span className="billing-card-exp">Exp 09/28</span>
        </div>
        <button type="button" className="ghost" onClick={() => setToast("Securely redirecting to Stripe to update your payment method…")}>
          Update payment method
        </button>
      </article>
      <article className="billing-info-card">
        <h3>Billing details</h3>
        <dl className="billing-detail-list">
          <div><dt>Billing email</dt><dd>member@unbounded.app</dd></div>
          <div><dt>Billing address</dt><dd>123 Market St, Suite 400<br />San Francisco, CA 94103</dd></div>
        </dl>
        <button type="button" className="ghost" onClick={() => setToast("Securely redirecting to Stripe billing portal…")}>
          Manage in Stripe
        </button>
      </article>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="billing-tab-panel">
      <div className="payment-history" role="table" aria-label="Payment history">
        <div className="payment-history-row payment-history-row--header" role="row">
          <span role="columnheader">Date</span>
          <span role="columnheader">Amount</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Invoice</span>
        </div>
        {PAYMENT_HISTORY.map((entry) => (
          <div className="payment-history-row" role="row" key={entry.date}>
            <span role="cell">{entry.date}</span>
            <span role="cell">{entry.amount}</span>
            <span role="cell">
              <span className={`payment-status payment-status--${entry.status.toLowerCase()}`}>
                {entry.status}
              </span>
            </span>
            <span role="cell">
              <button
                type="button"
                className="payment-invoice-link"
                onClick={() => setToast("Preparing your invoice download…")}
              >
                Download
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <MarketingChrome>
      <main className="billing-page-main account-page">
        <header className="account-page-header">
          <div>
            <p className="account-eyebrow">Billing &amp; payments</p>
            <h1>Manage your subscription</h1>
            <p className="account-subtitle">
              Review your plan, update payment details, and download invoices.
              Plan changes are handled securely through Stripe.
            </p>
          </div>
        </header>

        <nav className="billing-tabs" role="tablist" aria-label="Billing sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "plan"}
            className={`billing-tab${activeTab === "plan" ? " is-active" : ""}`}
            onClick={() => setActiveTab("plan")}
          >
            Plan &amp; Subscription
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "billing"}
            className={`billing-tab${activeTab === "billing" ? " is-active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            Billing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={`billing-tab${activeTab === "history" ? " is-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Payment History
          </button>
        </nav>

        {activeTab === "plan" ? renderPlanTab() : null}
        {activeTab === "billing" ? renderBillingTab() : null}
        {activeTab === "history" ? renderHistoryTab() : null}
      </main>

      {pending ? (
        <div className="billing-confirm-backdrop" role="presentation" onClick={() => setPending(null)}>
          <div
            className="billing-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="billing-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="billing-confirm-title">
              {pending.type === "cancel"
                ? "Cancel your subscription?"
                : `Switch to ${pending.plan}?`}
            </h2>
            <p>
              {pending.type === "cancel"
                ? "You'll keep access until the end of the current billing period, then move to the free tier."
                : "You'll be securely redirected to Stripe to confirm the change and update billing."}
            </p>
            <div className="billing-confirm-actions">
              <button type="button" className="ghost" onClick={() => setPending(null)}>
                No, keep current
              </button>
              <button type="button" className="primary pulse-on-hover" onClick={confirmPending}>
                Yes, continue
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="billing-toast" role="status">{toast}</div> : null}
    </MarketingChrome>
  );
}
