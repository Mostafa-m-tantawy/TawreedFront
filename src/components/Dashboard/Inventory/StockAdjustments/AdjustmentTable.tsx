"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import { AdjustmentRow } from "./mockStockAdjustments";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean;
  canAccept?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
};

export default function AdjustmentTable({
  rows,
  loading,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  onDelete,
  permissions,
}: {
  rows: AdjustmentRow[];
  loading?: boolean;
  onView: (r: AdjustmentRow) => void;
  onEdit: (r: AdjustmentRow) => void;
  onSubmit: (r: AdjustmentRow) => void;
  onApprove: (r: AdjustmentRow) => void;
  onReject: (r: AdjustmentRow) => void;
  onCancel: (r: AdjustmentRow) => void;
  onDelete: (r: AdjustmentRow) => void;
  permissions: TablePerms;
}) {
  const columns: Column<AdjustmentRow>[] = [
    {
      key: "code",
      headerKey: "ID",
      className: "min-w-[120px]",
      render: (r) => <span className="font-medium">{r.code}</span>,
    },
    {
      key: "date",
      headerKey: "Date",
      className: "min-w-[120px]",
      render: (r) => r.date,
    },
    {
      key: "warehouse",
      headerKey: "Warehouse",
      className: "min-w-[180px]",
      render: (r) => r.warehouse?.name || "—",
    },
    {
      key: "product",
      headerKey: "Product",
      className: "min-w-[180px]",
      render: (r) => r.product?.name || "—",
    },
    {
      key: "oldQty",
      headerKey: "Old Qty",
      className: "min-w-[100px]",
      render: (r) => r.oldQty,
    },
    {
      key: "newQty",
      headerKey: "New Qty",
      className: "min-w-[100px]",
      render: (r) => r.newQty,
    },
    {
      key: "diff",
      headerKey: "Difference",
      className: "min-w-[110px]",
      render: (r) => Math.abs(r.newQty - r.oldQty),
    },
    {
      key: "reason",
      headerKey: "Reason",
      className: "min-w-[160px]",
      render: (r) => r.reason || "—",
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
          canCancel: false, // false,
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
            permissions={rowPerms}
          />
        );
      },
    },
  ];
  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
