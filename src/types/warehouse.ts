export type WarehouseStatus = "active" | "inactive";

export type Warehouse = {
  id: number;
  name: string;
  address?: string | null;
  contact_number?: string | null;
  capacity?: string | number | null;
  status: "active" | "inactive" | string;
  manager?: {
    id: number;
    name: string;
    email?: string | null;
  } | null;
  type?: "Product" | "Finished Goods" | "Raw Material" | string;
};

export type ViewWarehouse = {
  id: number;
  name: string;
  address: string;
  manager: string;
  phone: string;
  capacity: string;
  status: "active" | "inactive";
  openingBalance?: { exists: boolean };
  stock: {
    product: string;
    sku: string;
    qty: number;
    unit: string;
    reorder: number;
    status: "in" | "out";
  }[];
  incoming: {
    id: string;
    supplier: string;
    date: string;
    items: number;
    status: "Scheduled" | "Delivered";
  }[];
  outgoing: {
    id: string;
    destination: string;
    date: string;
    items: number;
    status: "Scheduled" | "Delivered";
  }[];
  transfers: {
    id: string;
    source: string;
    destination: string;
    date: string;
    items: number;
    status: "Scheduled" | "Delivered";
  }[];
};
