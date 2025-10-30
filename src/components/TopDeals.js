import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./TopDeals.css";

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$59.99",
    image: "https://picsum.photos/seed/headphones/400/300",
  },
  {
    id: 2,
    name: "Smartwatch",
    price: "$89.99",
    image: "https://picsum.photos/seed/watch/400/300",
  },
  {
    id: 3,
    name: "Bluetooth Speaker",
    price: "$39.99",
    image: "https://picsum.photos/seed/speaker/400/300",
  },
  {
    id: 4,
    name: "Gaming Mouse",
    price: "$29.99",
    image: "https://picsum.photos/seed/mouse/400/300",
  },
  {
    id: 5,
    name: "Laptop Stand",
    price: "$24.99",
    image: "https://picsum.photos/seed/laptop/400/300",
  },
];

const TopDeals = () => {
  return (
    <section className="top-deals">
      <div className="container">
        <h2 className="section-title">🔥 Top Deals</h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="deal-card">
                <div className="deal-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="deal-image"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/400x300?text=No+Image")
                    }
                  />
                </div>
                <div className="deal-content">
                  <h3 className="deal-name">{product.name}</h3>
                  <p className="deal-price">{product.price}</p>
                  <button className="deal-btn">Add to Cart</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TopDeals;
