// ✅ src/scripts/importFromAPI.js

import fs from 'fs';
import fetch from 'node-fetch';

const API_URL = 'https://fakestoreapi.com/products';

async function importProducts() {
  const res = await fetch(API_URL);
  const products = await res.json();
  fs.writeFileSync('./src/data/import.json', JSON.stringify(products, null, 2));
  console.log('Produits importés !');
}

importProducts();
