import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./TravelSearch.css";

/* --- helpers --- */
const AIRLINES = [
  { code: "AI", name: "Air India" },
  { code: "6E", name: "IndiGo" },
  { code: "UK", name: "Vistara" },
  { code: "SG", name: "SpiceJet" },
  { code: "G8", name: "Go First" },
];

function parseQS(search) {
  const p = new URLSearchParams(search);
  return Object.fromEntries(p.entries());
}

function minsToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function addMinutes(baseDateIso, minutes) {
  const d = new Date(baseDateIso);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function makeResults({ from, to, depart }) {
  // synthetic results (stable-ish)
  const base = Math.abs((from + to + depart).split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const rand = (n) => (Math.sin(base + n) + 1) / 2; // 0..1
  const rows = [];
  for (let i = 0; i < 12; i++) {
    const al = AIRLINES[i % AIRLINES.length];
    const nonstop = rand(i) > 0.35;
    const dur = 90 + Math.round(rand(i + 3) * 150); // 1.5h .. 4h
    const price = 3999 + Math.round(rand(i + 7) * 9000) + (nonstop ? 700 : 0);
    const depDate = depart || new Date().toISOString().slice(0, 10);
    const depTimeStartMin = 6 * 60; // 06:00 earliest
    const depTime = depTimeStartMin + Math.round(rand(i + 11) * 12 * 60); // up to 18:00
    const depAt = addMinutes(`${depDate}T00:00:00`, depTime);
    const arrAt = addMinutes(depAt.toISOString(), dur + (nonstop ? 0 : 50));
    rows.push({
      id: `${al.code}-${i + 1}`,
      airlineCode: al.code,
      airline: al.name,
      price,
      durationMin: dur + (nonstop ? 0 : 50),
      durationLabel: minsToHHMM(dur + (nonstop ? 0 : 50)),
      departAt: depAt,
      arriveAt: arrAt,
      nonstop,
      from,
      to,
    });
  }
  return rows;
}

/* --- main component --- */
export default function TravelSearch() {
  const nav = useNavigate();
  const qs = useLocation().search;
  const data = useMemo(() => parseQS(qs), [qs]);
  const valid = Boolean(data.from && data.to && data.depart);

  // data & ui state
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const [sort, setSort] = useState("priceAsc");
  const [airlineFilter, setAirlineFilter] = useState([]); // codes
  const [onlyNonstop, setOnlyNonstop] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // modal for booking
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!valid) return;
    setLoading(true);
    // simulate fetch delay
    const id = setTimeout(() => {
      setAll(makeResults({ from: data.from, to: data.to, depart: data.depart }));
      setLoading(false);
      setPage(1);
    }, 500);
    return () => clearTimeout(id);
  }, [valid, data.from, data.to, data.depart]);

  const airlinesInResults = useMemo(
    () => Array.from(new Set(all.map((r) => r.airlineCode))),
    [all]
  );

  const filtered = useMemo(() => {
    let rows = [...all];
    if (onlyNonstop) rows = rows.filter((r) => r.nonstop);
    if (airlineFilter.length) rows = rows.filter((r) => airlineFilter.includes(r.airlineCode));
    switch (sort) {
      case "priceAsc": rows.sort((a, b) => a.price - b.price); break;
      case "priceDesc": rows.sort((a, b) => b.price - a.price); break;
      case "duration": rows.sort((a, b) => a.durationMin - b.durationMin); break;
      case "airline": rows.sort((a, b) => a.airline.localeCompare(b.airline)); break;
      default: break;
    }
    return rows;
  }, [all, sort, airlineFilter, onlyNonstop]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  const onToggleAirline = (code) => {
    setPage(1);
    setAirlineFilter((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const onBook = (r) => setSelected(r);
  const onCloseModal = () => setSelected(null);
  const onConfirm = () => {
    // send to thank-you with a booking ref in the URL
    const ref = encodeURIComponent(`${selected.airlineCode}${Date.now().toString().slice(-6)}`);
    nav(`/thank-you?ref=${ref}&from=${encodeURIComponent(selected.from)}&to=${encodeURIComponent(selected.to)}`);
  };

  return (
    <div className="ts-wrap">
      <div className="ts-top">
        <h1>Flight Search</h1>
        <Link to="/" className="ts-back">← Home</Link>
      </div>

      {/* Route summary chips */}
      <div className="ts-chipbar">
        <span>Trip: <b>{data.trip || "-"}</b></span>
        <span>From: <b>{data.from || "-"}</b></span>
        <span>To: <b>{data.to || "-"}</b></span>
        <span>Depart: <b>{data.depart || "-"}</b></span>
        <span>Return: <b>{data.return || "—"}</b></span>
        <span>Pax: <b>{data.pax || "-"}</b></span>
      </div>

      {!valid && (
        <div className="ts-empty">
          Please start a search from the travel page.{" "}
          <Link to="/#/travel">Go to Travel</Link>
        </div>
      )}

      {valid && (
        <>
          {/* controls */}
          <div className="ts-controls">
            <div className="ts-leftCtrl">
              <label className="ts-switch">
                <input
                  type="checkbox"
                  checked={onlyNonstop}
                  onChange={(e) => { setOnlyNonstop(e.target.checked); setPage(1); }}
                />
                <span className="slider" />
                <em>Non-stop only</em>
              </label>

              <div className="ts-airlines">
                {AIRLINES.filter(a => airlinesInResults.includes(a.code)).map((a) => (
                  <label key={a.code} className={`ts-chip ${airlineFilter.includes(a.code) ? "active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={airlineFilter.includes(a.code)}
                      onChange={() => onToggleAirline(a.code)}
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="ts-rightCtrl">
              <label className="sortLbl">Sort:</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="ts-sort"
              >
                <option value="priceAsc">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="duration">Duration</option>
                <option value="airline">Airline (A–Z)</option>
              </select>
              <div className="ts-count">{filtered.length} results</div>
            </div>
          </div>

          {/* list */}
          <ul className="ts-list">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i} className="ts-card skeleton">
                    <div className="sk-left" />
                    <div className="sk-right" />
                  </li>
                ))
              : visible.map((r) => (
                  <li key={r.id} className="ts-card">
                    <div className="ts-left">
                      <div className="ts-airline">{r.airline}</div>
                      <div className="ts-times">
                        <div className="time">
                          <div className="t">{fmtTime(r.departAt)}</div>
                          <div className="city">{r.from}</div>
                        </div>
                        <div className="mid">
                          <span className="dur">{r.durationLabel}</span>
                          <span className="dots" />
                          <span className="stops">{r.nonstop ? "Non-stop" : "1 stop"}</span>
                        </div>
                        <div className="time">
                          <div className="t">{fmtTime(r.arriveAt)}</div>
                          <div className="city">{r.to}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ts-right">
                      <div className="ts-price">₹{r.price.toLocaleString()}</div>
                      <button className="ts-btn" onClick={() => onBook(r)}>Book</button>
                    </div>
                  </li>
                ))}
          </ul>

          {/* pagination */}
          {!loading && page * PAGE_SIZE < filtered.length && (
            <div className="ts-pager">
              <button className="load-more" onClick={() => setPage((p) => p + 1)}>
                Load more
              </button>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="ts-empty">No matching flights. Try clearing filters.</div>
          )}
        </>
      )}

      {/* DEBUG (optional) */}
      {/* <pre className="ts-debug">{JSON.stringify(data, null, 2)}</pre> */}

      {/* booking modal */}
      {selected && (
        <div className="bk-backdrop" onClick={onCloseModal}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bk-header">
              <div className="bk-title">Review & Book</div>
              <button className="bk-close" onClick={onCloseModal}>✕</button>
            </div>
            <div className="bk-body">
              <div className="bk-row">
                <div className="bk-air">{selected.airline}</div>
                <div className="bk-route">{selected.from} → {selected.to}</div>
              </div>
              <div className="bk-row">
                <div>
                  <div className="bk-label">Departure</div>
                  <div className="bk-val">{selected.departAt.toDateString()} • {fmtTime(selected.departAt)}</div>
                </div>
                <div>
                  <div className="bk-label">Arrival</div>
                  <div className="bk-val">{selected.arriveAt.toDateString()} • {fmtTime(selected.arriveAt)}</div>
                </div>
                <div>
                  <div className="bk-label">Duration</div>
                  <div className="bk-val">{selected.durationLabel}</div>
                </div>
                <div>
                  <div className="bk-label">Stops</div>
                  <div className="bk-val">{selected.nonstop ? "Non-stop" : "1 stop"}</div>
                </div>
              </div>

              {/* fare box */}
              <div className="fare">
                <div className="line">
                  <span>Base Fare</span>
                  <span>₹{(selected.price - 750).toLocaleString()}</span>
                </div>
                <div className="line">
                  <span>Taxes & Fees</span>
                  <span>₹{(750).toLocaleString()}</span>
                </div>
                <div className="line total">
                  <span>Total</span>
                  <span>₹{selected.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bk-actions">
              <button className="bk-secondary" onClick={onCloseModal}>Back</button>
              <button className="bk-primary" onClick={onConfirm}>Confirm & Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
