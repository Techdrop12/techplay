// ✅ src/data/sync-stock.js

import importData from './import.json';
import supplierStock from './supplier-stock.json';

export default function syncStock() {
  return importData.map(product => {
    const stock = supplierStock[product.category] || 0;
    return { ...product, stock };
  });
}
