// salesQuotations.api.ts
"use client";
import api from "@/lib/api.client";
import * as mock from "./mockSalesQuotations";
import type {
  QOListParams,
  QuotationRow,
  QuotationPayload,
  QuotationStatus,
} from "./mockSalesQuotations";

const USE_MOCK = true; // flip to false when BE is ready

export async function listQuotations(params: QOListParams) {
  if (USE_MOCK) return mock.listQuotations(params);
  try {
    const res = await api.get("/admin/sales-quotations", { params });
    return {
      data: res?.data?.data ?? [],
      meta: res?.data?.meta ?? {},
      statuses: (res?.data?.statuses ?? [
        "Draft",
        "Approved",
      ]) as QuotationStatus[],
      customers: res?.data?.customers ?? [],
    };
  } catch {
    return mock.listQuotations(params);
  }
}

export async function getQuotation(id: number) {
  if (USE_MOCK) return mock.getQuotation(id);
  try {
    const res = await api.get(`/admin/sales-quotations/${id}`);
    return res?.data?.data ?? res?.data;
  } catch {
    return mock.getQuotation(id);
  }
}

export async function createQuotation(payload: QuotationPayload) {
  if (USE_MOCK) return mock.createQuotation(payload);
  try {
    const res = await api.post("/admin/sales-quotations", payload);
    return res?.data?.data ?? res?.data;
  } catch {
    return mock.createQuotation(payload);
  }
}

export async function updateQuotation(id: number, payload: QuotationPayload) {
  if (USE_MOCK) return mock.updateQuotation(id, payload);
  try {
    const res = await api.put(`/admin/sales-quotations/${id}`, payload);
    return res?.data?.data ?? res?.data;
  } catch {
    return mock.updateQuotation(id, payload);
  }
}

export async function deleteQuotation(id: number) {
  if (USE_MOCK) return mock.deleteQuotation(id);
  try {
    await api.delete(`/admin/sales-quotations/${id}`);
    return true;
  } catch {
    return mock.deleteQuotation(id);
  }
}

export async function approveQuotation(id: number) {
  if (USE_MOCK) return mock.approveQuotation(id);
  try {
    await api.post(`/admin/sales-quotations/${id}/approve`);
    return true;
  } catch {
    return mock.approveQuotation(id);
  }
}

export async function convertToOrder(id: number) {
  if (USE_MOCK) return mock.convertToOrder(id);
  try {
    const res = await api.post(`/admin/sales-quotations/${id}/convert`);
    return res?.data?.data ?? res?.data;
  } catch {
    return mock.convertToOrder(id);
  }
}
