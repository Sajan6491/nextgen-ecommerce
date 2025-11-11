// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SurpriseButton from "./components/SurpriseButton";
import WhatsAppChat from "./components/WhatsAppChat";
import { CartProvider } from "./context/CartContext";

// NEW home hero + existing home sections
import HeroSlider from "./components/HeroSlider";
import FeaturedProducts from "./components/FeaturedProducts";
import ProductList from "./components/ProductList";
import ShopYourFavorites from "./components/ShopYourFavorites";
import TopDeals from "./components/TopDeals";
import FurnitureDeals from "./components/FurnitureDeals";
import ProductSlider from "./components/ProductSlider"; // from old app (kept)

// Product & category pages (old app)
import ProductDetail from "./components/ProductDetail";
import TShirtsPage from "./components/TShirtsPage";
import JeansPage from "./components/JeansPage";
import MenPage from "./components/MenPage";
import AccessoriesPage from "./components/AccessoriesPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";

// Travel flow (new app)
import TravelHome from "./pages/TravelHome";
import TravelSearch from "./pages/TravelSearch";

// Shared page(s)
import ThankYouPage from "./pages/ThankYouPage";
import ProductListPage from "./pages/ProductListPage";

// Slick CSS (needed for ProductSlider)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <>
                {/* New hero. If HeroSlider CTA goes to /travel, it still works */}
                <HeroSlider />
                <FeaturedProducts />
                <ProductList />
                <ShopYourFavorites />
                <TopDeals />
                <FurnitureDeals />
                {/* Keep ProductSlider from old app (optional; remove if not needed) */}
                <ProductSlider />
                {/* <FAQ /> // if you want it back later */}
              </>
            }
          />

          {/* Product & Category routes (old) */}
          <Route path="/men" element={<MenPage />} />
          <Route path="/men/t-shirts" element={<TShirtsPage />} />
          <Route path="/men/jeans" element={<JeansPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/plp" element={<ProductListPage />} />

          {/* Cart / Checkout (old) */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Travel flow (new) */}
          <Route path="/travel" element={<TravelHome />} />
          <Route path="/travel/search" element={<TravelSearch />} />

          {/* Shared */}
          <Route path="/thank-you" element={<ThankYouPage />} />
        </Routes>

        <Footer />
        <SurpriseButton />
        <WhatsAppChat />
      </Router>
    </CartProvider>
  );
}

export default App;
