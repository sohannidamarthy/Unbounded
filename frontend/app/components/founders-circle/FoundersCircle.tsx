"use client";

import React, { useState } from "react";
import styles from "./FoundersCircle.module.css";
import Container from "../container/Container";
import Subscribe from "../../../public/subscribe.jpg"
import Image from "next/image";

const FOUNDERS_CIRCLE_SEATS_TOTAL = 300;
const FOUNDERS_CIRCLE_SEATS_CLAIMED = 214;

export default function FoundersCircle() {
  const [foundersCircleSubmitted, setFoundersCircleSubmitted] = useState(false);
  const [isFoundersCircleSubmitting, setIsFoundersCircleSubmitting] = useState(false);

  const handleFoundersCircleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isFoundersCircleSubmitting) {
      return;
    }

    setIsFoundersCircleSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    try {
      const response = await fetch(`${apiBase}/founders-circle/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch (error) {
      // Keep optimistic confirmation even if the request errors.
    } finally {
      setFoundersCircleSubmitted(true);
      setIsFoundersCircleSubmitting(false);
    }
  };

  return (
    <section id="founders-circle" className={`section ${styles.foundersCircleSection}`}>
      <Container>
        <div className={styles.foundersCircle}>
          <div className={styles.foundersCircleBadge} aria-hidden="true">
            <div className={styles.foundersCircleBadgeGlow} />
            <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none">
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="#f2c969"
                strokeWidth="2"
                strokeDasharray="6 7"
                className={styles.foundersCircleBadgeRing}
              />
              <circle cx="60" cy="60" r="44" fill="url(#foundersCircleGradient)" />
              <circle cx="60" cy="60" r="44" stroke="rgba(8,27,47,0.4)" strokeWidth="1.5" />
              <defs>
                <linearGradient
                  id="foundersCircleGradient"
                  x1="10"
                  y1="10"
                  x2="110"
                  y2="110"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#f5d488" />
                  <stop offset="1" stopColor="#a5771f" />
                </linearGradient>
              </defs>
              <text
                x="60"
                y="74"
                textAnchor="middle"
                fontSize="42"
                fontWeight="700"
                fill="#081b2f"
              >
                F
              </text>
            </svg>
          </div>
          <div className={styles.foundersCircleCopy}>
            <span className={styles.foundersCircleEyebrow}>
              <i>
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.53461 16.7486C2.9375 16.7486 2.38575 16.4219 2.0872 15.8915C1.78864 15.3612 1.78864 14.7077 2.0872 14.1774C2.38575 13.647 2.9375 13.3203 3.53461 13.3203H15.791C16.714 13.3203 17.4623 14.0878 17.4623 15.0345C17.4623 15.9811 16.714 16.7486 15.791 16.7486H3.53461Z" stroke="#E2B146" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1.86328 4.17969C3.27276 6.72578 6.39258 10.5438 9.66282 4.17969C12.933 10.5438 16.0528 6.72578 17.4623 4.17969L15.9024 13.3218H3.42319L1.86328 4.17969Z" stroke="#E2B146" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M9.66352 4.17831C8.74049 4.17831 7.99219 3.41086 7.99219 2.46416C7.99219 1.51745 8.74049 0.75 9.66352 0.75C10.5867 0.75 11.3348 1.51745 11.3348 2.46416C11.3348 2.91877 11.1589 3.35478 10.8454 3.67625C10.5319 3.99771 10.1068 4.17831 9.66352 4.17831Z" stroke="#E2B146" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M17.4638 4.17617C16.8486 4.17617 16.3496 3.66452 16.3496 3.0334C16.3496 2.40227 16.8486 1.89062 17.4638 1.89062C18.0792 1.89062 18.578 2.40227 18.578 3.0334C18.578 3.33648 18.4607 3.62714 18.2518 3.84146C18.0428 4.05576 17.7594 4.17617 17.4638 4.17617Z" stroke="#E2B146" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M1.86422 4.17617C1.24886 4.17617 0.75 3.66452 0.75 3.0334C0.75 2.40227 1.24886 1.89062 1.86422 1.89062C2.47959 1.89062 2.97844 2.40227 2.97844 3.0334C2.97844 3.33648 2.86105 3.62714 2.65209 3.84146C2.44314 4.05576 2.15973 4.17617 1.86422 4.17617Z" stroke="#E2B146" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

              </i>
              Limited access · 300 seats</span>
            <h2>Founders Circle Council</h2>
            <p>
              The Founders Circle Council is a small, invite-capped group of
              Unbounded&apos;s earliest members. In exchange for feedback on
              every new tool before it ships, the Council gets pricing and
              perks that are never offered again once the seats are gone.
              It&apos;s part advisory board, part standing discount &mdash;
              and it disappears the moment seat 300 is claimed.
            </p>
            <ul className={styles.foundersCircleBenefits}>
              <li>
                <div className={styles.foundersCircleBenefitsBox}>
                  <i>
                    <svg width="756" height="756" viewBox="0 0 756 756" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M447.835 730.677L730.678 447.834L424.265 141.421H141.422V424.264L447.835 730.677Z" stroke="currentColor" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M377.125 377.124C351.089 403.16 308.88 403.16 282.844 377.124C256.809 351.09 256.808 308.879 282.844 282.844C308.88 256.808 351.09 256.809 377.125 282.844C403.16 308.879 403.16 351.089 377.125 377.124Z" stroke="currentColor" stroke-width="50" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </i>
                  <span>Up to 50% off</span>
                </div>
              </li>
              <li>
                <div className={styles.foundersCircleBenefitsBox}>
                  <i>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 15C21.2091 15 23 16.7909 23 19V21H21M16 10.874C17.7252 10.4299 19 8.86383 19 6.99999C19 5.13615 17.7252 3.57005 16 3.12601M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM5 15H13C15.2091 15 17 16.7909 17 19V21H1V19C1 16.7909 2.79086 15 5 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </i>
                  <span>First 300</span>
                </div>
              </li>
              <li>
                <div className={styles.foundersCircleBenefitsBox}>
                  <i>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 17L6 20L7.5 14L3 9L9.5 8.5L12 3L14.5 8.5L21 9L16.5 14L18 20L12 17Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </i>
                  <span>More Future exclusive deals</span>
                </div>
              </li>
            </ul>
            <div className={styles.foundersCircleProgress}>
              <div
                className={styles.foundersCircleProgressTrack}
                role="progressbar"
                aria-valuenow={FOUNDERS_CIRCLE_SEATS_CLAIMED}
                aria-valuemin={0}
                aria-valuemax={FOUNDERS_CIRCLE_SEATS_TOTAL}
                aria-label="Founder seats claimed"
              >
                <div
                  className={styles.foundersCircleProgressFill}
                  style={{
                    width: `${(FOUNDERS_CIRCLE_SEATS_CLAIMED / FOUNDERS_CIRCLE_SEATS_TOTAL) * 100}%`
                  }}
                />
              </div>
              <p>
                {FOUNDERS_CIRCLE_SEATS_CLAIMED} of {FOUNDERS_CIRCLE_SEATS_TOTAL} founder seats claimed
              </p>
            </div>
            {foundersCircleSubmitted ? (
              <p className={styles.foundersCircleSuccess} role="status">
                You&apos;re on the list. We&apos;ll follow up by email if a
                founder seat opens up for you.
              </p>
            ) : (
              <form
                className={styles.foundersCircleForm}
                onSubmit={handleFoundersCircleSubmit}
              >
                <div className={styles.foundersCircleFormRow}>
                  <input
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                  />
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                  />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                />
                <button className="primary pulseOnHover" type="submit" disabled={isFoundersCircleSubmitting}>
                  {isFoundersCircleSubmitting
                    ? "Submitting..."
                    : "Apply for a founder seat"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}