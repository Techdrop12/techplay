'use client'
import React from 'react';
import { useCart } from '../src/context/cartContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} ajouté au panier`);
  };

  return (
    <div className="border p-4 rounded">
      <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
      <h3 className="mt-2 font-bold">{product.title}</h3>
      <p>{product.description}</p>
      <p className="text-green-600 font-semibold">{product.price} €</p>
      <button onClick={handleAddToCart} className="mt-2 bg-black text-white px-4 py-2 rounded">
        Ajouter au panier
      </button>
    </div>
  );
};

export default ProductCard;
