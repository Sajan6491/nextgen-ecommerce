import React, { useState } from "react";
import "./ProductListPage.css";

const allProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "Mobile",
    price: 134999,
    image: "https://easyphones.co.in/cdn/shop/files/Apple_iPhone_15_Pro_Max_-_Refurbished_White.png?v=1755515090&width=416",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Mobile",
    price: 129999,
    image: "https://telecomtalk.info/wp-content/uploads/2025/09/samsung-galaxy-s24-ultra-at-the-best.jpg",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5 Headphones",
    brand: "Sony",
    category: "Accessories",
    price: 29990,
    image: "https://images-cdn.ubuy.co.in/652127b10b0a4502220f9985-sony-wh-1000xm5-headphones-wireless.jpg",
  },
  {
    id: 4,
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "Accessories",
    price: 44999,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYewdifCOVYm-NIEHZFd3dEJjfvCTcTk7AAQ&s",
  },
  {
    id: 5,
    name: "MacBook Air M2",
    brand: "Apple",
    category: "Laptop",
    price: 124900,
    image: "https://i.ytimg.com/vi/mRE932GHe4Q/maxresdefault.jpg",
  },
  {
    id: 6,
    name: "JBL Flip 6 Speaker",
    brand: "JBL",
    category: "Accessories",
    price: 8499,
    image: "https://m.media-amazon.com/images/I/61CqYq+xwNL._SL1500_.jpg",
  },
];

const ProductListPage = () => {
  const [priceRange, setPriceRange] = useState(150000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Filter Logic
  const filteredProducts = allProducts
    .filter((p) => p.price <= priceRange)
    .filter((p) =>
      selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true
    )
    .filter((p) =>
      selectedCategory ? p.category === selectedCategory : true
    )
    .sort((a, b) => {
      if (sortOrder === "lowToHigh") return a.price - b.price;
      if (sortOrder === "highToLow") return b.price - a.price;
      return 0;
    });

  return (
    <div className="plp-container">
      {/* Sidebar */}
      <aside className="plp-sidebar">
        <h3>Filters</h3>

        <div className="filter-section">
          <h4>Price Range</h4>
          <input
            type="range"
            min="0"
            max="150000"
            step="1000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
          />
          <p>Up to ₹{priceRange.toLocaleString()}</p>
        </div>

        <div className="filter-section">
          <h4>Brand</h4>
          {["Apple", "Samsung", "Sony", "JBL"].map((brand) => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
              {brand}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>Category</h4>
          {["Mobile", "Laptop", "Accessories"].map((cat) => (
            <label key={cat}>
              <input
                type="checkbox"
                checked={selectedCategory === cat}
                onChange={() => handleCategoryChange(cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        <div className="filter-section">
          <h4>Sort By</h4>
          <select onChange={handleSortChange} value={sortOrder}>
            <option value="">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="plp-products">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="plp-card">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/200x200?text=No+Image")
                }
              />
              <h3>{product.name}</h3>
              <p className="brand">{product.brand}</p>
              <p className="price">₹{product.price.toLocaleString()}</p>
              <button className="add-btn">Add to Cart</button>
            </div>
          ))
        ) : (
          <p className="no-results">No products found.</p>
        )}
      </main>
    </div>
  );
};

export default ProductListPage;
