import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import BannerSlider from "../components/BannerSlider";
import "./MenPage.css";

const MenPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("All");

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products/category/men's clothing")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const categories = ["All", "T-Shirts", "Shirts", "Jeans", "Shoes", "Accessories"];

  const filteredProducts = filteredCategory === "All" 
    ? products 
    : products.filter(p => p.title.toLowerCase().includes(filteredCategory.toLowerCase()));

  return (
    <div className="men-page">
      <BannerSlider />
      <div className="hero">
        <h1>Men's Collection</h1>
        <p>Trendy, stylish and fun! Find your perfect look today.</p>
      </div>

      <div className="filters">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            className={filteredCategory === cat ? "active" : ""} 
            onClick={() => setFilteredCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default MenPage;
