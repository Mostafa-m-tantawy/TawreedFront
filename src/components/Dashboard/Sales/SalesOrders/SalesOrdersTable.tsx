"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import type { SalesOrderRow } from "./mockSalesOrders";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import { useLocale } from "next-intl";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean; // Accept (submit while Draft)
  canAccept?: boolean; // for RowActions compatibility (when Pending)
  canReject?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
};

export default function SalesOrdersTable({
  rows,
  loading,
  onView,
  onEdit,
  onSubmit,
  onApprove, // Accept
  onReject,
  onCancel,
  onDelete,
  permissions,
}: {
  rows: SalesOrderRow[];
  loading?: boolean;
  onView: (r: SalesOrderRow) => void;
  onEdit: (r: SalesOrderRow) => void;
  onSubmit: (r: SalesOrderRow) => void;
  onApprove: (r: SalesOrderRow) => void;
  onReject: (r: SalesOrderRow) => void;
  onCancel: (r: SalesOrderRow) => void;
  onDelete: (r: SalesOrderRow) => void;
  permissions: TablePerms;
}) {
  const locale = useLocale();

  const columns: Column<SalesOrderRow>[] = [
    {
      key: "code",
      headerKey: "SO Number",
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
      key: "order_date",
      headerKey: "Order Date",
      className: "min-w-[140px]",
      render: (r) => r.order_date,
    },
    {
      key: "expected_delivery",
      headerKey: "Expected Delivery",
      className: "min-w-[160px]",
      render: (r) => r.expected_delivery,
    },
    {
      key: "created_by",
      headerKey: "Created By",
      className: "min-w-[160px]",
      render: (r) => r.created_by,
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
          canApprove: true, // !!permissions.canApprove && isDraft, // submit-for-approval in RowActions
          canAccept: true, //  !!permissions.canAccept && isPending, // “Accept”
          canReject: true, // !!permissions.canReject && isPending,
          canCancel: true, // !!permissions.canCancel && isPending,
          canDelete: true, // !!permissions.canDelete && (isDraft || isRejected),
        };

        return (
          <RowActions
            onView={() => onView(r)}
            onEdit={() => onEdit(r)}
            onSubmitForApproval={() => onSubmit(r)}
            onExport={() => {
              /* hook up later */
            }}
            onAccept={() => onApprove(r)}
            onReject={() => onReject(r)}
            onCancel={() => onCancel(r)}
            onDelete={() => onDelete(r)}
            permissions={rowPerms}
          />
        );
      },
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
