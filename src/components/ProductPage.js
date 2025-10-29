// ProductPage.js
import React, { useState } from "react";
import ProductDetail from "../components/ProductDetail";

const ProductPage = () => {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    console.log("Added to cart:", product);
  };

  const dummyProduct = {
    id: 1,
    title: "Mens Cotton Jacket",
    price: 55.99
  };

  return (
    <div>
      <ProductDetail product={dummyProduct} addToCart={handleAddToCart} />
    </div>
  );
};

export default ProductPage;
