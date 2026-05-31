export const mockPOCreateMeta = {
  suppliers: [
    { id: 1, name: "ABC Supplies" },
    { id: 2, name: "Global Fabrics" },
  ],
  warehouses: [{ id: 1, name: "Main Warehouse" }],
  payment_terms: [
    { id: 10, name: "Net 30" },
    { id: 11, name: "Prepaid" },
  ],
  statuses: ["draft", "pending", "approved", "rejected"],
  products: [
    { id: 101, name: "Product A", sku: "SKU001", unit: "pcs", price: 2 },
    { id: 102, name: "Product B", sku: "SKU002", unit: "kg", price: 15 },
  ],
};

export const mockPOEdit = {
  purchase_order: {
    id: 555,
    code: "PO-1001",
    supplier_id: 1,
    order_date: "2025-08-28",
    expected_delivery: "2025-08-28",
    payment_terms: 10,
    currency: "USD",
    status: "draft",
    note: "",
    items: [
      {
        id: 1,
        product_id: 101,
        product_name: "Product A",
        sku: "SKU001",
        unit: "pcs",
        quantity: 1,
        unit_price: 1200,
        tax_percent: 0,
        expiry_date: "2025-08-20",
      },
    ],
  },
};
