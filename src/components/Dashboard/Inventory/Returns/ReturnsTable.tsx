"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import RowActions from "@/components/Dashboard/Purchase/Common/RowActions";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";

type ReturnRow = {
  id: number;
  code: string;
  date: string;
  type: string;
  source: string;
  linked_doc: string;
  products: number;
  status: string;
};

type TablePerms = {
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export default function ReturnsTable({
  rows,
  loading,
  onView,
  onEdit,
  onDelete,
  permissions,
}: {
  rows: ReturnRow[];
  loading?: boolean;
  onView: (r: ReturnRow) => void;
  onEdit: (r: ReturnRow) => void;
  onDelete: (r: ReturnRow) => void;
  permissions: TablePerms;
}) {
  const columns: Column<ReturnRow>[] = [
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
      key: "type",
      headerKey: "Type",
      className: "min-w-[180px]",
      render: (r) => r.type,
    },
    {
      key: "source",
      headerKey: "Source",
      className: "min-w-[180px]",
      render: (r) => r.source,
    },
    {
      key: "linked_doc",
      headerKey: "Linked Document",
      className: "min-w-[160px]",
      render: (r) => r.linked_doc,
    },
    {
      key: "products",
      headerKey: "Products",
      className: "text-center min-w-[100px]",
      render: (r) => r.products,
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
      render: (r) => (
        <RowActions
          onView={() => onView(r)}
          onEdit={() => onEdit(r)}
          onDelete={() => onDelete(r)}
          permissions={{
            canView: true,
            canEdit: true,
            canDelete: true,
            canAccept: true,
            canApprove: true,
            canReject: true,
          }}
        />
      ),
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
