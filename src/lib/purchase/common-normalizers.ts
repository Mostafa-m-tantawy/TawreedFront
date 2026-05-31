import { PurchaseLineItem } from "@/types/purchase-invoice";

export type Party = { id: number; name: string };
export type Terms = { id: number; name: string };
export type WarehouseLite = { id: number; name: string };
export type ProductLite = {
  id: number;
  name: string;
  sku?: string | null;
  unit?: string | null;
  price?: number | null;
  image?: string | null;
};

export function normArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? v : [];
}

export function pickFirst<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) if (obj && obj[k] != null) return obj[k];
  return undefined;
}

export function computeTotals(items: PurchaseLineItem[]) {
  const subtotal = items.reduce(
    (acc, it) => acc + (it.quantity || 0) * (it.unit_price || 0),
    0
  );
  const tax = items.reduce((acc, it) => {
    const base = (it.quantity || 0) * (it.unit_price || 0);
    const pct = Number(it.tax_percent || 0) / 100;
    return acc + base * pct;
  }, 0);
  const grand = subtotal + tax;
  return { subtotal, tax, grand };
}
