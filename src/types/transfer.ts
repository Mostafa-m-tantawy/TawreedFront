import { User } from "./user";

export type TransferItem = {
  productKey: string; // "Product:ID" | "ProductVariant:ID"
  productLabel: string;
  quantity: number | "";
  unit?: { id: number; name: string; conversion_factor?: number } | null;
  unit_id?: number;
  track_expiry_date?: boolean;
  expiry_date?: string | null;
  attributes?: Array<{ name: string; value: string }>;
  allowed_quantity?: number;
  units?: any;
  originalUnit?: { id: number; name: string; conversion_factor?: number };
};

export type Transfer = {
  id: number;
  code: string;
  status: "Draft" | "Pending" | "Rejected" | "Approved" | string;
  fromWarehouse: { id: number; name: string };
  toWarehouse: { id: number; name: string };
  total_products?: string | number;
  items?: {
    id: number;
    Product: any;
    quantity: number;
    unit: any;
  }[];
  createdBy?: { id: number; name: string };
  updatedBy?: { id: number; name: string };
  notes?: string | null;
  created_at?: string | null;
  createdby?: User | null;
  updatedby?: User | null;
};
