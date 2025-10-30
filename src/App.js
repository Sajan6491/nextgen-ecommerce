import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import Footer from "./components/Footer";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import TShirtsPage from "./components/TShirtsPage";
import JeansPage from "./components/JeansPage";
import MenPage from "./components/MenPage";
import AccessoriesPage from "./components/AccessoriesPage";
import ProductSlider from "./components/ProductSlider";
import FAQ from "./components/FAQ";
import SurpriseButton from "./components/SurpriseButton";
import WhatsAppChat from "./components/WhatsAppChat";
import { CartProvider } from "./context/CartContext";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ThankYouPage from "./pages/ThankYouPage";
import ShopYourFavorites from "./components/ShopYourFavorites";

function App() {
  return (
    <CartProvider>
   <Router>
  <Navbar />
  <Routes>
    {/* Home Page */}
    <Route
      path="/"
      element={
        <>
          <Hero />
          <FeaturedProducts />
          <ProductList />
          <ShopYourFavorites />
          <ProductSlider />
          <FAQ />
        </>
      }
    />
    <Route path="/men" element={<MenPage />} />
    <Route path="/men/t-shirts" element={<TShirtsPage />} />
    <Route path="/men/jeans" element={<JeansPage />} />
    <Route path="/accessories" element={<AccessoriesPage />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/product/:id" element={<ProductDetail />} />
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
