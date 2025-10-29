import React from "react";
import { motion } from "framer-motion";

const Hero = () => (
  <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: "center", padding: "80px 20px", background: "linear-gradient(90deg, #ff9a9e, #fad0c4)", color: "#fff" }}>
    <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Welcome to MyStore</h1>
    <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>Discover amazing products at the best prices!</p>
    <motion.button whileHover={{ scale: 1.1 }} style={{ padding: "15px 30px", borderRadius: "8px", border: "none", background: "#fff", color: "#1e1e2f", cursor: "pointer" }}>
      Shop Now
    </motion.button>
  </motion.section>
);

export default Hero;
