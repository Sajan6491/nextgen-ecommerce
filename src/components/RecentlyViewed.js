import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./RecentlyViewed.css";

const STORAGE_KEY = "recently_viewed_v1";

export default function RecentlyViewed({ max = 12 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setItems(parsed.slice(0, max));
    } catch (e) {
      console.error("RecentlyViewed parse error", e);
    }
  }, [max]);

  if (!items || items.length === 0) return null;

  const fallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect fill='%23f6f7f8' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='Arial' font-size='14'>No Image</text></svg>";

  return (
    <section className="rv-wrap">
      <div className="rv-inner">
        <div className="rv-header">
          <h3>Recently Viewed</h3>
          <p className="rv-sub">Items you saw recently — pick up where you left off</p>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={18}
          slidesPerView={5}
          navigation
          autoplay={{ delay: 3500, disableOnInteraction: true }}
          breakpoints={{
            320: { slidesPerView: 1.2 },
            520: { slidesPerView: 2.2 },
            768: { slidesPerView: 3.2 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="rv-swiper"
        >
          {items.map((p) => (
            <SwiperSlide key={p.id}>
              <Link to={`/product/${p.id}`} className="rv-card">
                <div className="rv-badge">{p.badge || ""}</div>

                <div className="rv-img">
                  <img src={p.image || fallback} alt={p.title || "Product"} onError={(e) => (e.target.src = fallback)} />
                </div>

                <div className="rv-info">
                  <div className="rv-title" title={p.title}>
                    {p.title?.length > 70 ? p.title.slice(0, 68) + "…" : p.title}
                  </div>

                  <div className="rv-price-row">
                    <div className="rv-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
                    {p.oldPrice ? <div className="rv-old">₹{Number(p.oldPrice).toLocaleString("en-IN")}</div> : null}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
