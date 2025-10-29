import React from "react";
import { motion } from "framer-motion";

const Categories = ({ categories, selected, onSelect }) => (
  <section style={{ textAlign: "center", padding: "50px 20px" }}>
    <h2>Shop by Category</h2>
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
      {categories.map((cat, idx) => (
        <motion.button
          key={idx}
          onClick={() => onSelect(cat)}
          whileHover={{ scale: 1.1 }}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            border: "1px solid #1e1e2f",
            background: selected === cat ? "#1e1e2f" : "#fff",
            color: selected === cat ? "#fff" : "#000",
            cursor: "pointer"
          }}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  </section>
);

export default Categories;
