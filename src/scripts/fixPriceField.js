// src/scripts/fixPriceField.js

import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' }); // Charger les variables d'environnement depuis la racine

import { connectToDatabase } from '../lib/mongo.js';
import Product from '../models/Product.js';

async function fixPriceField() {
  try {
    await connectToDatabase();

    const products = await Product.find({});

    for (const product of products) {
      // S'assurer que price est bien un nombre (float)
      if (typeof product.price !== 'number') {
        const fixedPrice = parseFloat(product.price);
        if (!isNaN(fixedPrice)) {
          product.price = fixedPrice;
          await product.save();
          console.log(`Prix corrigé pour produit ${product._id} (${product.title}) : ${fixedPrice}`);
        } else {
          console.warn(`Impossible de corriger le prix pour produit ${product._id} (${product.title})`);
        }
      }
    }

    console.log('Correction des prix terminée.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la correction des prix:', error);
    process.exit(1);
  }
}

fixPriceField();
