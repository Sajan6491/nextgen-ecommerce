// src/pages/WishlistPage.jsx
import React from "react";
import PRODUCTS from "../data/products";
import { useNavigate } from "react-router-dom";

export default function WishlistPage() {
  const raw = localStorage.getItem("app_wishlist_v1");
  const list = raw ? JSON.parse(raw) : [];
  const nav = useNavigate();

  const items = list.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  return (
    <div style={{maxWidth:1100, margin:'20px auto', padding:16}}>
      <h2>Your Wishlist</h2>
      {items.length===0 ? <p>No items in wishlist.</p> : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12}}>
          {items.map(p=>(
            <div key={p.id} style={{background:'#fff',padding:12,borderRadius:10,boxShadow:'0 10px 30px rgba(0,0,0,0.06)'}}>
              <img src={p.img} alt={p.title} style={{width:'100%',height:160,objectFit:'cover',borderRadius:8}} />
              <h4>{p.title}</h4>
              <div>{p.brand}</div>
              <div style={{fontWeight:800, marginTop:6}}>₹{p.price}</div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button onClick={()=>nav(`/product/${encodeURIComponent(p.id)}`)}>View</button>
                <button onClick={()=>{
                  const raw2 = localStorage.getItem("app_wishlist_v1")||'[]';
                  const arr = JSON.parse(raw2).filter(x=>x!==p.id);
                  localStorage.setItem("app_wishlist_v1", JSON.stringify(arr));
                  window.location.reload();
                }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
