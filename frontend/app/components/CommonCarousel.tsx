"use client";

import React, { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type CommonCarouselProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;

  mobileSlides?: number;
  tabletSlides?: number;
  desktopSlides?: number;

  mobileSpaceBetween?: number;
  tabletSpaceBetween?: number;
  desktopSpaceBetween?: number;

  showArrows?: boolean;
  showDots?: boolean;

  autoPlay?: boolean;
  autoPlayDelay?: number;

  loop?: boolean;
  className?: string;
};

export default function CommonCarousel<T>({
  data,
  renderItem,

  mobileSlides = 1,
  tabletSlides = 2,
  desktopSlides = 3,

  mobileSpaceBetween = 16,
  tabletSpaceBetween = 20,
  desktopSpaceBetween = 24,

  showArrows = true,
  showDots = true,

  autoPlay = false,
  autoPlayDelay = 5000,

  loop = true,
  className = "",
}: CommonCarouselProps<T>) {
  if (!data?.length) return null;

  const modules = [];

  if (showArrows) modules.push(Navigation);
  if (showDots) modules.push(Pagination);
  if (autoPlay) modules.push(Autoplay);

  const shouldLoop =
    loop && data.length > Math.max(desktopSlides, tabletSlides, mobileSlides);

  return (
    <div className={`common-carousel ${className}`}>
      <Swiper
        modules={modules}
        slidesPerView={mobileSlides}
        spaceBetween={mobileSpaceBetween}
        loop={shouldLoop}
        watchOverflow={true}
        navigation={showArrows}
        pagination={
          showDots
            ? {
                clickable: true,
              }
            : false
        }
        autoplay={
          autoPlay
            ? {
                delay: autoPlayDelay,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        breakpoints={{
          768: {
            slidesPerView: tabletSlides,
            spaceBetween: tabletSpaceBetween,
          },

          1200: {
            slidesPerView: desktopSlides,
            spaceBetween: desktopSpaceBetween,
          },
        }}
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            {renderItem(item, index)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}