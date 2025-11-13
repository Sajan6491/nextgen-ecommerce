import React, { useState, useMemo, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import PRODUCTS from "../data/products";
import ProductCard from "../components/ProductCard";
import QuickView from "../components/QuickView";
import Pagination from "../components/Pagination";
import "./ShopPage.css";

export default function ShopPage() {
  const { addToCart } = React.useContext(CartContext);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");
  const [view, setView] = useState("masonry"); 
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wj_wishlist") || "{}"); } catch { return {}; }
  });
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => ["All", ...new Set(PRODUCTS.map((p) => p.category))], []);

  useEffect(() => {
    localStorage.setItem("wj_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 140);
    return () => clearTimeout(t);
  }, [query, category, sort, itemsPerPage, view]);

  const filtered = useMemo(() => {
    let list = PRODUCTS.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        (p.title + p.brand + p.category).toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => setPage(1), [query, category, sort, itemsPerPage]);

  const toggleWish = (id) =>
    setWishlist((s) => {
      const c = { ...s };
      if (c[id]) delete c[id];
      else c[id] = true;
      return c;
    });

  return (
    <div className="shop-container upgraded">

      {/* ----- HERO replaced header → div ----- */}
      <div className="shop-hero">
        <div>
          <h1>Premium Store</h1>
          <p>Clean, fast and focused shopping UI.</p>
        </div>

        <div className="controls-row">
          <input
            className="shop-search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="none">Sort</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
            <option value="rating">Rating</option>
          </select>

          <div className="view-buttons">
            <button className={view === "masonry" ? "active" : ""} onClick={() => setView("masonry")}>
              Mosaic
            </button>
            <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>
              Grid
            </button>
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
              List
            </button>
          </div>

          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
            <option value={6}>6 / page</option>
            <option value={9}>9 / page</option>
            <option value={12}>12 / page</option>
          </select>
        </div>
      </div>
      {/* ----- end of changed div ----- */}

      {loading ? (
        <div className="skeleton-grid">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={i} className="skeleton-item" />
          ))}
        </div>
      ) : (
        <main className={`product-list ${view}`}>
          {pageItems.map((p, idx) => (
            <ProductCard
              key={p.id}
              product={p}
              idx={idx}
              view={view}
              wishlist={wishlist}
              toggleWish={toggleWish}
              onQuick={() => setQuick(p)}
              addToCart={(prod, qty) => addToCart(prod, qty)}
            />
          ))}
        </main>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {quick && (
        <QuickView
          product={quick}
          onClose={() => setQuick(null)}
          addToCart={(p) => {
            addToCart(p, 1);
            setQuick(null);
          }}
        />
      )}
    </div>
  );
}
