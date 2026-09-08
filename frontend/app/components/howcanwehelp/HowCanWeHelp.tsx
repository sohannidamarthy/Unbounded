"use client";

import React from "react";
import styles from "./HowCanWeHelp.module.css";
import Container from "../container/Container";

const EmailIcon = () => (
  <svg
    width="34"
    height="25"
    viewBox="0 0 34 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.41667 0L0 1.38889V23.6111L1.41667 25H32.5833L34 23.6111L34 1.38889L32.5833 0H1.41667ZM2.83333 4.5287V22.2222H31.1667V4.52824L16.9998 17.1548L2.83333 4.5287ZM28.9187 2.77778H5.08085L16.9998 13.4007L28.9187 2.77778Z"
      fill="#071826"
    />
  </svg>
);

const TalkUS = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.6 31.401H7.33333C3.83607 31.401 1 28.565 1 25.0677C1 21.5704 3.83607 18.7344 7.33333 18.7344H8.6V31.401Z" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M32.6671 31.401H31.4004V18.7344H32.6671C36.1643 18.7344 39.0004 21.5704 39.0004 25.0677C39.0004 28.565 36.1643 31.401 32.6671 31.401Z" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M6.06641 18.7333V14.9333C6.06641 7.23833 12.3047 1 19.9997 1C27.6947 1 33.9331 7.23833 33.9331 14.9333V18.7333" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M33.9329 31.3984V36.4651C33.9329 37.8648 32.7993 38.9984 31.3996 38.9984H27.5996" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M22.5332 39H25.0665" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M20 30.1328V32.6661" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M19.9993 27.6016V24.2892C19.9993 22.464 21.1102 20.8236 22.805 20.146C24.9355 19.2935 26.3327 17.2301 26.3327 14.9349C26.3327 11.4376 23.4966 8.60156 19.9993 8.60156C16.5021 8.60156 13.666 11.4376 13.666 14.9349" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
  </svg>

);

const HelpCenter = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 39C30.4934 39 39 30.4934 39 20C39 9.50659 30.4934 1 20 1C9.50659 1 1 9.50659 1 20C1 30.4934 9.50659 39 20 39Z" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M3.5332 11.1328H36.4665" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M3.5332 28.8672H36.4665" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M19.9995 1C19.9995 1 11.1328 7.33333 11.1328 20C11.1328 32.6667 19.9995 39 19.9995 39" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
    <path d="M20 1C20 1 28.8667 7.33333 28.8667 20C28.8667 32.6667 20 39 20 39" stroke="#071826" stroke-width="2" stroke-miterlimit="10" stroke-linejoin="round" />
  </svg>

)

const CONTACT_OPTIONS = [
  {
    icon: EmailIcon,
    title: "Email Us",
    description: "Drop us a line anytime at support@unbounded.com",
  },
  {
    icon: TalkUS,
    title: "Help Center",
    description: "Browse our FAQs and detailed documentation.",
  },
  {
    icon: HelpCenter,
    title: "Talk to Us",
    description: "Join our Discord community for real-time chat.",
  },
];

export default function HowCanWeHelp() {
  return (
    <section className={styles.contactSection}>
      <Container>
        <div className={styles.contactSectionHead}>
          <h2 className={styles.contactTitle}>
            How Can We <span>Help?</span>
          </h2>
          <p className={styles.contactDescription}>
            Have a question, suggestion, or feedback? We&apos;d love to hear from you. Send us a message and our team will get back to you.
          </p>
        </div>
        <div className={styles.contactBox}>
          <div className={styles.contactLeft}>
            <h3 className={styles.listenTitle}>We&apos;re Here to Listen</h3>
            <div className={styles.listenLine} />
            <div className={styles.contactOptions}>
              {CONTACT_OPTIONS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={styles.contactOption}
                    key={item.title}
                  >
                    <div className={styles.contactOptionIcon}>
                      <Icon />
                    </div>

                    <div className={styles.contactOptionContent}>
                      <h4 className={styles.contactOptionTitle}>
                        {item.title}
                      </h4>

                      <p className={styles.contactOptionDescription}>
                        {item.description}
                      </p>
                    </div>

                    <div className={styles.contactOptionArrow}>
                      <svg width="14" height="23" viewBox="0 0 14 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.69533 23L14 11.5L2.69533 0L4.47035e-08 2.7419L8.60935 11.5L4.47035e-08 20.2581L2.69533 23Z" fill="#DAA946" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className={styles.contactForm}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="fullName">
                  Full Name
                </label>
                <div className={styles.formInput}>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="email">
                  Email Address
                </label>

                <div className={styles.formInput}>
                  <input
                    id="email"
                    type="email"
                    className={styles.formInputText}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* REASON */}
            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label className={styles.formLabel} htmlFor="reason">
                Reason for Contact
              </label>

              <div className={styles.formSelect}>
                <select id="reason" className={styles.formInputText} defaultValue="">
                  <option value="" disabled>Select a reason</option>
                  <option value="General Feedback">General Feedback</option>
                  <option value="Suggestion / Feature Request">Suggestion / Feature Request</option>
                  <option value="Website / Technical Issue">Website / Technical Issue</option>
                  <option value="UI/UX Feedback">UI/UX Feedback</option>
                  <option value="Request a New Sport / League">Request a New Sport / League</option>
                  <option value="Privacy / Data Concern">Privacy / Data Concern</option>
                  <option value="Partnership / Business Inquiry">Partnership / Business Inquiry</option>
                  <option value="Advertising / Media Inquiry">Advertising / Media Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* MESSAGE */}
            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label className={styles.formLabel} htmlFor="message">
                Message
              </label>

              <div className={styles.formMessage}>
                <textarea
                  id="message"
                  className={styles.formInputText}
                  placeholder="How can we help you today?"
                  rows={5}
                />
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className={styles.formFooter}>
              <div className={styles.privacyText}>
                <span>
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 22C9.13333 22 7.41667 21.575 5.85 20.725C4.28333 19.875 3 18.7417 2 17.325V20H0V14H6V16H3.525C4.325 17.2 5.37917 18.1667 6.6875 18.9C7.99583 19.6333 9.43333 20 11 20C12.25 20 13.4208 19.7625 14.5125 19.2875C15.6042 18.8125 16.5542 18.1708 17.3625 17.3625C18.1708 16.5542 18.8125 15.6042 19.2875 14.5125C19.7625 13.4208 20 12.25 20 11H22C22 12.5167 21.7125 13.9417 21.1375 15.275C20.5625 16.6083 19.775 17.775 18.775 18.775C17.775 19.775 16.6083 20.5625 15.275 21.1375C13.9417 21.7125 12.5167 22 11 22ZM0 11C0 9.48333 0.2875 8.05833 0.8625 6.725C1.4375 5.39167 2.225 4.225 3.225 3.225C4.225 2.225 5.39167 1.4375 6.725 0.8625C8.05833 0.2875 9.48333 0 11 0C12.8667 0 14.5833 0.425 16.15 1.275C17.7167 2.125 19 3.25833 20 4.675V2H22V8H16V6H18.475C17.675 4.8 16.6208 3.83333 15.3125 3.1C14.0042 2.36667 12.5667 2 11 2C9.75 2 8.57917 2.2375 7.4875 2.7125C6.39583 3.1875 5.44583 3.82917 4.6375 4.6375C3.82917 5.44583 3.1875 6.39583 2.7125 7.4875C2.2375 8.57917 2 9.75 2 11H0ZM11.8875 16.6375C12.1292 16.3958 12.25 16.1 12.25 15.75C12.25 15.4 12.1292 15.1 11.8875 14.85C11.6458 14.6 11.35 14.475 11 14.475C10.65 14.475 10.3542 14.5958 10.1125 14.8375C9.87083 15.0792 9.75 15.375 9.75 15.725C9.75 16.075 9.87083 16.375 10.1125 16.625C10.3542 16.875 10.65 17 11 17C11.35 17 11.6458 16.8792 11.8875 16.6375ZM10.1 13.2H11.925C11.925 12.6 11.9958 12.15 12.1375 11.85C12.2792 11.55 12.5667 11.1833 13 10.75C13.5833 10.1667 13.9708 9.69583 14.1625 9.3375C14.3542 8.97917 14.45 8.55 14.45 8.05C14.45 7.11667 14.1167 6.375 13.45 5.825C12.7833 5.275 11.9667 5 11 5C10.1667 5 9.45 5.21667 8.85 5.65C8.25 6.08333 7.81667 6.7 7.55 7.5L9.2 8.2C9.31667 7.76667 9.5375 7.40833 9.8625 7.125C10.1875 6.84167 10.5667 6.7 11 6.7C11.45 6.7 11.8292 6.82917 12.1375 7.0875C12.4458 7.34583 12.6 7.69167 12.6 8.125C12.6 8.40833 12.5333 8.69167 12.4 8.975C12.2667 9.25833 11.9833 9.59167 11.55 9.975C11 10.4583 10.6208 10.9292 10.4125 11.3875C10.2042 11.8458 10.1 12.45 10.1 13.2Z" fill="currentColor" />
                  </svg>

                </span>
                Your information will only be used to respond to your request.
              </div>

              <button type="submit" className={styles.sendButton}>
                <span>➤</span>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}