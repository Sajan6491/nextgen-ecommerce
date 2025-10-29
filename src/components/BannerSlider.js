import React, { useEffect, useState, useRef } from "react";
import "./BannerSlider.css";
import acc1 from "../assets/accessory1.webp";
import acc2 from "../assets/travel-and-hospitality-best-travel-web-development-company.webp";

const slides = [
  {
    id: 1,
    title: "Fresh Looks, Fresh Vibes",
    subtitle: "Bold colors, better fits — Summer drop is here",
    cta: "Shop New",
    bg: acc1,
  },
  {
    id: 2,
    title: "Adventure-Ready",
    subtitle: "Lightweight layers for city trips & weekend escapes",
    cta: "Explore",
    bg: acc2,
  },
  {
    id: 3,
    title: "Everyday Comfort",
    subtitle: "Soft tees, sharp style — made for movement",
    cta: "See Collection",
    bg: null, // will use gradient fallback
  },
];

const BannerSlider = ({ autoplay = true, interval = 4500 }) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!autoplay) return;
    const next = () => setIndex((i) => (i + 1) % slides.length);
    timeoutRef.current = setInterval(next, interval);
    return () => clearInterval(timeoutRef.current);
  }, [autoplay, interval]);

  const goTo = (i) => {
    setIndex(i % slides.length);
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      // restart autoplay
      timeoutRef.current = setInterval(() => setIndex((s) => (s + 1) % slides.length), interval);
    }
  };

  const prev = () => goTo((index - 1 + slides.length) % slides.length);
  const next = () => goTo((index + 1) % slides.length);

  // simple keyboard left/right handlers
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Touch / swipe support for mobile
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // pixels

  const onTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    touchStartX.current = touch.clientX;
  };

  const onTouchMove = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    touchEndX.current = touch.clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // swiped left -> next
        next();
      } else {
        // swiped right -> prev
        prev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="banner-slider"
      role="region"
      aria-label="Promotional banners"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="slides" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            className="slide"
            key={s.id}
            style={{
              backgroundImage: s.bg ? `url(${s.bg})` : "none",
            }}
          >
            <div className="slide-overlay" />
            <div className="slide-content">
              <h2 className="slide-title">{s.title}</h2>
              <p className="slide-sub">{s.subtitle}</p>
              <button className="slide-cta" aria-label={`${s.cta} - ${s.title}`}>{s.cta}</button>
            </div>
            <div className="slide-decor" aria-hidden="true">🎉</div>
          </div>
        ))}
      </div>

      <button className="arrow left" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="arrow right" onClick={next} aria-label="Next slide">›</button>

      <div className="dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
