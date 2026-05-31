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

import ItemsTab from "./sections/ItemsTab";
import LinkedPOsTab from "./PurchaseInvoice/tabs/LinkedPOsTab";
import PaymentsTab from "./PurchaseInvoice/tabs/PaymentsTab";
import AttachmentsTab from "./PurchaseInvoice/tabs/AttachmentsTab";
import ApprovalLogTab from "./PurchaseInvoice/tabs/ApprovalLogTab";

import ExportMenu from "../Common/ExportMenu";
import ConfirmStatusDialog from "../PurchaseOrders/ConfirmPOStatusDialog";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import NotesAttachmentsTab from "./sections/NotesAttachmentsTab";

const mockedData = {
  linked_pos: [
    {
      id: 1,
      number: "PO-2023-001",
      date: "Jun 20, 2023",
      amount: 3450,
      status: "Approved",
    },
  ],
  payments: [
    {
      id: "PAY-2023-001",
      date: "Jun 20, 2023",
      amount: 3450,
      method: "Bank Transfer",
      reference: "TRF12345",
    },
  ],
  attachments: [
    {
      id: 1,
      file_name: "Delivery_Note.pdf",
      uploaded_by: "Mike Johnson",
      uploaded_at: "Jun 20, 2023, 01:30 PM",
    },
  ],
  approvals: [
    {
      id: 1,
      title: "Created by John Doe",
      subtitle: "Initial creation",
      at: "Jun 10, 2023, 12:30 PM",
    },
    {
      id: 2,
      title: "Submitted for Approval by John Doe",
      at: "Jun 10, 2023, 12:30 PM",
    },
    {
      id: 3,
      title: "Approved by Jane Smith",
      subtitle: "Approved as per budget",
      at: "Jun 10, 2023, 12:30 PM",
    },
  ],
};

export default function PurchaseInvoiceDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [pi, setPi] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject";
    loading: boolean;
  }>({ open: false, action: "approve", loading: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/purchase-invoices/${id}`);
      const raw = res?.data?.data;

      setPi({
        ...raw,
        mocked: mockedData,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changePIStatus(
    invoiceId: number,
    action: "approve" | "reject"
  ) {
    const path =
      action === "approve"
        ? `/admin/purchase-invoices/approve/${invoiceId}`
        : `/admin/purchase-invoices/reject/${invoiceId}`;
    return api.post(path);
  }

  const confirmStatus = async () => {
    if (!pi) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changePIStatus(pi.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("purchaseInvoice.approvedToast")
          : t("purchaseInvoice.rejectedToast")
      );
      setStatusDlg((s) => ({ ...s, open: false }));
      await load();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("purchaseInvoice.failedToast")
      );
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  if (!pi) return null;

  const currency = pi?.purchase_order?.currency?.symbol;

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/purchase/invoices"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Purchase Invoices")}
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Invoice Details")}
        </h1>
        <ActionsBar
          entity="invoice"
          status={pi.status ?? ""}
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
            { label: t("Invoice Number"), value: pi.code ?? "-" },
            { label: t("Supplier"), value: pi.supplier?.name ?? "-" },
            {
              label: t("Status"),
              value: pi.status && <StatusPill value={pi.status} />,
            },
            { label: t("Invoice Date"), value: pi.invoice_date ?? "-" },
            {
              label: t("Linked PO"),
              value: pi.purchase_order.id && (
                <Link
                  className="text-primary-700 underline"
                  href={`/dashboard/purchase/orders/${pi.purchase_order.id}`}
                >
                  {pi.code ?? "-"}
                </Link>
              ),
            },
            { label: t("Due Date"), value: pi.due_date ?? "-" },
            {
              label: t("Total Amount"),
              value: currency
                ? `${currency} ${pi.total_amount}`
                : nfCurrency(locale, pi.total_amount ?? 0),
            },
            {
              label: t("Balance Due"),
              value: currency
                ? `${currency} ${pi.balance_due}`
                : nfCurrency(locale, pi.balance_due ?? 0),
            },
            { label: t("Payment Terms"), value: pi.payment_terms ?? "-" },
          ]}
        />
      </SectionCard>

      <TabbedPanel
        tabs={[
          {
            key: "items",
            label: t("Items"),
            content: (
              <ItemsTab
                currency={currency || ""}
                rows={pi.purchase_invoice_items || []}
                isInvoice
              />
            ),
          },
          {
            key: "pos",
            label: t("Linked POs"),
            content: <LinkedPOsTab rows={[pi.purchase_order]} />,
          },
          {
            key: "payments",
            label: t("Payments"),
            content: <PaymentsTab rows={pi?.mocked?.payments || []} />,
          },
          {
            key: "attachments",
            label: t("Attachments"),
            content: (
              <NotesAttachmentsTab
                note={pi.notes || "-"}
                attachments={pi?.mocked?.attachments || []}
              />
            ),
          },
          {
            key: "approval",
            label: t("Approval Log"),
            content: <ApprovalLogTab events={pi?.mocked?.approvals || []} />,
          },
        ]}
      />

      <ConfirmStatusDialog
        poCode={pi.code || ""}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </div>
  );
}
