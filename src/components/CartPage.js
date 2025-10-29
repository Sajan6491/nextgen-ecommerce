import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import ProductCard from "./ProductCard";
import "./CartPage.css";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, addToCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart
    .reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0)
    .toFixed(2);

  return (
    <div style={{ padding: 24 }}>
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {cart.map((p) => (
              <div key={p.id} style={{ position: 'relative', minWidth: 240 }}>
                <ProductCard product={p} />
                <div style={{ position: 'absolute', right: 6, top: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => removeFromCart(p.id)} aria-label={`decrease-${p.id}`}>-</button>
                  <span style={{ padding: '4px 8px', background: '#fff' }}>{p.quantity || 1}</span>
                  <button onClick={() => addToCart(p, 1)} aria-label={`increase-${p.id}`} style={{ padding: '6px 8px', borderRadius: 6 }}>+</button>
                  <button onClick={() => removeFromCart(p.id, true)} aria-label={`remove-${p.id}`}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <button onClick={() => navigate('/checkout')} style={{ padding: '8px 12px', background: '#0b74de', color: '#fff', border: 'none', borderRadius: 6 }}>Buy All / Checkout</button>
            <button onClick={() => clearCart()} style={{ marginLeft: 8, padding: '8px 12px', background: '#ddd', border: 'none', borderRadius: 6 }}>Clear Cart</button>
          </div>
          <div style={{ marginTop: 20 }}>
            <strong>Total: ${total}</strong>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
