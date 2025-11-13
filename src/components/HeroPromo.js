import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroPromo.css";

export default function HeroPromo({
  headline = "Smart Shopping\nTrusted by Millions",
  sub = "Upto 35% OFF on 1st app order",
  ctaText = "Shop Now",
  qrData = "https://example.com/app",
  onCTAClick = null,
}) {
  const navigate = useNavigate();
  const [qrOpen, setQrOpen] = useState(false);

  // *** STATIC FAKE QR IMAGE ***
  const qrSrc =
    "https://media.istockphoto.com/id/1347277582/vector/qr-code-sample-for-smartphone-scanning-on-white-background.jpg?s=612x612&w=0&k=20&c=6e6Xqb1Wne79bJsWpyyNuWfkrUgNhXR4_UYj3i_poc0=";

  const handleCTA = () => {
    if (typeof onCTAClick === "function") {
      try {
        onCTAClick();
      } catch {}
    } else {
      navigate("/shop");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      alert("Link copied to clipboard");
    } catch {
      alert("Copy failed");
    }
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "qr-code.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <section className="hp-hero pro">
      <div className="hp-inner pro">
        {/* LEFT ARTWORK */}
        <div className="hp-left pro" aria-hidden>
          <div className="hp-artwork pro">
            <div className="hp-arc pro" />
            <img
              src="/images/person-left.png"
              alt=""
              className="hp-person left pro"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
            <img
              src="/images/person-right.png"
              alt=""
              className="hp-person right pro"
              onError={(e) => (e.currentTarget.style.opacity = 0)}
            />
          </div>
        </div>

        {/* CENTER QR */}
        <div className="hp-qr pro">
          <div
            className="hp-qr-card pro"
            role="button"
            tabIndex={0}
            onClick={() => setQrOpen(true)}
          >
            <div className="hp-badge pro">{sub}</div>

            <div className="hp-qr-frame pro">
              <img src={qrSrc} alt="QR code" className="hp-qr-img pro" />
            </div>

            <div className="hp-qr-hint pro">Scan to open • Tap to enlarge</div>
          </div>
        </div>

        {/* RIGHT TEXT */}
        <div className="hp-right pro">
          <div className="hp-copy pro">
            {headline.split("\n").map((line, i) => (
              <h1 className="hp-title pro" key={i}>
                {line}
              </h1>
            ))}

            <p className="hp-desc pro">
              Curated deals, lightning-fast checkout and exclusive app-only
              offers — everything in one place.
            </p>

            <div className="hp-actions pro">
              <button className="hp-cta pro" onClick={handleCTA}>
                {ctaText}
              </button>

              <button className="hp-ghost pro" onClick={() => setQrOpen(true)}>
                Get app
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {qrOpen && (
        <div className="hp-modal pro" onClick={() => setQrOpen(false)}>
          <div className="hp-modal-card pro" onClick={(e) => e.stopPropagation()}>
            <button
              className="hp-modal-close pro"
              onClick={() => setQrOpen(false)}
            >
              ✕
            </button>

            <div className="hp-modal-body pro">
              <div className="hp-modal-qrwrap pro">
                <img src={qrSrc} alt="QR-large" className="hp-modal-qr pro" />
              </div>

              <div className="hp-modal-actions pro">
                <button className="btn pro" onClick={copyLink}>
                  Copy link
                </button>
                <a className="btn pro" href={qrData} target="_blank">
                  Open
                </a>
                <button className="btn pro" onClick={downloadQR}>
                  Download
                </button>
              </div>

              <div className="hp-modal-foot pro">
                <div className="hint pro">Tip: Use your phone camera to scan.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
