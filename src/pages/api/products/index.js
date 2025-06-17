// src/pages/api/products/index.js

import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';

export default async function handler(req, res) {
  try {
    await dbConnect();

    const products = await Product.find({});

    console.log('📦 Produits récupérés :', products.length);
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Erreur API /products:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
}
