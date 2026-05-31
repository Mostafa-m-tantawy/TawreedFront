"use client";
import api from "@/lib/api.client";
import * as mock from "./mockSalesOrders";
import type {
  SOListParams,
  SalesOrderRow,
  SalesOrderPayload,
} from "./mockSalesOrders";

export async function listOrders(params: SOListParams) {
  try {
    const res = await api.get("/admin/sales-orders", { params });
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
      data: SalesOrderRow[];
      meta: any;
      statuses: string[];
    };
  } catch {
    return mock.listOrders(params);
  }
}

export async function getOrder(id: number) {
  try {
    const res = await api.get(`/admin/sales-orders/${id}`);
    return (res?.data?.data ?? res?.data) as SalesOrderRow;
  } catch {
    return mock.getOrder(id);
  }
}

export async function createOrder(payload: SalesOrderPayload) {
  try {
    const res = await api.post("/admin/sales-orders", payload);
    return (res?.data?.data ?? res?.data) as SalesOrderRow;
  } catch {
    return mock.createOrder(payload);
  }
}

export async function updateOrder(id: number, payload: SalesOrderPayload) {
  try {
    const res = await api.put(`/admin/sales-orders/${id}`, payload);
    return (res?.data?.data ?? res?.data) as SalesOrderRow;
  } catch {
    return mock.updateOrder(id, payload);
  }
}

export async function deleteOrder(id: number) {
  try {
    await api.delete(`/admin/sales-orders/${id}`);
    return true;
  } catch {
    return mock.deleteOrder(id);
  }
}

export async function submitForApproval(id: number) {
  try {
    await api.post(`/admin/sales-order/submit-for-approval/${id}`);
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
        ? `/admin/sales-order/approve/${id}`
        : action === "cancel"
        ? `/admin/sales-order/cancel/${id}`
        : `/admin/sales-order/reject/${id}`;
    await api.post(path);
    return true;
  } catch {
    return mock.changeStatus(id, action);
  }
}
