// src/data/cities.js
// React-only, no backend. Loads India + US JSON chunks (inside src/).
// Exposes: preloadCities(), searchCities(q, limit), useCitiesReady().

import { useEffect, useState } from "react";

let _cities = [];
let _loaded = false;
let _loadingPromise = null;

const normalize = (row) => ({
  city: row.city || row.name || "",
  state: row.state || row.admin1 || "",
  country: row.country || "",
  code: row.code || row.iata || "",
  airport: row.airport || "",
});

/** Call once to load IN+US JSON (code-split). */
export function preloadCities() {
  if (_loaded) return Promise.resolve(_cities);
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = Promise.all([
    import(/* webpackChunkName: "cities-in" */ "./cities.in.json").catch(() => ({ default: null })),
    import(/* webpackChunkName: "cities-us" */ "./cities.us.json").catch(() => ({ default: null })),
  ])
    .then(([inMod, usMod]) => {
      const inList = Array.isArray(inMod?.default) ? inMod.default : [];
      const usList = Array.isArray(usMod?.default) ? usMod.default : [];

      if (inList.length || usList.length) {
        _cities = []
          .concat(inList.map(normalize))
          .concat(usList.map(normalize))
          .filter((row, idx, arr) => {
            const key = `${row.city}|${row.state}|${row.country}`.toLowerCase();
            return idx === arr.findIndex(r => `${r.city}|${r.state}|${r.country}`.toLowerCase() === key);
          });
      } else {
        // Fallback sample so the UI always works
        _cities = [
          { city: "Delhi", state: "Delhi", country: "India", code: "DEL", airport: "Indira Gandhi Intl" },
          { city: "Mumbai", state: "Maharashtra", country: "India", code: "BOM", airport: "Chhatrapati Shivaji Intl" },
          { city: "Bengaluru", state: "Karnataka", country: "India", code: "BLR", airport: "Kempegowda Intl" },
          { city: "Hyderabad", state: "Telangana", country: "India", code: "HYD", airport: "Rajiv Gandhi Intl" },
          { city: "Chennai", state: "Tamil Nadu", country: "India", code: "MAA", airport: "Chennai Intl" },
          { city: "Kolkata", state: "West Bengal", country: "India", code: "CCU", airport: "NSC Bose Intl" },
          { city: "New York", state: "New York", country: "United States", code: "NYC", airport: "All Airports" },
          { city: "Los Angeles", state: "California", country: "United States", code: "LAX", airport: "Los Angeles Intl" },
          { city: "Chicago", state: "Illinois", country: "United States", code: "CHI", airport: "All Airports" },
          { city: "San Francisco", state: "California", country: "United States", code: "SFO", airport: "San Francisco Intl" },
        ];
      }

      _loaded = true;
      return _cities;
    })
    .catch((e) => {
      console.warn("[cities] load error:", e);
      _cities = [
        { city: "Delhi", state: "Delhi", country: "India", code: "DEL", airport: "Indira Gandhi Intl" },
        { city: "Mumbai", state: "Maharashtra", country: "India", code: "BOM", airport: "Chhatrapati Shivaji Intl" },
        { city: "New York", state: "New York", country: "United States", code: "NYC", airport: "All Airports" },
        { city: "Los Angeles", state: "California", country: "United States", code: "LAX", airport: "Los Angeles Intl" },
      ];
      _loaded = true;
      return _cities;
    });

  return _loadingPromise;
}

/** Hook: tells you when cities are ready. */
export function useCitiesReady() {
  const [ready, setReady] = useState(_loaded);
  useEffect(() => {
    if (_loaded) return;
    let mounted = true;
    preloadCities().finally(() => mounted && setReady(true));
    return () => { mounted = false; };
  }, []);
  return ready;
}

/** Simple search (fast). Call only after useCitiesReady() is true. */
export function searchCities(query, limit = 12) {
  const q = (query || "").trim().toLowerCase();
  if (!_loaded) return [];
  if (!q) return _cities.slice(0, limit);

  const scored = _cities.map((c) => {
    const hay = `${c.city} ${c.state} ${c.country} ${c.code} ${c.airport}`.toLowerCase();
    let score = -1;
    if (c.city.toLowerCase().startsWith(q)) score = 100;
    else if (hay.startsWith(q)) score = 80;
    else if (hay.includes(q)) score = 50;
    return { c, score };
  }).filter(x => x.score >= 0);

  scored.sort((a, b) => b.score - a.score || a.c.city.localeCompare(b.c.city));
  return scored.slice(0, limit).map(x => x.c);
}
