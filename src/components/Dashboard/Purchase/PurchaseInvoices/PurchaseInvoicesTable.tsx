"use client";
import { PI_STATUS_MAP } from "@/lib/purchase/purchase-invoices/status.map";
import PurchaseStatusBadge from "../Common/PurchaseStatusBadge";
import PurchaseTable, { Column } from "../Common/PurchaseTable";
import RowActions from "../Common/RowActions";
import type { PurchaseInvoice } from "@/types/purchase-invoice";
import Link from "next/link";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/authStore";

export default function PurchaseInvoicesTable(props: {
  rows: PurchaseInvoice[];
  loading?: boolean;
  onView: (r: PurchaseInvoice) => void;
  onEdit: (r: PurchaseInvoice) => void;
  onSubmitForApproval: (r: PurchaseInvoice) => void;
  onExport: (r: PurchaseInvoice) => void;
  onAccept: (r: PurchaseInvoice) => void;
  onReject: (r: PurchaseInvoice) => void;
  onDelete: (r: PurchaseInvoice) => void;
}) {
  const locale = useLocale();
  const { hasPermission } = useAuthStore();

  const columns: Column<PurchaseInvoice>[] = [
    {
      key: "invoice_number",
      headerKey: "Invoice Number",
      render: (r) => r.invoice_number || r.code || "-",
    },
    {
      key: "supplier_name",
      headerKey: "Supplier Name",
      render: (r) => r.supplier?.name ?? r.supplier_name ?? "-",
    },
    {
      key: "invoice_date",
      headerKey: "Invoice Date",
      render: (r) => r.invoice_date,
    },
    {
      key: "po_code",
      headerKey: "PO Number",
      render: (r) =>
        r.purchase_order?.code ? (
          <Link
            href={`/dashboard/purchase/orders/${encodeURIComponent(
              r.purchase_order.id
            )}`}
            className="text-primary-600 hover:underline"
          >
            {r.purchase_order.code}
          </Link>
        ) : (
          "-"
        ),
    },
    {
      key: "status",
      headerKey: "Status",
      render: (r) => (
        <PurchaseStatusBadge value={r.status} map={PI_STATUS_MAP} />
      ),
    },
    {
      key: "total_amount",
      headerKey: "Total Amount",
      render: (r) =>
        r.purchase_order?.currency?.symbol
          ? `${r.purchase_order?.currency?.symbol} ${r.total_amount?.toFixed(
              2
            )}`
          : nfCurrency(locale, r.total_amount ?? 0),
    },
    {
      key: "balance_due",
      headerKey: "Balance Due",
      render: (r) =>
        r.purchase_order?.currency?.symbol
          ? `${r.purchase_order?.currency?.symbol} ${r.balance_due?.toFixed(2)}`
          : nfCurrency(locale, r.balance_due ?? 0),
    },
    {
      key: "actions",
      headerKey: "Actions",
      render: (r) => (
        <RowActions
          onView={() => props.onView(r)}
          onEdit={() => props.onEdit(r)}
          onSubmitForApproval={() => props.onSubmitForApproval(r)}
          onExport={() => props.onExport(r)}
          onAccept={() => props.onAccept(r)}
          onReject={() => props.onReject(r)}
          onDelete={() => props.onDelete(r)}
          permissions={{
            canView: r.allowed_actions?.includes("view"),
            canEdit:
              r.allowed_actions?.includes("edit") &&
              hasPermission("edit-purchase-invoices"),
            canExport: true,
            canApprove:
              r.allowed_actions?.includes("submit_for_approvel") &&
              hasPermission("edit-purchase-invoices"),
            canAccept:
              r.allowed_actions?.includes("approve") &&
              hasPermission("approve-purchase-invoices"),
            canReject:
              r.allowed_actions?.includes("reject") &&
              hasPermission("reject-purchase-invoices"),
            canDelete:
              r.allowed_actions?.includes("delete") &&
              hasPermission("delete-purchase-invoices"),
          }}
        />
      ),
    },
  ];

  return (
    <PurchaseTable
      rows={props.rows}
      loading={props.loading}
      columns={columns}
      emptyI18nKey="noRecords"
    />
  );
}
