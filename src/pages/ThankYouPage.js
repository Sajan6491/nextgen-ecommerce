import React from "react";
import { Link } from "react-router-dom";

const ThankYouPage = () => {
  return (
    <div style={{
      textAlign: "center",
      marginTop: "120px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>🎉 Thank You for Your Order!</h1>
      <p>We’ve received your details and will process your order soon.</p>
      <Link 
        to="/" 
        style={{
          display: "inline-block",
          marginTop: "20px",
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          textDecoration: "none"
        }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ThankYouPage;
