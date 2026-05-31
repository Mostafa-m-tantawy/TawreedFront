"use client";
import api from "@/lib/api.client";
import * as mock from "./mockStockAdjustments";
import type {
  AdjustmentListParams,
  AdjustmentRow,
  AdjustmentPayload,
} from "./mockStockAdjustments";

export async function listAdjustments(params: AdjustmentListParams) {
  try {
    const res = await api.get("/admin/stock-adjustments", { params });
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
      data: AdjustmentRow[];
      meta: any;
      statuses: string[];
    };
  } catch (e) {
    // Fallback to mock
    return mock.listAdjustments(params);
  }
}

export async function getAdjustment(id: number) {
  try {
    const res = await api.get(`/admin/stock-adjustments/${id}`);
    return (res?.data?.data ?? res?.data) as AdjustmentRow;
  } catch (e) {
    return mock.getAdjustment(id);
  }
}

export async function createAdjustment(payload: AdjustmentPayload) {
  try {
    const res = await api.post("/admin/stock-adjustments", payload);
    return (res?.data?.data ?? res?.data) as AdjustmentRow;
  } catch (e) {
    return mock.createAdjustment(payload);
  }
}

export async function updateAdjustment(id: number, payload: AdjustmentPayload) {
  try {
    const res = await api.put(`/admin/stock-adjustments/${id}`, payload);
    return (res?.data?.data ?? res?.data) as AdjustmentRow;
  } catch (e) {
    return mock.updateAdjustment(id, payload);
  }
}

export async function deleteAdjustment(id: number) {
  try {
    await api.delete(`/admin/stock-adjustments/${id}`);
    return true;
  } catch (e) {
    return mock.deleteAdjustment(id);
  }
}

// status actions mirror Transfer endpoints style
export async function submitForApproval(id: number) {
  try {
    await api.post(`/admin/stock-adjustment/submit-for-approval/${id}`);
    return true;
  } catch (e) {
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
        ? `/admin/stock-adjustment/approve/${id}`
        : action === "cancel"
        ? `/admin/stock-adjustment/cancel/${id}`
        : `/admin/stock-adjustment/reject/${id}`;
    await api.post(path);
    return true;
  } catch (e) {
    return mock.changeStatus(id, action);
  }
}

export async function pagedWarehouses(page: number, search: string) {
  try {
    const res = await api.get(`/admin/paginated-warehouses`, {
      params: {
        page,
        per_page: 20,
        search: search || undefined,
        status: "active",
      },
    });
    const rows = (res?.data?.data ?? []).map((w: any) => ({
      id: w.id,
      name: w.name,
    }));
    const meta = res?.data?.meta ?? {};
    return {
      items: rows,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? rows.length,
    };
  } catch (e) {
    return mock.pagedWarehouses(page, search);
  }
}

export async function pagedProducts(page: number, search: string) {
  try {
    const res = await api.get(`/admin/paginated-products`, {
      params: {
        page,
        per_page: 20,
        search: search || undefined,
        status: "active",
      },
    });
    const rows = (res?.data?.data ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
    }));
    const meta = res?.data?.meta ?? {};
    return {
      items: rows,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? rows.length,
    };
  } catch (e) {
    return mock.pagedProducts(page, search);
  }
}
