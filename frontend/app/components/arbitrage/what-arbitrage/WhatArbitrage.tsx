import React from 'react';
import styles from './WhatArbitrage.module.css';
import Container from '../../container/Container';
import SectionHeading from '../../section-heading/SectionHeading';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

type WhatArbitrageProps = {
  highlight: string;
  title: string;
  description: string;
  tickerItems: string[];
};

export default function WhatArbitrage({ highlight, title, description, tickerItems }: WhatArbitrageProps) {
  const carouselFeatures = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <Container sectionClassName={styles.WhatArbitrageSection} fullWidth noFullWidthPadding>
      <SectionHeading
        highlight={highlight}
        title={title}
        description={description}
      />

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
    </Container>
  );
}