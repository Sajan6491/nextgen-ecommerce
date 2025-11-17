import React, { useEffect, useState } from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaPhoneAlt,
  FaEnvelope,
  FaShoppingBag,
  FaChevronUp,
  FaWhatsapp
} from "react-icons/fa";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMsg("Enter a valid email.");
      return;
    }
    setMsg("Subscribed (demo).");
    setEmail("");
    setTimeout(() => setMsg(""), 2000);
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openWhatsApp() {
    window.open("https://wa.me/919877257522", "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <footer className="cg-footer" role="contentinfo" aria-label="Site footer">
        <div className="cg-top">
          <div className="cg-left">
            <span className="cg-badge">20% OFF</span>
            <FaShoppingBag className="cg-icon" />
            <div>
              <h2 className="cg-title">Shop with Confidence</h2>
              <p className="cg-sub">Fast delivery · Secure payments · 24/7 support</p>
            </div>
          </div>
          <a className="cg-visit" href="https://sajan6491.github.io/nextgen-ecommerce/#/" target="_blank" rel="noopener noreferrer">
            Visit Store
          </a>
        </div>

        <div className="cg-grid">
          <div className="cg-col">
            <h4>Store</h4>
            <a href="#">Home</a>
            <a href="#">Products</a>
            <a href="#">Best Sellers</a>
            <a href="#">Offers</a>
          </div>

          <div className="cg-col">
            <h4>Support</h4>
            <a href="#">Track Order</a>
            <a href="#">Returns</a>
            <a href="#">Shipping</a>
            <a href="#">Help Center</a>
          </div>

          <div className="cg-col">
            <h4>Policies</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Refund Policy</a>
            <a href="#">Cookie Policy</a>
          </div>

          <div className="cg-col">
            <h4>Contact & News</h4>
            <div className="cg-contact"><FaPhoneAlt /> <a href="tel:+919877257522">+91 9877257522</a></div>
            <div className="cg-contact"><FaEnvelope /> <a href="mailto:sajan6491@gmail.com">sajan6491@gmail.com</a></div>

            <form className="cg-news" onSubmit={handleSubscribe}>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="submit">Join</button>
            </form>
            <div className="cg-msg">{msg}</div>

            <div className="cg-socials">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
            </div>

            <div className="cg-payments" aria-hidden>
              <div className="cg-pay">VISA</div>
              <div className="cg-pay">MC</div>
              <div className="cg-pay">UPI</div>
            </div>
          </div>
        </div>

        <div className="cg-bottom">
          <div>© 2025 MyStore. All rights reserved.</div>
          <div className="cg-links">
            <a href="#">Sitemap</a>
            <a href="#">Contact</a>
            <a href="#">Careers</a>
          </div>
        </div>
      </footer>

      <button className="cg-ws" title="WhatsApp" onClick={openWhatsApp}><FaWhatsapp /></button>

      {showTop && (
        <button className="cg-topbtn" title="Back to top" onClick={scrollTop}><FaChevronUp /></button>
      )}
    </>
  );
}
