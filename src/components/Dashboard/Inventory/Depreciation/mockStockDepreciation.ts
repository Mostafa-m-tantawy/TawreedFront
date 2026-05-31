"use client";

/**
 * Depreciation (Write-off) — Mock data layer
 * Shape is similar to stock adjustment mocks, but with a single quantity field:
 *   qtyWrittenOff
 */

export type AdjustmentStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type AdjustmentRow = {
  id: number;
  code: string; // e.g. DEP-1001
  date: string; // ISO (yyyy-mm-dd) or displayable string
  warehouse?: { id: number; name: string } | null;
  product?: { id: number; name: string } | null;
  qtyWrittenOff: number; // single quantity for write-off
  reason: string;
  status: AdjustmentStatus;
};

export type AdjustmentListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: AdjustmentStatus | "";
};

export type AdjustmentPayload = {
  date: string;
  warehouse_id: number;
  status?: AdjustmentStatus;
  item: {
    product_id: number;
    qty_written_off: number;
    reason: string;
  };
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* -------------------------------------------------------------------------- */
/*                               Seeded Records                               */
/* -------------------------------------------------------------------------- */

let autoId = 3000;

let rows: AdjustmentRow[] = [
  {
    id: 1,
    code: "DEP-1001",
    date: "2025-06-15",
    warehouse: { id: 1, name: "Main Warehouse" },
    product: { id: 10, name: "Product A" },
    qtyWrittenOff: 5,
    reason: "Damage",
    status: "Approved",
  },
  {
    id: 2,
    code: "DEP-1002",
    date: "2025-06-15",
    warehouse: { id: 2, name: "Supplier Warehouse" },
    product: { id: 10, name: "Product A" },
    qtyWrittenOff: 8,
    reason: "Count Error",
    status: "Draft",
  },
  {
    id: 3,
    code: "DEP-1003",
    date: "2025-06-15",
    warehouse: { id: 1, name: "Main Warehouse" },
    product: { id: 10, name: "Product A" },
    qtyWrittenOff: 56,
    reason: "Damage",
    status: "Cancelled",
  },
];

const WAREHOUSES = [
  { id: 1, name: "Main Warehouse" },
  { id: 2, name: "Supplier Warehouse" },
  { id: 3, name: "Finished Goods WH" },
];

const PRODUCTS = [
  { id: 10, name: "Product A" },
  { id: 11, name: "Product B" },
  { id: 12, name: "Product C" },
  { id: 13, name: "Product D" },
];

export const REASONS = ["Damage", "Count Error", "Expiry", "Other"];

/* -------------------------------------------------------------------------- */
/*                                   CRUD                                     */
/* -------------------------------------------------------------------------- */

export async function listAdjustments({
  page = 1,
  per_page = 10,
  search = "",
  status = "" as any,
}: AdjustmentListParams) {
  await delay(120);

  let items = rows.filter((r) =>
    [r.code, r.warehouse?.name, r.product?.name, r.reason].some((f) =>
      String(f || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  if (status) items = items.filter((r) => r.status === status);

  const total = items.length;
  const last_page = Math.max(1, Math.ceil(total / per_page));

  return {
    data: items.slice((page - 1) * per_page, page * per_page),
    meta: { last_page, total },
    statuses: ["Draft", "Pending", "Approved", "Rejected", "Cancelled"],
  };
}

export async function getAdjustment(id: number) {
  await delay(80);
  const f = rows.find((r) => r.id === id);
  if (!f) throw new Error("Not found");
  return f;
}

export async function createAdjustment(payload: AdjustmentPayload) {
  await delay(120);

  const id = ++autoId;
  const code = `DEP-${id}`;
  const wh = WAREHOUSES.find((w) => w.id === payload.warehouse_id) || null;
  const prod = PRODUCTS.find((p) => p.id === payload.item.product_id) || null;

  const row: AdjustmentRow = {
    id,
    code,
    date: payload.date,
    warehouse: wh,
    product: prod,
    qtyWrittenOff: payload.item.qty_written_off,
    reason: payload.item.reason,
    status: (payload.status as any) || "Draft",
  };

  rows.unshift(row);
  return row;
}

export async function updateAdjustment(id: number, payload: AdjustmentPayload) {
  await delay(120);

  const i = rows.findIndex((r) => r.id === id);
  if (i < 0) throw new Error("Not found");

  const wh =
    WAREHOUSES.find((w) => w.id === payload.warehouse_id) || rows[i].warehouse;
  const prod =
    PRODUCTS.find((p) => p.id === payload.item.product_id) || rows[i].product;

  rows[i] = {
    ...rows[i],
    date: payload.date,
    warehouse: wh,
    product: prod,
    qtyWrittenOff: payload.item.qty_written_off,
    reason: payload.item.reason,
    status: payload.status || rows[i].status,
  };

  return rows[i];
}

export async function deleteAdjustment(id: number) {
  await delay(80);
  rows = rows.filter((r) => r.id !== id);
  return true;
}

export async function submitForApproval(id: number) {
  await delay(60);
  const r = rows.find((x) => x.id === id);
  if (r && r.status === "Draft") r.status = "Pending";
  return true;
}

/** Approve / Reject / Cancel */
export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel"
) {
  await delay(60);
  const r = rows.find((x) => x.id === id);
  if (!r) return false;
  r.status =
    action === "approve"
      ? "Approved"
      : action === "reject"
      ? "Rejected"
      : "Cancelled";
  return true;
}

/* -------------------------------------------------------------------------- */
/*                             Paged dropdown mocks                           */
/* -------------------------------------------------------------------------- */

export async function pagedWarehouses(page: number, search: string) {
  await delay(60);
  const filtered = WAREHOUSES.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );
  return { items: filtered, page, lastPage: 1, total: filtered.length };
}

export async function pagedProducts(page: number, search: string) {
  await delay(60);
  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return { items: filtered, page, lastPage: 1, total: filtered.length };
}
