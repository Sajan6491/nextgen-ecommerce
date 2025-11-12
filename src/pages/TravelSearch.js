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
    const price = 3999 + Math.round(rand(i + 7) * 9000) + (nonstop ? 700 : 0); // per-person
    const depDate = depart || new Date().toISOString().slice(0, 10);
    const depTimeStartMin = 6 * 60; // 06:00 earliest
    const depTime = depTimeStartMin + Math.round(rand(i + 11) * 12 * 60); // up to 18:00
    const depAt = addMinutes(`${depDate}T00:00:00`, depTime);
    const arrAt = addMinutes(depAt.toISOString(), dur + (nonstop ? 0 : 50));
    rows.push({
      id: `${al.code}-${i + 1}`,
      airlineCode: al.code,
      airline: al.name,
      price, // per-person price
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

/* --- load Razorpay script (only once) --- */
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

/* --- main component --- */
export default function TravelSearch() {
  const nav = useNavigate();
  const qs = useLocation().search;
  const data = useMemo(() => parseQS(qs), [qs]);
  const valid = Boolean(data.from && data.to && data.depart);

  // passengers & class (from query)
  const adults = Math.max(0, Number(data.adults ?? 1));
  const children = Math.max(0, Number(data.children ?? 0));
  const infants = Math.max(0, Number(data.infants ?? 0));
  const totalPax = Math.max(1, adults + children + infants);
  const cls = data.cls || "Economy";

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
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      case "priceAsc": rows.sort((a, b) => a.price - b.price); break;      // per-person
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

  const onBook = (r) => {
    const perPersonFees = 750;
    const perPersonBase = Math.max(0, r.price - perPersonFees);
    const totalPrice = r.price * totalPax;
    const totalBase = perPersonBase * totalPax;
    const totalFees = perPersonFees * totalPax;
    setSelected({ ...r, perPersonBase, totalBase, totalFees, totalPrice });
    setErrorMsg("");
  };
  const onCloseModal = () => { setSelected(null); setPaying(false); setErrorMsg(""); };

  // ---- PAYMENT ----
  const payNow = async () => {
    if (!selected) return;
    try {
      setPaying(true);
      await loadRazorpay();

      // amount in paise
      const amountPaise = selected.totalPrice * 100;

      const key =
        process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_1DP5mmOlF5G5ag"; // demo key; replace in prod

      const options = {
        key,
        amount: amountPaise,
        currency: "INR",
        name: "Your Travel Co.",
        description: `${selected.airline} • ${selected.from} → ${selected.to}`,
        // For a production app, create an order on server and pass order_id
        // order_id: "<server-generated-order-id>",
        handler: function (response) {
          // success
          const ref = `${selected.airlineCode}${Date.now().toString().slice(-6)}`;
          nav(
            `/thank-you?ref=${encodeURIComponent(ref)}&from=${encodeURIComponent(
              selected.from
            )}&to=${encodeURIComponent(selected.to)}&payment_id=${encodeURIComponent(
              response.razorpay_payment_id || ""
            )}`
          );
        },
        modal: {
          ondismiss: function () {
            // user closed without paying
            setPaying(false);
          },
        },
        prefill: {
          name: data.name || "Traveller",
          email: data.email || "test@example.com",
          contact: data.phone || "9999999999",
        },
        notes: {
          cls,
          adults: String(adults),
          children: String(children),
          infants: String(infants),
        },
        theme: { color: "#2f5bea" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        upi: { /* enable UPI intent and collect */ },
        remember_customer: true,
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setErrorMsg(resp?.error?.description || "Payment failed. Please try again.");
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      setErrorMsg(e.message || "Unable to start payment.");
      setPaying(false);
    }
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
        <span>Pax: <b>{adults}A, {children}C, {infants}I • {cls}</b></span>
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
                <option value="priceAsc">Price: Low → High (per person)</option>
                <option value="priceDesc">Price: High → Low (per person)</option>
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
                          <div className="pp">
                            ₹{r.price.toLocaleString()} per person × {totalPax}
                          </div>
                        </div>
                        <button
                          className="ts-btn"
                          onClick={() =>
                            onBook({ ...r, perPersonBase, totalBase, totalFees, totalPrice })
                          }
                        >
                          Book
                        </button>
                      </div>
                    </li>
                  );
                })}
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

      {/* booking modal */}
      {selected && (
        <div className="bk-backdrop" onClick={onCloseModal}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bk-header">
              <div className="bk-title">Review & Pay</div>
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

              {/* pax + class */}
              <div className="bk-row">
                <div>
                  <div className="bk-label">Travellers</div>
                  <div className="bk-val">
                    {adults} Adult(s){children ? `, ${children} Child(ren)` : ""}{infants ? `, ${infants} Infant(s)` : ""} • {cls}
                  </div>
                </div>
              </div>

              {/* fare box */}
              <div className="fare">
                <div className="line">
                  <span>Base Fare</span>
                  <span>₹{selected.totalBase.toLocaleString()}</span>
                </div>
                <div className="line">
                  <span>Taxes & Fees</span>
                  <span>₹{selected.totalFees.toLocaleString()}</span>
                </div>
                <div className="line note">
                  <span>Per person</span>
                  <span>₹{selected.perPersonBase.toLocaleString()} + ₹{(750).toLocaleString()}</span>
                </div>
                <div className="line total">
                  <span>Total ({totalPax} traveller{totalPax > 1 ? "s" : ""})</span>
                  <span>₹{selected.totalPrice.toLocaleString()}</span>
                </div>

                {errorMsg && <div className="bk-error">{errorMsg}</div>}
              </div>
            </div>

            <div className="bk-actions">
              <button className="bk-secondary" onClick={onCloseModal} disabled={paying}>Back</button>
              <button className="bk-primary" onClick={payNow} disabled={paying}>
                {paying ? "Opening Razorpay…" : "Pay with Razorpay (UPI / Card / Netbanking)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
