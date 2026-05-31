import type { PurchaseLineItem } from "@/types/purchase-invoice";

export function normalizeSalesItem(raw: any): PurchaseLineItem {
  return {
    expiry: "",
    key: raw.id ? `product:${raw.id}` : raw.productKey || "",
    productKey:
      raw.productKey || `product:${raw.productable_id || raw.id || ""}`,
    productLabel:
      raw.productLabel ||
      raw.name ||
      raw.product_name ||
      raw.product?.name ||
      raw.variant?.name ||
      "Unnamed Product",

    product_id: raw.productable_id || raw.product_id || raw.id || 0,
    name: raw.name || raw.product?.name || "",
    sku: raw.sku || raw.product?.sku || "",
    unit: raw.unit ||
      raw.unit_object || { id: 0, name: "", conversion_factor: 1 },
    units: raw.units || {},
    unit_id: raw.unit_id || raw.unit?.id || 0,

    quantity: Number(raw.quantity || 0),
    unit_price: Number(raw.price || raw.unit_price || 0),
    tax_percent: Number(raw.tax || raw.tax_percent || 0),
    line_total:
      Number(raw.quantity || 0) * Number(raw.price || raw.unit_price || 0),

    expiry_date: raw.expiry_date || raw.expired_date || "",
    received_quantity: Number(raw.received_quantity || 0),

    track_expiry_date: !!raw.track_expiry_date,
    attributes: raw.attributes || [],
    warehouse_id: raw.warehouse_id || 0,
    warehouse: raw.warehouse || null,

    // compatibility for ProductsTable shared code
    cost: Number(raw.cost || raw.unit_price || 0),
    qty: Number(raw.quantity || 0),
  };
}
