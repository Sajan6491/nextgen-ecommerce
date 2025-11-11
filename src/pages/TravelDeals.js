import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import "./TravelDeals.css";

const SAMPLE = [
  { id: 1, title: "Economy Saver", price: 4499 },
  { id: 2, title: "Flexi Economy", price: 6299 },
  { id: 3, title: "Business Promo", price: 13499 },
];

export default function TravelDeals() {
  const { airline } = useParams();
  const code = new URLSearchParams(useLocation().search).get("code");

  return (
    <div className="td-wrap">
      <div className="td-top">
        <h1>Deals • {airline?.toUpperCase()}</h1>
        <Link to="/" className="td-back">← Home</Link>
      </div>

      {code && <div className="td-code">Promo Code applied: <b>{code}</b></div>}

      <div className="td-grid">
        {SAMPLE.map((d) => (
          <div key={d.id} className="td-card">
            <div className="td-title">{d.title}</div>
            <div className="td-price">₹{d.price.toLocaleString()}</div>
            <button className="td-btn">View</button>
          </div>
        ))}
      </div>
    </div>
  );
}
