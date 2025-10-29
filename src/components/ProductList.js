import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import ProductCard from "./ProductCard";

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 50px 20px;
`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const params = new URLSearchParams(location.search);
  const q = params.get('q') ? params.get('q').toLowerCase() : null;
  const filtered = q
    ? products.filter(p => (p.title + ' ' + (p.description||'')).toLowerCase().includes(q))
    : products;

  return (
    <Grid>
      {filtered.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => navigate(`/product/${product.id}`)}
        />
      ))}
    </Grid>
  );
};

export default ProductList;
