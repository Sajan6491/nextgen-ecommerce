import React, { useState, useContext } from "react";
import "./SurpriseButton.css";
import { CartContext } from "../context/CartContext";

const SurpriseButton = () => {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);

  const openRandom = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      const pick = data[Math.floor(Math.random() * data.length)];
      setProduct(pick);
      setOpen(true);
    } catch (e) {
      console.error(e);
      alert("Couldn't fetch a surprise — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="surprise-fab" onClick={openRandom} aria-label="Surprise me">
        🎲 Surprise Me
      </button>

      {open && product && (
        <div className="surprise-overlay" onClick={() => setOpen(false)}>
          <div className="surprise-modal" onClick={(e) => e.stopPropagation()}>
            <button className="surprise-close" onClick={() => setOpen(false)}>✖</button>
            <div className="surprise-left">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="surprise-right">
              <h2>{product.title}</h2>
              <p className="surprise-price">${product.price}</p>
              <p className="surprise-desc">{product.description?.slice(0, 220)}</p>
              <div className="surprise-actions">
                <button className="btn primary" onClick={() => { addToCart(product); setOpen(false); alert(`${product.title} added to cart`); }}>Add to Cart</button>
                <button className="btn" onClick={() => setOpen(false)}>Maybe Later</button>
              </div>
            </div>
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => <span key={i} className={`c${i % 6}`} />)}
            </div>
          </div>
        </div>
      )}
      {loading && <div className="surprise-loading">Looking for a surprise...</div>}
    </>
  );
};

export default SurpriseButton;
