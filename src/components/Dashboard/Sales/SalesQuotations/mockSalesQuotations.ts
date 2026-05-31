// mockSalesQuotations.ts
export type QuotationStatus = "Draft" | "Approved";

export type QuotationRow = {
  id: number;
  code: string; // QO-xxxxx
  customer: string;
  date: string; // yyyy-mm-dd
  validity_days: number; // validity period
  status: QuotationStatus;
  total_amount: number; // major units
};

export type QuotationItem = {
  product: string;
  qty: number;
  price: number;
  discount: number; // absolute amount
  tax: number; // absolute amount
  subtotal: number; // derived
};

export type QuotationPayload = {
  customer: string;
  date: string;
  validity_days: number;
  notes?: string;
  items: QuotationItem[];
  status?: QuotationStatus;
};

export type QOListParams = {
  page?: number;
  per_page?: number;
  customer?: string;
  status?: QuotationStatus | "";
  date_from?: string; // yyyy-mm-dd
  date_to?: string; // yyyy-mm-dd
  // (no free-text search in spec; add if you want)
};

let SEQ = 8000;
const nextId = () => ++SEQ;
const codeFromId = (id: number) => `QO-${String(id).padStart(5, "0")}`;

const DB: QuotationRow[] = [
  {
    id: 8001,
    code: "QO-08001",
    customer: "Alpha Textiles",
    date: "2025-08-10",
    validity_days: 14,
    status: "Draft",
    total_amount: 950,
  },
  {
    id: 8002,
    code: "QO-08002",
    customer: "Bravo Chemicals",
    date: "2025-08-12",
    validity_days: 30,
    status: "Approved",
    total_amount: 2200,
  },
  {
    id: 8003,
    code: "QO-08003",
    customer: "Cosmo Fabrics",
    date: "2025-08-13",
    validity_days: 7,
    status: "Draft",
    total_amount: 1450,
  },
];

// Lightweight “line items” store for details/editing
// (In a real BE, items live on another table.)
const ITEMS: Record<number, QuotationItem[]> = {
  8001: [
    {
      product: "Cotton Roll",
      qty: 10,
      price: 50,
      discount: 0,
      tax: 50,
      subtotal: 10 * 50 - 0 + 50,
    },
  ],
  8002: [
    {
      product: "Dye Pack",
      qty: 20,
      price: 100,
      discount: 100,
      tax: 200,
      subtotal: 20 * 100 - 100 + 200,
    },
  ],
  8003: [
    {
      product: "Yarn Box",
      qty: 5,
      price: 250,
      discount: 50,
      tax: 100,
      subtotal: 5 * 250 - 50 + 100,
    },
  ],
};

export async function listQuotations(params: QOListParams) {
  const {
    page = 1,
    per_page = 10,
    customer = "",
    status = "",
    date_from,
    date_to,
  } = params;

  let data = DB.slice();

  if (customer) {
    const c = customer.toLowerCase();
    data = data.filter((r) => r.customer.toLowerCase().includes(c));
  }
  if (status) data = data.filter((r) => r.status === status);

  if (date_from) data = data.filter((r) => r.date >= date_from);
  if (date_to) data = data.filter((r) => r.date <= date_to);

  // newest first by date then id
  data.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paged = data.slice(start, end);
  const last_page = Math.max(1, Math.ceil(data.length / per_page));

  return {
    data: paged,
    meta: { current_page: page, last_page, total: data.length },
    statuses: ["Draft", "Approved"] as QuotationStatus[],
    customers: Array.from(new Set(DB.map((r) => r.customer))).sort(),
  };
}

export async function getQuotation(id: number) {
  const row = DB.find((r) => r.id === id);
  if (!row) throw new Error("not found");
  return {
    ...row,
    notes: "",
    items: ITEMS[id] ?? [],
  } as QuotationPayload & { id: number; code: string };
}

export async function createQuotation(payload: QuotationPayload) {
  const id = nextId();
  const code = codeFromId(id);
  const total =
    payload.items.reduce(
      (sum, it) => sum + (it.qty * it.price - it.discount + it.tax),
      0
    ) || 0;

  const row: QuotationRow = {
    id,
    code,
    customer: payload.customer,
    date: payload.date,
    validity_days: payload.validity_days,
    status: payload.status ?? "Draft",
    total_amount: total,
  };
  DB.unshift(row);
  ITEMS[id] = payload.items.map((it) => ({
    ...it,
    subtotal: it.qty * it.price - it.discount + it.tax,
  }));
  return row;
}

export async function updateQuotation(id: number, payload: QuotationPayload) {
  const i = DB.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("not found");
  const total =
    payload.items.reduce(
      (sum, it) => sum + (it.qty * it.price - it.discount + it.tax),
      0
    ) || 0;

  DB[i] = {
    ...DB[i],
    customer: payload.customer,
    date: payload.date,
    validity_days: payload.validity_days,
    status: payload.status ?? DB[i].status,
    total_amount: total,
  };
  ITEMS[id] = payload.items.map((it) => ({
    ...it,
    subtotal: it.qty * it.price - it.discount + it.tax,
  }));
  return DB[i];
}

export async function deleteQuotation(id: number) {
  const i = DB.findIndex((r) => r.id === id);
  if (i >= 0) DB.splice(i, 1);
  delete ITEMS[id];
  return true;
}

export async function approveQuotation(id: number) {
  const i = DB.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("not found");
  DB[i].status = "Approved";
  return true;
}

// simple no-op; your BE would return an SO id
export async function convertToOrder(id: number) {
  const row = DB.find((r) => r.id === id);
  if (!row) throw new Error("not found");
  if (row.status !== "Approved") throw new Error("must_approve_first");
  return { salesOrderId: 50000 + id };
}
