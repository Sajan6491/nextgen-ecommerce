import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./ProductSlider.css";

import { CartContext } from "../context/CartContext";

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios
      .get("https://fakestoreapi.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading products...</p>;

  return (
    <section className="ps-outer">
      <div className="ps-container">
        <h2 className="ps-heading">Featured <span>Products</span></h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay, A11y]}
          navigation
          autoplay={{ delay: 3500, disableOnInteraction: true }}
          loop={false}
          centeredSlides={false}
          slidesPerView={3}
          spaceBetween={18}
          slidesPerGroup={1}
          pagination={{
            clickable: true,
            renderBullet: function (index, className) {
              if (index >= 5) return ""; 
              return `<span class="${className} custom-dot"></span>`;
            },
          }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 14 },
            1024: { slidesPerView: 4, spaceBetween: 16 },
            1280: { slidesPerView: 6, spaceBetween: 18 },
          }}
        >
          {products.map((p) => (
            <SwiperSlide key={p.id} className="ps-slide">
              <article className="ps-card">
                <div className="ps-img-wrap">
                  <img src={p.image} alt={p.title} className="ps-img" loading="lazy" />
                </div>

                <div className="ps-body">
                  <h3 className="ps-title" title={p.title}>
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
    </section>
  );
};

export default ProductSlider;
