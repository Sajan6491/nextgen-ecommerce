import React from "react";
import ProductCard from "../components/ProductCard";
import accessoriesData from "../data/staticAccessories";
import "./AccessoriesPage.css";
import accessory1 from "../assets/accessory1.webp";


const AccessoriesPage = () => {
  return (
    <div className="accessories-page">
      <h1>Accessories</h1>
      <img src={accessory1} alt="Accessory 1" />

      <div className="products-grid">
        {accessoriesData.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default AccessoriesPage;
