// src/components/ProductCard.js
import React, { useState, useContext, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css"; // <-- external CSS

const ProductCard = ({ product, onClick }) => {
  const [open, setOpen] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // wishlist persisted in localStorage (simple per-product toggle)
  const [wish, setWish] = useState(false);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("wj_wishlist") || "{}");
      setWish(!!data[product.id]);
    } catch {
      setWish(false);
    }
  }, [product.id]);

  const toggleWish = (e) => {
    e.stopPropagation();
    try {
      const raw = JSON.parse(localStorage.getItem("wj_wishlist") || "{}");
      if (raw[product.id]) {
        delete raw[product.id];
        setWish(false);
      } else {
        raw[product.id] = true;
        setWish(true);
      }
      localStorage.setItem("wj_wishlist", JSON.stringify(raw));
    } catch {
      setWish((s) => !s);
    }
  };

  // support both product.image and product.img
  const imgSrc = product.image || product.img || product.imageUrl || "";

  // format price for INR if numeric
  const formatPrice = (val) => {
    if (typeof val === "number") {
      return val.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    }
    return val ? `${val}` : "—";
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    // small confirmation
    alert(`${product.title} added to cart`);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setOpen(false);
    navigate("/checkout", { state: { singleItem: { ...product, quantity: 1 } } });
  };

  // accessibility: close modal on Escape and return focus
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const first = modalRef.current && modalRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    first && first.focus();
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      try { prev && prev.focus && prev.focus(); } catch {}
    };
  }, [open]);

  return (
    <>
      <motion.div
        className={`pc-card`}
        ref={triggerRef}
        whileHover={{ scale: 1.04, boxShadow: "0px 12px 20px rgba(0,0,0,0.16)" }}
        onClick={onClick}
        role="button"
        aria-label={`Open product ${product.title}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onClick && onClick(); }}
      >
        <div className="pc-image-wrap">
          {imgSrc ? (
            <img className="pc-image" src={imgSrc} alt={product.title} />
          ) : (
            <div className="pc-image-placeholder">No image</div>
          )}

          {product.badge && <span className="pc-badge">{product.badge}</span>}

          <button
            className="pc-quickbtn"
            aria-label="Open quick view"
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            title="Quick view"
          >
            Quick View
          </button>

          <button
            className="pc-wish"
            aria-pressed={wish}
            aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
            onClick={toggleWish}
            title={wish ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wish ? "💖" : "🤍"}
          </button>
        </div>

        <div className="pc-body">
          <h3 className="pc-title">{product.title}</h3>
          {product.brand && <div className="pc-brand">{product.brand}</div>}

          <div className="pc-price-row">
            <div className="pc-price">{formatPrice(product.price)}</div>
            {product.oldPrice && <div className="pc-old">{formatPrice(product.oldPrice)}</div>}
          </div>

          <div className="pc-meta">
            <div className="pc-stars" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(product.rating || 0) ? 'on' : ''}>★</span>
              ))}
            </div>
            {product.reviews ? <div className="pc-reviews">({product.reviews})</div> : null}
          </div>

          <div className="pc-actions">
            <button
              onClick={handleAdd}
              className="pc-add"
              disabled={product.inStock === false}
              aria-disabled={product.inStock === false}
            >
              Add
            </button>

            <button onClick={handleBuyNow} className="pc-buy">
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>

      {open && (
        <div
          className="pc-quick-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view of ${product.title}`}
          onClick={() => setOpen(false)}
        >
          <div className="pc-quick-card" ref={modalRef} onClick={(e) => e.stopPropagation()}>
            <button className="pc-quick-close" onClick={() => setOpen(false)} aria-label="Close">✖</button>

            <div className="pc-quick-left">
              {imgSrc ? (
                <img className="pc-quick-image" src={imgSrc} alt={product.title} />
              ) : (
                <div className="pc-image-placeholder">No image</div>
              )}
            </div>

            <div className="pc-quick-right">
              <h3 className="pc-quick-title">{product.title}</h3>
              {product.brand && <div className="pc-brand muted">{product.brand} • {product.category}</div>}
              <p className="pc-desc">{product.description ? product.description.slice(0, 300) : 'No description available.'}</p>

              <div className="pc-price-row" style={{ marginTop: 8 }}>
                <div className="pc-price">{formatPrice(product.price)}</div>
                {product.oldPrice && <div className="pc-old">{formatPrice(product.oldPrice)}</div>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="pc-add big" onClick={() => { addToCart(product, 1); alert(`${product.title} added to cart`); }}>
                  Add to Cart
                </button>

                <button className="pc-buy big" onClick={() => { addToCart(product, 1); setOpen(false); navigate('/checkout', { state: { singleItem: { ...product, quantity: 1 } } }); }}>
                  Buy Now
                </button>

                <button className="pc-close-btn" onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
