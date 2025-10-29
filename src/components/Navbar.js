import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { cart } = useContext(CartContext);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const menuItems = [
    { name: "Men", categories: ["T-Shirts", "Shirts", "Jeans", "Shoes", "Accessories"] },
    { name: "Women", categories: ["Tops", "Dresses", "Handbags", "Heels", "Jewelry"] },
    { name: "Electronics", categories: ["Mobiles", "Laptops", "Headphones", "Smartwatches", "Cameras"] },
    { name: "Home & Living", categories: ["Furniture", "Decor", "Kitchen", "Lighting", "Bedding"] },
  ];

  const headerClass = activeMenu !== null ? "mega-open" : "";

  return (
    <header className={headerClass}>
      <nav>
        <Link to="/" className="logo">MyStore</Link>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : "☰"}
        </div>

        <ul className={`nav-menu ${menuOpen ? "open" : ""}`}>
          {menuItems.map((item, idx) => (
            <li key={idx}
                onMouseEnter={() => setActiveMenu(idx)}
                onMouseLeave={() => setActiveMenu(null)}
                onClick={() => setActiveMenu(activeMenu === idx ? null : idx)}
            >
              {item.name}
              <AnimatePresence>
                {(activeMenu === idx || menuOpen) && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {item.categories.map((cat, i) => (
                      <Link key={i} to={`/${item.name.toLowerCase()}/${cat.toLowerCase()}`}>
                        {cat}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <div className="right-section">
          <form onSubmit={(e) => { e.preventDefault(); const q = search.trim(); navigate(q ? `/?q=${encodeURIComponent(q)}` : '/'); }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search products..." className="search-input" />
          </form>
          <motion.div
            whileHover={{ scale: 1.1 }}
            style={{ cursor: "pointer", fontWeight: "500" }}
          >
            <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>🛒 {cart.length}</Link>
          </motion.div>
        </div>
      </nav>
      {/* Full-page mega panel - appears when activeMenu is not null */}
      <AnimatePresence>
        {activeMenu !== null && (
          <motion.div
            className="mega-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="mega-inner">
              <div className="mega-cats">
                <h4>{menuItems[activeMenu].name}</h4>
                <div className="mega-columns">
                  {menuItems[activeMenu].categories.map((cat, i) => (
                    <Link key={i} to={`/${menuItems[activeMenu].name.toLowerCase()}/${cat.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mega-hero">
                <div className="mega-hero-content">
                  <h3>Shop the best of {menuItems[activeMenu].name}</h3>
                  <p>Curated picks and seasonal favorites — hand-selected for you.</p>
                  <Link to={`/${menuItems[activeMenu].name.toLowerCase()}`} className="mega-cta" onClick={() => setMenuOpen(false)}>Explore {menuItems[activeMenu].name}</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
