import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchCities, useCitiesReady } from "../data/cities";
import "./TravelHome.css";

const CLASSES = ["Economy", "Premium Economy", "Business"];
const POPULAR = [
  { from: "Delhi (DEL)", to: "Mumbai (BOM)" },
  { from: "Bengaluru (BLR)", to: "Goa (GOI)" },
  { from: "Hyderabad (HYD)", to: "Pune (PNQ)" },
  { from: "Kolkata (CCU)", to: "Delhi (DEL)" },
];

const DEFAULT_TRAV = { adults: 1, children: 0, infants: 0, cls: "Economy" };

function todayISO() { return new Date().toISOString().slice(0, 10); }
function addDays(d, n) { const t = new Date(d); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); }

/* City input with suggestions */
function CityInput({ label, value, onChange, placeholder = "City or airport", autoFocus, ready }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const [idx, setIdx] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => { setQ(value || ""); }, [value]);

  useEffect(() => {
    const h = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => (ready ? searchCities(q, 7) : []), [q, ready]);

  const select = (item) => {
    const text = `${item.city} (${item.code})`;
    onChange(text);
    setQ(text);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((p) => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((p) => Math.max(p - 1, 0)); }
    else if (e.key === "Enter") {
      if (open && idx >= 0) { e.preventDefault(); select(results[idx]); }
    } else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <label className="field city-box" ref={boxRef}>
      <span>{label}</span>
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); setIdx(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={!ready}
      />
      {!ready && <div className="hint">Loading cities…</div>}
      {open && ready && (
        <ul className="suggest">
          {results.length === 0 ? (
            <li className="empty">No matches</li>
          ) : results.map((r, i) => (
            <li
              key={r.city + r.code}
              className={i === idx ? "item active" : "item"}
              onMouseDown={(e) => { e.preventDefault(); select(r); }}
              onMouseEnter={() => setIdx(i)}
            >
              <div className="left">{r.city} <b>({r.code})</b></div>
              <div className="right">{r.airport}</div>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export default function TravelHome() {
  const nav = useNavigate();
  const { state } = useLocation();
  const ready = useCitiesReady();

  const promo = useMemo(
    () => state || { headline: "Get. Set. Travel.", note: "Search flights, compare fares, book instantly." },
    [state]
  );

  const [trip, setTrip] = useState("oneway");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [depart, setDepart] = useState("");
  const [ret, setRet] = useState("");
  const [trav, setTrav] = useState(DEFAULT_TRAV);
  const [showTrav, setShowTrav] = useState(false);
  const [err, setErr] = useState("");

  const today = todayISO();
  const totalPax = trav.adults + trav.children + trav.infants;
  const paxSummary = `${totalPax} Traveller${totalPax > 1 ? "s" : ""} | ${trav.cls}`;

  const swap = () => { const a = from; setFrom(to); setTo(a); };

  const quickDepart = (type) => {
    if (type === "today") setDepart(today);
    if (type === "7") setDepart(addDays(today, 7));
    if (type === "30") setDepart(addDays(today, 30));
    if (type === "wknd") {
      const d = new Date(); const add = (6 - d.getDay() + 7) % 7 || 7;
      const sat = addDays(today, add); setDepart(sat); if (trip === "round") setRet(addDays(sat, 2));
    }
  };

  // Safer bump that keeps constraints live
  const bump = (k, n) => setTrav((p) => {
    let next = Math.max(0, p[k] + n);
    let a = k === "adults" ? next : p.adults;
    let c = k === "children" ? next : p.children;
    let i = k === "infants" ? next : p.infants;

    if (a === 0 && (c > 0 || i > 0)) a = 1; // need at least one adult if kids/infants present
    if (i > a) i = a;                       // infants ≤ adults

    return { ...p, adults: a, children: c, infants: i };
  });

  const validate = () => {
    if (!from.trim() || !to.trim() || !depart) return "Please fill From, To and Depart.";
    if (trip === "round" && ret && ret < depart) return "Return date can’t be before Depart.";
    return "";
  };

  const submit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }
    setErr("");

    // Send real counts so totals can be calculated on search page
    const payload = {
      trip,
      from: from.trim(),
      to: to.trim(),
      depart,
      ...(trip === "round" && ret ? { return: ret } : {}),
      adults: trav.adults,
      children: trav.children,
      infants: trav.infants,
      cls: trav.cls,
      totalPax: totalPax,
    };
    nav(`/travel/search?${new URLSearchParams(payload).toString()}`);
  };

  return (
    <div className="th">
      {/* HERO */}
      <div className="th-hero">
        <div className="th-hero-inner">
          <div className="th-badge">Travel</div>
          <h1>{promo.headline || "Get. Set. Travel."}</h1>
          <p>{promo.note || "Discover great fares across top routes."}</p>
          {promo.promoCode && <span className="th-pill">CODE: {promo.promoCode}</span>}
        </div>
      </div>

      {/* SEARCH CARD */}
      <div className="th-card">
        <div className="th-tabs">
          <button className={trip === "oneway" ? "active" : ""} onClick={() => setTrip("oneway")}>One Way</button>
          <button className={trip === "round" ? "active" : ""} onClick={() => setTrip("round")}>Round Trip</button>
        </div>

        {/* Popular routes */}
        <div className="th-popular">
          <span className="th-popular-title">Popular:</span>
          {POPULAR.map((r, i) => (
            <button key={i} className="chip" onClick={() => { setFrom(r.from); setTo(r.to); }}>
              {r.from} → {r.to}
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate>
          <div className="th-grid">
            <CityInput label="From" value={from} onChange={setFrom} autoFocus ready={ready} />
            <button type="button" className="swap" onClick={swap} aria-label="Swap">⇆</button>
            <CityInput label="To" value={to} onChange={setTo} ready={ready} />

            <label className="field">
              <span>Depart</span>
              <input type="date" min={today} value={depart} onChange={(e) => setDepart(e.target.value)} required />
              <div className="quick">
                <button type="button" onClick={() => quickDepart("today")}>Today</button>
                <button type="button" onClick={() => quickDepart("7")}>+7d</button>
                <button type="button" onClick={() => quickDepart("30")}>+30d</button>
                <button type="button" onClick={() => quickDepart("wknd")}>Weekend</button>
              </div>
            </label>

            <label className="field">
              <span>Return</span>
              <input type="date" min={depart || today} value={ret} onChange={(e) => setRet(e.target.value)} disabled={trip !== "round"} />
            </label>

            {/* Travellers & Class */}
            <label className="field">
              <span>Travellers | Class</span>
              <button type="button" className="travBtn" onClick={() => setShowTrav((s) => !s)} aria-expanded={showTrav}>
                {paxSummary}
              </button>

              {showTrav && (
                <div className="trav-pop">
                  {[
                    { key: "adults", label: "Adults", hint: "12+ years" },
                    { key: "children", label: "Children", hint: "2–12 years" },
                    { key: "infants", label: "Infants", hint: "< 2 years" },
                  ].map(({ key, label, hint }) => (
                    <div className="row" key={key}>
                      <div className="left">
                        <div className="role">{label}</div>
                        <div className="hint">{hint}</div>
                      </div>
                      <div className="right">
                        <button type="button" onClick={() => bump(key, -1)}>-</button>
                        <span>{trav[key]}</span>
                        <button type="button" onClick={() => bump(key, 1)}>+</button>
                      </div>
                    </div>
                  ))}

                  <div className="classes">
                    {CLASSES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={trav.cls === c ? "cls active" : "cls"}
                        onClick={() => setTrav((p) => ({ ...p, cls: c }))}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="pop-actions">
                    <button
                      type="button"
                      className="clear"
                      onClick={() => { setTrav(DEFAULT_TRAV); setShowTrav(false); }}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="apply"
                      onClick={() => {
                        setTrav((p) => {
                          let a = Math.max(0, p.adults);
                          let c = Math.max(0, p.children);
                          let i = Math.max(0, p.infants);
                          if (a === 0 && (c > 0 || i > 0)) a = 1;
                          if (i > a) i = a;
                          return { ...p, adults: a, children: c, infants: i };
                        });
                        setShowTrav(false);
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </label>

            <button className="searchBtn" type="submit">SEARCH</button>
          </div>

          {err && <div className="error">{err}</div>}
        </form>
      </div>
    </div>
  );
}
