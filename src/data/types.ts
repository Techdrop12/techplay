export interface SupplierStockItem {
  sku: string;
  supplier?: string;
  stock: number;
}
export function isSupplierStockItem(x: unknown): x is SupplierStockItem {
  return x && typeof x.sku === 'string' && typeof x.stock === 'number' && x.sku.length > 0;
}

