"use client";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import PurchaseStatusBadge from "../Common/PurchaseStatusBadge";
import PurchaseTable, { Column } from "../Common/PurchaseTable";
import RowActions from "../Common/RowActions";
import type { PurchaseOrder } from "@/types/purchase-order";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/store/authStore";

export default function PurchaseOrdersTable(props: {
  rows: PurchaseOrder[];
  loading?: boolean;
  onView: (r: PurchaseOrder) => void;
  onEdit: (r: PurchaseOrder) => void;
  onSubmitForApproval: (r: PurchaseOrder) => void;
  onExport: (r: PurchaseOrder) => void;
  onAccept: (r: PurchaseOrder) => void;
  onAddInvoice: (r: PurchaseOrder) => void;
  onReject: (r: PurchaseOrder) => void;
  onCancel: (r: PurchaseOrder) => void;
  onDelete: (r: PurchaseOrder) => void;
}) {
  const locale = useLocale();

  const { hasPermission } = useAuthStore();

  const columns: Column<PurchaseOrder>[] = [
    { key: "code", headerKey: "PO Number", render: (r) => r.code },
    {
      key: "supplier_name",
      headerKey: "Supplier Name",
      render: (r) => r.supplier.name,
    },
    { key: "order_date", headerKey: "Order Date", render: (r) => r.order_date },
    {
      key: "expected_delivery",
      headerKey: "Expected Delivery",
      render: (r) => r.expected_delivery,
    },
    {
      key: "created_by",
      headerKey: "Created By",
      render: (r) => r.by_user.name,
    },
    {
      key: "status",
      headerKey: "Status",
      render: (r) => (
        <PurchaseStatusBadge value={r.status} map={PO_STATUS_MAP} />
      ),
    },
    {
      key: "total",
      headerKey: "Total Amount",
      render: (r) =>
        r?.currency?.symbol
          ? `${r.currency.symbol} ${r?.total_price ?? 0}`
          : nfCurrency(locale, r?.total_price ?? 0),
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
          onAddInvoice={() => props.onAddInvoice(r)}
          onReject={() => props.onReject(r)}
          onCancel={() => props.onCancel(r)}
          onDelete={() => props.onDelete(r)}
          permissions={{
            canView: r.allowed_actions?.includes("view"),
            canEdit:
              r.allowed_actions?.includes("edit") &&
              hasPermission("edit-purchase-orders"),
            canExport: true,
            canApprove:
              r.allowed_actions?.includes("submit_for_approvel") &&
              hasPermission("edit-purchase-orders"),
            canAccept:
              r.allowed_actions?.includes("approve") &&
              hasPermission("approve-purchase-orders"),
            canAddInvoice:
              r.status == "Approved" &&
              hasPermission("create-purchase-invoices"),
            canReject:
              r.allowed_actions?.includes("reject") &&
              hasPermission("reject-purchase-orders"),
            canCancel: r.allowed_actions?.includes("cancel"),
            canDelete:
              r.allowed_actions?.includes("delete") &&
              hasPermission("delete-purchase-orders"),
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
