// src/components/HeroPromoAdvanced.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import "./HeroPromoAdvanced.css";

/**
 * HeroPromoAdvanced
 * Props:
 *  - headline, sub, ctaText, qrData, logoSrc
 */
export default function HeroPromoAdvanced({
  headline = "Shop Smarter\nSave More",
  sub = "App-only: extra 20% OFF",
  ctaText = "Shop Now",
  qrData = "https://your-store.example.com/promo",
  logoSrc = "/images/brand-logo-small.png",
}) {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const modalRef = useRef(null);

  // Small helper: show toast
  const pushToast = (text, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  // CTA: show a toast, then navigate after 300ms (SPA)
  const handleCTA = () => {
    pushToast("Taking you to shop…", "success");
    setTimeout(() => navigate("/shop"), 350);
  };

  // copy link
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      pushToast("Link copied to clipboard", "success");
    } catch {
      pushToast("Unable to copy link", "error");
    }
  };

  // download QR by opening the image (we use Google Charts QR image as data source for simplicity)
  const qrSrc = `https://chart.googleapis.com/chart?cht=qr&chs=640x640&chl=${encodeURIComponent(qrData)}&chld=L|2`;

  const handleDownload = () => {
    // simple download: open the image in a new tab where user can save
    const a = document.createElement("a");
    a.href = qrSrc;
    a.target = "_blank";
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    pushToast("Opened QR for download", "info");
  };

  // trap keyboard on modal close (Escape)
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && qrOpen) setQrOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qrOpen]);

  // accessible focus management when modal opens
  React.useEffect(() => {
    if (qrOpen) {
      setTimeout(() => modalRef.current?.focus?.(), 80);
    }
  }, [qrOpen]);

  return (
    <>
      <section className="hp-advanced">
        <div className="hp-inner">
          {/* Left artwork */}
          <div className="hp-left">
            <div className="hp-art">
              <div className="hp-arc" />
              <img src="/images/person-left.png" alt="" className="hp-p left" onError={(e)=> e.currentTarget.style.opacity=0} />
              <img src="/images/person-right.png" alt="" className="hp-p right" onError={(e)=> e.currentTarget.style.opacity=0} />
            </div>
          </div>

          {/* Center QR */}
          <div className="hp-center">
            <div
              className="qr-card"
              role="button"
              tabIndex={0}
              onClick={() => setQrOpen(true)}
              onKeyDown={(e) => e.key === "Enter" && setQrOpen(true)}
              aria-label="Open QR"
            >
              <div className="qr-badge">{sub}</div>
              <div className="qr-frame">
                <img className="qr-img" src={qrSrc} alt="QR code" />
                {logoSrc && <img className="qr-logo" src={logoSrc} alt="brand" onError={(e)=> e.currentTarget.style.opacity=0} />}
              </div>
              <div className="qr-hint">Scan to open • Click to enlarge</div>
            </div>
          </div>

          {/* Right copy */}
          <div className="hp-right">
            <div className="hp-copy">
              {headline.split("\n").map((l, i) => (
                <h1 key={i} className="hp-h">{l}</h1>
              ))}
              <p className="hp-sub">
                Curated deals, lightning-fast checkout and VIP app-only offers — everything in one place.
              </p>

              <div className="cta-row">
                <button className="btn primary" onClick={handleCTA}>{ctaText}</button>
                <button className="btn ghost" onClick={() => setQrOpen(true)}>Get app</button>
              </div>

              <div className="small-notes">
                <span>Available on iOS & Android</span>
                <span className="dot">•</span>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR modal */}
      {qrOpen && (
        <div className="modal-back" onClick={() => setQrOpen(false)} aria-modal="true" role="dialog">
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            ref={modalRef}
            aria-label="QR modal"
          >
            <button className="modal-close" onClick={() => setQrOpen(false)} aria-label="Close">✕</button>

            <div className="modal-body">
              <div className="modal-qrwrap">
                <img src={qrSrc} alt="Large QR" className="modal-qr" />
                {logoSrc && <img src={logoSrc} alt="logo" className="modal-logo" />}
              </div>

              <div className="modal-actions">
                <button className="btn" onClick={handleCopy}>Copy link</button>
                <a className="btn" href={qrData} target="_blank" rel="noreferrer">Open</a>
                <button className="btn" onClick={handleDownload}>Download</button>
              </div>

              <div className="modal-tip">Tip: use your phone camera to scan the QR code</div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <Toast items={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );
}
