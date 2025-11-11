import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSlider.css";
import { BANNERS } from "../data/banners"; // ✅ Dynamic import

export default function HeroSlider() {
  const nav = useNavigate();
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause || BANNERS.length === 0) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % BANNERS.length), 4000);
    return () => clearInterval(id);
  }, [pause]);

  const go = (n) => setIndex((p) => (n + BANNERS.length) % BANNERS.length);

  const handleClick = (b) => {
    nav("/travel", {
      state: {
        promoCode: b.code,
        headline: b.title,
        note: b.tagline
      }
    });
  };

  if (!BANNERS.length) return null;

  return (
    <section className="hz">
      <div className="hz-slider"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        <div className="hz-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {BANNERS.map((b) => (
            <div
              key={b.id}
              className="hz-slide"
              role="button"
              tabIndex={0}
              onClick={() => handleClick(b)}
              onKeyDown={(e) => e.key === "Enter" && handleClick(b)}
            >
              <img src={b.img} alt={b.alt} />
              <div className="hz-overlay">
                <h2>{b.title}</h2>
                <p>{b.tagline}</p>
                <span className="hz-pill">CODE: {b.code}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="hz-nav left" onClick={() => go(index - 1)}>‹</button>
        <button className="hz-nav right" onClick={() => go(index + 1)}>›</button>

        <div className="hz-dots">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              className={`hz-dot ${idx === index ? "active" : ""}`}
              onClick={() => go(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
