export type InvoiceStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Paid";

export type SalesInvoiceRow = {
  id: number;
  code: string; // INV-YYYY-###
  customer: string;
  invoice_date: string; // yyyy-mm-dd
  so_code: string; // related SO number
  status: InvoiceStatus;
  total_amount: number; // major units
  balance_due: number; // major units
};

export type InvoiceListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: InvoiceStatus | "";
};

export type SalesInvoicePayload = {
  customer: string;
  invoice_date: string;
  so_code: string;
  total_amount: number;
  balance_due: number;
  status?: InvoiceStatus;
};

let DB: SalesInvoiceRow[] = [
  {
    id: 9001,
    code: "INV-2023-001",
    customer: "AC Customer",
    invoice_date: "2025-08-15",
    so_code: "SO-2023-001",
    status: "Draft",
    total_amount: 1250,
    balance_due: 0,
  },
  {
    id: 9002,
    code: "INV-2023-002",
    customer: "Global Fabrics",
    invoice_date: "2025-08-16",
    so_code: "SO-2023-001",
    status: "Paid",
    total_amount: 2500,
    balance_due: 2000,
  },
  {
    id: 9003,
    code: "INV-2023-003",
    customer: "ChemSource",
    invoice_date: "2025-08-17",
    so_code: "SO-2023-001",
    status: "Approved",
    total_amount: 3200,
    balance_due: 2300,
  },
];

export async function listInvoices(params: InvoiceListParams) {
  const { page = 1, per_page = 10, search = "", status = "" } = params;
  let data = DB.slice();

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.so_code.toLowerCase().includes(q)
    );
  }
  if (status) data = data.filter((r) => r.status === status);

  data.sort(
    (a, b) => b.invoice_date.localeCompare(a.invoice_date) || b.id - a.id
  );

  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paged = data.slice(start, end);
  const last_page = Math.max(1, Math.ceil(data.length / per_page));

  return {
    data: paged,
    meta: { current_page: page, last_page, total: data.length },
    statuses: ["Draft", "Pending", "Approved", "Rejected", "Cancelled", "Paid"],
  };
}

export async function getInvoice(id: number) {
  const it = DB.find((r) => r.id === id);
  if (!it) throw new Error("not found");
  return it;
}

export async function createInvoice(payload: SalesInvoicePayload) {
  const maxId = DB.length ? Math.max(...DB.map((x) => x.id)) : 0;
  const id = maxId + 1;
  const code = `INV-${new Date().getFullYear()}-${String(id).padStart(3, "0")}`;
  const row: SalesInvoiceRow = {
    id,
    code,
    customer: payload.customer,
    invoice_date: payload.invoice_date,
    so_code: payload.so_code,
    status: payload.status ?? "Draft",
    total_amount: payload.total_amount,
    balance_due: payload.balance_due,
  };
  DB.unshift(row);
  return row;
}

export async function updateInvoice(id: number, payload: SalesInvoicePayload) {
  const i = DB.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("not found");
  DB[i] = { ...DB[i], ...payload, status: payload.status ?? DB[i].status };
  return DB[i];
}

export async function deleteInvoice(id: number) {
  DB = DB.filter((r) => r.id !== id);
  return true;
}

export async function submitForApproval(id: number) {
  const r = await getInvoice(id);
  r.status = "Pending";
  return true;
}

export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel" | "mark_paid"
) {
  const r = await getInvoice(id);
  r.status =
    action === "approve"
      ? "Approved"
      : action === "reject"
      ? "Rejected"
      : action === "cancel"
      ? "Cancelled"
      : "Paid";
  return true;
}
