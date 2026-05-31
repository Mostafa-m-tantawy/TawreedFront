export const mockInvoiceCreateMeta = {
  suppliers: [
    { id: 1, name: "ABC Supplies" },
    { id: 2, name: "Global Fabrics" },
  ],
  warehouses: [{ id: 1, name: "Main Warehouse" }],
  payment_terms: [
    { id: 10, name: "Net 30" },
    { id: 11, name: "Prepaid" },
  ],
  statuses: ["draft", "pending", "approved", "paid", "rejected"],
  products: [
    { id: 101, name: "Product A", sku: "SKU001", unit: "pcs", price: 2 },
    { id: 102, name: "Product B", sku: "SKU002", unit: "kg", price: 15 },
  ],
  purchase_orders: [{ id: 888, number: "PO-0032-001" }],
};

export const mockInvoiceEdit = {
  purchase_invoice: {
    id: 9901,
    invoice_number: "INV-2023-001",
    supplier_id: 1,
    invoice_date: "2025-08-28",
    po_id: 888,
    code: "PO-0032-001",
    warehouse_id: 1,
    payment_terms: 10,
    status: "draft",
    note: "",
    items: [
      {
        id: 1,
        product_id: 101,
        product_name: "Product A",
        sku: "SKU001",
        unit: "pcs",
        quantity: 2,
        received_quantity: 1,
        unit_price: 2,
        tax_percent: 10,
        expiry_date: "2025-08-28",
        line_total: 4,
      },
    ],
  },
};
