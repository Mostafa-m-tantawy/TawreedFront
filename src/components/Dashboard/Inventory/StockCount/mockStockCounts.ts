export type CountStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type StockCountRow = {
  id: number;
  code: string;
  date: string; // yyyy-mm-dd or localized
  warehouse?: { id: number; name: string } | null;
  variance: number; // counted - system
  status: CountStatus;
};

export type CountListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: CountStatus | "";
};

export type StockCountPayload = {
  date: string;
  warehouse_id: number;
  variance: number;
  status?: CountStatus;
};

let DB: StockCountRow[] = [
  {
    id: 1001,
    code: "DEP-1001",
    date: "2023-06-15",
    warehouse: { id: 1, name: "Main Warehouse" },
    variance: -5,
    status: "Approved",
  },
  {
    id: 1002,
    code: "DEP-1002",
    date: "2023-06-15",
    warehouse: { id: 2, name: "Supplier Warehouse" },
    variance: +8,
    status: "Draft",
  },
  {
    id: 1003,
    code: "DEP-1003",
    date: "2023-06-15",
    warehouse: { id: 1, name: "Main Warehouse" },
    variance: -2,
    status: "Approved",
  },
];

export async function listCounts(params: CountListParams) {
  const { page = 1, per_page = 10, search = "", status = "" } = params;
  let data = DB.slice();

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.warehouse?.name.toLowerCase().includes(q)
    );
  }
  if (status) data = data.filter((r) => r.status === status);

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

export async function getCount(id: number) {
  const item = DB.find((r) => r.id === id);
  if (!item) throw new Error("not found");
  return item;
}

export async function createCount(payload: StockCountPayload) {
  const id = Math.max(...DB.map((x) => x.id)) + 1;
  const row: StockCountRow = {
    id,
    code: `DEP-${id}`,
    date: payload.date,
    warehouse: {
      id: payload.warehouse_id,
      name: `Warehouse ${payload.warehouse_id}`,
    },
    variance: payload.variance,
    status: payload.status ?? "Draft",
  };
  DB.unshift(row);
  return row;
}

export async function updateCount(id: number, payload: StockCountPayload) {
  const i = DB.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("not found");
  DB[i] = {
    ...DB[i],
    ...payload,
    warehouse: {
      id: payload.warehouse_id,
      name: DB[i].warehouse?.name ?? `Warehouse ${payload.warehouse_id}`,
    },
  };
  return DB[i];
}

export async function deleteCount(id: number) {
  DB = DB.filter((r) => r.id !== id);
  return true;
}

export async function submitForApproval(id: number) {
  const r = await getCount(id);
  r.status = "Pending";
  return true;
}

export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel"
) {
  const r = await getCount(id);
  r.status =
    action === "approve"
      ? "Approved"
      : action === "reject"
      ? "Rejected"
      : "Cancelled";
  return true;
}
