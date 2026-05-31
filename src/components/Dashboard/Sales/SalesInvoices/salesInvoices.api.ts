"use client";
import api from "@/lib/api.client";
import * as mock from "./mockSalesInvoices";
import type {
  InvoiceListParams,
  SalesInvoiceRow,
  SalesInvoicePayload,
} from "./mockSalesInvoices";

export async function listInvoices(params: InvoiceListParams) {
  try {
    const res = await api.get("/admin/sales-invoices", { params });
    const data = res?.data?.data ?? [];
    const meta = res?.data?.meta ?? {};
    const statuses: string[] = res?.data?.statuses ?? [
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Cancelled",
      "Paid",
    ];
    return { data, meta, statuses } as {
      data: SalesInvoiceRow[];
      meta: any;
      statuses: string[];
    };
  } catch {
    return mock.listInvoices(params);
  }
}

export async function getInvoice(id: number) {
  try {
    const res = await api.get(`/admin/sales-invoices/${id}`);
    return (res?.data?.data ?? res?.data) as SalesInvoiceRow;
  } catch {
    return mock.getInvoice(id);
  }
}

export async function createInvoice(payload: SalesInvoicePayload) {
  try {
    const res = await api.post("/admin/sales-invoices", payload);
    return (res?.data?.data ?? res?.data) as SalesInvoiceRow;
  } catch {
    return mock.createInvoice(payload);
  }
}

export async function updateInvoice(id: number, payload: SalesInvoicePayload) {
  try {
    const res = await api.put(`/admin/sales-invoices/${id}`, payload);
    return (res?.data?.data ?? res?.data) as SalesInvoiceRow;
  } catch {
    return mock.updateInvoice(id, payload);
  }
}

export async function deleteInvoice(id: number) {
  try {
    await api.delete(`/admin/sales-invoices/${id}`);
    return true;
  } catch {
    return mock.deleteInvoice(id);
  }
}

// workflow actions (singular path, like your orders)
export async function submitForApproval(id: number) {
  try {
    await api.post(`/admin/sales-invoice/submit-for-approval/${id}`);
    return true;
  } catch {
    return mock.submitForApproval(id);
  }
}

export async function changeStatus(
  id: number,
  action: "approve" | "reject" | "cancel" | "mark_paid"
) {
  try {
    const path =
      action === "approve"
        ? `/admin/sales-invoice/approve/${id}`
        : action === "reject"
        ? `/admin/sales-invoice/reject/${id}`
        : action === "cancel"
        ? `/admin/sales-invoice/cancel/${id}`
        : `/admin/sales-invoice/mark-paid/${id}`;
    await api.post(path);
    return true;
  } catch {
    return mock.changeStatus(id, action);
  }
}
