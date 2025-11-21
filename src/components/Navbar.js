// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { CartContext } from "../context/CartContext";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpenIndex, setMobileOpenIndex] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const panelRef = useRef(null);
  const { cart } = useContext(CartContext);

  const totalQty = Array.isArray(cart) ? cart.reduce((t, p) => t + (p.quantity || 1), 0) : 0;

  const menuItems = [
    { name: "Men", categories: ["T-Shirts", "Shirts", "Jeans", "Shoes", "Accessories"] },
    { name: "Women", categories: ["Tops", "Dresses", "Handbags", "Heels", "Jewelry"] },
    { name: "Electronics", categories: ["Mobiles", "Laptops", "Headphones", "Smartwatches", "Cameras"] },
    { name: "Home & Living", categories: ["Furniture", "Decor", "Kitchen", "Lighting", "Bedding"] },
  ];

  useEffect(() => {
    const onResize = () => {
      const nowDesktop = window.innerWidth > 768;
      setIsDesktop(nowDesktop);
      if (!nowDesktop) setActiveMenu(null);
      else {
        setMenuOpen(false);
        setMobileOpenIndex(null);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setActiveMenu(null);
        setMobileOpenIndex(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // defensive cleanup in case of stale classes
  useEffect(() => {
    document.body.classList.remove("hide-nav");
    const hdr = document.querySelector("header");
    if (hdr) hdr.classList.remove("nav-hidden");
  }, []);

  return (
    <header className={isDesktop && activeMenu !== null ? "mega-open" : ""}>
      <div className="container nav-wrap">
        <nav aria-label="Main navigation">
          <Link to="/" className="logo" onClick={() => { setMenuOpen(false); setActiveMenu(null); }}>
            MyStore
          </Link>

          <button
            className={`hamburger ${menuOpen ? "is-open" : ""}`}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(s => !s)}
          >
            <span className="hamburger-icon">{menuOpen ? "✖" : "☰"}</span>
          </button>

          <ul className={`nav-menu ${menuOpen ? "open" : ""}`} role="menubar">
            {menuItems.map((item, idx) => (
              <li
                key={idx}
                role="none"
                onMouseEnter={() => isDesktop && setActiveMenu(idx)}
                onMouseLeave={() => isDesktop && setActiveMenu(null)}
              >
                <button
                  className="menu-btn"
                  role="menuitem"
                  onClick={() => {
                    if (!isDesktop) setMobileOpenIndex(mobileOpenIndex === idx ? null : idx);
                    else setActiveMenu(activeMenu === idx ? null : idx);
                  }}
                  aria-expanded={!isDesktop ? (mobileOpenIndex === idx) : (activeMenu === idx)}
                >
                  {item.name}
                </button>

                {/* desktop per-item small dropdown */}
                <AnimatePresence>
                  {isDesktop && activeMenu === idx && (
                    <motion.div
                      className="mega-menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                    >
                      {item.categories.map((cat, i) => (
                        <Link key={i} to={`/${item.name.toLowerCase()}/${cat.toLowerCase()}`} onClick={() => setActiveMenu(null)}>
                          {cat}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* mobile accordion */}
                {!isDesktop && (
                  <AnimatePresence>
                    {mobileOpenIndex === idx && (
                      <motion.div className="mobile-accordion" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                        {item.categories.map((cat, i) => (
                          <Link key={i} to={`/${item.name.toLowerCase()}/${cat.toLowerCase()}`} onClick={() => { setMenuOpen(false); setMobileOpenIndex(null); }}>
                            {cat}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            ))}
          </ul>

          <div className="right-section">
            <SearchBar />
            <motion.div whileHover={{ scale: 1.05 }} className="cart-badge" title="View cart">
              <Link to="/cart" onClick={() => setMenuOpen(false)} aria-label={`Cart with ${totalQty} items`}>
                🛒 <span className="cart-count">{totalQty}</span>
              </Link>
            </motion.div>
          </div>
        </nav>
      </div>

      {/* Full-width mega panel for desktop */}
      <AnimatePresence>
        {isDesktop && activeMenu !== null && (
          <motion.div className="mega-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} onMouseEnter={() => setActiveMenu(activeMenu)} onMouseLeave={() => setActiveMenu(null)}>
            <div className="mega-inner">
              <div className="mega-cats">
                <h4>{menuItems[activeMenu].name}</h4>
                <div className="mega-columns">
                  {menuItems[activeMenu].categories.map((cat, i) => (
                    <Link key={i} to={`/${menuItems[activeMenu].name.toLowerCase()}/${cat.toLowerCase()}`} onClick={() => setActiveMenu(null)}>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mega-hero">
                <div className="mega-hero-content">
                  <h3>Shop the best of {menuItems[activeMenu].name}</h3>
                  <p>Curated picks and seasonal favorites — hand-selected for you.</p>
                  <Link to={`/${menuItems[activeMenu].name.toLowerCase()}`} className="mega-cta" onClick={() => setActiveMenu(null)}>
                    Explore {menuItems[activeMenu].name}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen sliding panel */}
      <AnimatePresence>
        {menuOpen && !isDesktop && (
          <motion.aside className="mobile-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.22 }} ref={panelRef} aria-modal="true" role="dialog">
            <div className="mobile-panel-inner">
              <div className="mobile-top">
                <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>MyStore</Link>
                <button className="hamburger close" onClick={() => setMenuOpen(false)} aria-label="Close menu">✖</button>
              </div>

              <div className="mobile-links">
                {menuItems.map((it, i) => (
                  <div key={i} className="mobile-group">
                    <button className="mobile-group-btn" onClick={() => setMobileOpenIndex(mobileOpenIndex === i ? null : i)} aria-expanded={mobileOpenIndex === i}>
                      {it.name}
                      <span className={`caret ${mobileOpenIndex === i ? "open" : ""}`}>▾</span>
                    </button>

                    <AnimatePresence>
                      {mobileOpenIndex === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mobile-sub">
                          {it.categories.map((cat, idx) => (
                            <Link key={idx} to={`/${it.name.toLowerCase()}/${cat.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                              {cat}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="mobile-quick">
                  <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                  <Link to="/travel" onClick={() => setMenuOpen(false)}>Travel</Link>
                </div>
              </div>

              <div className="mobile-bottom">
                <form onSubmit={(e)=>e.preventDefault()} className="mobile-search" role="search">
                  <input type="search" placeholder="Search products..." aria-label="Search products" />
                </form>
                <div className="mobile-contact">
                  <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                  <Link to="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
