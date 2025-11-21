// src/components/ProductDetail.jsx
import React, { useEffect, useState, useContext, useRef, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "../context/CartContext";
import PRODUCTS from "../data/products";
import "./ProductDetail.css";

/* -------------------------
   LocalStorage keys & helpers
--------------------------*/
const RV_KEY = "recently_viewed_v1";
const REVIEWS_KEY = "product_reviews_v1";
const WISH_KEY = "wishlist_v1";
const COUPONS = { SAVE10: { type: "percent", amount: 10 }, FLAT200: { type: "fixed", amount: 200 } };

const safeParse = (v, fallback) => {
  try { return JSON.parse(v); } catch { return fallback; }
};

function addRecentlyViewed(product) {
  try {
    if (!product || product.id == null) return;
    const raw = localStorage.getItem(RV_KEY);
    const list = safeParse(raw, []);
    const cleaned = list.filter(p => String(p.id) !== String(product.id));
    cleaned.unshift({ id: product.id, title: product.title, image: product.image || product.img || "", price: product.price });
    localStorage.setItem(RV_KEY, JSON.stringify(cleaned.slice(0, 24)));
  } catch (e) { console.error(e); }
}
function readRecentlyViewed() { return safeParse(localStorage.getItem(RV_KEY), []); }
function readReviews(productId) { const all = safeParse(localStorage.getItem(REVIEWS_KEY), {}); return all[String(productId)] || []; }
function saveReview(productId, review) {
  const all = safeParse(localStorage.getItem(REVIEWS_KEY), {});
  all[String(productId)] = all[String(productId)] || [];
  all[String(productId)].unshift(review);
  all[String(productId)] = all[String(productId)].slice(0, 500);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
}
function readWishlist() { return safeParse(localStorage.getItem(WISH_KEY), []); }
function saveWishlist(list) { try { localStorage.setItem(WISH_KEY, JSON.stringify(list)); } catch (e) { } }

/* -------------------------
   Utilities
--------------------------*/
function normalizeImages(prod) {
  if (!prod) return [];
  if (prod.images && Array.isArray(prod.images) && prod.images.length) return prod.images;
  const base = prod.image || prod.img || null;
  if (!base) return [];
  return [base, base + "?v=1", base + "?v=2"];
}

function debounce(fn, wait = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* -------------------------
   Small UI components (top-level so hooks are allowed)
--------------------------*/
function Countdown({ endAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(endAt).getTime() - now);
  if (ms <= 0) return null;
  const days = Math.floor(ms / (1000*60*60*24));
  const hrs = Math.floor((ms % (1000*60*60*24)) / (1000*60*60));
  const mins = Math.floor((ms % (1000*60*60)) / (1000*60));
  const secs = Math.floor((ms % (1000*60)) / 1000);
  return <div className="pd-countdown">Limited offer: {days}d {hrs}h {mins}m {secs}s</div>;
}

function ZoomModal({ thumbs = [], index = 0, onClose = ()=>{}, onPrev = ()=>{}, onNext = ()=>{} }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (!thumbs || thumbs.length === 0) return null;
  return (
    <AnimatePresence>
      <motion.div className="pd-zoom-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <div className="pd-zoom-inner" onClick={e => e.stopPropagation()}>
          <button aria-label="Close" className="pd-zoom-close" onClick={onClose}>✕</button>
          <button aria-label="Prev" className="pd-zoom-prev" onClick={onPrev}>‹</button>
          <img className="pd-zoom-img" src={thumbs[index]} alt="Zoom" />
          <button aria-label="Next" className="pd-zoom-next" onClick={onNext}>›</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------
   Main component
--------------------------*/
export default function ProductDetail() {
  const { id: rawId } = useParams();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [thumbs, setThumbs] = useState([]);
  const [mainImg, setMainImg] = useState(null);

  const colors = ["#000000", "#ff0000", "#1e90ff", "#008000"];
  const sizes = ["S","M","L","XL"];

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewPageSize, setReviewPageSize] = useState(5);
  const nameInputRef = useRef(null);

  const [wishlist, setWishlist] = useState(() => readWishlist());
  const [toast, setToast] = useState(null);

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const [showSticky, setShowSticky] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  const lastReviewRef = useRef(null);

  const productId = useMemo(() => {
    if (!rawId) return null;
    const m = String(rawId).match(/(\d+)$/);
    return m ? m[1] : rawId;
  }, [rawId]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (productId) {
          const local = PRODUCTS.find(p => String(p.id) === String(productId));
          if (local) {
            if (!mounted) return;
            setProduct(local);
            const imgs = normalizeImages(local);
            setThumbs(imgs);
            setMainImg(imgs[0] || local.image || local.img || null);
            addRecentlyViewed(local);
            setReviews(readReviews(productId));
            setLoading(false);
            window.dataLayer?.push?.({ event: "product_view", productId: local.id, productTitle: local.title });
            window.dispatchEvent(new CustomEvent("product-view", { detail: { id: local.id } }));
            return;
          }
        }
        if (productId && /^\d+$/.test(String(productId))) {
          const res = await axios.get(`https://fakestoreapi.com/products/${productId}`);
          if (mounted && res && res.data) {
            const p = res.data;
            setProduct(p);
            const imgs = normalizeImages(p);
            setThumbs(imgs);
            setMainImg(imgs[0] || p.image || p.img || null);
            addRecentlyViewed(p);
            setReviews(readReviews(productId));
            setLoading(false);
            window.dataLayer?.push?.({ event: "product_view", productId: p.id, productTitle: p.title });
            window.dispatchEvent(new CustomEvent("product-view", { detail: { id: p.id } }));
            return;
          }
        }
        if (mounted) { setError("Product not found"); setLoading(false); }
      } catch (err) {
        console.error(err);
        const local = PRODUCTS.find(p => String(p.id) === String(productId));
        if (local && mounted) {
          setProduct(local);
          const imgs = normalizeImages(local);
          setThumbs(imgs);
          setMainImg(imgs[0] || local.image || local.img || null);
          addRecentlyViewed(local);
          setReviews(readReviews(productId));
          setLoading(false);
          return;
        }
        if (mounted) { setError("Failed to load product"); setLoading(false); }
      }
    })();

    return () => { mounted = false; };
  }, [productId]);

  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setQty(1);
    setReviewForm({ name: "", rating: 5, text: "" });
    setReviewPageSize(5);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
  }, [productId]);

  useEffect(() => {
    const onScroll = () => setShowSticky((window.scrollY || 0) > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = e => {
      if (e.key === "Escape") setZoomOpen(false);
      if (e.key === "ArrowLeft") setZoomIndex(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setZoomIndex(i => Math.min(thumbs.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomOpen, thumbs.length]);

  const showToast = useCallback((text, type = "ok", ms = 2500, action = null) => {
    setToast({ text, type, action });
    if (ms > 0) setTimeout(() => setToast(null), ms);
  }, []);

  const basePrice = Number(product?.price || 0);
  const discountedPrice = appliedCoupon
    ? appliedCoupon.type === "percent"
      ? Math.max(0, Math.round(basePrice * (1 - appliedCoupon.amount / 100)))
      : Math.max(0, basePrice - appliedCoupon.amount)
    : basePrice;

  const inStock = product?.stock === undefined ? true : Boolean(product.stock > 0);

  function flyToCart(imgSrc) {
    try {
      const wrapId = "pd-fly-wrap";
      let wrap = document.getElementById(wrapId);
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.id = wrapId;
        wrap.style.position = "fixed";
        wrap.style.left = "0";
        wrap.style.top = "0";
        wrap.style.pointerEvents = "none";
        wrap.style.zIndex = "150000";
        document.body.appendChild(wrap);
      }
      const img = document.createElement("img");
      img.src = imgSrc || (product && (product.image || product.img)) || "";
      img.style.width = "64px";
      img.style.height = "64px";
      img.style.borderRadius = "8px";
      img.style.position = "fixed";
      const startX = window.innerWidth * 0.5;
      const startY = window.innerHeight * 0.45;
      img.style.left = startX + "px";
      img.style.top = startY + "px";
      img.style.boxShadow = "0 10px 30px rgba(2,6,23,0.2)";
      img.style.transition = "transform 700ms cubic-bezier(.2,.9,.2,1), opacity 700ms";
      wrap.appendChild(img);
      requestAnimationFrame(() => {
        const endX = window.innerWidth - 60;
        const endY = 28;
        const dx = endX - startX;
        const dy = endY - startY;
        img.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
        img.style.opacity = "0.2";
      });
      setTimeout(() => { img.remove(); }, 800);
    } catch (e) { console.error(e); }
  }

  const handleAddToCart = async () => {
    if (adding) return;
    if (!selectedColor || !selectedSize) { showToast("Select color & size", "warn"); return; }
    setAdding(true);
    try {
      const item = {
        id: product.id,
        title: product.title,
        price: discountedPrice,
        color: selectedColor,
        size: selectedSize,
        image: product.image || product.img,
        quantity: qty,
      };
      try { addToCart(item, qty); } catch { addToCart(item); }
      flyToCart(item.image);
      showToast(`Added ${qty} × ${product.title}`, "ok", 2500, { label: "Undo", cb: () => {
        window.dispatchEvent(new CustomEvent("undo-add", { detail: { id: product.id } }));
        showToast("Undo requested", "warn", 1500);
      }});
    } catch (e) { console.error(e); showToast("Could not add to cart", "warn"); } finally {
      setTimeout(() => setAdding(false), 800);
    }
  };

  const quickAdd = (p) => {
    const item = { id: p.id, title: p.title, price: p.price, image: p.img || p.image || "", quantity: 1 };
    try { addToCart(item, 1); } catch { addToCart(item); }
    flyToCart(item.image);
    showToast(`Added ${p.title}`, "ok");
  };

  const toggleWishlist = () => {
    const cur = readWishlist();
    const exists = cur.find(i => String(i.id) === String(product.id));
    let next;
    if (exists) {
      next = cur.filter(i => String(i.id) !== String(product.id));
      showToast("Removed from wishlist", "warn", 2200, { label: "Undo", cb: () => {
        const restored = [{ id: product.id, title: product.title, image: product.image || product.img }, ...next];
        saveWishlist(restored); setWishlist(restored); showToast("Restored", "ok", 1400);
      }});
    } else {
      next = [{ id: product.id, title: product.title, image: product.image || product.img }, ...cur];
      showToast("Added to wishlist", "ok", 2200, { label: "Undo", cb: () => {
        const without = next.filter(i => String(i.id) !== String(product.id));
        saveWishlist(without); setWishlist(without); showToast("Removed", "warn", 1400);
      }});
    }
    saveWishlist(next);
    setWishlist(next);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); showToast("Link copied", "ok"); } catch { showToast("Unable to copy", "warn"); }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(product.title + " " + window.location.href)}`, "_blank");
  };

  useEffect(() => { setReviews(readReviews(productId)); }, [productId]);

  const submitReview = (e) => {
    e.preventDefault();
    if (submittingReview) return;
    const name = (reviewForm.name || "").trim();
    const text = (reviewForm.text || "").trim();
    const rating = Number(reviewForm.rating) || 5;
    if (!name || !text) { showToast("Name & review required", "warn"); return; }

    if (reviews.find(r => r.name === name && r.text === text)) { showToast("Duplicate review detected", "warn"); return; }

    setSubmittingReview(true);
    const r = { id: Date.now(), name, rating, text, date: new Date().toISOString() };
    setReviews(prev => [r, ...prev]);
    saveReview(productId, r);
    lastReviewRef.current = r.id;
    setReviewForm({ name: "", rating: 5, text: "" });

    showToast("Review submitted", "ok", 5000, {
      label: "Undo",
      cb: () => {
        const all = safeParse(localStorage.getItem(REVIEWS_KEY), {});
        all[String(productId)] = (all[String(productId)] || []).filter(rr => rr.id !== r.id);
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
        setReviews(prev => prev.filter(rr => rr.id !== r.id));
        showToast("Review removed", "warn");
      }
    });

    setTimeout(() => { setSubmittingReview(false); nameInputRef.current && nameInputRef.current.focus(); }, 700);
  };

  const resetReviewForm = () => { setReviewForm({ name: "", rating: 5, text: "" }); nameInputRef.current && nameInputRef.current.focus(); };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) { setCouponError("Enter coupon"); return; }
    const c = COUPONS[code];
    if (!c) { setCouponError("Invalid coupon"); return; }
    setAppliedCoupon({ code, ...c });
    setCouponError(null);
    showToast(`Coupon ${code} applied`, "ok");
  };

  const debouncedCheck = useMemo(() => debounce((pin) => {
    if (!/^\d{5,6}$/.test(pin)) { setDeliveryInfo({ error: "Enter valid pincode" }); return; }
    const days = (parseInt(pin.slice(-1)) % 2 === 0) ? [2,4] : [4,7];
    setDeliveryInfo({ days });
  }, 450), []);

  const checkPincode = () => { debouncedCheck(pincode); };

  const displayedReviews = reviews.slice(0, reviewPageSize);
  const related = PRODUCTS.filter(p => p.category === product?.category && String(p.id) !== String(product?.id)).slice(0, 8);
  const recent = readRecentlyViewed().filter(r => String(r.id) !== String(product?.id)).slice(0, 8);

  if (loading) return <div className="pd-loading">Loading...</div>;
  if (error) return <div className="pd-loading">{error}</div>;
  if (!product) return <div className="pd-loading">Product not found.</div>;

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) : null;

  const jsonld = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": thumbs.length ? thumbs[0] : (product.image || product.img || ""),
    "description": product.description || product.desc || "",
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": discountedPrice,
      "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="pd-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <div className="pd-container">
        {/* Left column */}
        <div className="pd-image-col">
          <div className="pd-breadcrumbs">
            <Link to="/">Home</Link> › <Link to={`/shop?cat=${encodeURIComponent(product.category || "")}`}>{product.category || "Products"}</Link> › <span>{product.title}</span>
          </div>

          <div className="pd-main-image-wrap">
            {product.badge && <div className="pd-badge">{product.badge}</div>}
            {product.saleEnds && <Countdown endAt={product.saleEnds} />}
            {product.mrp && product.price && product.mrp > product.price && (
              <div className="pd-discount">-{Math.round((product.mrp - product.price)/product.mrp*100)}%</div>
            )}

            <img
              className="pd-main-image"
              src={mainImg || product.image || product.img}
              alt={product.title}
              onClick={() => { setZoomIndex(thumbs.indexOf(mainImg) || 0); setZoomOpen(true); }}
              onError={(e) => { e.target.src = product.image || product.img || ""; }}
              loading="lazy"
              role="button"
              aria-label="Open image zoom"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") setZoomOpen(true); }}
            />
          </div>

          <div className="pd-thumbs" role="list" aria-label="Product thumbnails">
            {thumbs.map((t, i) => (
              <img
                key={i}
                src={t}
                alt={`thumb-${i}`}
                className={`pd-thumb ${t === mainImg ? "active" : ""}`}
                onClick={() => { setMainImg(t); setZoomIndex(i); }}
                loading="lazy"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setMainImg(t); setZoomIndex(i); }
                  if (e.key === "ArrowLeft") {
                    const prev = Math.max(0, i - 1);
                    const n = thumbs[prev];
                    if (n) { setMainImg(n); setZoomIndex(prev); }
                  }
                  if (e.key === "ArrowRight") {
                    const next = Math.min(thumbs.length - 1, i + 1);
                    const n = thumbs[next];
                    if (n) { setMainImg(n); setZoomIndex(next); }
                  }
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="pd-btn" onClick={() => (navigator.share ? navigator.share({ title: product.title, text: product.description, url: window.location.href }) : copyLink())}>Share</button>
            <button className="pd-btn" onClick={copyLink}>Copy link</button>
            <button className="pd-btn" onClick={shareWhatsApp}>WhatsApp</button>
          </div>
        </div>

        {/* Right column */}
        <div className="pd-info-col">
          <h1 className="pd-title">{product.title}</h1>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="pd-price">
              <span style={{ textDecoration: appliedCoupon ? "line-through" : "none", marginRight: 8 }}>₹{basePrice.toLocaleString("en-IN")}</span>
              {appliedCoupon && <span> ₹{discountedPrice.toLocaleString("en-IN")}</span>}
            </div>
            <div style={{ color: "#6b7280" }}>{avgRating && <span style={{ fontWeight: 700 }}>{avgRating}★</span>} <span style={{ marginLeft: 8 }}>{reviews.length} reviews</span></div>
          </div>

          <div className={`pd-stock ${inStock ? "in" : "out"}`}>{inStock ? "In stock" : "Out of stock"}</div>
          <p className="pd-desc">{product.description || product.desc || "No description available."}</p>

          <div className="pd-variants">
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="pd-variant-label">Color</div>
                <button className="pd-sizechart-btn" onClick={() => setSizeChartOpen(true)}>Size chart</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {colors.map(c => <button key={c} className={`pd-swatch ${selectedColor === c ? "active" : ""}`} style={{ background: c }} onClick={() => setSelectedColor(c)} aria-label={`color ${c}`} />)}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="pd-variant-label">Size</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {sizes.map(s => <button key={s} className={`pd-size ${selectedSize === s ? "active" : ""}`} onClick={() => setSelectedSize(s)}>{s}</button>)}
              </div>
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

          {selectedColor && selectedSize && <div className="pd-selected" style={{ marginTop: 10 }}>Selected: <b>{selectedSize}</b> • <span style={{ color: selectedColor }}>Color</span></div>}

          {/* Coupon + Delivery */}
          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input value={coupon} onChange={e => { setCoupon(e.target.value); setCouponError(null); }} placeholder="Coupon code" className="pd-input" aria-label="Coupon code" />
            <button onClick={applyCoupon} className="pd-smallbtn">{appliedCoupon ? "Update" : "Apply"}</button>
            {appliedCoupon && <button onClick={() => { setAppliedCoupon(null); showToast("Coupon removed", "warn"); }} className="pd-smallbtn">Remove</button>}
            {couponError && <div style={{ color: "#ef4444" }}>{couponError}</div>}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600 }}>Delivery estimate</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={pincode} onChange={e => { const val = e.target.value.replace(/\D/g, ""); setPincode(val); debouncedCheck(val); }} placeholder="Pincode" className="pd-input" aria-label="Pincode" />
              <button onClick={checkPincode} className="pd-smallbtn">Check</button>
            </div>
            {deliveryInfo && deliveryInfo.error && <div style={{ color: "#ef4444", marginTop: 8 }}>{deliveryInfo.error}</div>}
            {deliveryInfo && deliveryInfo.days && <div style={{ marginTop: 8, color: "#0b74de" }}>Estimated delivery: in {deliveryInfo.days[0]}–{deliveryInfo.days[1]} days</div>}
          </div>

          {/* Reviews (kept behavior + added undo) */}
          <div className="pd-reviews">
            <h3>Customer reviews</h3>

            <div style={{ marginTop: 8 }}>
              {[5,4,3,2,1].map(st => {
                const count = reviews.filter(r => Number(r.rating) === st).length;
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={st} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <div style={{ width: 28, fontWeight: 700 }}>{st}★</div>
                    <div style={{ flex: 1, height: 10, background: "#e6e9ee", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b" }} />
                    </div>
                    <div style={{ width: 40, textAlign: "right", color: "#6b7280" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>

            <form className="pd-review-form" onSubmit={submitReview}>
              <input ref={nameInputRef} placeholder="Your name" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} aria-label="Reviewer name" />
              <div className="pd-star-input" aria-label="Rating">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className={`star-btn ${reviewForm.rating >= n ? "on" : ""}`} onClick={() => setReviewForm({...reviewForm, rating: n})} aria-pressed={reviewForm.rating === n}>★</button>
                ))}
              </div>
              <textarea rows={3} placeholder="Write your review" value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} aria-label="Review text" />
              <div className="pd-form-actions">
                <button type="submit" disabled={submittingReview}>{submittingReview ? "Submitting..." : "Submit review"}</button>
                <button type="button" onClick={resetReviewForm} disabled={!reviewForm.name && !reviewForm.text && reviewForm.rating === 5}>Reset</button>
              </div>
            </form>

            <div className="pd-review-list">
              {displayedReviews.length === 0 ? <div className="pd-no-reviews">No reviews yet.</div> : displayedReviews.map(r => (
                <div key={r.id} className="pd-review">
                  <div className="pd-review-head"><b>{r.name}</b> <span className="pd-stars">{'★'.repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)))}</span></div>
                  <div className="pd-review-text">{r.text}</div>
                </div>
              ))}
              {reviews.length > displayedReviews.length && <button className="pd-load-more" onClick={() => setReviewPageSize(s => s + 5)}>Load more reviews</button>}
            </div>
          </div>

          {/* Related (with Quick Add) and Recently viewed (kept) */}
          <div className="pd-related">
            <h3>Related products</h3>
            <div className="pd-related-grid">
              {related.length ? related.map(p => (
                <Link key={p.id} to={`/product/p${p.id}`} className="pd-related-card" onClick={() => {}}>
                  <div style={{ position: "relative" }}>
                    {p.badge && <div className="pd-card-badge">{p.badge}</div>}
                    {p.mrp && p.price && p.mrp > p.price && <div className="pd-card-discount">-{Math.round((p.mrp - p.price)/p.mrp*100)}%</div>}
                    <img src={p.img || p.image || ""} alt={p.title} />
                  </div>
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.title}</div>
                      <div style={{ color: "#6b7280", marginTop: 6 }}>₹{Number(p.price).toLocaleString()}</div>
                    </div>
                    <button className="pd-quick-add" onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); quickAdd(p); }} aria-label={`Quick add ${p.title}`}>＋</button>
                  </div>
                </Link>
              )) : <div style={{ marginTop: 8, color: "#6b7280" }}>No related products found.</div>}
            </div>
          </div>

          {recent.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3>Recently viewed</h3>
              <div className="pd-rv-list">
                {recent.map(r => (
                  <Link key={r.id} to={`/product/p${r.id}`} className="pd-rv-card">
                    <img src={r.image || r.img} alt={r.title} loading="lazy" />
                    <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ color: "#0b74de", marginTop: 6 }}>₹{Number(r.price).toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className={`pd-toast ${toast.type}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div>{toast.text}</div>
              {toast.action && <button className="pd-smallbtn" onClick={() => { toast.action.cb(); setToast(null); }}>{toast.action.label}</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom modal */}
      {zoomOpen && thumbs.length > 0 && (
        <ZoomModal
          thumbs={thumbs}
          index={zoomIndex}
          onClose={() => setZoomOpen(false)}
          onPrev={() => setZoomIndex(i => Math.max(0, i - 1))}
          onNext={() => setZoomIndex(i => Math.min(thumbs.length - 1, i + 1))}
        />
      )}

      {/* Size chart modal */}
      <AnimatePresence>
        {sizeChartOpen && (
          <motion.div className="pd-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSizeChartOpen(false)}>
            <motion.div className="pd-modal" initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }} onClick={e => e.stopPropagation()}>
              <button className="pd-modal-close" onClick={() => setSizeChartOpen(false)}>✕</button>
              <h3>Size Chart</h3>
              <table style={{ width: "100%", marginTop: 12 }}>
                <thead><tr><th>Size</th><th>Chest (cm)</th><th>Waist (cm)</th></tr></thead>
                <tbody>
                  <tr><td>S</td><td>88-92</td><td>72-76</td></tr>
                  <tr><td>M</td><td>96-100</td><td>80-84</td></tr>
                  <tr><td>L</td><td>104-108</td><td>88-92</td></tr>
                  <tr><td>XL</td><td>112-116</td><td>96-100</td></tr>
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky bottom bar */}
      {showSticky && (
        <div className="pd-sticky" role="region" aria-label="Quick buy bar">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={product.image || product.img} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{product.title}</div>
              <div style={{ color: "#6b7280" }}>₹{discountedPrice.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pd-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Top</button>
            <button className="pd-add small" onClick={handleAddToCart}>{adding ? "Adding..." : "Add to cart"}</button>
          </div>
        </div>
      )}
    </div>
  );
} 


