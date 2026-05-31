"use client";
import { Button } from "@/components/ui/button";
import ProtectedElement from "@/components/ui/protected-element";
import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Add } from "iconsax-reactjs";
import Link from "next/link";

type Entity = "order" | "invoice" | "sales-order";

type PermissionSet = {
  approve: string;
  reject: string;
  view: string;
  export: string;
  addInvoice?: string;
};

const PERMS: Record<Entity, PermissionSet> = {
  order: {
    approve: "approve-purchase-orders",
    reject: "reject-purchase-orders",
    view: "view-purchase-orders",
    export: "export-purchase-orders",
    addInvoice: "create-purchase-invoices",
  },
  invoice: {
    approve: "approve-purchase-invoices",
    reject: "reject-purchase-invoices",
    view: "view-purchase-invoices",
    export: "export-purchase-invoices",
  },
  "sales-order": {
    approve: "approve-purchase-invoices",
    reject: "reject-purchase-invoices",
    view: "view-purchase-invoices",
    export: "export-purchase-invoices",
  },
};

function canShowApprove(status: string) {
  const s = status?.toLowerCase?.() || "";

  return s === "pending";
}

function canShowReject(status: string) {
  const s = status?.toLowerCase?.() || "";

  return s === "pending";
}

export default function ActionsBar({
  id,
  entity,
  status,
  onApprove,
  onReject,
  onPrint,
  exportMenu,
  loading = false,
  /** optionally override default permissions */
  permissions,
}: {
  id?: number;
  entity: Entity;
  status: string;
  onApprove?: () => void;
  onReject?: () => void;
  onPrint?: () => void;
  exportMenu?: React.ReactNode;
  loading?: boolean;
  permissions?: Partial<PermissionSet>;
}) {
  const t = useTranslations("");

  const p = { ...PERMS[entity], ...(permissions || {}) };

  const showApprove = !!onApprove && canShowApprove(status);
  const showReject = !!onReject && canShowReject(status);
  const showAddInvoice = entity === "order" && status === "Approved";

  return (
    <div className="flex gap-2 flex-wrap">
      {showApprove && (
        <ProtectedElement permissions={p.approve}>
          <Button
            variant="secondary"
            onClick={onApprove}
            disabled={loading}
            size="md"
            className="rounded-md font-normal !text-[#29A548]"
          >
            {t("Approve")}
          </Button>
        </ProtectedElement>
      )}

      {showReject && (
        <ProtectedElement permissions={p.reject}>
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={loading}
            size="md"
            className="rounded-md font-normal !text-[#FF3B30]"
          >
            {t("Reject")}
          </Button>
        </ProtectedElement>
      )}

      {showAddInvoice && (
        <ProtectedElement permissions={p.addInvoice || ""}>
          <Link href={`/dashboard/purchase/invoices/create?po=${id}`}>
            <Button
              variant="secondary"
              disabled={loading}
              size="md"
              className="rounded-md font-normal"
            >
              <Add size={20} />
              {t("Add Invoice")}
            </Button>
          </Link>
        </ProtectedElement>
      )}

      {onPrint && (
        <ProtectedElement permissions={p.view}>
          <Button
            variant="secondary"
            onClick={onPrint}
            disabled={loading}
            size="md"
            className="rounded-md font-normal"
          >
            <Printer size={18} />
            {t("Print")}
          </Button>
        </ProtectedElement>
      )}

      {exportMenu && (
        <ProtectedElement permissions={p.export}>{exportMenu}</ProtectedElement>
      )}
    </div>
  );
}
