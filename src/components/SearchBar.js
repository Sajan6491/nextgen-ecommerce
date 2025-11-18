// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PRODUCTS from "../data/products"; // <-- your PRODUCTS array

// debounce helper
const debounce = (fn, wait = 220) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const SearchBar = ({ placeholder = "Search products...", minChars = 1 }) => {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Primary: attempt server endpoint, then fallback to local PRODUCTS
  const fetchSuggestions = async (term) => {
    if (!term || term.length < minChars) {
      setSuggestions([]);
      return;
    }

    // try backend endpoint first (non-blocking)
    try {
      const resp = await fetch(`/api/products?q=${encodeURIComponent(term)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length) {
          setSuggestions(data.slice(0, 8));
          return;
        }
      }
    } catch (err) {
      // ignore; we'll fall back to local PRODUCTS
    }

    // fallback: filter local PRODUCTS
    const termLower = term.toLowerCase();
    const filtered = PRODUCTS.filter(p =>
      (p.title || "").toLowerCase().includes(termLower)
      || (p.brand || "").toLowerCase().includes(termLower)
      || (p.category || "").toLowerCase().includes(termLower)
    ).slice(0, 8);

    setSuggestions(filtered);
  };

  const debouncedFetch = React.useCallback(debounce(fetchSuggestions, 180), []);

  useEffect(() => {
    if (q && q.trim().length >= minChars) {
      debouncedFetch(q.trim());
      setOpen(true);
    } else {
      setOpen(false);
      setSuggestions([]);
      setHighlight(-1);
    }
  }, [q, debouncedFetch, minChars]);

  // close suggestions on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const performSearch = (term) => {
    const trimmed = (term || "").trim();
    setOpen(false);
    setHighlight(-1);
    if (!trimmed) {
      navigate("/shop");
      return;
    }
    navigate(`/shop?q=${encodeURIComponent(trimmed)}`);
  };

  const selectSuggestion = (item) => {
    setOpen(false);
    setHighlight(-1);
    if (!item) return;

    // your app's product route uses /product/:id — we'll navigate by id
    if (item.id) {
      navigate(`/product/${item.id}`);
    } else if (item.slug) {
      navigate(`/product/${item.slug}`);
    } else if (item.title) {
      navigate(`/shop?q=${encodeURIComponent(item.title)}`);
    } else {
      performSearch(q);
    }
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(q);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < suggestions.length) {
        selectSuggestion(suggestions[highlight]);
      } else {
        performSearch(q);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="searchbar" ref={menuRef} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        className="search-input"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
        autoComplete="off"
      />

      {open && suggestions && suggestions.length > 0 && (
        <ul className="search-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestions.map((s, i) => {
            const title = s.title || s.brand || "Product";
            return (
              <li
                key={s.id || `${title}-${i}`}
                role="option"
                aria-selected={highlight === i}
                className={`suggestion-item ${highlight === i ? "is-highlight" : ""}`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(ev) => ev.preventDefault()} // prevent blur before click
                onClick={() => selectSuggestion(s)}
              >
                <div className="suggestion-left">
                  {s.img ? <img src={s.img} alt={title} /> : <span className="s-avatar">{(title[0] || "").toUpperCase()}</span>}
                </div>

                <div className="suggestion-main">
                  <div className="s-title">{title}</div>
                  <div className="s-meta">{s.brand ? `${s.brand} • ${s.category}` : s.category}</div>
                  {s.price !== undefined && <div className="s-sub">₹{s.price.toLocaleString()}</div>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
