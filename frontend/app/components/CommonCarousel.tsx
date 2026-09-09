"use client";

import React, { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

type CoverflowEffectOptions = {
  rotate?: number;
  stretch?: number;
  depth?: number;
  modifier?: number;
  slideShadows?: boolean;
};

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

  /** Visual effect for slide transitions. Defaults to Swiper's regular "slide" effect. */
  effect?: "slide" | "coverflow";
  /** Fine-tune the 3D coverflow look. Only used when effect="coverflow". */
  coverflowEffect?: CoverflowEffectOptions;
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

  effect = "slide",
  coverflowEffect,
}: CommonCarouselProps<T>) {
  if (!data?.length) return null;

  const isCoverflow = effect === "coverflow";

  const modules = [];

  if (showArrows) modules.push(Navigation);
  if (showDots) modules.push(Pagination);
  if (autoPlay) modules.push(Autoplay);
  if (isCoverflow) modules.push(EffectCoverflow);

  const shouldLoop =
    loop && data.length > Math.max(desktopSlides, tabletSlides, mobileSlides);

  return (
    <div
      className={`common-carousel ${isCoverflow ? "common-carousel--coverflow" : ""
        } ${className}`}
    >
      <Swiper
        modules={modules}
        effect={effect}
        grabCursor={isCoverflow}
        centeredSlides={isCoverflow}
        slidesPerView={isCoverflow ? "auto" : mobileSlides}
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
        coverflowEffect={
          isCoverflow
            ? {
              rotate: 18,
              stretch: 0,
              depth: 150,
              modifier: 1,
              slideShadows: false,
              ...coverflowEffect,
            }
            : undefined
        }
        breakpoints={{
          768: {
            slidesPerView: isCoverflow ? "auto" : tabletSlides,
            spaceBetween: tabletSpaceBetween,
          },

          1200: {
            slidesPerView: isCoverflow ? "auto" : desktopSlides,
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
