import React, { useEffect, useRef } from "react";
import "../pages/ShopPage.css";

export default function QuickView({ product, onClose, addToCart }) {
  const ref = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    const node = ref.current;
    const first = node && node.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    first && first.focus();
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev && prev.focus && prev.focus(); };
  }, [onClose]);

  if (!product) return null;
  return (
    <div className="quick-modal" role="dialog" aria-modal="true" aria-label={`Quick view ${product.title}`} onClick={onClose}>
      <div className="quick-card" ref={ref} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">✕</button>
        <div className="quick-grid">
          <img src={product.img} alt={product.title} className="quick-img" />
          <div className="quick-info">
            <h2>{product.title}</h2>
            <div className="brand">{product.brand} • {product.category}</div>

            <div className="price-box">
              <span className="price">₹{product.price.toLocaleString()}</span>
              {product.oldPrice && <span className="old">₹{product.oldPrice.toLocaleString()}</span>}
            </div>

            <p className="desc">High-quality product, premium materials, comfort guaranteed.</p>

            <div className="quick-actions">
              <button className="add-btn big" onClick={() => addToCart(product)}>Add to cart</button>
              <button className="quick-btn" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
