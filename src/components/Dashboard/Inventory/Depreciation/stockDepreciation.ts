"use client";
import api from "@/lib/api.client";
import * as mock from "./mockStockDepreciation";
import type {
  AdjustmentListParams as DepreciationListParams,
  AdjustmentRow as DepreciationRow,
  AdjustmentStatus as DepreciationStatus,
  AdjustmentPayload as DepreciationPayload,
} from "./mockStockDepreciation";

// LIST
export async function listDepreciations(params: DepreciationListParams) {
  try {
    const res = await api.get("/admin/stock-depreciations", { params });
    const data = (res?.data?.data ?? []) as DepreciationRow[];
    const meta = res?.data?.meta ?? {};
    const statuses: string[] = res?.data?.statuses ?? [
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
    ];
    return { data, meta, statuses };
  } catch {
    // Fallback to mock
    return mock.listAdjustments(params);
  }
}

// GET ONE
export async function getDepreciation(id: number) {
  try {
    const res = await api.get(`/admin/stock-depreciations/${id}`);
    return (res?.data?.data ?? res?.data) as DepreciationRow;
  } catch {
    return mock.getAdjustment(id);
  }
}

// CREATE
export async function createDepreciation(payload: DepreciationPayload) {
  try {
    const res = await api.post("/admin/stock-depreciations", payload);
    return (res?.data?.data ?? res?.data) as DepreciationRow;
  } catch {
    return mock.createAdjustment(payload);
  }
}

// UPDATE
export async function updateDepreciation(
  id: number,
  payload: DepreciationPayload
) {
  try {
    const res = await api.put(`/admin/stock-depreciations/${id}`, payload);
    return (res?.data?.data ?? res?.data) as DepreciationRow;
  } catch {
    return mock.updateAdjustment(id, payload);
  }
}

// DELETE
export async function deleteDepreciation(id: number) {
  try {
    await api.delete(`/admin/stock-depreciations/${id}`);
    return true;
  } catch {
    return mock.deleteAdjustment(id);
  }
}

// SUBMIT FOR APPROVAL (mirrors Transfer pattern)
export async function submitDepreciationForApproval(id: number) {
  try {
    await api.post(`/admin/stock-depreciation/submit-for-approval/${id}`);
    return true;
  } catch {
    return mock.submitForApproval(id);
  }
}

// CHANGE STATUS (approve / reject / cancel)
export async function changeDepreciationStatus(
  id: number,
  action: "approve" | "reject" | "cancel"
) {
  try {
    const path =
      action === "approve"
        ? `/admin/stock-depreciation/approve/${id}`
        : action === "cancel"
        ? `/admin/stock-depreciation/cancel/${id}`
        : `/admin/stock-depreciation/reject/${id}`;
    await api.post(path);
    return true;
  } catch {
    return mock.changeStatus(id, action);
  }
}

// Paged dropdowns (same as adjustments; API-first, mock fallback)
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
  } catch {
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
  } catch {
    return mock.pagedProducts(page, search);
  }
}
