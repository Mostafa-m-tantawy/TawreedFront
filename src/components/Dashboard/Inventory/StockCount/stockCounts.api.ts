"use client";
import api from "@/lib/api.client";
import * as mock from "./mockStockCounts";
import type {
  CountListParams,
  StockCountRow,
  StockCountPayload,
} from "./mockStockCounts";

export async function listCounts(params: CountListParams) {
  try {
    const res = await api.get("/admin/stock-counts", { params });
    const data = res?.data?.data ?? [];
    const meta = res?.data?.meta ?? {};
    const statuses: string[] = res?.data?.statuses ?? [
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
    ];
    return { data, meta, statuses } as {
      data: StockCountRow[];
      meta: any;
      statuses: string[];
    };
  } catch {
    return mock.listCounts(params);
  }
}

export async function getCount(id: number) {
  try {
    const res = await api.get(`/admin/stock-counts/${id}`);
    return (res?.data?.data ?? res?.data) as StockCountRow;
  } catch {
    return mock.getCount(id);
  }
}

export async function createCount(payload: StockCountPayload) {
  try {
    const res = await api.post("/admin/stock-counts", payload);
    return (res?.data?.data ?? res?.data) as StockCountRow;
  } catch {
    return mock.createCount(payload);
  }
}

export async function updateCount(id: number, payload: StockCountPayload) {
  try {
    const res = await api.put(`/admin/stock-counts/${id}`, payload);
    return (res?.data?.data ?? res?.data) as StockCountRow;
  } catch {
    return mock.updateCount(id, payload);
  }
}

export async function deleteCount(id: number) {
  try {
    await api.delete(`/admin/stock-counts/${id}`);
    return true;
  } catch {
    return mock.deleteCount(id);
  }
}

export async function submitForApproval(id: number) {
  try {
    await api.post(`/admin/stock-count/submit-for-approval/${id}`);
    return true;
  } catch {
    return mock.submitForApproval(id);
  }
}

export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel"
) {
  try {
    const path =
      action === "approve"
        ? `/admin/stock-count/approve/${id}`
        : action === "cancel"
        ? `/admin/stock-count/cancel/${id}`
        : `/admin/stock-count/reject/${id}`;
    await api.post(path);
    return true;
  } catch {
    return mock.changeStatus(id, action);
  }
}
