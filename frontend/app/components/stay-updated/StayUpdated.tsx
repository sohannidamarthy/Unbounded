"use client";

import React, { useState } from "react";
import styles from "./StayUpdated.module.css";
import Container from "../container/Container";
import Subscribe from "../../../public/subscribe.jpg"
import Image from "next/image";

export default function StayUpdated() {
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);

  const handleNewsletterSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (isNewsletterSubmitting) {
      return;
    }

    setIsNewsletterSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    try {
      const response = await fetch(`${apiBase}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || null })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }
    } catch (error) {
      // Keep optimistic confirmation even if the request errors.
    } finally {
      setNewsletterSubscribed(true);
      setIsNewsletterSubmitting(false);
    }
  };
  return (
    <section className={styles.stayUpdatedWrapper}>
      <Container>
        <div className={styles.stayUpdatedBox}>
          <div className={styles.stayUpdated}>
            <i className={styles.stayUpdatedIcon}>
              <svg width="46" height="50" viewBox="0 0 46 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.0018 0C19.0633 0 15.832 3.21879 15.832 7.1421C15.832 7.14567 15.832 7.14924 15.832 7.15281C15.8392 8.36104 16.1515 9.54887 16.7458 10.6053C16.8606 10.8101 17.0149 10.9903 17.1997 11.1356C17.3846 11.281 17.5963 11.3886 17.8229 11.4524C18.0495 11.5162 18.2865 11.5349 18.5204 11.5075C18.7542 11.48 18.9804 11.4069 19.1859 11.2923C19.3914 11.1779 19.5724 11.0242 19.7183 10.8401C19.8642 10.656 19.9723 10.445 20.0363 10.2193C20.1004 9.99358 20.1191 9.7575 20.0916 9.52454C20.064 9.29158 19.9906 9.06631 19.8755 8.86161C19.5801 8.33635 19.4217 7.74356 19.4169 7.13887C19.4187 5.14716 21.0019 3.5713 23.0018 3.5713C25.0017 3.5713 26.5848 5.14716 26.5867 7.13887C26.5813 7.73735 26.4273 8.32473 26.1351 8.84768C25.9042 9.26117 25.8475 9.74905 25.9775 10.2042C26.1075 10.6592 26.4135 11.0443 26.8283 11.2749C27.2434 11.5049 27.7331 11.5613 28.19 11.4318C28.6469 11.3024 29.0335 10.9976 29.2649 10.5844C29.8517 9.53466 30.1643 8.35424 30.1716 7.15281C30.1716 7.14924 30.1716 7.14567 30.1716 7.1421C30.1716 3.21879 26.9403 0 23.0018 0Z" fill="#E2B146" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M23.0014 7.14453C14.1132 7.14453 6.86948 14.3598 6.86948 23.2131V33.9254C3.92147 33.9254 1.49219 36.3451 1.49219 39.2816C1.49219 42.218 3.92147 44.6377 6.86948 44.6377H39.1332C42.0813 44.6377 44.5105 42.218 44.5105 39.2816C44.5105 36.3451 42.0813 33.9254 39.1332 33.9254V23.2131C39.1332 14.3598 31.8895 7.14453 23.0014 7.14453ZM23.0014 10.7153C29.9521 10.7153 35.5484 16.2896 35.5484 23.2131V35.7108C35.5484 36.1843 35.7373 36.6384 36.0735 36.9732C36.4096 37.308 36.8654 37.4961 37.3408 37.4962H39.1332C40.1572 37.4962 40.9257 38.2616 40.9257 39.2816C40.9257 40.3015 40.1572 41.067 39.1332 41.067H6.86948C5.84552 41.067 5.07705 40.3015 5.07705 39.2816C5.07705 38.2616 5.84552 37.4962 6.86948 37.4962H8.66191C9.13728 37.4961 9.59314 37.308 9.92927 36.9732C10.2654 36.6384 10.4543 36.1843 10.4543 35.7108V23.2131C10.4543 16.2896 16.0506 10.7153 23.0014 10.7153Z" fill="#E2B146" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0405 46.4297C13.5651 46.4297 13.1092 46.6178 12.7731 46.9527C12.4369 47.2875 12.248 47.7417 12.248 48.2152C12.248 48.6888 12.4369 49.1429 12.7731 49.4778C13.1092 49.8126 13.5651 50.0007 14.0405 50.0007H31.9649C32.4403 50.0007 32.8962 49.8126 33.2323 49.4778C33.5685 49.1429 33.7574 48.6888 33.7574 48.2152C33.7574 47.7417 33.5685 47.2875 33.2323 46.9527C32.8962 46.6178 32.4403 46.4297 31.9649 46.4297H14.0405Z" fill="#E2B146" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M38.3671 5.82249C38.1906 5.66714 37.9851 5.54797 37.7623 5.47178C37.5396 5.39559 37.3039 5.36387 37.0688 5.37845C36.8338 5.39303 36.6039 5.4536 36.3924 5.55673C36.1808 5.65985 35.9917 5.80348 35.8359 5.97943C35.68 6.15525 35.5604 6.35995 35.4839 6.58185C35.4074 6.80374 35.3755 7.03848 35.3902 7.27264C35.4048 7.5068 35.4656 7.7358 35.5692 7.94653C35.6727 8.15727 35.8168 8.3456 35.9935 8.50079C39.3246 11.4281 41.6702 15.4401 42.4421 19.9463C42.4815 20.1776 42.5663 20.399 42.6917 20.5976C42.817 20.7963 42.9804 20.9684 43.1726 21.1041C43.3647 21.2398 43.5818 21.3364 43.8115 21.3885C44.0412 21.4405 44.2789 21.447 44.5111 21.4075C44.9794 21.3274 45.3967 21.0653 45.6711 20.6788C45.9455 20.2923 46.0546 19.8131 45.9744 19.3465C45.0597 14.0061 42.2914 9.27102 38.3671 5.82249Z" fill="#E2B146" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.95281 5.36294C8.71772 5.34812 8.48201 5.37961 8.25914 5.45561C8.03628 5.53161 7.83064 5.65061 7.65399 5.80583C3.72006 9.25591 0.940962 13.998 0.0255968 19.3472C-0.0140702 19.5785 -0.00757848 19.8153 0.0446875 20.0441C0.0969534 20.2729 0.193941 20.4892 0.330172 20.6806C0.466404 20.872 0.639189 21.0348 0.838618 21.1597C1.03805 21.2845 1.26024 21.369 1.49246 21.4083C1.72464 21.4478 1.96236 21.4413 2.19203 21.3893C2.42171 21.3372 2.63884 21.2405 2.83099 21.1048C3.02315 20.9691 3.18658 20.797 3.31193 20.5984C3.43727 20.3997 3.52205 20.1784 3.56147 19.9471C4.33387 15.4333 6.68145 11.416 10.0206 8.48761C10.1975 8.33266 10.3419 8.14451 10.4458 7.93391C10.5496 7.7233 10.6108 7.49436 10.6257 7.26019C10.6407 7.02603 10.6092 6.79123 10.533 6.56921C10.4568 6.34718 10.3375 6.14229 10.1817 5.96625C9.86847 5.611 9.42645 5.39403 8.95281 5.36294Z" fill="#E2B146" />
              </svg>
            </i>
            <div className={styles.stayUpdatedContent}>
              <h2>Stay <span>updated</span></h2>
              <p>Receive product updates, tier announcements, and <br /> betting workflow notes.</p>
              <div className={styles.stayUpdatedForm}>


                {newsletterSubscribed ? (
                  <p className="newsletter-inline-success" role="status">
                    You&apos;re subscribed. Watch your inbox for the next update.
                  </p>
                ) : (
                  <form className="" onSubmit={handleNewsletterSubmit}>
                    <i>
                      <svg width="20" height="16" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.42578 3.85163L11.2829 10.4944C12.8068 11.6373 14.9019 11.6373 16.4258 10.4944L25.2829 3.85156" stroke="#F5B53F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M23.8571 1H3.85714C2.27919 1 1 2.27919 1 3.85714V18.1429C1 19.7208 2.27919 21 3.85714 21H23.8571C25.4351 21 26.7143 19.7208 26.7143 18.1429V3.85714C26.7143 2.27919 25.4351 1 23.8571 1Z" stroke="#F5B53F" stroke-width="2" stroke-linecap="round" />
                      </svg>
                    </i>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                    />
                    <button className="primary" type="submit">
                      {isNewsletterSubmitting ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>
                )}
              </div>



            </div>
          </div>
          <div className={styles.stayUpdatedIMG}>
            <Image src={Subscribe} width={473} height={356} alt="Subscribe" />
          </div>
        </div>
      </Container>
    </section>
  );
}