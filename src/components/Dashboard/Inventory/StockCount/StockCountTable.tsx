"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import SignedDiff from "./SignedDiff";
import type { StockCountRow } from "./mockStockCounts";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean; // Accept
  canAccept?: boolean; // for RowActions compatibility
  canReject?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
};

export default function StockCountTable({
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
  rows: StockCountRow[];
  loading?: boolean;
  onView: (r: StockCountRow) => void;
  onEdit: (r: StockCountRow) => void;
  onSubmit: (r: StockCountRow) => void;
  onApprove: (r: StockCountRow) => void;
  onReject: (r: StockCountRow) => void;
  onCancel: (r: StockCountRow) => void;
  onDelete: (r: StockCountRow) => void;
  permissions: TablePerms;
}) {
  const columns: Column<StockCountRow>[] = [
    {
      key: "code",
      headerKey: "ID",
      className: "min-w-[140px]",
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
      className: "min-w-[220px]",
      render: (r) => r.warehouse?.name || "—",
    },
    {
      key: "variance",
      headerKey: "Variance",
      className: "min-w-[120px]",
      render: (r) => <SignedDiff value={r.variance} />,
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
          canApprove: true, // !!permissions.canApprove && isDraft, // submit-for-approval shown via onSubmit handler
          canAccept: true, // !!permissions.canAccept && isPending, // “Accept”
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
            permissions={rowPerms}
          />
        );
      },
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
