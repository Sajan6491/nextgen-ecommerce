// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PRODUCTS from "../data/products";

// debounce helper
const debounce = (fn, wait = 180) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

export default function SearchBar({ placeholder = "Search products..." }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const fetchSuggestions = async (q) => {
    if (!q || q.trim().length < 1) return [];
    const term = q.toLowerCase();
    // local filter (replace with API if available)
    return PRODUCTS.filter(d =>
      (d.title || "").toLowerCase().includes(term) ||
      (d.brand || "").toLowerCase().includes(term) ||
      (d.category || "").toLowerCase().includes(term)
    ).slice(0, 8);
  };

  useEffect(() => {
    let mounted = true;
    if (!query) {
      setResults([]);
      setOpen(false);
      setHighlight(-1);
      return;
    }
    const id = setTimeout(async () => {
      const res = await fetchSuggestions(query);
      if (!mounted) return;
      setResults(res);
      setOpen(res.length > 0);
      setHighlight(-1);
    }, 160);
    return () => { mounted = false; clearTimeout(id); };
  }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" && results.length) {
        setOpen(true);
        setHighlight(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      setHighlight((h) => Math.min(h + 1, results.length - 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlight((h) => Math.max(h - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlight >= 0 && highlight < results.length) {
        onSelect(results[highlight]);
      } else {
        navigate(`/shop?q=${encodeURIComponent(query)}`);
        setOpen(false);
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const onSelect = (item) => {
    // navigate to product route in the format /product/p{id}
    if (!item) return;
    const id = item.id ?? item.productId ?? item.slug ?? null;
    const routeId = id ? `p${id}` : encodeURIComponent(item.title || item.brand || "");
    navigate(`/product/${routeId}`);
    setOpen(false);
  };

  return (
    <div className="searchbar" ref={containerRef}>
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (results.length) setOpen(true); }}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="search-suggestions"
        autoComplete="off"
      />

      {open && results.length > 0 && (
        <ul id="search-suggestions" className="search-suggestions" role="listbox">
          {results.map((r, idx) => (
            <li
              key={r.id ?? idx}
              id={`sugg-${idx}`}
              role="option"
              aria-selected={highlight === idx}
              className={`suggestion-item ${highlight === idx ? "is-highlight" : ""}`}
              onMouseEnter={() => setHighlight(idx)}
              onMouseDown={(ev) => { ev.preventDefault(); onSelect(r); }} // mousedown to avoid blur issues
              tabIndex={0}
            >
              <div className="suggestion-left">
                {r.img ? <img src={r.img} alt="" /> : <div className="s-avatar">{(r.title||"").slice(0,1).toUpperCase()}</div>}
              </div>
              <div className="suggestion-main">
                <div className="s-title">{r.title}</div>
                <div className="s-sub">{r.brand ? `${r.brand} • ${r.category}` : r.category}</div>
                {r.price !== undefined && <div className="s-sub">₹{r.price.toLocaleString()}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
