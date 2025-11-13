// src/components/Toast.jsx
import React from "react";

export default function Toast({ items = [], onDismiss = () => {} }) {
  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {items.map((it) => (
        <div key={it.id} className={`toast ${it.type === "success" ? "success" : ""}`}>
          <span>{it.text}</span>
          <button
            onClick={() => onDismiss(it.id)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}
            aria-label="dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
