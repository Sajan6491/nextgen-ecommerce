import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./ShopYourFavorites.css";
import { CartContext } from "../context/CartContext";

const productsData = [
  {
    id: 1,
    title: "Wireless Earbuds",
    price: 2499,
    image:
      "https://images.pexels.com/photos/3769740/pexels-photo-3769740.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 2,
    title: "Smart Watch",
    price: 4999,
    image:
      "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 3,
    title: "Bluetooth Speaker",
    price: 1899,
    image:
      "https://images.pexels.com/photos/63703/pexels-photo-63703.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 4,
    title: "Leather Wallet",
    price: 899,
    image:
      "https://images.pexels.com/photos/139205/pexels-photo-139205.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 5,
    title: "Sneakers",
    price: 3299,
    image:
      "https://images.pexels.com/photos/19090/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 6,
    title: "Classic Sunglasses",
    price: 1499,
    image:
      "https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

export default function ShopYourFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const { addToCart } = useContext(CartContext);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    );
  };

  const visibleProducts = showAll ? productsData : productsData.slice(0, 4);

  return (
    <section className="fav2025-section">
      <div className="fav2025-header">
        <h2>Shop Your Favorites</h2>
        <p>Curated premium picks loved by our customers</p>
      </div>

      <div className="fav2025-grid">
        {visibleProducts.map((product) => (
          <div key={product.id} className="fav2025-card">

            <Link to={`/product/${product.id}`} className="fav2025-link">
              <div className="fav2025-imgBox">
                <img src={product.image} alt={product.title} />

                <button
                  className={`fav2025-heart ${favorites.includes(product.id) ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  ❤
                </button>
              </div>

              <div className="fav2025-info">
                <h3>{product.title}</h3>
                <p className="fav2025-price">₹{product.price}</p>
              </div>
            </Link>

            <button
              className="fav2025-add"
              onClick={() => addToCart(product)}
            >
              🛒 Add to Cart
            </button>

          </div>
        ))}
      </div>

      <div className="fav2025-more">
        <button
          className="fav2025-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : "See All Favorites"}
        </button>
      </div>
    </section>
  );
}
