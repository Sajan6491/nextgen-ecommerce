import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { motion } from "framer-motion";
import { CartContext } from "../context/CartContext";

/* ---------------------------
  Recently viewed helper
  - Writes a compact item into localStorage key "recently_viewed_v1"
  - Keeps newest first, removes duplicates, trims to max 24
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
    // non-fatal
    console.error("addRecentlyViewed error", e);
  }
}

/* ---------------------------
  Your styled-components (kept as-is)
---------------------------- */

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 50px;
  padding: 50px 20px;
  justify-content: center;
`;

const Image = styled.img`
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 15px;
`;

const Info = styled.div`
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;

const Price = styled.p`
  font-weight: bold;
  font-size: 1.3rem;
  margin: 10px 0;
`;

const Desc = styled.p`
  color: #555;
  line-height: 1.5;
`;

const SwatchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
`;

const ColorSwatch = styled(motion.div)`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.active ? "#000" : "#ccc")};
  background-color: ${(props) => props.color};
  cursor: pointer;
`;

const VariationButton = styled.button`
  margin-right: 10px;
  padding: 6px 14px;
  border: 1px solid #1e1e2f;
  cursor: pointer;
  border-radius: 5px;
  background: ${(props) => (props.active ? "#1e1e2f" : "#fff")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  transition: 0.2s;
`;

const AddCartButton = styled(motion.button)`
  margin-top: 20px;
  padding: 10px 20px;
  background: #1e1e2f;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
`;

const SelectedInfo = styled.div`
  margin-top: 15px;
  font-size: 14px;
  color: #333;
`;

const ProductDetail = () => {
  const { addToCart } = useContext(CartContext);
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const colors = ["#000000", "#ff0000", "#1e90ff", "#008000"];
  const sizes = ["Small", "Medium", "Large"];

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    axios
      .get(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        // <-- add to recently viewed immediately after loading product
        addRecentlyViewed(res.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select both color and size!");
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

    addToCart(cartItem); // ✅ Add to global cart
    alert(`Added ${product.title} (${selectedSize}, ${selectedColor}) to cart!`);
  };

  return (
    <Container>
      <Image src={product.image} alt={product.title} />
      <Info>
        <Title>{product.title}</Title>
        <Price>₹{product.price}</Price>
        <Desc>{product.description}</Desc>

        <h4>Color:</h4>
        <SwatchContainer>
          {colors.map((color, i) => (
            <ColorSwatch
              key={i}
              color={color}
              active={selectedColor === color}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </SwatchContainer>

        <h4>Size:</h4>
        <div>
          {sizes.map((size, i) => (
            <VariationButton
              key={i}
              active={selectedSize === size}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </VariationButton>
          ))}
        </div>

        {selectedColor && selectedSize && (
          <SelectedInfo>
            Selected: {selectedSize} / <span style={{ color: selectedColor }}>Color</span>
          </SelectedInfo>
        )}

        <AddCartButton whileHover={{ scale: 1.05 }} onClick={handleAddToCart}>
          Add to Cart
        </AddCartButton>
      </Info>
    </Container>
  );
};

export default ProductDetail;
