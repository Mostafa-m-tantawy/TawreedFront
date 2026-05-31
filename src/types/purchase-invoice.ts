import { ProductUnit } from "./product";

export type Money = number;

export type PurchaseLineItem = {
  id?: number;
  key: string;
  product_id: number | null;
  name?: string | null;
  sku?: string | null;
  quantity: number; // ordered for PO, received for invoice when applicable

  unit_id: number | null; // pcs, kg, etc
  unit_price: Money;
  tax_percent?: number | null; // e.g. 10 for 10%
  expiry_date?: string | null; // ISO yyyy-mm-dd

  // invoice-only extras
  received_quantity?: number | null;
  line_total?: Money | null;

  productKey: string | "";
  productLabel?: string;
  qty: number;
  cost: number;
  expiry: string;
  track_expiry_date?: boolean;
  unit?: ProductUnit;
  originalUnit?: ProductUnit;
  units: any;
  attributes?: any[];
  warehouse?: any;
  warehouse_id?: number;
  allowed_quantity?: number;
  flow?: string;
};

export type PurchaseInvoiceStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Paid"
  | (string & {});

type SlimSupplier = { id: number; name: string };
type SlimPurchaseOrder = {
  id: number;
  code: string;
  currency: {
    id: number;
    title: string;
    symbol: string;
    code: string;
  };
};

export type PurchaseInvoice = {
  id: number;

  /** Some endpoints return the invoice number as `invoice_number`, others as `code` */
  invoice_number?: string | null;
  code?: string | null;

  invoice_date: string; // ISO date string (YYYY-MM-DD or datetime)
  status: PurchaseInvoiceStatus;

  // Supplier (both id/name flat AND nested object are possible)
  supplier_id?: number | null;
  supplier_name?: string | null; // fallback for list rows that only return name
  supplier?: SlimSupplier | null;

  // Linked PO
  purchase_order_id?: number | null; // aka po_id on some screens
  purchase_order?: SlimPurchaseOrder | null;

  // Other meta
  warehouse_id?: number | null;
  payment_terms?: string | number | null;
  note?: string | null;

  // Totals (server may provide different naming; keep all)
  subtotal?: Money;
  tax_total?: Money;
  grand_total?: Money;
  total_amount?: Money;
  balance_due?: Money;

  // Optional relations
  items?: PurchaseLineItem[];
  by_user?: { id: number; name: string } | null;
  allowed_actions?: string[];
};
