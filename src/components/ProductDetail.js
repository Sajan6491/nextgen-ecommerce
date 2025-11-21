// src/components/ProductDetail.jsx
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "../context/CartContext";
import PRODUCTS from "../data/products";
import "./ProductDetail.css";

/* Local storage keys */
const RV_KEY = "recently_viewed_v1";
const REVIEWS_KEY = "product_reviews_v1";
const WISH_KEY = "wishlist_v1";

/* Helpers for localStorage */
function addRecentlyViewed(product) {
  try {
    if (!product || product.id == null) return;
    const raw = localStorage.getItem(RV_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const cleaned = list.filter((p) => String(p.id) !== String(product.id));
    cleaned.unshift({
      id: product.id,
      title: product.title,
      image: product.image || product.img || "",
      price: product.price,
    });
    localStorage.setItem(RV_KEY, JSON.stringify(cleaned.slice(0, 24)));
  } catch (e) {
    console.error(e);
  }
}
function readRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function readReviews(productId) {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY) || "{}";
    const all = JSON.parse(raw);
    return all[String(productId)] || [];
  } catch {
    return [];
  }
}
function saveReview(productId, review) {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY) || "{}";
    const all = JSON.parse(raw);
    all[String(productId)] = all[String(productId)] || [];
    all[String(productId)].unshift(review);
    all[String(productId)] = all[String(productId)].slice(0, 200);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
}
function readWishlist() {
  try {
    const raw = localStorage.getItem(WISH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveWishlist(list) {
  try {
    localStorage.setItem(WISH_KEY, JSON.stringify(list));
  } catch {}
}

/* Simple coupons for demo */
const COUPONS = {
  SAVE10: { type: "percent", amount: 10 },
  FLAT200: { type: "fixed", amount: 200 },
};

export default function ProductDetail() {
  const { addToCart } = useContext(CartContext);
  const { id: rawId } = useParams();

  // product/loading state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const colors = ["#000000", "#ff0000", "#1e90ff", "#008000"];
  const sizes = ["S", "M", "L", "XL"];
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(null);
  const [thumbs, setThumbs] = useState([]);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" });
  const [reviewPageSize, setReviewPageSize] = useState(5);
  const nameInputRef = useRef(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // wishlist + toast + flags
  const [wishlist, setWishlist] = useState(() => readWishlist());
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [showSticky, setShowSticky] = useState(false);

  // coupon + size chart + delivery
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  // derive productId as numeric or original
  const productId = useMemo(() => {
    if (!rawId) return null;
    const match = String(rawId).match(/(\d+)$/);
    return match ? match[1] : rawId;
  }, [rawId]);

  // hooks that must always run (safe useMemo)
  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return { counts, total: 0, pct: (star) => 0 };
    }
    reviews.forEach((r) => {
      const s = Number(r.rating) || 5;
      counts[s] = (counts[s] || 0) + 1;
    });
    const total = reviews.length;
    return {
      counts,
      total,
      pct: (star) => Math.round(((counts[star] || 0) / Math.max(1, total)) * 100),
    };
  }, [reviews]);

  // load product (local PRODUCTS preferred, fallback to fakestore)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (productId) {
          const local = PRODUCTS.find((p) => String(p.id) === String(productId));
          if (local && mounted) {
            setProduct(local);
            setThumbs(normalizeImages(local));
            setMainImg(local.image || local.img || (local.images?.[0] ?? null));
            addRecentlyViewed(local);
            setReviews(readReviews(productId));
            setLoading(false);
            return;
          }
        }
        if (productId && /^\d+$/.test(String(productId))) {
          const res = await axios.get(`https://fakestoreapi.com/products/${productId}`);
          if (mounted && res && res.data) {
            setProduct(res.data);
            setThumbs(normalizeImages(res.data));
            setMainImg(res.data.image || res.data.img || null);
            addRecentlyViewed(res.data);
            setReviews(readReviews(productId));
            setLoading(false);
            return;
          }
        }
        if (mounted) {
          setError("Product not found");
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        const local = PRODUCTS.find((p) => String(p.id) === String(productId));
        if (local && mounted) {
          setProduct(local);
          setThumbs(normalizeImages(local));
          setMainImg(local.image || local.img || null);
          addRecentlyViewed(local);
          setReviews(readReviews(productId));
          setLoading(false);
          return;
        }
        if (mounted) {
          setError("Failed to load product");
          setLoading(false);
        }
      }
    })();
    return () => (mounted = false);
  }, [productId]);

  // reset selection when product changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setQty(1);
    setReviewForm({ name: "", rating: 5, text: "" });
  }, [productId]);

  // sticky CTA logic
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setShowSticky(y > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // keyboard shortcuts (a = add, z = zoom)
  useEffect(() => {
    const onKey = (e) => {
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (activeTag && ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;
      if (e.key === "a") handleAddToCart();
      if (e.key === "z") setZoomOpen((s) => !s);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor, selectedSize, qty, product, adding]);

  function normalizeImages(prod) {
    if (!prod) return [];
    if (prod.images && Array.isArray(prod.images) && prod.images.length) return prod.images;
    const base = prod.image || prod.img || null;
    if (!base) return [];
    return [base, base + "?v=1", base + "?v=2"];
  }

  function showToast(text, type = "ok", ms = 2000) {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), ms);
  }

  // wishlist toggle
  const toggleWishlist = () => {
    const cur = readWishlist();
    const exists = cur.find((i) => String(i.id) === String(product.id));
    let next;
    if (exists) {
      next = cur.filter((i) => String(i.id) !== String(product.id));
      showToast("Removed from wishlist", "warn");
    } else {
      next = [{ id: product.id, title: product.title, image: product.image || product.img }, ...cur];
      showToast("Added to wishlist", "ok");
    }
    saveWishlist(next);
    setWishlist(next);
  };

  // compute price with coupon
  const basePrice = Number(product?.price || 0);
  const discountedPrice = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.max(0, Math.round(basePrice * (1 - appliedCoupon.amount / 100)))
      : Math.max(0, basePrice - appliedCoupon.amount)
    : basePrice;

  const handleAddToCart = async () => {
    if (adding) return;
    if (!selectedColor || !selectedSize) {
      showToast("Select color & size", "warn");
      return;
    }
    setAdding(true);
    try {
      const cartItem = {
        id: product.id,
        title: product.title,
        price: discountedPrice,
        color: selectedColor,
        size: selectedSize,
        image: product.image || product.img,
        quantity: qty,
      };
      try {
        addToCart(cartItem, qty);
      } catch {
        addToCart(cartItem);
      }
      if (window.dataLayer) window.dataLayer.push({ event: "add_to_cart", productId: product.id, price: discountedPrice, qty });
      showToast(`Added ${qty} × ${product.title}`, "ok");
    } catch (e) {
      console.error(e);
      showToast("Could not add to cart", "warn");
    } finally {
      setTimeout(() => setAdding(false), 900);
    }
  };

  // copy/ share
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied", "ok");
    } catch {
      showToast("Unable to copy", "warn");
    }
  };
  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(product.title + " " + window.location.href)}`, "_blank");
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text: product.description, url: window.location.href });
      } catch {}
    } else copyLink();
  };

  // REVIEW: prevent duplicates & double-submit
  const submitReview = (e) => {
    e.preventDefault();
    if (submittingReview) return;
    const name = (reviewForm.name || "").trim();
    const text = (reviewForm.text || "").trim();
    const rating = Number(reviewForm.rating) || 5;
    if (!name || !text) {
      showToast("Name & review required", "warn");
      return;
    }

    // duplicate check
    if (reviews.find((r) => r.name === name && r.text === text)) {
      showToast("Duplicate review detected", "warn");
      return;
    }

    setSubmittingReview(true);
    const r = { id: Date.now(), name, rating, text, date: new Date().toISOString() };
    setReviews((prev) => [r, ...prev]);
    saveReview(productId, r);
    setReviewForm({ name: "", rating: 5, text: "" });
    setTimeout(() => {
      setSubmittingReview(false);
      nameInputRef.current && nameInputRef.current.focus();
      showToast("Thanks for your review", "ok");
    }, 700);
    if (window.dataLayer) window.dataLayer.push({ event: "submit_review", productId, rating });
  };

  // reset review form (works now)
  const resetReviewForm = () => {
    setReviewForm({ name: "", rating: 5, text: "" });
    nameInputRef.current && nameInputRef.current.focus();
  };

  // zoom keyboard
  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowLeft") setZoomIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setZoomIndex((i) => Math.min(thumbs.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, thumbs.length]);

  const displayedReviews = reviews.slice(0, reviewPageSize);

  if (loading) return <div className="pd-loading">Loading...</div>;
  if (error) return <div className="pd-loading">{error}</div>;
  if (!product) return <div className="pd-loading">Product not found.</div>;

  const inStock = product.stock === undefined ? true : Boolean(product.stock > 0);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) : null;
  const related = PRODUCTS.filter((p) => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 8);
  const recent = readRecentlyViewed().filter((r) => String(r.id) !== String(product.id)).slice(0, 8);

  return (
    <div className="pd-page">
      <div className="pd-container">
        <div className="pd-image-col">
          <div className="pd-breadcrumbs">
            <Link to="/">Home</Link> › <Link to={`/shop?cat=${encodeURIComponent(product.category || "")}`}>{product.category || "Products"}</Link> › <span>{product.title}</span>
          </div>

          <div className="pd-main-image-wrap">
            <img
              className="pd-main-image"
              src={mainImg || product.image || product.img}
              alt={product.title}
              loading="lazy"
              onClick={() => {
                setZoomIndex(thumbs.indexOf(mainImg || product.image || product.img) || 0);
                setZoomOpen(true);
              }}
              onError={(e) => {
                e.target.src = product.image || product.img || "";
              }}
            />
          </div>

          <div className="pd-thumbs">{thumbs.map((t, i) => <img key={i} className={`pd-thumb ${t === mainImg ? "active" : ""}`} loading="lazy" src={t} alt={`thumb-${i}`} onClick={() => setMainImg(t)} />)}</div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={nativeShare} className="pd-btn">Share</button>
            <button onClick={copyLink} className="pd-btn">Copy link</button>
            <button onClick={shareWhatsApp} className="pd-btn">WhatsApp</button>
          </div>
        </div>

        <div className="pd-info-col">
          <h1 className="pd-title">{product.title}</h1>

          {/* Price with coupon support */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="pd-price">
              <span style={{ textDecoration: appliedCoupon ? "line-through" : "none", marginRight: 8 }}>₹{basePrice.toLocaleString("en-IN")}</span>
              {appliedCoupon && <span> ₹{discountedPrice.toLocaleString("en-IN")}</span>}
              {!appliedCoupon && <span> </span>}
            </div>

            {/* coupon UI */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input aria-label="Coupon code" placeholder="Coupon code" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(null); }} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }} />
              <button onClick={() => {
                const code = coupon.trim();
                if (!code) { setCouponError("Enter coupon"); return; }
                const c = COUPONS[code];
                if (!c) { setCouponError("Invalid coupon"); return; }
                setAppliedCoupon({ code, ...c });
                setCouponError(null);
                showToast(`Coupon ${code} applied`, "ok");
              }} style={{ padding: "8px 10px", borderRadius: 8, background: "#111827", color: "#fff", border: "none" }}>{appliedCoupon ? "Update" : "Apply"}</button>
              {appliedCoupon && <button onClick={() => { setAppliedCoupon(null); showToast("Coupon removed", "warn"); }} style={{ padding: "8px 10px", borderRadius: 8 }}>Remove</button>}
              {couponError && <div style={{ color: "#ef4444" }}>{couponError}</div>}
            </div>
          </div>

          <div className={`pd-stock ${inStock ? "in" : "out"}`}>{inStock ? "In stock" : "Out of stock"}</div>
          <p className="pd-desc">{product.description || product.desc || "No description available."}</p>

          <div className="pd-meta">
            {avgRating && <div className="pd-rating">{avgRating} ★</div>}
            <div className="pd-review-count">{reviews.length} reviews</div>
          </div>

          <div className="pd-variants">
            <div style={{ marginBottom: 8 }}>
              <div className="pd-variant-label">Color <button onClick={() => setSizeChartOpen(true)} style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Size chart</button></div>
              <div style={{ display: "flex", gap: 8 }}>{colors.map(c => <button key={c} className={`pd-swatch ${selectedColor === c ? "active" : ""}`} style={{ background: c }} onClick={() => setSelectedColor(c)} aria-label={`Choose color ${c}`} />)}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="pd-variant-label">Size</div>
              <div style={{ display: "flex", gap: 8 }}>{sizes.map(s => <button key={s} className={`pd-size ${selectedSize === s ? "active" : ""}`} onClick={() => setSelectedSize(s)}>{s}</button>)}</div>
            </div>
          </div>

          <div className="pd-controls">
            <div className="pd-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="pd-qty-btn">−</button>
              <div className="pd-qty-val">{qty}</div>
              <button onClick={() => setQty(q => Math.min((product.stock || 99), q + 1))} className="pd-qty-btn">+</button>
            </div>

            <button onClick={handleAddToCart} className="pd-add" disabled={!inStock || adding}>{adding ? "Adding..." : "Add to cart"}</button>

            <button onClick={toggleWishlist} className={`pd-wish ${wishlist.find(i => String(i.id) === String(product.id)) ? "active" : ""}`}>{wishlist.find(i => String(i.id) === String(product.id)) ? "♥ Wishlisted" : "♡ Wishlist"}</button>
          </div>

          {selectedColor && selectedSize && <div className="pd-selected">Selected: <b>{selectedSize}</b> • <span style={{ color: selectedColor }}>Color</span></div>}

          {/* Delivery estimator */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontWeight: 600 }}>Delivery estimate</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ""))} style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #e5e7eb" }} />
              <button onClick={() => {
                if (!/^\d{5,6}$/.test(pincode)) { setDeliveryInfo({ error: "Enter valid pincode" }); return; }
                const days = (parseInt(pincode.slice(-1)) % 2 === 0) ? [2, 4] : [4, 7];
                setDeliveryInfo({ days });
              }} style={{ padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff" }}>Check</button>
            </div>
            {deliveryInfo && deliveryInfo.error && <div style={{ color: "#ef4444", marginTop: 8 }}>{deliveryInfo.error}</div>}
            {deliveryInfo && deliveryInfo.days && <div style={{ marginTop: 8, color: "#0b74de" }}>Estimated delivery: in {deliveryInfo.days[0]}–{deliveryInfo.days[1]} days</div>}
          </div>

          {/* Reviews + breakdown */}
          <div className="pd-reviews">
            <h3>Customer reviews</h3>

            {/* rating breakdown */}
            <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
              {[5, 4, 3, 2, 1].map(st => (
                <div key={st} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 32, fontWeight: 700 }}>{st}★</div>
                  <div style={{ flex: 1, background: "#e6e9ee", height: 10, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${breakdown.pct(st)}%`, height: "100%", background: "#f59e0b" }} />
                  </div>
                  <div style={{ width: 40, textAlign: "right", color: "#6b7280" }}>{breakdown.pct(st)}%</div>
                </div>
              ))}
            </div>

            {/* review form */}
            <form className="pd-review-form" onSubmit={submitReview}>
              <input ref={nameInputRef} placeholder="Your name" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} />
              <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Okay</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Terrible</option>
              </select>
              <textarea rows={3} placeholder="Write your review" value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} />
              <div className="pd-form-actions">
                <button type="submit" disabled={submittingReview}>{submittingReview ? "Submitting..." : "Submit review"}</button>
                <button type="button" onClick={resetReviewForm} disabled={!reviewForm.name && !reviewForm.text && reviewForm.rating === 5}>Reset</button>
              </div>
            </form>

            {/* list */}
            <div className="pd-review-list">    
              {displayedReviews.length === 0 && <div className="pd-no-reviews">No reviews yet.</div>}
              {displayedReviews.map(r => (
                <div key={r.id} className="pd-review">
                  <div className="pd-review-head"><b>{r.name}</b> <span className="pd-stars">{'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</span></div>
                  <div className="pd-review-text">{r.text}</div>
                </div>
              ))}
              {reviews.length > displayedReviews.length && <button className="pd-load-more" onClick={() => setReviewPageSize(s => s + 5)}>Load more reviews</button>}
            </div>
          </div>

          {/* Related */}
          <div className="pd-related">
            <h3>Related products</h3>
            <div className="pd-related-grid">
              {related.length ? related.map(p => (
                <Link key={p.id} to={`/product/p${p.id}`} className="pd-related-card">
                  <img src={p.img} alt={p.title} loading="lazy" />
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ color: "#6b7280", marginTop: 6 }}>₹{Number(p.price).toLocaleString()}</div>
                </Link>
              )) : <div style={{ marginTop: 8, color: "#6b7280" }}>No related products found.</div>}
            </div>
          </div>

          {/* Recently viewed */}
          {recent.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3>Recently viewed</h3>
              <div className="pd-rv-list">{recent.map(r => <Link key={r.id} to={`/product/p${r.id}`} className="pd-rv-card"><img src={r.image || r.img} alt={r.title} loading="lazy" /><div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>{r.title}</div><div style={{ color: "#0b74de", marginTop: 6 }}>₹{Number(r.price).toLocaleString()}</div></Link>)}</div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>{toast && <motion.div className={`pd-toast ${toast.type}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>{toast.text}</motion.div>}</AnimatePresence>

      {/* Zoom lightbox */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div className="pd-zoom-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomOpen(false)}>
            <div className="pd-zoom-inner" onClick={(e) => e.stopPropagation()}>
              <button className="pd-zoom-close" onClick={() => setZoomOpen(false)}>✕</button>
              <button className="pd-zoom-prev" onClick={() => setZoomIndex(i => Math.max(0, i - 1))}>‹</button>
              <img className="pd-zoom-img" src={thumbs[zoomIndex] || mainImg || product.image || product.img} alt={product.title} />
              <button className="pd-zoom-next" onClick={() => setZoomIndex(i => Math.min(thumbs.length - 1, i + 1))}>›</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* sticky CTA */}
      {showSticky && (
        <div className="pd-sticky">
          <div className="pd-sticky-info"> 
            <div style={{ fontWeight: 700 }}>{product.title}</div>
            <div style={{ color: "#6b7280" }}>₹{discountedPrice.toLocaleString()}</div>
          </div>
          <div className="pd-sticky-actions">
            <button onClick={handleAddToCart} className="pd-add small">{adding ? "Adding..." : "Add to cart"}</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="pd-btn">Top</button>
          </div>
        </div>
      )}
    </div>
  );
}
