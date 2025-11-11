import React, { useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./ThankYouPage.css";

function useQuery() {
  const search = useLocation().search;
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ThankYouPage() {
  const nav = useNavigate();
  const q = useQuery();
  const ref = q.get("ref") || "—";

  // Read saved booking data
  const booking = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("lastBooking");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const airline = booking?.airline || "—";
  const route = booking ? `${booking.from} → ${booking.to}` : "—";
  const duration = booking?.duration || "—";
  const stops = booking ? (booking.nonstop ? "Non-stop" : "1 stop") : "—";
  const price = booking?.price?.toLocaleString() || "—";
  const depart = booking?.depart || "—";

  const printTicket = () => window.print();

  return (
    <div className="ty-container">
      <div className="ty-card">
        <div className="ty-success">
          ✅ Booking Confirmed
        </div>

        <div className="ty-ref">
          Booking Reference: <b>{ref}</b>
        </div>

        <div className="ty-flight">
          <h2>{airline}</h2>
          <p className="ty-route">{route}</p>
          <p className="ty-info">{duration} • {stops}</p>
          <p className="ty-info">Departure On: {depart}</p>
        </div>

        <div className="ty-price">
          Total Paid: <b>₹{price}</b>
        </div>

        <div className="ty-btns">
          <button className="btn outline" onClick={printTicket}>Print Ticket</button>
          <Link className="btn" to="/">Go Home</Link>
        </div>
      </div>

      <p className="ty-small">E-ticket has been emailed. Please carry a valid ID at the airport.</p>
    </div>
  );
}
