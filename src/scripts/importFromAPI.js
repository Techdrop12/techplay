import dotenv from 'dotenv';
dotenv.config({ path: process.cwd() + '/.env.local' });

import axios from 'axios';
import dbConnect from '../lib/dbConnect.js';
import Product from '../models/Product.js';

async function importFromAPI() {
  try {
    await dbConnect();

    const response = await axios.get('https://fakestoreapi.com/products');
    const products = response.data;

    let count = 0;
    for (const item of products) {
      const slug = item.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      const productData = {
        title: item.title,
        price: parseFloat(item.price),
        image: item.image,
        images: [item.image],
        slug,
        description: item.description,
        category: item.category,
        stock: 10,
        tags: [item.category],
        source: 'api',
        rating: item.rating?.rate || 4.5,
      };

      await Product.findOneAndUpdate({ slug }, productData, { upsert: true, new: true });
      count++;
    }

    console.log(`Import terminé, ${count} produits insérés/mis à jour.`);
    process.exit(0);
  } catch (error) {
    console.error('Erreur import API:', error);
    process.exit(1);
  }
}

importFromAPI();
