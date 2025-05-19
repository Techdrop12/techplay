'use client'
import React, { useState } from 'react';

const AddProductPage = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ici tu pourras intégrer l'API / MongoDB
    console.log('Produit ajouté :', form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <input name="title" onChange={handleChange} placeholder="Titre" className="w-full mb-2 p-2 border" />
      <textarea name="description" onChange={handleChange} placeholder="Description" className="w-full mb-2 p-2 border" />
      <input name="price" type="number" onChange={handleChange} placeholder="Prix" className="w-full mb-2 p-2 border" />
      <input name="image" onChange={handleChange} placeholder="URL de l'image" className="w-full mb-2 p-2 border" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
    </form>
  );
};

export default AddProductPage;
