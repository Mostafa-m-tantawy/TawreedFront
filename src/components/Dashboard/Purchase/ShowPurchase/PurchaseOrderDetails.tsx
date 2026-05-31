"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api.client";
import { toast } from "sonner";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import ActionsBar from "@/components/Dashboard/Purchase/ShowPurchase/sections/ActionsBar";
import TabbedPanel from "@/components/Dashboard/Purchase/ShowPurchase/sections/TabbedPanel";

import OrderedItemsTab from "./sections/ItemsTab";
import InvoicesTab from "./PurchaseOrder/tabs/InvoicesTab";
import NotesAttachmentsTab from "./sections/NotesAttachmentsTab";
import ApprovalHistoryTab from "./PurchaseOrder/tabs/ApprovalHistoryTab";
import ExportMenu from "../Common/ExportMenu";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import ConfirmStatusDialog from "../PurchaseOrders/ConfirmPOStatusDialog";
import { ActivityLog } from "@/types/activity-log";

type API_PO = {
  id: number;
  code: string | null;
  order_date: string | null;
  expected_delivery: string | null;
  sub_total?: number | null;
  total_tax?: number | null;
  total_price?: number | null;
  total_amount?: number | null;
  status: string | null;
  payment_terms?: string | null;
  notes?: string | null;

  currency?: { id: number; title: string; symbol: string; code: string } | null;
  by_user?: { id: number; name?: string | null } | null;
  supplier?: { id: number; name?: string | null } | null;

  purchase_order_items?: any[];
  purchase_invoices?: any[];
  attachments?: any[];
  created_at?: string | null;

  approvals?: Array<{
    id: number | string;
    user_name?: string | null;
    action?: "Submitted" | "Approved" | "Rejected" | string;
    note?: string | null;
    created_at?: string | null;
  }>;
};

export default function PurchaseOrderDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [po, setPo] = useState<API_PO | null>(null);
  const [loading, setLoading] = useState(false);

  // NEW: activity events state
  const [events, setEvents] = useState<ActivityLog[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // approve/reject dialog state
  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject";
    loading: boolean;
  }>({ open: false, action: "approve", loading: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/purchase-orders/${id}`);
      const raw: API_PO =
        res?.data?.data ?? res?.data?.purchase_order ?? res?.data;
      setPo(raw ?? null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const loadActivity = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await api.get<ActivityLog[] | { data: ActivityLog[] }>(
        `/admin/purchase-orders/get-activity-logs/${id}`,
        { headers: { "Accept-Language": locale } }
      );
      const rows: ActivityLog[] = Array.isArray(res?.data)
        ? (res.data as ActivityLog[])
        : (res?.data as any)?.data ?? [];

      setEvents(rows);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("purchaseOrder.activityLoadFailed")
      );
    } finally {
      setEventsLoading(false);
    }
  }, [id, locale, t]);

  useEffect(() => {
    void load();
    void loadActivity();
  }, [load, loadActivity]);

  async function changePOStatus(
    purchaseOrderId: number,
    action: "approve" | "reject"
  ) {
    const path =
      action === "approve"
        ? `/admin/purchase-orders/approve/${purchaseOrderId}`
        : `/admin/purchase-orders/reject/${purchaseOrderId}`;
    return api.post(path);
  }

  const confirmStatus = async () => {
    if (!po) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changePOStatus(po.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("purchaseOrder.approvedToast")
          : t("purchaseOrder.rejectedToast")
      );
      setStatusDlg((s) => ({ ...s, open: false }));
      await load();
      await loadActivity(); // refresh history after an action
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("purchaseOrder.failedToast"));
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  if (!po) return null;

  const supplierName = po.supplier?.name ?? "";
  const createdBy = po.by_user?.name ?? "";
  const total = (po.total_price ?? po.total_amount ?? 0) as number;

  const orderedItems = Array.isArray(po.purchase_order_items)
    ? po.purchase_order_items
    : [];
  const invoices = Array.isArray(po.purchase_invoices)
    ? po.purchase_invoices
    : [];
  const attachments = Array.isArray(po.attachments) ? po.attachments : [];

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/purchase/orders"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Purchase orders")}
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Purchase Order Details")}
        </h1>

        <ActionsBar
          id={po.id}
          entity="order"
          status={po.status ?? ""}
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
            { label: t("PO Number"), value: po.code ?? "-" },
            { label: t("Supplier Name"), value: supplierName || "-" },
            {
              label: t("Status"),
              value: po.status && <StatusPill value={po.status} />,
            },
            { label: t("Order Date"), value: po.order_date ?? "-" },
            {
              label: t("Expected Delivery"),
              value: po.expected_delivery ?? "-",
            },
            {
              label: t("Total Amount"),
              value: po?.currency?.symbol
                ? po.currency.symbol + " " + total.toFixed(2)
                : nfCurrency(locale, total),
            },
            { label: t("Payment Terms"), value: po.payment_terms ?? "-" },
            { label: t("Created By"), value: createdBy || "-" },
          ]}
        />
      </SectionCard>

      <TabbedPanel
        tabs={[
          {
            key: "items",
            label: t("Ordered items"),
            content: (
              <OrderedItemsTab
                currency={po.currency?.symbol || ""}
                rows={orderedItems}
              />
            ),
          },
          {
            key: "invoices",
            label: t("Invoices"),
            content: (
              <InvoicesTab rows={invoices} currency={po.currency?.symbol} />
            ),
          },
          {
            key: "notes",
            label: t("Notes & Attachments"),
            content: (
              <NotesAttachmentsTab
                note={po.notes ?? ""}
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
        poCode={po.code || ""}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </div>
  );
}
