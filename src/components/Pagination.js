import React from "react";
import "../pages/ShopPage.css";

export default function Pagination({ page, totalPages, onChange }) {
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start < windowSize - 1) start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button onClick={() => onChange(1)} className="page-btn" disabled={page===1}>«</button>
      <button onClick={() => onChange(page-1)} className="page-btn" disabled={page===1}>‹</button>

      {start > 1 && <span className="dots">...</span>}
      {pages.map(p => <button key={p} onClick={() => onChange(p)} className={`page-btn ${page===p ? 'active' : ''}`} aria-current={page===p ? 'page' : undefined}>{p}</button>)}
      {end < totalPages && <span className="dots">...</span>}

      <button onClick={() => onChange(page+1)} className="page-btn" disabled={page===totalPages}>›</button>
      <button onClick={() => onChange(totalPages)} className="page-btn" disabled={page===totalPages}>»</button>
    </div>
  );
}
