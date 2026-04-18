"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { SeoPageDefinition } from "./seoData";

const TOKEN_STORAGE_KEY = "unbounded.access_token";

type SeoPageClientProps = {
  page: SeoPageDefinition;
};

export function SeoPageClient({ page }: SeoPageClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);
  const [pricingNotified, setPricingNotified] = useState(false);

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
  const primaryHref =
    isAuthReady && isAuthenticated ? page.ctaTarget : "/auth";
  const primaryLabel =
    isAuthReady && isAuthenticated
      ? page.ctaLoggedInLabel
      : page.ctaLoggedOutLabel;
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
              <a className="ghost pulse-on-hover" href="/waitlist">
                Join newsletter
              </a>
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
              className="ghost"
              onClick={() =>
                setActiveTestimonialIndex(
                  (current) =>
                    (current - 1 + page.testimonials.length) % page.testimonials.length
                )
              }
              aria-label="Previous testimonial"
            >
              Prev
            </button>
            <button
              type="button"
              className="primary"
              onClick={() =>
                setActiveTestimonialIndex(
                  (current) => (current + 1) % page.testimonials.length
                )
              }
              aria-label="Next testimonial"
            >
              Next
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
            <form className="pricing-form" onSubmit={handlePricingSubmit}>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
              <button className="primary pulse-on-hover" type="submit">
                {isPricingSubmitting
                  ? "Sending..."
                  : pricingNotified
                    ? "Notified!"
                    : "Join waitlist"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
