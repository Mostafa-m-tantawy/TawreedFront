"use client";

import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import type { AdjustmentRow as DepreciationRow } from "./mockStockDepreciation";

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean; // "Approve" in UI
  canAccept?: boolean; // "Accept" (used for Pending)
  canReject?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
};

export default function DepreciationTable({
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
  rows: DepreciationRow[];
  loading?: boolean;
  onView: (r: DepreciationRow) => void;
  onEdit: (r: DepreciationRow) => void;
  onSubmit: (r: DepreciationRow) => void;
  onApprove: (r: DepreciationRow) => void;
  onReject: (r: DepreciationRow) => void;
  onCancel: (r: DepreciationRow) => void;
  onDelete: (r: DepreciationRow) => void;
  permissions: TablePerms;
}) {
  const columns: Column<DepreciationRow>[] = [
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
      key: "qtyWrittenOff",
      headerKey: "Qty Written-off",
      className: "min-w-[140px]",
      render: (r) => r.qtyWrittenOff,
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
          canApprove: true, // !!permissions.canApprove && isDraft, // "Approve" while in Draft
          canAccept: true, // !!permissions.canAccept && isPending, // Accept while Pending
          canReject: true, // !!permissions.canReject && isPending,
          canCancel: false, // permissions.canCancel ?? false,
          canDelete: true, // !!permissions.canDelete && (isDraft || isRejected),
        };

        return (
          <RowActions
            onView={() => onView(r)}
            onEdit={() => onEdit(r)}
            onSubmitForApproval={() => onSubmit(r)}
            onExport={() => {}}
            onAccept={() => onApprove(r)} // use "accept" slot for approve action
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
