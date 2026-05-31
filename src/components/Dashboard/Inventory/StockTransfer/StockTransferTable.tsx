"use client";

import { useTranslations } from "next-intl";
import PurchaseTable, { Column } from "../../Purchase/Common/PurchaseTable";
import RowActions from "../../Purchase/Common/RowActions";
import PurchaseStatusBadge from "../../Purchase/Common/PurchaseStatusBadge";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";

export type TransferRow = {
  id: number;
  code: string;
  status: string;
  fromWarehouse?: { id: number; name: string };
  toWarehouse?: { id: number; name: string };
  total_products?: number;
};

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

export default function TransfersTable({
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
  rows: TransferRow[];
  loading?: boolean;
  onView: (r: TransferRow) => void;
  onEdit: (r: TransferRow) => void;
  onSubmit: (r: TransferRow) => void;
  onApprove: (r: TransferRow) => void;
  onReject: (r: TransferRow) => void;
  onCancel: (r: TransferRow) => void;
  onDelete: (r: TransferRow) => void;
  permissions: TablePerms;
}) {
  const t = useTranslations("");

  const columns: Column<TransferRow>[] = [
    // {
    //   key: "code",
    //   headerKey: "Code",
    //   className: "min-w-[160px]",
    //   render: (r) => <span className="font-medium">{r.code}</span>,
    // },
    {
      key: "from",
      headerKey: "From",
      className: "min-w-[200px]",
      render: (r) => r.fromWarehouse?.name || "—",
    },
    {
      key: "to",
      headerKey: "To",
      className: "min-w-[200px]",
      render: (r) => r.toWarehouse?.name || "—",
    },
    {
      key: "total_products",
      headerKey: "total_products",
      className: "min-w-[200px]",
      render: (r) => r.total_products,
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
      className: "min-w-[80px]",
      render: (r) => {
        const isDraft = r.status === "Draft";
        const isPending = r.status === "Pending";
        const isApproved = r.status === "Approved";
        const isRejected = r.status === "Rejected";

        const rowPerms = {
          canView: permissions.canView ?? true,
          canEdit: permissions.canEdit && (isDraft || isRejected),
          canExport: permissions.canExport ?? true,
          canApprove: permissions.canApprove && isDraft,
          canAccept: permissions.canAccept && isPending,
          canReject: permissions.canReject && isPending,
          canCancel: false,
          canDelete: permissions.canDelete && (isDraft || isRejected),
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
