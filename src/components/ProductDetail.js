import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";

/* ---------------------------
  Recently viewed helper
---------------------------- */
const RV_KEY = "recently_viewed_v1";
function addRecentlyViewed(product) {
  try {
    if (!product || !product.id) return;
    const raw = localStorage.getItem(RV_KEY);
    const list = raw ? JSON.parse(raw) : [];

    // remove any existing entry with same id
    const cleaned = list.filter((p) => p.id !== product.id);

    // build compact entry
    const entry = {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      oldPrice: product.oldPrice || product.previousPrice || null,
      badge: product.badge || "",
    };

    // add to front
    cleaned.unshift(entry);

    // trim length
    const trimmed = cleaned.slice(0, 24);
    localStorage.setItem(RV_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("addRecentlyViewed error", e);
  }
}

/* ---------------------------
  Styled components (responsive + overflow-safe)
---------------------------- */

const PageWrapper = styled.div`
  width: 100%;
  overflow-x: hidden; /* prevent horizontal scroll */
  box-sizing: border-box;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  padding: 40px 20px;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;

  /* smaller gaps & padding on narrow screens */
  @media (max-width: 768px) {
    gap: 20px;
    padding: 20px 12px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const ImageWrap = styled.div`
  flex: 0 0 340px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`;

const Image = styled.img`
  width: 100%;
  max-width: 340px;
  height: 340px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
  box-shadow: 0 8px 26px rgba(15, 23, 42, 0.06);

  @media (max-width: 420px) {
    height: auto;
    max-width: 100%;
  }
`;

const Info = styled.div`
  flex: 1 1 460px;
  max-width: 640px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    max-width: 100%;
    flex: 1 1 100%;
  }
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin: 6px 0 12px;
`;

const Price = styled.p`
  font-weight: 700;
  font-size: 1.3rem;
  margin: 6px 0 14px;
  color: #0b74de;
`;

const Desc = styled.p`
  color: #555;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const SwatchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
`;

const ColorSwatch = styled(motion.div)`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.active ? "#000" : "#ddd")};
  background-color: ${(props) => props.color};
  cursor: pointer;
  box-sizing: border-box;
`;

const VariationButton = styled.button`
  margin-right: 10px;
  margin-top: 8px;
  padding: 8px 14px;
  border: 1px solid #1e1e2f;
  cursor: pointer;
  border-radius: 6px;
  background: ${(props) => (props.active ? "#1e1e2f" : "#fff")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  transition: 0.15s;
`;

const AddCartButton = styled(motion.button)`
  margin-top: 18px;
  padding: 12px 20px;
  background: #1e1e2f;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
`;

const SelectedInfo = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #333;
`;

/* ---------------------------
  Component
---------------------------- */

const ProductDetail = () => {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const colors = ["#000000", "#ff0000", "#1e90ff", "#008000"];
  const sizes = ["Small", "Medium", "Large"];

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    let mounted = true;
    axios
      .get(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!mounted) return;
        setProduct(res.data);

        // add to recently viewed (safe)
        try {
          addRecentlyViewed(res.data);
        } catch (e) {
          // non-fatal
          console.error(e);
        }
      })
      .catch((err) => console.error(err));

    return () => (mounted = false);
  }, [id]);

  if (!product) return <p style={{ padding: 20 }}>Loading...</p>;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select color and size!");
      return;
    }

    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      image: product.image,
      quantity: 1,
    };

    // call CartContext's addToCart (many contexts accept addToCart(item, qty) or addToCart(item))
    // if your context expects 2 args use addToCart(cartItem, 1) — otherwise adjust as needed.
    // We'll attempt both patterns safely:
    try {
      addToCart(cartItem, 1);
    } catch {
      try {
        addToCart(cartItem);
      } catch (e) {
        console.error("addToCart failed", e);
      }
    }

    // small non-blocking visual feedback can be added instead of alert
    alert(`Added "${product.title}" (${selectedSize}) to cart`);
  };

  return (
    <PageWrapper>
      <Container>
        <ImageWrap>
          <Image src={product.image} alt={product.title} />
        </ImageWrap>

        <Info>
          <Link to="/" style={{ textDecoration: "none", color: "#0b74de", fontWeight: 600 }}>
            ← Back to shop
          </Link>

          <Title>{product.title}</Title>
          <Price>₹{Number(product.price).toLocaleString("en-IN")}</Price>
          <Desc>{product.description}</Desc>

          <h4>Color</h4>
          <SwatchContainer>
            {colors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                active={selectedColor === color}
                whileHover={{ scale: 1.08 }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </SwatchContainer>

          <h4>Size</h4>
          <div>
            {sizes.map((size) => (
              <VariationButton
                key={size}
                active={selectedSize === size}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </VariationButton>
            ))}
          </div>

          {selectedColor && selectedSize && (
            <SelectedInfo>
              Selected: <b>{selectedSize}</b> • <span style={{ color: selectedColor }}>Color</span>
            </SelectedInfo>
          )}

          <AddCartButton whileHover={{ scale: 1.03 }} onClick={handleAddToCart}>
            Add to Cart
          </AddCartButton>
        </Info>
      </Container>
    </PageWrapper>
  );
};

export default ProductDetail;
