export type PurchaseOrder = {
  id: number;
  code: string;
  order_date: string; // ISO date string
  expected_delivery: string; // ISO date string
  total_price: number;
  status: "Pending" | "Approved" | "Rejected" | "Invoiced" | string; // extend if you have more
  by_user: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    is_change_password: number; // 0 or 1
    status: "active" | "inactive" | string;
    email_verified_at: string | null;
    avatar: string;
  };
  supplier: {
    id: number;
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    tax_number: string | null;
    notes: string | null;
    status: "active" | "inactive" | string;
  };
  allowed_actions?: string[];
  currency: {
    id: number;
    name: string;
    symbol: string;
    code: string;
    exchange_rate: number;
  };
};
