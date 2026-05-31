"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import ActionsBar from "@/components/Dashboard/Purchase/ShowPurchase/sections/ActionsBar";
import TabbedPanel from "@/components/Dashboard/Purchase/ShowPurchase/sections/TabbedPanel";
import OrderedItemsTab from "@/components/Dashboard/Purchase/ShowPurchase/sections/ItemsTab";
import InvoicesTab from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseOrder/tabs/InvoicesTab";
import NotesAttachmentsTab from "@/components/Dashboard/Purchase/ShowPurchase/sections/NotesAttachmentsTab";
import ApprovalHistoryTab from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseOrder/tabs/ApprovalHistoryTab";
import ConfirmStatusDialog from "@/components/Dashboard/Purchase/PurchaseOrders/ConfirmPOStatusDialog";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import { ActivityLog } from "@/types/activity-log";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";

// 🧾 Mock API client that simulates network fetch
async function mockApiGet(path: string) {
  console.log("Mock GET:", path);

  // Simulate server delay
  await new Promise((r) => setTimeout(r, 500));

  if (path.includes("get-activity-logs")) {
    return {
      data: [
        {
          id: 1,
          user_name: "Admin",
          action: "Created",
          note: "Sales Order initialized",
          created_at: "2025-08-20T10:00:00Z",
        },
        {
          id: 2,
          user_name: "Manager",
          action: "Approved",
          note: "Looks good",
          created_at: "2025-08-21T09:30:00Z",
        },
      ],
    };
  }

  // Default sales order mock
  return {
    data: {
      id: 1,
      code: "SO-2025-001",
      order_date: "2025-08-15",
      expected_delivery: "2025-08-30",
      sub_total: 3450,
      total_tax: 0,
      total_amount: 3450,
      status: "Approved",
      payment_terms: "Net 30",
      notes: "Deliver before end of month.",
      currency: { id: 1, title: "Saudi Riyal", symbol: "ر.س", code: "SAR" },
      by_user: { id: 1, name: "Admin User" },
      customer: { id: 1, name: "John Smith" },
      sales_order_items: [
        {
          id: 1,
          quantity: 10,
          price: 12,
          sub_total: 120,
          tax: 0,
          total_price: 120,
          expired_date: null,
          received_quantity: 10,
          remaining_quantity: 0,
          productable_type: "Product",
          unit: {
            id: 5,
            name: "باكيت 6",
            short_code: "P6",
            conversion_factor: 6,
            status: "active",
          },
          productable: {
            id: 5,
            name: "طقم مفروشات",
            sku: "no-prefix-001",
            has_variant: false,
            description: "لباتنم",
            barcode: "098765477",
            flow: "Finished Goods",
            type: "grouped products",
            brand_name: "TW",
            purchase_price: "0.00",
            sale_price: "60.00",
            profit_margin: "0.00",
            tax_1: "14.00",
            tax_2: null,
            lowest_sale_price: "50.00",
            discount_type: null,
            discount_value: null,
            stock: "0.00",
            track_inventory: false,
            track_expiry_date: false,
            tags: null,
            status: "active",
            notes: null,
            units: {
              id: 1,
              name: "قطعه",
              short_code: "ق",
              conversion_factor: 1,
              status: "active",
              base_unit: null,
              dervied_unit: [
                {
                  id: 5,
                  name: "باكيت 6",
                  short_code: "P6",
                  conversion_factor: 6,
                  status: "active",
                },
                {
                  id: 6,
                  name: "كرتونه 24",
                  short_code: "P24",
                  conversion_factor: 24,
                  status: "active",
                },
              ],
            },
            image: "",
          },
        },
      ],
      attachments: [],
      invoices: [
        {
          id: 21,
          code: "PI-2025-006",
          invoice_date: "2025-10-16",
          payment_terms: "term",
          sub_total: 0,
          total_tax: 0,
          status: "Draft",
          total_amount: 0,
          balance_due: 0,
          notes: null,
        },
      ],
    },
  };
}

async function mockApiPost(path: string) {
  console.log("Mock POST:", path);
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

type API_SO = {
  id: number;
  code: string | null;
  order_date: string | null;
  expected_delivery: string | null;
  sub_total?: number | null;
  total_tax?: number | null;
  total_amount?: number | null;
  status: string | null;
  payment_terms?: string | null;
  notes?: string | null;

  currency?: { id: number; title: string; symbol: string; code: string } | null;
  by_user?: { id: number; name?: string | null } | null;
  customer?: { id: number; name?: string | null } | null;

  sales_order_items?: any[];
  attachments?: any[];
  created_at?: string | null;

  approvals?: Array<{
    id: number | string;
    user_name?: string | null;
    action?: "Submitted" | "Approved" | "Rejected" | string;
    note?: string | null;
    created_at?: string | null;
  }>;
  invoices?: any[];
};

export default function SalesOrderDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [so, setSo] = useState<API_SO | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ActivityLog[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject";
    loading: boolean;
  }>({ open: false, action: "approve", loading: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await mockApiGet(`/admin/sales-orders/${id}`);
      const raw: API_SO =
        res?.data?.data ?? res?.data?.sales_order ?? res?.data;
      setSo(raw ?? null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadActivity = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await mockApiGet(
        `/admin/sales-orders/get-activity-logs/${id}`
      );
      const rows: ActivityLog[] = Array.isArray(res?.data)
        ? (res.data as ActivityLog[])
        : (res?.data as any)?.data ?? [];
      setEvents(rows);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("activityLoadFailed"));
    } finally {
      setEventsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
    void loadActivity();
  }, [load, loadActivity]);

  async function changeSOStatus(
    salesOrderId: number,
    action: "approve" | "reject"
  ) {
    const path =
      action === "approve"
        ? `/admin/sales-orders/approve/${salesOrderId}`
        : `/admin/sales-orders/reject/${salesOrderId}`;
    return mockApiPost(path);
  }

  const confirmStatus = async () => {
    if (!so) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changeSOStatus(so.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("Sales Order approved successfully.")
          : t("Sales Order rejected.")
      );
      setStatusDlg((s) => ({ ...s, open: false }));
      await load();
      await loadActivity();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("Action failed."));
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  if (!so) return null;

  const customerName = so.customer?.name ?? "-";
  const createdBy = so.by_user?.name ?? "-";
  const total = so.total_amount ?? 0;
  const orderedItems = so.sales_order_items ?? [];
  const attachments = so.attachments ?? [];

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/sales/orders"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Sales orders")}
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Sales Order Details")}
        </h1>

        <ActionsBar
          id={so.id}
          entity="sales-order"
          status={so.status ?? ""}
          onApprove={() =>
            setStatusDlg({ open: true, action: "approve", loading: false })
          }
          onReject={() =>
            setStatusDlg({ open: true, action: "reject", loading: false })
          }
          onPrint={() => window.print()}
          exportMenu={<ExportMenu />}
          loading={loading}
        />
      </div>

      <SectionCard>
        <KeyValueGrid
          cols={3}
          items={[
            { label: t("SO Number"), value: so.code ?? "-" },
            { label: t("Customer Name"), value: customerName },
            {
              label: t("Status"),
              value: so.status && <StatusPill value={so.status} />,
            },
            { label: t("Order Date"), value: so.order_date ?? "-" },
            {
              label: t("Expected Delivery"),
              value: so.expected_delivery ?? "-",
            },
            {
              label: t("Total Amount"),
              value: so?.currency?.symbol
                ? so.currency.symbol + " " + total.toFixed(2)
                : nfCurrency(locale, total),
            },
            { label: t("Payment Terms"), value: so.payment_terms ?? "-" },
            { label: t("Created By"), value: createdBy },
          ]}
        />
      </SectionCard>

      <TabbedPanel
        tabs={[
          {
            key: "items",
            label: t("Ordered Items"),
            content: (
              <OrderedItemsTab
                currency={so.currency?.symbol || ""}
                rows={orderedItems}
              />
            ),
          },
          {
            key: "invoices",
            label: t("Invoices"),
            content: (
              <InvoicesTab
                rows={so.invoices ?? []}
                currency={so.currency?.symbol}
                isSales
              />
            ),
          },
          {
            key: "notes",
            label: t("Notes & Attachments"),
            content: (
              <NotesAttachmentsTab
                note={so.notes ?? ""}
                attachments={attachments}
              />
            ),
          },
          {
            key: "approval",
            label: t("Approval History"),
            content: (
              <ApprovalHistoryTab logs={events} loading={eventsLoading} />
            ),
          },
        ]}
      />

      <ConfirmStatusDialog
        poCode={so.code || ""}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </div>
  );
}
