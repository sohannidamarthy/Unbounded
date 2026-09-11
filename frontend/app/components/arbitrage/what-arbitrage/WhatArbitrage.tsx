import React from 'react';
import styles from './WhatArbitrage.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const features = [
  "Compare odds across sportsbooks",
  "Identify pricing differences",
  "Find potential arbitrage opportunities",
  "Calculate required stake amounts",
  "Track potential returns",
];

export default function WhatArbitrage() {
  const carouselFeatures = [...features, ...features, ...features];

  return (
    <section className={`section ${styles.WhatArbitrageSection}`}>
      <Container>
        <SectionHeading
          highlight="What is Arbitrage "
          title=" Betting?"
          description="Arbitrage betting is a sports betting strategy that takes advantage of different odds offered by multiple sportsbooks for the same event. By placing calculated bets on all relevant outcomes, bettors can potentially create a position where the combined odds provide a favorable return, regardless of which outcome wins."
        />
      </Container>

      <div className={styles.WhatArbitrageCarousel}>
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
          }}
          speed={3000}
          spaceBetween={30}
          slidesPerView="auto"
          loop={false}
          allowTouchMove={false}
        >
          {carouselFeatures.map((feature, index) => (
            <SwiperSlide
              key={`${feature}-${index}`}
              className={styles.featureSlide}
            >
              <div className={styles.featureItem}>
                <i>
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="4" cy="4" r="4" fill="#E2B146" />
                  </svg>
                </i>

                <h3>{feature}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}