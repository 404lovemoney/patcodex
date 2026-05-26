"use client";

import { useId, useState } from "react";
import { testimonials } from "../config/home";

export function TestimonialsKeywordCloud() {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentId = useId();
  const activeTestimonial = testimonials.items[activeIndex];

  return (
    <section className="testimonials" id="testimonials" aria-labelledby="testimonials-title">
      <div className="section-inner testimonials-layout">
        <div className="section-head testimonials-head">
          <div>
            <h2 id="testimonials-title">{testimonials.title}</h2>
            <p>{testimonials.copy}</p>
          </div>
        </div>
        <div className="testimonial-keywords" aria-label="选择评价关键词">
          {testimonials.items.map((item, index) => (
            <button
              className={index === activeIndex ? "is-active" : undefined}
              type="button"
              aria-pressed={index === activeIndex}
              aria-controls={contentId}
              key={item.keyword}
              onClick={() => setActiveIndex(index)}
            >
              {item.keyword}
            </button>
          ))}
        </div>
        <article className="testimonial-panel" id={contentId} aria-live="polite">
          <span>{activeTestimonial.tag}</span>
          <h3>{activeTestimonial.title}</h3>
          <p>{activeTestimonial.quote}</p>
          <strong>{activeTestimonial.author}</strong>
        </article>
      </div>
    </section>
  );
}
