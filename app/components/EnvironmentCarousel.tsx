"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type EnvironmentSlide = {
  src: string;
  alt: string;
  title: string;
  copy: string;
  tag: string;
  label: string;
};

type EnvironmentCarouselProps = {
  slides: EnvironmentSlide[];
};

export function EnvironmentCarousel({ slides }: EnvironmentCarouselProps) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const nextSlideIndex = (active + 1) % slides.length;

  const showSlide = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  return (
    <div
      className="environment-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="environment-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((slide, index) => {
          const shouldPreloadSlide = index === active || index === nextSlideIndex;

          return (
            <figure className="environment-slide" key={slide.src}>
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="(max-width: 1160px) calc(100vw - 40px), 1120px"
                loading={shouldPreloadSlide ? "eager" : "lazy"}
                fetchPriority={index === active ? "high" : "low"}
              />
              <figcaption>
                <div>
                  <h3>{slide.title}</h3>
                  <p>{slide.copy}</p>
                </div>
                <span className="environment-tag">{slide.tag}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <button
        className="carousel-control prev"
        type="button"
        aria-label="上一张店内环境图"
        onClick={() => showSlide(active - 1)}
      >
        ‹
      </button>
      <button
        className="carousel-control next"
        type="button"
        aria-label="下一张店内环境图"
        onClick={() => showSlide(active + 1)}
      >
        ›
      </button>
      <div className="carousel-dots" aria-label="店内环境轮播分页">
        {slides.map((slide, index) => (
          <button
            className={index === active ? "is-active" : undefined}
            type="button"
            aria-label={slide.label}
            key={slide.label}
            onClick={() => showSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
