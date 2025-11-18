import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./ProductSlider.css";
import { CartContext } from "../context/CartContext";

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  // refs for header navigation buttons
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get("https://fakestoreapi.com/products")
      .then((res) => {
        if (mounted) setProducts(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section className="ps-outer header-arrows">
      <div className="ps-inner">
        {/* Header with title + arrows aligned to right */}
        <div className="ps-header">
          <h2 className="ps-heading">Featured <span>Products</span></h2>

          <div className="ps-nav-arrows">
            <button ref={prevRef} className="ps-nav-btn ps-nav-prev" aria-label="Previous">
              ‹
            </button>
            <button ref={nextRef} className="ps-nav-btn ps-nav-next" aria-label="Next">
              ›
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="ps-slider-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            loop={false}
            centeredSlides={false}
            slidesPerView={3}
            spaceBetween={18}
            slidesPerGroup={1}
            autoplay={{ delay: 3500, disableOnInteraction: true }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 12 },
              480: { slidesPerView: 2, spaceBetween: 12 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            // wire header buttons into Swiper navigation reliably
            onBeforeInit={(swiper) => {
              // eslint-disable-next-line no-param-reassign
              swiper.params.navigation.prevEl = prevRef.current;
              // eslint-disable-next-line no-param-reassign
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            pagination={{
              el: ".custom-pagination",
              clickable: true,
              bulletClass: "swiper-pagination-bullet custom-dot",
              bulletActiveClass: "swiper-pagination-bullet-active custom-dot-active",
              renderBullet: (index, className) => {
                if (index >= 5) return ""; // show only 5 bullets
                return `<span class="${className}"></span>`;
              },
            }}
          >
            {products.map((p) => (
              <SwiperSlide key={p.id} className="ps-slide">
                <article className="ps-card" aria-label={p.title}>
                  <div className="ps-img-wrap" title={p.title}>
                    <img src={p.image} alt={p.title} className="ps-img" loading="lazy" />
                  </div>

                  <div className="ps-body">
                    <h3 className="ps-title">
                      {p.title.length > 60 ? p.title.slice(0, 57) + "…" : p.title}
                    </h3>

                    <div className="ps-footer">
                      <div className="ps-price">₹{Number(p.price).toLocaleString()}</div>

                      <button
                        className="ps-add"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                        aria-label={`Add ${p.title} to cart`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* external pagination container (below slider) */}
        <div className="custom-pagination" aria-hidden="false" />
      </div>
    </section>
  );
};

export default ProductSlider;
