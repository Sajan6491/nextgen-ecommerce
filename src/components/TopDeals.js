import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopDeals.css";

/**
 * TopDeals - modern Flipkart-like top deals row with wishlist + hover effects.
 * Clicking a card navigates to /plp (PLP will consume state or fetch products).
 *
 * Usage:
 *   <TopDeals />
 */

const initialDeals = [
  {
    id: 1,
    name: "Apple iPhone 15",
    price: 79999,
    image:"https://easyphones.co.in/cdn/shop/files/Apple_iPhone_15_Pro_Max_-_Refurbished_White.png?v=1755515090&width=416",
    rating: 4.8,
    discount: 15,
    inStock: true,
  },
  {
    id: 2,
    name: "Sony WH-1000XM5",
    price: 29990,
    image:
      "https://images-cdn.ubuy.co.in/652127b10b0a4502220f9985-sony-wh-1000xm5-headphones-wireless.jpg",
    rating: 4.6,
    discount: 20,
    inStock: true,
  },
  {
    id: 3,
    name: "Samsung Galaxy S23 Ultra",
    price: 109999,
    image:
      "https://telecomtalk.info/wp-content/uploads/2025/09/samsung-galaxy-s24-ultra-at-the-best.jpg",
    rating: 4.7,
    discount: 10,
    inStock: true,
  },
  {
    id: 4,
    name: "MacBook Air M2",
    price: 124990,
    image:
      "https://i.ytimg.com/vi/mRE932GHe4Q/maxresdefault.jpg",
    rating: 4.9,
    discount: 12,
    inStock: true,
  },
  {
    id: 5,
    name: "Canon DSLR",
    price: 38999,
    image:
      "https://admiringlight.com/blog/wp-content/uploads/30D_AL.jpg",
    rating: 4.4,
    discount: 30,
    inStock: true,
  },
  {
    id: 6,
    name: "JBL Flip 6",
    price: 8499,
    image:
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/84/7628391/1.jpg?2538",
    rating: 4.5,
    discount: 12,
    inStock: true,
  },
  {
    id: 7,
    name: "Nike Air Max",
    price: 7499,
    image:
      "https://images.unsplash.com/photo-1600180758890-6b94519a8ba0?w=1200&q=80&auto=format&fit=crop",
    rating: 4.3,
    discount: 25,
    inStock: true,
  },
  {
    id: 8,
    name: "OnePlus Buds Pro",
    price: 6999,
    image:
      "https://images.unsplash.com/photo-1627352400940-4b8c45f6c1d9?w=1200&q=80&auto=format&fit=crop",
    rating: 4.2,
    discount: 18,
    inStock: true,
  },
];

const TopDeals = ({ showCount = 6 }) => {
  const navigate = useNavigate();
  const [deals] = useState(initialDeals);
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    setWishlist((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleCardClick = (deal) => {
    // Navigate to PLP — pass state: selectedDeal (PLP can read location.state)
    navigate("/plp", { state: { selectedDeal: deal } });
  };

  return (
    <section className="td-section">
      <div className="td-header">
        <h2>Top Deals</h2>
        <button className="td-viewall" onClick={() => navigate("/plp")}>View All</button>
      </div>

      <div className="td-row">
        {deals.slice(0, showCount).map((d) => (
          <article
            key={d.id}
            className="td-card"
            role="button"
            onClick={() => handleCardClick(d)}
          >
            <div className="td-image-wrap">
              <img
                src={d.image}
                alt={d.name}
                onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=No+Image")}
              />
              {d.discount > 0 && <span className="td-badge">{d.discount}% OFF</span>}
              <button
                className={`td-wish ${wishlist.includes(d.id) ? "wish-active" : ""}`}
                onClick={(e) => toggleWishlist(d.id, e)}
                aria-label="wishlist"
              >
                ♥
              </button>
            </div>

            <div className="td-info">
              <h3 className="td-name">{d.name}</h3>
              <div className="td-meta">
                <span className="td-price">₹{d.price.toLocaleString()}</span>
                <span className="td-rating">⭐ {d.rating}</span>
              </div>
              <div className="td-cta">
                <button className="td-shop">Shop</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TopDeals;
