// src/components/Footer.jsx
import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col about">
          <h4>MyStore</h4>
          <p>Quality goods, great prices. Fast delivery and secure shopping.</p>
          <div className="socials">
            <a href="#" aria-label="facebook">📘 Facebook</a>
            <a href="#" aria-label="instagram">📸 Instagram</a>
            <a href="#" aria-label="twitter">🐦 Twitter</a>
          </div>
        </div>

        <div className="footer-col links">
          <h5>Quick Links</h5>
          <a href="/shop">Shop</a>
          <a href="/men">Men</a>
          <a href="/wishlist">Wishlist</a>
          <a href="/travel">Travel</a>
        </div>

        <div className="footer-col support">
          <h5>Support</h5>
          <a href="/contact">Contact Us</a>
          <a href="/faq">FAQ</a>
          <a href="/returns">Returns</a>
          <a href="/shipping">Shipping</a>
        </div>

        <div className="footer-col newsletter">
          <h5>Join our newsletter</h5>
          <p>Get 10% off your first order.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" aria-label="email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MyStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
