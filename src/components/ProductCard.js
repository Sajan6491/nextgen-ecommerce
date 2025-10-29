import React, { useState, useContext } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Card = styled(motion.div)`
  width: 220px;
  background: #fff;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: contain;
  border-radius: 10px;
`;

const ProductName = styled.h3`
    font-size: 1.1rem;
    margin: 10px 0 5px;
    display: -webkit-box;          /* Required for line clamp */
    -webkit-line-clamp: 2;         /* Number of lines to show */
    -webkit-box-orient: vertical;  /* Required for line clamp */
    overflow: hidden;              /* Hide overflow text */
    text-overflow: ellipsis;       /* Show ... for truncated text */
    line-height: 1.2rem;           /* Adjust line height if needed */
    height: 2.4rem;                /* line-height * 2 lines */
`;

const ProductPrice = styled.p`
  font-weight: bold;
  color: #1e1e2f;
  margin: 5px 0;
`;


const QuickModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  z-index: 1200;
`;

const QuickModal = styled(motion.div)`
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  max-width: 720px;
  width: 94%;
  display: flex;
  gap: 18px;
  align-items: center;
`;

const QuickInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const QuickClose = styled.button`
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
`;

const QuickButton = styled.button`
  position: absolute;
  right: 12px;
  top: 10px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
`;

const ProductCard = ({ product, onClick }) => {
  const [open, setOpen] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product);
    // navigate directly to checkout for a faster flow
    navigate("/checkout", { state: { singleItem: { ...product, quantity: 1 } } });
  };

  return (
    <>
      <Card
        whileHover={{ scale: 1.05, boxShadow: "0px 12px 20px rgba(0,0,0,0.2)" }}
        onClick={onClick}
      >
        <div style={{ position: "relative" }}>
          <ProductImage src={product.image} alt={product.title} />
          <QuickButton onClick={(e) => { e.stopPropagation(); setOpen(true); }}>Quick View</QuickButton>
        </div>
        <ProductName>{product.title}</ProductName>
        <ProductPrice>${product.price}</ProductPrice>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={(e) => { e.stopPropagation(); addToCart(product); alert(`${product.title} added to cart`); }} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#0b74de', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Add</button>
          <button onClick={handleBuyNow} style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: '#ff6b6b', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Buy Now</button>
        </div>
      </Card>

      {open && (
        <QuickModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <QuickModal
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <ProductImage src={product.image} alt={product.title} style={{ width: 220, height: 220, objectFit: 'contain' }} />
            <QuickInfo>
              <h3 style={{ margin: 0 }}>{product.title}</h3>
              <p style={{ margin: '8px 0' }}>{product.description?.slice(0, 200) || 'No description available.'}</p>
              <p style={{ fontWeight: 700 }}>${product.price}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => { addToCart(product); alert(`${product.title} added to cart`); }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', cursor: 'pointer' }}>Add to Cart</button>
                <button onClick={() => { addToCart(product); setOpen(false); navigate('/checkout', { state: { singleItem: { ...product, quantity: 1 } } }); }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ff6b6b', color: '#fff', cursor: 'pointer' }}>Buy Now</button>
                <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }} onClick={() => setOpen(false)}>Close</button>
              </div>
            </QuickInfo>
            <QuickClose onClick={() => setOpen(false)} aria-label="Close quick view">✖</QuickClose>
          </QuickModal>
        </QuickModalOverlay>
      )}
    </>
  );
};

export default ProductCard;
