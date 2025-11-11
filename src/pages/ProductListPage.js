import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import "./ProductListPage.css";

/* Combined product dataset (electronics + furniture) - keep and expand as needed */
const allProducts = [
  { id: 1, name: "iPhone 15 Pro", brand: "Apple", category: "Mobile", price: 134999, discount: 10, rating: 4.8, available: true, image: "https://easyphones.co.in/cdn/shop/files/Apple_iPhone_15_Pro_Max_-_Refurbished_White.png?v=1755515090&width=416" },
  { id: 2, name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "Mobile", price: 129999, discount: 15, rating: 4.7, available: true, image: "https://telecomtalk.info/wp-content/uploads/2025/09/samsung-galaxy-s24-ultra-at-the-best.jpg" },
  { id: 3, name: "Sony WH-1000XM5", brand: "Sony", category: "Accessories", price: 29990, discount: 5, rating: 4.5, available: true, image: "https://images-cdn.ubuy.co.in/652127b10b0a4502220f9985-sony-wh-1000xm5-headphones-wireless.jpg" },

  { id: 7, name: "Mattress", brand: "Sleepwell", category: "Mattress", price: 2990, discount: 20, rating: 4.4, reversible: true, gstInvoice: true, verified: true, suitableFor: "Bedroom", available: true, image: "https://www.duroflexworld.com/cdn/shop/files/2_bb2c85e4-2660-4a27-b220-9c81e4f76149.jpg?v=1744560691" },
  { id: 8, name: "Sofa & Sectional", brand: "Urban Ladder", category: "Sofa", price: 7999, discount: 25, rating: 4.6, gstInvoice: true, verified: true, suitableFor: "Living Room", available: true, image: "https://images-cdn.ubuy.co.in/65a1843783da5257de4a7903-honbay-modern-linen-fabric-couch-l-shape.jpg" },
  { id: 9, name: "Office Study Chair", brand: "Green Soul", category: "Chair", price: 1890, discount: 10, rating: 4.3, gstInvoice: true, verified: true, suitableFor: "Office", available: false, image: "https://www.jiomart.com/images/product/original/494338153/classela-boom-black-mesh-mid-back-revolving-office-chair-with-head-rest-height-adjustment-and-tilt-mechanism-work-from-home-chair-diy-product-images-o494338153-p607352759-0-202412100709.jpg" },
  { id: 10, name: "Beds", brand: "Durfi", category: "Bed", price: 1790, discount: 0, rating: 3.9, available: true, image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTI28to4dm3UR81YRa1opz16YuveuEu5kLHnMuTIoou1j8ViKKXG4gOcHVb_2gp8-hTOT8oj1Sp10o4HJET1ZJZKv62n5Rn6FSRmOAmtnM" },
  { id: 11, name: "TV Unit", brand: "IKEA", category: "TV-Unit", price: 1249, discount: 5, rating: 4.1, available: true, image: "https://m.media-amazon.com/images/I/71H8B1O5nVL.jpg" },
  { id: 12, name: "Sofa Bed", brand: "Pepperfry", category: "SofaBed", price: 6099, discount: 12, rating: 4.0, available: true, image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT28DQ0i2nw4C-9PJBJv2xV-MkkS6a_fSlU35tCwATeIb7MX0gpyMQMvtd1EhF7xaYqgxuC1OQEx2mql6xjIfr_Ew7YUzvQ4UA-O5yy-5c" },
  { id: 13, name: "Sofa Set", brand: "HomeTown", category: "SofaSet", price: 21999, discount: 18, rating: 4.5, available: true, image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSPZ6hVaaGSOHnkn_Oibl9xjwUBWYUNnGYCpwYC9T2hOWj9jGxbOm_N73P0859PUUDrj9LxeKzSZG6belFM5n8MalZA59IvbPwjS11LYa0K" }
];

/* utils */
const unique = (arr, key) => [...new Set(arr.map(item => item[key] || item))];

export default function ProductListPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // UI + filter states
  const [priceRange, setPriceRange] = useState(150000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyReversible, setOnlyReversible] = useState(false);
  const [onlyGST, setOnlyGST] = useState(false);
  const [verified, setVerified] = useState(false);

  // pagination
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  // read query/state for deep links (from TopDeals / other pages)
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedIdParam = params.get("selectedId");
  const selectedIdFromState = location.state?.selectedDeal?.id;
  const selectedId = selectedIdParam || selectedIdFromState ? String(selectedIdParam || selectedIdFromState) : "";

  // catch category param from url (from slider etc.)
  useEffect(() => {
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat.charAt(0).toUpperCase() + cat.slice(1));
  }, [params]);

  // helpers
  const toggleBrand = (b) => setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  const clearSelectedId = () => {
    // remove selectedId from URL and state
    params.delete("selectedId");
    navigate({ pathname: "/plp", search: params.toString() }, { replace: true, state: {} });
    setPage(1);
  };

  // compute filtered list
  const baseFiltered = allProducts
    .filter(p => p.price <= priceRange)
    .filter(p => selectedBrands.length ? selectedBrands.includes(p.brand) : true)
    .filter(p => selectedCategory ? ((p.category + "").toLowerCase() === selectedCategory.toLowerCase()) : true)
    .filter(p => minRating ? p.rating >= minRating : true)
    .filter(p => onlyAvailable ? p.available === true : true)
    .filter(p => onlyReversible ? p.reversible === true : true)
    .filter(p => onlyGST ? p.gstInvoice === true : true)
    .filter(p => verified ? p.verified === true : true);

  // if selectedId is present, hard-filter to that product
  const filtered = selectedId
    ? baseFiltered.filter(p => String(p.id) === String(selectedId))
    : baseFiltered;

  // sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    if (sortOrder === "rating") return b.rating - a.rating;
    if (sortOrder === "newest") return b.id - a.id;
    return 0;
  });

  // pagination slice
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice(0, page * PAGE_SIZE);

  // breadcrumbs text
  const breadcrumbs = ["Home", "Furniture"].concat(selectedCategory ? [selectedCategory] : []);

  // (optional) click card → PDP
  const openPDP = (id, e) => {
    e?.preventDefault?.();
    // Only if you have a PDP route:
    navigate(`/product/${id}`);
  };

  return (
    <div className="plp-wrap">
      <div className="plp-inner">
        {/* Sidebar */}
        <aside className="plp-sidebar">
          <div className="filters-title">Filters</div>

          <details open className="filter-block">
            <summary>CATEGORIES</summary>
            <div className="filter-content">
              <button
                className={`cat-btn ${selectedCategory === "" ? "active" : ""}`}
                onClick={() => { setSelectedCategory(""); setPage(1); }}
              >
                All Categories
              </button>
              {unique(allProducts, "category").map(cat => (
                <button
                  key={cat}
                  className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </details>

          <details className="filter-block">
            <summary>PRICE</summary>
            <div className="filter-content">
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
              />
              <div className="price-row">
                <span>Up to ₹{priceRange.toLocaleString()}</span>
                <button className="reset" onClick={() => { setPriceRange(150000); setPage(1); }}>Reset</button>
              </div>
            </div>
          </details>

          <details className="filter-block">
            <summary>BRAND</summary>
            <div className="filter-content">
              {unique(allProducts, "brand").map(br => (
                <label key={br} className="checkbox">
                  <input type="checkbox" checked={selectedBrands.includes(br)} onChange={() => { toggleBrand(br); setPage(1); }} />
                  <span>{br}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="filter-block">
            <summary>AVAILABILITY & FEATURES</summary>
            <div className="filter-content">
              <label className="checkbox">
                <input type="checkbox" checked={onlyAvailable} onChange={() => { setOnlyAvailable(!onlyAvailable); setPage(1); }} />
                <span>In Stock</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={onlyReversible} onChange={() => { setOnlyReversible(!onlyReversible); setPage(1); }} />
                <span>Reversible Mattress</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={onlyGST} onChange={() => { setOnlyGST(!onlyGST); setPage(1); }} />
                <span>GST Invoice Available</span>
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={verified} onChange={() => { setVerified(!verified); setPage(1); }} />
                <span>Quality Verified Furniture</span>
              </label>
            </div>
          </details>

          <details className="filter-block">
            <summary>CUSTOMER RATINGS</summary>
            <div className="filter-content">
              {[5, 4, 3].map(r => (
                <label key={r} className="checkbox">
                  <input type="radio" name="rating" checked={minRating === r} onChange={() => { setMinRating(r); setPage(1); }} />
                  <span>{r}★ & above</span>
                </label>
              ))}
              <label className="checkbox">
                <input type="radio" name="rating" checked={minRating === 0} onChange={() => { setMinRating(0); setPage(1); }} />
                <span>All Ratings</span>
              </label>
            </div>
          </details>

          <div style={{ height: 30 }}></div>
        </aside>

        {/* Main content */}
        <main className="plp-main">
          {/* Breadcrumb + sort bar */}
          <div className="plp-topbar">
            <div className="breadcrumbs">
              {breadcrumbs.map((b, i) => (
                <span key={i} className={i === breadcrumbs.length - 1 ? "crumb active" : "crumb"}>
                  {b}{i < breadcrumbs.length - 1 && " › "}
                </span>
              ))}
            </div>

            <div className="sortbar">
              {selectedId && (
                <button className="reset" onClick={clearSelectedId} title="Show all products">
                  Clear filter
                </button>
              )}
              <label>Sort:</label>
              <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }}>
                <option value="">Relevance</option>
                <option value="rating">Rating</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
              <div className="results-count">{sorted.length} results</div>
            </div>
          </div>

          {/* product grid */}
          <div className="product-grid">
            {paged.length ? paged.map(p => (
              <article key={p.id} className="product-card" onClick={(e) => openPDP(p.id, e)} role="button">
                <div className="card-media">
                  <img
                    src={p.image}
                    alt={p.name}
                    onError={(e) => e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image"}
                  />
                  {p.discount > 0 && <div className="badge">{p.discount}% OFF</div>}
                  {!p.available && <div className="oos">Out of stock</div>}
                </div>
                <div className="card-body">
                  <h3 className="title">{p.name}</h3>
                  <div className="meta">
                    <span className="brand">{p.brand}</span>
                    <span className="rating"><FaStar /> {p.rating}</span>
                  </div>
                  <div className="price-row">
                    <span className="price">₹{p.price.toLocaleString()}</span>
                    {p.discount > 0 && <span className="mrp">₹{Math.round(p.price / (1 - p.discount / 100)).toLocaleString()}</span>}
                  </div>
                  <div className="card-actions">
                    <button className="btn primary" onClick={(e) => { e.stopPropagation(); openPDP(p.id, e); }}>Buy Now</button>
                    <button className="btn" onClick={(e) => e.stopPropagation()}>Wishlist</button>
                  </div>
                </div>
              </article>
            )) : (
              <div className="no-results">No products found</div>
            )}
          </div>

          {/* pagination / load more */}
          <div className="plp-pagination">
            {page * PAGE_SIZE < sorted.length ? (
              <button className="load-more" onClick={() => setPage(prev => prev + 1)}>Load more</button>
            ) : (
              <div className="end">Showing {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} products</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
