"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import ActionsBar from "@/components/Dashboard/Purchase/ShowPurchase/sections/ActionsBar";
import TabbedPanel from "@/components/Dashboard/Purchase/ShowPurchase/sections/TabbedPanel";

import ItemsTab from "@/components/Dashboard/Purchase/ShowPurchase/sections/ItemsTab";
import LinkedPOsTab from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseInvoice/tabs/LinkedPOsTab";
import PaymentsTab from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseInvoice/tabs/PaymentsTab";
import NotesAttachmentsTab from "@/components/Dashboard/Purchase/ShowPurchase/sections/NotesAttachmentsTab";
import ApprovalLogTab from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseInvoice/tabs/ApprovalLogTab";

import ConfirmStatusDialog from "@/components/Dashboard/Purchase/PurchaseOrders/ConfirmPOStatusDialog";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";

/** -----------------------------------------------------------------------
 * MOCK DATA (replace with live API later)
 * ----------------------------------------------------------------------*/
const mockedSalesInvoice = {
  id: 101,
  code: "SI-2025-001",
  customer: { id: 1, name: "Acme Corporation" },
  status: "Pending",
  invoice_date: "2025-08-28",
  due_date: "2025-09-28",
  payment_terms: "Net 30 Days",
  total_amount: 4400,
  balance_due: 4400,
  currency: { id: 1, title: "Saudi Riyal", symbol: "ر.س", code: "SAR" },
  notes: "Thank you for your business!",

  sales_order: {
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
  },

  items: [
    {
      id: 1,
      quantity_receive: 2,
      price: 2,
      sub_total: 4,
      tax: 1,
      total_price: 4.04,
      expired_date: null,
      unit: {
        id: 1,
        name: "قطعه",
        short_code: "ق",
        conversion_factor: 1,
        status: "active",
      },
      warehouse: {
        id: 1,
        name: "مخزن الرياض 1",
        type: "Finished Goods",
        address: "الرياض",
        contact_number: "+201004281947",
        capacity: 200,
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

  payments: [
    {
      id: "PAY-2025-001",
      date: "2025-09-01",
      amount: 2200,
      method: "Credit Card",
      reference: "CC-REF-123",
    },
  ],

  attachments: [
    {
      id: 1,
      file_name: "Invoice_Copy.pdf",
      uploaded_by: "Sarah Connor",
      uploaded_at: "Aug 28, 2025, 2:15 PM",
    },
  ],

  approvals: [
    {
      id: 1,
      title: "Created by John Doe",
      subtitle: "Initial entry",
      at: "Aug 28, 2025, 10:00 AM",
    },
    {
      id: 2,
      title: "Submitted for Approval by John Doe",
      at: "Aug 28, 2025, 10:30 AM",
    },
    {
      id: 3,
      title: "Approved by Jane Smith",
      subtitle: "All good to proceed",
      at: "Aug 28, 2025, 11:00 AM",
    },
  ],
};

export default function SalesInvoiceDetails({ id = 101 }: { id?: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject";
    loading: boolean;
  }>({ open: false, action: "approve", loading: false });

  /** ------------------------------ Mock Loader ------------------------------ */
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInvoice(mockedSalesInvoice);
      setLoading(false);
    }, 800);
  }, []);

  /** ------------------------------ Mock Actions ------------------------------ */
  async function changeStatus(action: "approve" | "reject") {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  const confirmStatus = async () => {
    if (!invoice) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changeStatus(statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("salesInvoice.approvedToast") || "Sales Invoice approved!"
          : t("salesInvoice.rejectedToast") || "Sales Invoice rejected!"
      );
      setInvoice((p: any) => ({
        ...p,
        status: statusDlg.action === "approve" ? "Approved" : "Rejected",
      }));
      setStatusDlg((s) => ({ ...s, open: false }));
    } catch (e: any) {
      toast.error(
        e?.message || t("salesInvoice.failedToast") || "Action failed."
      );
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  if (!invoice) return null;

  const currency = invoice.currency?.symbol ?? "$";

  return (
    <div className="space-y-6 p-6">
      {/* Back Link */}
      <Link
        href="/dashboard/sales/invoices"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Sales Invoices")}
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Invoice Details")}
        </h1>
        <ActionsBar
          entity="invoice"
          status={invoice.status ?? ""}
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

      {/* Info Grid */}
      <SectionCard>
        <KeyValueGrid
          cols={3}
          items={[
            { label: t("Invoice Number"), value: invoice.code ?? "-" },
            { label: t("Customer"), value: invoice.customer?.name ?? "-" },
            {
              label: t("Status"),
              value: invoice.status && <StatusPill value={invoice.status} />,
            },
            { label: t("Invoice Date"), value: invoice.invoice_date ?? "-" },
            {
              label: t("Linked SO"),
              value: invoice.sales_order.id && (
                <Link
                  className="text-primary-700 underline"
                  href={`/dashboard/sales/orders/${invoice.sales_order.id}`}
                >
                  {invoice.sales_order.code ?? "-"}
                </Link>
              ),
            },
            { label: t("Due Date"), value: invoice.due_date ?? "-" },
            {
              label: t("Total Amount"),
              value: currency
                ? `${currency} ${invoice.total_amount}`
                : nfCurrency(locale, invoice.total_amount ?? 0),
            },
            {
              label: t("Balance Due"),
              value: currency
                ? `${currency} ${invoice.balance_due}`
                : nfCurrency(locale, invoice.balance_due ?? 0),
            },
            { label: t("Payment Terms"), value: invoice.payment_terms ?? "-" },
          ]}
        />
      </SectionCard>

      {/* Tabs */}
      <TabbedPanel
        tabs={[
          {
            key: "items",
            label: t("Items"),
            content: (
              <ItemsTab currency={currency} rows={invoice.items} isInvoice />
            ),
          },
          {
            key: "sales_orders",
            label: t("Linked SOs"),
            content: <LinkedPOsTab rows={[invoice.sales_order]} isSales />,
          },
          {
            key: "payments",
            label: t("Payments"),
            content: <PaymentsTab rows={invoice.payments} />,
          },
          {
            key: "attachments",
            label: t("Attachments / Notes"),
            content: (
              <NotesAttachmentsTab
                note={invoice.notes || "-"}
                attachments={invoice.attachments}
              />
            ),
          },
          {
            key: "approval_log",
            label: t("Approval Log"),
            content: <ApprovalLogTab events={invoice.approvals} />,
          },
        ]}
      />

      {/* Confirm Dialog */}
      <ConfirmStatusDialog
        poCode={invoice.code || ""}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </div>
  );
}
