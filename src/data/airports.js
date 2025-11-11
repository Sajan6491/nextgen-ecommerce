// src/data/airports.js
// React-only loader for airports (World + India). Caches in localStorage.
// Exposes: preloadAirports(), useAirportsReady(), searchAirports(q, limit)

import { useEffect, useState } from "react";

const WORLD_URL =
  "https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json"; // ~10k
const INDIA_URL =
  "https://raw.githubusercontent.com/expodes/indian-airports/master/airports.json";

const LS_WORLD = "air_world_v1";
const LS_INDIA = "air_india_v1";

let _air = [];
let _loaded = false;
let _promise = null;

const normWorld = (r) => ({
  city: r.city || "",
  country: r.country || "",
  code: r.IATA || r.iata || "",
  airport: r.name || "",
  state: r.state || r.admin1 || "",
});
const normIndia = (r) => ({
  city: r.city || r.name || "",
  country: "India",
  code: r.code || r.iata || "",
  airport: r.airport || r.fullname || r.name || "",
  state: r.state || r.region || "",
});

async function fetchJson(url) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function preloadAirports() {
  if (_loaded) return Promise.resolve(_air);
  if (_promise) return _promise;

  _promise = (async () => {
    // try cache
    let world = null, india = null;
    try { world = JSON.parse(localStorage.getItem(LS_WORLD) || "null"); } catch {}
    try { india = JSON.parse(localStorage.getItem(LS_INDIA) || "null"); } catch {}

    if (!world) {
      try { world = await fetchJson(WORLD_URL); localStorage.setItem(LS_WORLD, JSON.stringify(world)); } catch {}
    }
    if (!india) {
      try { india = await fetchJson(INDIA_URL); localStorage.setItem(LS_INDIA, JSON.stringify(india)); } catch {}
    }

    const a = Array.isArray(world) ? world.map(normWorld) : [];
    const b = Array.isArray(india) ? india.map(normIndia) : [];
    _air = a.concat(b).filter((x) => x.city && x.code && x.airport);

    // de-dup by city|code|country
    _air = _air.filter((row, i, arr) => {
      const k = `${row.city}|${row.code}|${row.country}`.toLowerCase();
      return i === arr.findIndex(r => `${r.city}|${r.code}|${r.country}`.toLowerCase() === k);
    });

    if (_air.length === 0) {
      _air = [
        { city: "Delhi", country: "India", code: "DEL", airport: "Indira Gandhi International" },
        { city: "Mumbai", country: "India", code: "BOM", airport: "Chhatrapati Shivaji International" },
        { city: "New York", country: "United States", code: "JFK", airport: "John F Kennedy International" },
        { city: "London", country: "United Kingdom", code: "LHR", airport: "Heathrow" },
      ];
    }

    _loaded = true;
    return _air;
  })();

  return _promise;
}

export function useAirportsReady() {
  const [ready, setReady] = useState(_loaded);
  useEffect(() => {
    if (_loaded) return;
    let mounted = true;
    preloadAirports().finally(() => mounted && setReady(true));
    return () => { mounted = false; };
  }, []);
  return ready;
}

export function searchAirports(query, limit = 12) {
  if (!_loaded) return [];
  const q = (query || "").trim().toLowerCase();
  if (!q) return _air.slice(0, limit);

  const scored = _air
    .map((c) => {
      const hay = `${c.city} ${c.state} ${c.country} ${c.code} ${c.airport}`.toLowerCase();
      let score = -1;
      if (c.code.toLowerCase().startsWith(q)) score = 110;
      else if (c.city.toLowerCase().startsWith(q)) score = 100;
      else if (hay.startsWith(q)) score = 80;
      else if (hay.includes(q)) score = 50;
      return { c, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.c.city.localeCompare(b.c.city))
    .slice(0, limit)
    .map((x) => x.c);

  return scored;
}
