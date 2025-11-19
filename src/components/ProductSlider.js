import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./ProductSlider.css";
import { CartContext } from "../context/CartContext";

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products")
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <section className="ps-outer header-arrows">
      <div className="ps-inner">

        {/* HEADER WITH ARROWS */}
        <div className="ps-header">
          <h2 className="ps-heading">Featured <span>Products</span></h2>

          <div className="ps-nav-arrows">
            <button ref={prevRef} className="ps-nav-btn">‹</button>
            <button ref={nextRef} className="ps-nav-btn">›</button>
          </div>
        </div>

        <div className="ps-slider-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            pagination={{
              el: ".custom-pagination",
              clickable: true,
              bulletClass: "custom-dot",
              bulletActiveClass: "custom-dot-active",
              renderBullet: (i, className) =>
                i < 5 ? `<span class="${className}"></span>` : "",
            }}
            slidesPerView={6}
            spaceBetween={20}
            autoplay={{ delay: 3000 }}
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 6 },
            }}
          >
            {products.map((p) => (
              <SwiperSlide key={p.id} className="ps-slide">

                <article className="ps-card">

                  {/* PRODUCT CLICKABLE SECTION */}
                  <Link to={`/product/${p.id}`} className="ps-card-link">
                    <div className="ps-img-wrap">
                      <img src={p.image} alt={p.title} className="ps-img" />
                    </div>

                    <div className="ps-body">
                      <h3 className="ps-title">{p.title}</h3>
                    </div>
                  </Link>

                  {/* ADD TO CART — OUTSIDE LINK!!! */}
                  <div className="ps-footer">
                    <div className="ps-price">₹{p.price}</div>

                    <button
                      className="ps-add"
                      onClick={() => addToCart(p)}  // NOW WORKS ALWAYS
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>

              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="custom-pagination"></div>
      </div>
    </section>
  );
};

export default ProductSlider;
