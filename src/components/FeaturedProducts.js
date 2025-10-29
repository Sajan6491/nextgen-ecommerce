import React, { useState } from "react";
import ProductCard from "./ProductCard";
import Categories from "./Categories";
import productsData from "../data/products";

const FeaturedProducts = () => {
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(productsData.map(p => p.category))];
  const filteredProducts = category === "All" ? productsData : productsData.filter(p => p.category === category);

  return (
    <section style={{ padding: "50px 20px", background: "#f9f9f9", textAlign: "center" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>🌟 Featured Products</h2>
      <Categories categories={categories} selected={category} onSelect={setCategory} />
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "30px" }}>
        {filteredProducts.map(prod => <ProductCard key={prod.id} product={prod} />)}
      </div>
    </section> 
  );
};

export default FeaturedProducts;
