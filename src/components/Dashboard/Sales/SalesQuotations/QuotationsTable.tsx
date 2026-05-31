// QuotationsTable.tsx
"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";
import PurchaseStatusBadge from "@/components/Dashboard/Purchase/Common/PurchaseStatusBadge";
import { useLocale } from "next-intl";
import type { QuotationRow } from "./mockSalesQuotations";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import { nfCurrency } from "../../InventorySettings/InventoryFormDialog/helpers";
import RowActions from "../../Purchase/Common/RowActions";

export default function QuotationsTable({
  rows,
  loading,
  onView,
  onEdit,
  onApprove,
  onConvert,
  onDelete,
}: {
  rows: QuotationRow[];
  loading?: boolean;
  onView: (r: QuotationRow) => void;
  onEdit: (r: QuotationRow) => void;
  onApprove: (r: QuotationRow) => void;
  onConvert: (r: QuotationRow) => void;
  onDelete: (r: QuotationRow) => void;
}) {
  const locale = useLocale();

  const columns: Column<QuotationRow>[] = [
    {
      key: "code",
      headerKey: "Quotation No",
      className: "min-w-[140px]",
      render: (r) => <span className="font-medium">{r.code}</span>,
    },
    {
      key: "customer",
      headerKey: "Customer",
      className: "min-w-[200px]",
      render: (r) => r.customer,
    },
    {
      key: "date",
      headerKey: "Date",
      className: "min-w-[140px]",
      render: (r) => r.date,
    },
    {
      key: "total_amount",
      headerKey: "Total Amount",
      className: "min-w-[140px]",
      render: (r) => nfCurrency(locale, r.total_amount),
    },
    {
      key: "status",
      headerKey: "Status",
      className: "min-w-[120px]",
      render: (r) => (
        <PurchaseStatusBadge value={r.status} map={PO_STATUS_MAP} />
      ),
    },
    {
      key: "actions",
      headerKey: "Actions",
      className: "",
      render: (r) => {
        const isDraft = r.status === "Draft";

        const rowPerms = {
          canView: true, // permissions.canView ?? true,
          canEdit: true, // !!permissions.canEdit && (isDraft || isRejected),
          canExport: true, // permissions.canExport ?? false,
          canApprove: false, // !!permissions.canApprove && isDraft, // submit-for-approval in RowActions
          canAccept: true, //  !!permissions.canAccept && isPending, // “Accept”
          canReject: false, // !!permissions.canReject && isPending,
          canCancel: false, // !!permissions.canCancel && isPending,
          canDelete: true, // !!permissions.canDelete && (isDraft || isRejected),
          canConvert: true, // !!permissions.canDelete && (isDraft || isRejected),
        };

        return (
          <RowActions
            onView={() => onView(r)}
            onEdit={() => onEdit(r)}
            onSubmitForApproval={() => {}}
            onExport={() => {
              /* hook up later */
            }}
            onAccept={() => onApprove(r)}
            onReject={() => {}}
            onCancel={() => {}}
            onConvert={() => onConvert(r)}
            onDelete={() => onDelete(r)}
            permissions={rowPerms}
          />
        );
      },
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
