"use client";

import React, { useState } from "react";
import styles from "./FaqSection.module.css";
import Container from "../../container/Container";
import type { FaqItem } from "../../../data/seoRichPage.types";

type FaqSectionProps = {
  description: string;
  items: FaqItem[];
};

export default function FaqSection({ description, items: faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <Container sectionClassName={styles.FaqSection}>
      <div className={styles.FaqBox}>
        <div className={styles.FaqBoxContent}>
          <h3>
            Frequently Asked <br /> <span>Questions?</span>
          </h3>

          <p>{description}</p>
        </div>
        <div className={styles.accordion}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`${styles.accordionQuestion} ${isOpen ? styles.active : ""}`}
                key={index}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>

                  <span className={styles.icon}>
                    {isOpen ? (
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 10.5C1.10218 10.5 0.720645 10.342 0.43934 10.0607C0.158036 9.77936 0 9.39782 0 9C0 8.60218 0.158036 8.22064 0.43934 7.93934C0.720645 7.65804 1.10218 7.5 1.5 7.5H16.5C16.8978 7.5 17.2794 7.65804 17.5607 7.93934C17.842 8.22064 18 8.60218 18 9C18 9.39782 17.842 9.77936 17.5607 10.0607C17.2794 10.342 16.8978 10.5 16.5 10.5H1.5Z" fill="#E2B146" />
                      </svg>

                    ) : (

                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 10.5C1.10218 10.5 0.720645 10.342 0.43934 10.0607C0.158036 9.77936 0 9.39782 0 9C0 8.60218 0.158036 8.22064 0.43934 7.93934C0.720645 7.65804 1.10218 7.5 1.5 7.5H16.5C16.8978 7.5 17.2794 7.65804 17.5607 7.93934C17.842 8.22064 18 8.60218 18 9C18 9.39782 17.842 9.77936 17.5607 10.0607C17.2794 10.342 16.8978 10.5 16.5 10.5H1.5Z" fill="#E2B146" />
                        <path d="M7.5 1.5C7.5 1.10218 7.65804 0.720645 7.93934 0.43934C8.22064 0.158036 8.60218 0 9 0C9.39782 0 9.77936 0.158036 10.0607 0.43934C10.342 0.720645 10.5 1.10218 10.5 1.5V16.5C10.5 16.8978 10.342 17.2794 10.0607 17.5607C9.77936 17.842 9.39782 18 9 18C8.60218 18 8.22064 17.842 7.93934 17.5607C7.65804 17.2794 7.5 16.8978 7.5 16.5V1.5Z" fill="#E2B146" />
                      </svg>
                    )}
                  </span>
                </button>

                <div
                  className={`${styles.answer} ${isOpen ? styles.answerOpen : ""
                    }`}
                >
                  <div className={styles.answerInner}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}