// src/data/types.ts

export interface SupplierStockItem {
  sku: string;
  supplier?: string;
  stock: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isSupplierStockItem(x: unknown): x is SupplierStockItem {
  if (!isRecord(x)) return false;

  const { sku, supplier, stock } = x;

  return (
    typeof sku === 'string' &&
    sku.length > 0 &&
    typeof stock === 'number' &&
    Number.isFinite(stock) &&
    (supplier === undefined || typeof supplier === 'string')
  );
}
