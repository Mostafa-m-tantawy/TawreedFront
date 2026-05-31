"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import type { SalesInvoiceRow } from "./mockSalesInvoices";
import Link from "next/link";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import { useLocale } from "next-intl";

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean; // submit from Draft
  canAccept?: boolean; // Accept (when Pending)
  canReject?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
  canMarkPaid?: boolean; // custom action if you add a button for paid
};

export default function SalesInvoicesTable({
  rows,
  loading,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onDelete,
  onMarkPaid,
  permissions,
}: {
  rows: SalesInvoiceRow[];
  loading?: boolean;
  onView: (r: SalesInvoiceRow) => void;
  onEdit: (r: SalesInvoiceRow) => void;
  onSubmit: (r: SalesInvoiceRow) => void;
  onApprove: (r: SalesInvoiceRow) => void;
  onReject: (r: SalesInvoiceRow) => void;
  onCancel: (r: SalesInvoiceRow) => void;
  onDelete: (r: SalesInvoiceRow) => void;
  onMarkPaid?: (r: SalesInvoiceRow) => void;
  permissions: TablePerms;
}) {
  const locale = useLocale();

  const columns: Column<SalesInvoiceRow>[] = [
    {
      key: "code",
      headerKey: "Invoice Number",
      className: "min-w-[140px]",
      render: (r) => <span className="font-medium">{r.code}</span>,
    },
    {
      key: "customer",
      headerKey: "Customer Name",
      className: "min-w-[200px]",
      render: (r) => r.customer,
    },
    {
      key: "invoice_date",
      headerKey: "Invoice Date",
      className: "min-w-[140px]",
      render: (r) => r.invoice_date,
    },
    {
      key: "so_code",
      headerKey: "SO Number",
      className: "min-w-[140px]",
      render: (r) => (
        <Link
          href={`/dashboard/sales/orders/${encodeURIComponent(r.so_code)}`}
          className="text-primary-700 underline"
        >
          {r.so_code}
        </Link>
      ),
    },
    {
      key: "status",
      headerKey: "Status",
      className: "min-w-[140px]",
      render: (r) => (
        <PurchaseStatusBadge value={r.status} map={PO_STATUS_MAP} />
      ),
    },
    {
      key: "total_amount",
      headerKey: "Total Amount",
      className: "min-w-[140px]",
      render: (r) => nfCurrency(locale, r.total_amount),
    },
    {
      key: "balance_due",
      headerKey: "Balance Due",
      className: "min-w-[140px]",
      render: (r) => nfCurrency(locale, r.balance_due),
    },
    {
      key: "actions",
      headerKey: "Actions",
      className: "min-w-[90px]",
      render: (r) => {
        const isDraft = r.status === "Draft";
        const isPending = r.status === "Pending";
        const isRejected = r.status === "Rejected";

        const rowPerms = {
          canView: true, // permissions.canView ?? true,
          canEdit: true, // !!permissions.canEdit && (isDraft || isRejected),
          canExport: true, // permissions.canExport ?? false,
          canApprove: true, // !!permissions.canApprove && isDraft,
          canAccept: true, // !!permissions.canAccept && isPending,
          canReject: true, // !!permissions.canReject && isPending,
          canCancel: true, // !!permissions.canCancel && isPending,
          canDelete: true, // !!permissions.canDelete && (isDraft || isRejected),
        };

        return (
          <RowActions
            onView={() => onView(r)}
            onEdit={() => onEdit(r)}
            onSubmitForApproval={() => onSubmit(r)}
            onExport={() => {}}
            onAccept={() => onApprove(r)}
            onReject={() => onReject(r)}
            onCancel={() => onCancel(r)}
            onDelete={() => onDelete(r)}
            // If you add a dedicated "Mark Paid" button in RowActions, wire it here:
            // onCustom1={() => onMarkPaid?.(r)}
            // custom1Label="Mark as Paid"
            permissions={rowPerms}
          />
        );
      },
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
