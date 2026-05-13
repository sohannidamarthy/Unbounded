"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { SeoPageDefinition } from "./seoData";

type SeoPageClientProps = {
  page: SeoPageDefinition;
};

export function SeoPageClient({ page }: SeoPageClientProps) {
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);
  const [pricingNotified, setPricingNotified] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex(
        (current) => (current + 1) % page.testimonials.length
      );
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [page.testimonials.length]);

  const activeTestimonial = page.testimonials[activeTestimonialIndex];
  const primaryHref = page.ctaTarget;
  const primaryLabel = page.ctaLoggedInLabel;
  const apiBase = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000"
    );
  }, []);

  const handlePricingSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isPricingSubmitting) {
      return;
    }

    setIsPricingSubmitting(true);
    setPricingNotified(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    try {
      const response = await fetch(`${apiBase}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      event.currentTarget.reset();
      setPricingNotified(true);
      setIsNewsletterOpen(false);
    } catch {
      setPricingNotified(true);
    } finally {
      setIsPricingSubmitting(false);
    }
  };

  return (
    <main className="seo-page-main">
      <section className="seo-hero">
        <div className="seo-hero-frame">
          <div className="seo-hero-copy">
            <span className="seo-hero-eyebrow">{page.eyebrow}</span>
            <h1>{page.heroTitle}</h1>
            <p>{page.heroDescription}</p>
            <div className="seo-hero-actions">
              <a className="primary header-primary pulse-on-hover" href={primaryHref}>
                {primaryLabel}
              </a>
              <button
                className="ghost pulse-on-hover"
                type="button"
                onClick={() => setIsNewsletterOpen(true)}
              >
                Join newsletter
              </button>
            </div>
          </div>
          <div className="seo-hero-preview">
            <div className="seo-hero-preview-label">{page.previewLabel}</div>
            <div className="seo-hero-preview-media">
              <Image
                src={page.previewImage}
                alt={page.previewAlt}
                width={1200}
                height={720}
                priority
              />
              <div className="seo-hero-preview-overlay" />
            </div>
            <p>{page.previewCaption}</p>
          </div>
        </div>
      </section>

      <section className="section seo-related-section">
        <div className="section-header">
          <h2>{page.relatedLabel}</h2>
          <p>Different questions, strategies, and tools connected to this topic.</p>
        </div>
        <div className="seo-related-grid">
          {page.relatedLinks.map((link) => (
            <a className="seo-related-card" href={link.href} key={link.href}>
              <strong>{link.title}</strong>
              <p>{link.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section testimonials seo-testimonials">
        <div className="section-header testimonials-header">
          <div>
            <h2>What users say after working through this topic</h2>
            <p>Educational pages should make the workflow clearer before a user ever logs in.</p>
          </div>
          <div className="testimonial-controls">
            <button
              type="button"
              className="testimonial-arrow"
              onClick={() =>
                setActiveTestimonialIndex(
                  (current) =>
                    (current - 1 + page.testimonials.length) % page.testimonials.length
                )
              }
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <button
              type="button"
              className="testimonial-arrow"
              onClick={() =>
                setActiveTestimonialIndex(
                  (current) => (current + 1) % page.testimonials.length
                )
              }
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        </div>
        <div className="testimonial-card" key={activeTestimonial.quote}>
          <div className="testimonial-quote">
            <p>“{activeTestimonial.quote}”</p>
          </div>
          <div className="testimonial-meta">
            <div className="testimonial-avatar" aria-hidden="true">
              <span>?</span>
            </div>
            <div>
              <strong>{activeTestimonial.name}</strong>
              <span>{activeTestimonial.role}</span>
            </div>
          </div>
          <div className="testimonial-dots" role="tablist">
            {page.testimonials.map((testimonial, index) => (
              <button
                key={testimonial.quote}
                type="button"
                className={`dot ${activeTestimonialIndex === index ? "active" : ""}`}
                aria-pressed={activeTestimonialIndex === index}
                onClick={() => setActiveTestimonialIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section pricing-section seo-pricing-section">
        <div className="pricing-waitlist seo-pricing-panel">
          <div>
            <h3>{page.pricingLabel}</h3>
            <p>{page.pricingDescription}</p>
          </div>
          <div className="seo-pricing-actions">
            <a className="primary pulse-on-hover" href={primaryHref}>
              {primaryLabel}
            </a>
            <button
              className="primary pulse-on-hover"
              type="button"
              onClick={() => setIsNewsletterOpen(true)}
            >
              Newsletter updates
            </button>
          </div>
        </div>
      </section>
      {isNewsletterOpen ? (
        <div
          className="newsletter-modal-backdrop"
          role="presentation"
          onClick={() => setIsNewsletterOpen(false)}
        >
          <section
            className="newsletter-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seo-newsletter-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="newsletter-modal-close"
              type="button"
              aria-label="Close newsletter form"
              onClick={() => setIsNewsletterOpen(false)}
            >
              ×
            </button>
            <span className="billing-eyebrow">Newsletter</span>
            <h2 id="seo-newsletter-title">Get Unbounded updates</h2>
            <p>Product updates, tier announcements, and betting workflow notes.</p>
            <form className="pricing-form newsletter-modal-form" onSubmit={handlePricingSubmit}>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
              />
              <button className="primary pulse-on-hover" type="submit">
                {isPricingSubmitting
                  ? "Sending..."
                  : pricingNotified
                    ? "Subscribed"
                    : "Subscribe"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
