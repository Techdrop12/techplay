// ✅ src/scripts/fixPriceField.js

import fs from 'fs';

const products = JSON.parse(fs.readFileSync('./src/data/import.json', 'utf-8'));

const fixed = products.map(prod => ({
  ...prod,
  price: Math.round((prod.price || 0) * 100) / 100
}));

fs.writeFileSync('./src/data/import.json', JSON.stringify(fixed, null, 2));
console.log('Prix corrigés !');
