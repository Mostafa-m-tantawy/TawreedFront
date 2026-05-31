export type SOStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type SalesOrderRow = {
  id: number;
  code: string; // SO-xxxx
  customer: string;
  order_date: string; // yyyy-mm-dd
  expected_delivery: string; // yyyy-mm-dd
  created_by: string;
  status: SOStatus;
  total_amount: number; // cents or major units, here major units
};

export type SOListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: SOStatus | "";
};

export type SalesOrderPayload = {
  customer: string;
  order_date: string;
  expected_delivery: string;
  created_by: string;
  total_amount: number;
  status?: SOStatus;
};

let DB: SalesOrderRow[] = [
  {
    id: 5001,
    code: "SO-00123",
    customer: "ABC Supplies",
    order_date: "2025-08-15",
    expected_delivery: "2025-08-25",
    created_by: "Ahmed Ali",
    status: "Draft",
    total_amount: 1250,
  },
  {
    id: 5002,
    code: "SO-00123",
    customer: "Global Fabrics",
    order_date: "2025-08-16",
    expected_delivery: "2025-08-28",
    created_by: "Mariam Hassan",
    status: "Pending",
    total_amount: 2500,
  },
  {
    id: 5003,
    code: "SO-00123",
    customer: "ChemSource",
    order_date: "2025-08-17",
    expected_delivery: "2025-08-30",
    created_by: "Omar Khaled",
    status: "Approved",
    total_amount: 3200,
  },
];

export async function listOrders(params: SOListParams) {
  const { page = 1, per_page = 10, search = "", status = "" } = params;
  let data = DB.slice();

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.created_by.toLowerCase().includes(q)
    );
  }
  if (status) data = data.filter((r) => r.status === status);

  // newest first by order_date, then id
  data.sort((a, b) => b.order_date.localeCompare(a.order_date) || b.id - a.id);

  const start = (page - 1) * per_page;
  const end = start + per_page;
  const paged = data.slice(start, end);
  const last_page = Math.max(1, Math.ceil(data.length / per_page));

  return {
    data: paged,
    meta: { current_page: page, last_page, total: data.length },
    statuses: ["Draft", "Pending", "Approved", "Rejected", "Cancelled"],
  };
}

export async function getOrder(id: number) {
  const item = DB.find((r) => r.id === id);
  if (!item) throw new Error("not found");
  return item;
}

export async function createOrder(payload: SalesOrderPayload) {
  const maxId = DB.length ? Math.max(...DB.map((x) => x.id)) : 0;
  const id = maxId + 1;
  const code = `SO-${String(id).padStart(5, "0")}`;
  const row: SalesOrderRow = {
    id,
    code,
    customer: payload.customer,
    order_date: payload.order_date,
    expected_delivery: payload.expected_delivery,
    created_by: payload.created_by,
    total_amount: payload.total_amount,
    status: payload.status ?? "Draft",
  };
  DB.unshift(row);
  return row;
}

export async function updateOrder(id: number, payload: SalesOrderPayload) {
  const i = DB.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("not found");
  DB[i] = { ...DB[i], ...payload, status: payload.status ?? DB[i].status };
  return DB[i];
}

export async function deleteOrder(id: number) {
  DB = DB.filter((r) => r.id !== id);
  return true;
}

export async function submitForApproval(id: number) {
  const r = await getOrder(id);
  r.status = "Pending";
  return true;
}

export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel"
) {
  const r = await getOrder(id);
  r.status =
    action === "approve"
      ? "Approved"
      : action === "reject"
      ? "Rejected"
      : "Cancelled";
  return true;
}
