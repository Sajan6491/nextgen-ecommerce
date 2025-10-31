import React from "react";
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./FurnitureDeals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const furnitureProducts = [
  {
    id: 1,
    name: "Mattress",
    price: "₹2,990",
    image: "https://www.duroflexworld.com/cdn/shop/files/2_bb2c85e4-2660-4a27-b220-9c81e4f76149.jpg?v=1744560691",
    link: "/plp?category=mattress",
  },
  {
    id: 2,
    name: "Sofa & Sectional",
    price: "₹7,999",
    image: "https://images-cdn.ubuy.co.in/65a1843783da5257de4a7903-honbay-modern-linen-fabric-couch-l-shape.jpg",
    link: "/plp?category=sofa",
  },
  {
    id: 3,
    name: "Office Study Chair",
    price: "₹1,890",
    image: "https://www.jiomart.com/images/product/original/494338153/classela-boom-black-mesh-mid-back-revolving-office-chair-with-head-rest-height-adjustment-and-tilt-mechanism-work-from-home-chair-diy-product-images-o494338153-p607352759-0-202412100709.jpg?im=Resize=(420,420)",
    link: "/plp?category=chair",
  },
  {
    id: 4,
    name: "Beds",
    price: "₹1,790",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTI28to4dm3UR81YRa1opz16YuveuEu5kLHnMuTIoou1j8ViKKXG4gOcHVb_2gp8-hTOT8oj1Sp10o4HJET1ZJZKv62n5Rn6FSRmOAmtnM",
    link: "/plp?category=bed",
  },
  {
    id: 5,
    name: "TV Unit",
    price: "₹1,249",
    image: "https://m.media-amazon.com/images/I/71H8B1O5nVL.jpg",
    link: "/plp?category=tv-unit",
  },
  {
    id: 6,
    name: "Sofa Bed",
    price: "₹6,099",
    image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT28DQ0i2nw4C-9PJBJv2xV-MkkS6a_fSlU35tCwATeIb7MX0gpyMQMvtd1EhF7xaYqgxuC1OQEx2mql6xjIfr_Ew7YUzvQ4UA-O5yy-5c",
    link: "/plp?category=sofabed",
  },
  {
    id: 7,
    name: "Sofa Set",
    price: "₹21,999",
    image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSPZ6hVaaGSOHnkn_Oibl9xjwUBWYUNnGYCpwYC9T2hOWj9jGxbOm_N73P0859PUUDrj9LxeKzSZG6belFM5n8MalZA59IvbPwjS11LYa0K",
    link: "/plp?category=sofaset",
  },
];

// Custom Arrows
function PrevArrow({ onClick }) {
  return (
    <div className="custom-arrow prev" onClick={onClick}>
      <FaChevronLeft />
    </div>
  );
}

function NextArrow({ onClick }) {
  return (
    <div className="custom-arrow next" onClick={onClick}>
      <FaChevronRight />
    </div>
  );
}

export default function FurnitureDeals() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="furniture-deals-wrapper">
      <div className="furniture-deals">
        <div className="fd-header">
          <h2>Furniture Deals</h2>
        </div>

        <Slider {...settings}>
          {furnitureProducts.map((item) => (
            <div key={item.id} className="fd-card">
              <a href={item.link} className="fd-link">
                <div className="fd-image-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                </div>
                <div className="fd-info">
                  <h4>{item.name}</h4>
                  <p className="fd-price">From {item.price}</p>
                </div>
              </a>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
