import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./TravelSearch.css";

/* ---------- Airlines (demo) ---------- */
const AIRLINES = [
  { code: "AI", name: "Air India" },
  { code: "6E", name: "IndiGo" },
  { code: "UK", name: "Vistara" },
  { code: "SG", name: "SpiceJet" },
  { code: "G8", name: "Go First" },
];

/* ---------- Helpers ---------- */
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

/* ---------- Fake search results ---------- */
function makeResults({ from, to, depart }) {
  const base = Math.abs((from + to + depart).split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const rand = (n) => (Math.sin(base + n) + 1) / 2;

  const rows = [];
  for (let i = 0; i < 12; i++) {
    const al = AIRLINES[i % AIRLINES.length];
    const nonstop = rand(i) > 0.35;
    const dur = 90 + Math.round(rand(i + 3) * 150);
    const price = 3999 + Math.round(rand(i + 7) * 9000) + (nonstop ? 700 : 0); // per-person
    const depDate = depart || new Date().toISOString().slice(0, 10);
    const depTime = 6 * 60 + Math.round(rand(i + 11) * 12 * 60);
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

/* ---------- Seat map helpers ---------- */
const SEAT_COLS = ["A", "B", "C", "D", "E", "F"]; // aisle between C & D
const SEAT_ROWS = 24;

function seededRand(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 1_000_000;
  return () => {
    s = (s * 1103515245 + 12345) % 2 ** 31;
    return (s & 0x7fffffff) / 0x80000000;
  };
}
function generateOccupiedSeats(flightId) {
  const rnd = seededRand(flightId);
  const taken = new Set();
  const total = SEAT_ROWS * SEAT_COLS.length;
  const count = Math.floor(total * 0.25);
  while (taken.size < count) {
    const r = 1 + Math.floor(rnd() * SEAT_ROWS);
    const c = SEAT_COLS[Math.floor(rnd() * SEAT_COLS.length)];
    taken.add(`${r}${c}`);
  }
  // keep exit rows 12–13 more open
  for (const lab of [...taken]) {
    const row = parseInt(lab, 10);
    if (row === 12 || row === 13) taken.delete(lab);
  }
  return taken;
}

/* ---------- SeatMap with interactive legend + centered fuselage ---------- */
function SeatMap({ occupied, selected, setSelected, seatsNeeded }) {
  const [show, setShow] = useState({ available: true, chosen: true, taken: true });

  const toggleLegend = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const seatState = (label) => {
    if (occupied.has(label)) return "taken";
    if (selected.includes(label)) return "chosen";
    return "available";
  };

  const onToggleSeat = (label) => {
    if (occupied.has(label)) return;
    setSelected((prev) => {
      if (prev.includes(label)) return prev.filter((s) => s !== label);
      if (prev.length >= seatsNeeded) return prev;
      return [...prev, label];
    });
  };

  return (
    <div className="plane">
      {/* Interactive legend */}
      <div className="legend legend-controls">
        <label>
          <input
            type="checkbox"
            checked={show.available}
            onChange={() => toggleLegend("available")}
          />
          <i className="sq available" />
          Available
        </label>

        <label>
          <input
            type="checkbox"
            checked={show.chosen}
            onChange={() => toggleLegend("chosen")}
          />
          <i className="sq chosen" />
          Selected
        </label>

        <label>
          <input
            type="checkbox"
            checked={show.taken}
            onChange={() => toggleLegend("taken")}
          />
          <i className="sq taken" />
          Occupied
        </label>

        <span className="exit-label">Exit rows 12–13</span>
      </div>

      {/* Centered aircraft body */}
      <div className="fuselage">
        <div className="seat-grid fx">
          {Array.from({ length: SEAT_ROWS }).map((_, ri) => {
            const row = ri + 1;
            return (
              <div key={row} className={`row ${row === 12 || row === 13 ? "exit-row" : ""}`}>
                <div className="rowno">{row}</div>

                {SEAT_COLS.map((col) => {
                  const label = `${row}${col}`;
                  const st = seatState(label); // available | chosen | taken
                  const hidden =
                    (st === "available" && !show.available) ||
                    (st === "chosen" && !show.chosen) ||
                    (st === "taken" && !show.taken);

                  return (
                    <button
                      key={label}
                      type="button"
                      title={`Seat ${label}`}
                      aria-label={`Seat ${label}`}
                      className={[
                        "seat",
                        st,
                        ["A", "F"].includes(col) ? "window" : "",
                        ["C", "D"].includes(col) ? "aisle" : "",
                        hidden ? "hidden" : "",
                      ].join(" ").trim()}
                      onClick={() => onToggleSeat(label)}
                      disabled={st === "taken"}
                    >
                      <span className="txt">{col}</span>
                    </button>
                  );
                })}

                <div className="rowno">{row}</div>
              </div>
            );
          })}
        </div>

        {/* Decorative nose & tail */}
        <div className="nose" aria-hidden />
        <div className="tail" aria-hidden />
      </div>
    </div>
  );
}

/* ---------- Razorpay loader ---------- */
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

/* ================== MAIN PAGE ================== */
export default function TravelSearch() {
  const nav = useNavigate();
  const qs = useLocation().search;
  const data = useMemo(() => parseQS(qs), [qs]);
  const valid = Boolean(data.from && data.to && data.depart);

  // pax & class from query
  const adults = Math.max(0, Number(data.adults ?? 1));
  const children = Math.max(0, Number(data.children ?? 0));
  const infants = Math.max(0, Number(data.infants ?? 0));
  const totalPax = Math.max(1, adults + children + infants);
  const seatsNeeded = Math.max(1, adults + children); // infants don’t need seats
  const cls = data.cls || "Economy";

  // list state
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const [sort, setSort] = useState("priceAsc");
  const [airlineFilter, setAirlineFilter] = useState([]);
  const [onlyNonstop, setOnlyNonstop] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // modal state
  const [selected, setSelected] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState(new Set());
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // fetch fake data
  useEffect(() => {
    if (!valid) return;
    setLoading(true);
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

  const onToggleAirline = (code) =>
    setAirlineFilter((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));

  const onBook = (r) => {
    const perPersonFees = 750;
    const perPersonBase = Math.max(0, r.price - perPersonFees);
    const totalPrice = r.price * totalPax;
    const totalBase = perPersonBase * totalPax;
    const totalFees = perPersonFees * totalPax;

    setSelected({ ...r, perPersonBase, totalBase, totalFees, totalPrice });
    setSelectedSeats([]);
    setOccupiedSeats(generateOccupiedSeats(r.id));
    setErrorMsg("");
  };

  const onCloseModal = () => {
    setSelected(null);
    setPaying(false);
    setErrorMsg("");
    setSelectedSeats([]);
  };

  const payNow = async () => {
    if (!selected) return;
    if (selectedSeats.length < seatsNeeded) {
      setErrorMsg(`Please select ${seatsNeeded} seat${seatsNeeded > 1 ? "s" : ""}.`);
      return;
    }
    try {
      setPaying(true);
      await loadRazorpay();
      const key = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag";
      const amountPaise = selected.totalPrice * 100;

      const rzp = new window.Razorpay({
        key,
        amount: amountPaise,
        currency: "INR",
        name: "Your Travel Co.",
        description: `${selected.airline} • ${selected.from} → ${selected.to}`,
        handler: (response) => {
          const ref = `${selected.airlineCode}${Date.now().toString().slice(-6)}`;
          nav(
            `/thank-you?ref=${encodeURIComponent(ref)}&from=${encodeURIComponent(
              selected.from
            )}&to=${encodeURIComponent(selected.to)}&payment_id=${encodeURIComponent(
              response.razorpay_payment_id || ""
            )}&seats=${encodeURIComponent(selectedSeats.join(","))}`
          );
        },
        prefill: { name: "Traveller", email: "test@example.com", contact: "9999999999" },
        notes: { adults, children, infants, cls, seats: selectedSeats.join(",") },
        theme: { color: "#2f5bea" },
        method: { upi: true, card: true, netbanking: true, wallet: true },
        modal: { ondismiss: () => setPaying(false) },
      });

      rzp.on("payment.failed", () => {
        setErrorMsg("Payment failed. Try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      setErrorMsg("Unable to start payment.");
      setPaying(false);
    }
  };

  return (
    <div className="ts-wrap">
      <div className="ts-top">
        <h1>Flight Search</h1>
        <Link to="/" className="ts-back">← Home</Link>
      </div>

      {/* chips */}
      <div className="ts-chipbar">
        <span>Trip: <b>{data.trip || "-"}</b></span>
        <span>From: <b>{data.from || "-"}</b></span>
        <span>To: <b>{data.to || "-"}</b></span>
        <span>Depart: <b>{data.depart || "-"}</b></span>
        <span>Return: <b>{data.return || "—"}</b></span>
        <span>Pax: <b>{adults}A, {children}C, {infants}I • {cls}</b></span>
      </div>

      {!valid && <div className="ts-empty">Please start a search on the travel page.</div>}

      {valid && (
        <>
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
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="ts-sort">
                <option value="priceAsc">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="duration">Duration</option>
                <option value="airline">Airline (A–Z)</option>
              </select>
              <div className="ts-count">{filtered.length} results</div>
            </div>
          </div>

          <ul className="ts-list">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <li key={i} className="ts-card skeleton">
                    <div className="sk-left" />
                    <div className="sk-right" />
                  </li>
                ))
              : visible.map((r) => {
                  const perPersonFees = 750;
                  const perPersonBase = Math.max(0, r.price - perPersonFees);
                  const totalPrice = r.price * totalPax;
                  const totalBase = perPersonBase * totalPax;
                  const totalFees = perPersonFees * totalPax;

                  return (
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
                        <div className="ts-price">
                          ₹{totalPrice.toLocaleString()}
                          <div className="pp">₹{r.price.toLocaleString()} × {totalPax}</div>
                        </div>
                        <button
                          className="ts-btn"
                          onClick={() => onBook({ ...r, perPersonBase, totalBase, totalFees, totalPrice })}
                        >
                          Book
                        </button>
                      </div>
                    </li>
                  );
                })}
          </ul>

          {!loading && page * PAGE_SIZE < filtered.length && (
            <div className="ts-pager">
              <button className="load-more" onClick={() => setPage((p) => p + 1)}>Load more</button>
            </div>
          )}
        </>
      )}

      {/* ===== Creative Seat Popup ===== */}
      {selected && (
        <div className="bk-backdrop" onClick={onCloseModal}>
          <div className="bk-modal bk-modal-seat" onClick={(e) => e.stopPropagation()}>
            <div className="bk-header">
              <div className="bk-title">Select Seats & Pay <span className="glow-dot" /></div>
              <button className="bk-close" onClick={onCloseModal}>✕</button>
            </div>

            <div className="bk-content">
              <div className="bk-pane bk-summary">
                <div className="bk-row top-flight">
                  <div className="air-pill">{selected.airlineCode}</div>
                  <div className="bk-air">{selected.airline}</div>
                </div>

                <div className="flight-card">
                  <div className="fc-row">
                    <div className="fc-time">
                      <div className="t">{fmtTime(selected.departAt)}</div>
                      <div className="c">{selected.from}</div>
                    </div>
                    <div className="fc-mid">
                      <span className="fc-line" />
                      <span className={`fc-stop ${selected.nonstop ? "ok" : ""}`}>{selected.nonstop ? "Non-stop" : "1 stop"}</span>
                    </div>
                    <div className="fc-time">
                      <div className="t">{fmtTime(selected.arriveAt)}</div>
                      <div className="c">{selected.to}</div>
                    </div>
                  </div>
                  <div className="fc-meta">
                    <span>{selected.departAt.toDateString()}</span>
                    <span>•</span>
                    <span>{selected.durationLabel}</span>
                    <span className="tag">{cls}</span>
                  </div>
                </div>

                <div className="fare fancy">
                  <div className="line"><span>Base Fare</span><span>₹{selected.totalBase.toLocaleString()}</span></div>
                  <div className="line"><span>Taxes & Fees</span><span>₹{selected.totalFees.toLocaleString()}</span></div>
                  <div className="line note"><span>Per person</span><span>₹{selected.perPersonBase.toLocaleString()} + ₹750</span></div>
                  <div className="line total"><span>Total ({adults + children + infants} travellers)</span><span>₹{selected.totalPrice.toLocaleString()}</span></div>
                  {errorMsg && <div className="bk-error">{errorMsg}</div>}
                </div>
              </div>

              <div className="bk-pane bk-seats">
                <div className="seatbar">
                  <div className="need">Select <b>{seatsNeeded}</b> seat{seatsNeeded > 1 ? "s" : ""} (infants don’t need a seat)</div>
                  <div className="actions">
                    <button
                      type="button"
                      className="btn-subtle"
                      onClick={() => {
                        const pref = ["A","F","C","D","B","E"]; // window → aisle → middle
                        const picks = [];
                        for (let r = 1; r <= SEAT_ROWS && picks.length < seatsNeeded; r++) {
                          for (const col of pref) {
                            const s = `${r}${col}`;
                            if (!occupiedSeats.has(s)) picks.push(s);
                            if (picks.length === seatsNeeded) break;
                          }
                        }
                        setSelectedSeats(picks);
                      }}
                    >
                      Auto-assign
                    </button>
                    <button type="button" className="btn-subtle" onClick={() => setSelectedSeats([])}>Clear</button>
                  </div>
                </div>

                <SeatMap
                  occupied={occupiedSeats}
                  selected={selectedSeats}
                  setSelected={setSelectedSeats}
                  seatsNeeded={seatsNeeded}
                />
              </div>
            </div>

            <div className="bk-footer">
              <div className="bk-picked">Seats: {selectedSeats.length ? selectedSeats.join(", ") : "—"}</div>
              <div className="bk-total">
                <div className="amt">₹{selected.totalPrice.toLocaleString()}</div>
                <div className="sub">incl. taxes & fees</div>
              </div>
              <button className="bk-primary" onClick={payNow} disabled={paying || selectedSeats.length < seatsNeeded}>
                {paying ? "Opening Razorpay…" : "Pay now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
