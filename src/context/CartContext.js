import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  /* ----------------------------------------------------
     LOAD CART FROM LOCAL STORAGE
  -----------------------------------------------------*/
  useEffect(() => {
    try {
      const saved = localStorage.getItem("myshop_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.log("Failed loading cart:", e);
    }
  }, []);

  /* ----------------------------------------------------
     SAVE CART TO LOCAL STORAGE
  -----------------------------------------------------*/
  useEffect(() => {
    try {
      localStorage.setItem("myshop_cart", JSON.stringify(cart));
    } catch (e) {
      console.log("Failed saving cart:", e);
    }
  }, [cart]);

  /* ----------------------------------------------------
     GLOBAL EVENT LISTENER FOR ADD-TO-CART
     (You can trigger: window.dispatchEvent(new CustomEvent("add-to-cart"))
  -----------------------------------------------------*/
  useEffect(() => {
    const handler = (e) => {
      const { product, quantity = 1 } = e.detail || {};
      if (product) addToCart(product, quantity);
    };
    window.addEventListener("add-to-cart", handler);
    return () => window.removeEventListener("add-to-cart", handler);
  }, []);


  /* ----------------------------------------------------
     ADD TO CART FUNCTION
  -----------------------------------------------------*/
  const addToCart = (product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((p) => p.id === product.id);

      if (found) {
        return current.map((p) =>
          p.id === product.id
            ? { ...p, quantity: (p.quantity || 1) + quantity }
            : p
        );
      }

      return [...current, { ...product, quantity }];
    });
  };

  /* ----------------------------------------------------
     REMOVE FROM CART FUNCTION
  -----------------------------------------------------*/
  const removeFromCart = (id, removeAll = false) => {
    setCart((current) => {
      const found = current.find((p) => p.id === id);
      if (!found) return current;

      if (removeAll || (found.quantity || 1) <= 1) {
        return current.filter((p) => p.id !== id);
      }

      return current.map((p) =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p
      );
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
