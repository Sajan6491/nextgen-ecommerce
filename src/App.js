// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SurpriseButton from "./components/SurpriseButton";
import WhatsAppChat from "./components/WhatsAppChat";
import { CartProvider } from "./context/CartContext";

// New hero component
import HeroPromo from "./components/HeroPromo";

// existing home sections
import HeroSlider from "./components/HeroSlider";
import FeaturedProducts from "./components/FeaturedProducts";
import ProductList from "./components/ProductList";
import ShopYourFavorites from "./components/ShopYourFavorites";
import TopDeals from "./components/TopDeals";
import FurnitureDeals from "./components/FurnitureDeals";
import ProductSlider from "./components/ProductSlider";

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

// Slick CSS (if used)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// at top imports
import HeroPromoAdvanced from "./components/HeroPromoAdvanced";
import ShopPage from "./pages/ShopPage";
import WishlistPage from "./pages/WishlistPage";

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
                {/* Promo hero at top */}
                <HeroPromo qrData="https://your-app-link.example.com" headline={"Smart Shopping\nTrusted by Millions"} sub="Upto 35% OFF on 1st app order" ctaText="Shop Now" onCTAClick={() => { window.location.hash = "#/shop"; }}/>
                <HeroSlider />
                <FeaturedProducts />
                <ProductList />
                <TopDeals />
                <FurnitureDeals />
                <ShopYourFavorites />
                <ProductSlider />
              </>
            }
          />

          {/* Product & Category routes */}
          <Route path="/men" element={<MenPage />} />
          <Route path="/men/t-shirts" element={<TShirtsPage />} />
          <Route path="/men/jeans" element={<JeansPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/plp" element={<ProductListPage />} />

          {/* Cart / Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Travel */}
          <Route path="/travel" element={<TravelHome />} />
          <Route path="/travel/search" element={<TravelSearch />} />

          {/* Shared */}
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>

        <Footer />
        <SurpriseButton />
        <WhatsAppChat />
      </Router>
    </CartProvider>
  );
}

export default App;
