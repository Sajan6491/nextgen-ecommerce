import React, { createContext, useState } from "react";

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Adds product; merges by id and increases quantity if already present
  const addToCart = (product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((p) => p.id === product.id);
      if (found) {
        // create new array with updated quantity
        return current.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 1) + quantity } : p
        );
      }
      return [...current, { ...product, quantity }];
    });
  };

  // Remove one unit or entire product if quantity <= 1
  const removeFromCart = (id, removeAll = false) => {
    setCart((current) => {
      const found = current.find((p) => p.id === id);
      if (!found) return current;
      if (removeAll || (found.quantity || 1) <= 1) {
        return current.filter((p) => p.id !== id);
      }
      return current.map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p));
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
