"use client";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import { useLocale } from "next-intl";
import PurchaseTable, { Column } from "../../../Common/PurchaseTable";
import { PurchaseOrder } from "@/types/purchase-order";
import RowActions from "../../../Common/RowActions";
import { useRouter } from "next/navigation";

export default function LinkedPOsTab({
  rows,
  isSales = false,
}: {
  rows: Array<PurchaseOrder>;
  isSales?: boolean;
}) {
  const router = useRouter();
  const locale = useLocale();

  const columns: Column<PurchaseOrder>[] = [
    { key: "code", headerKey: "PO Number", render: (r) => r.code },
    { key: "order_date", headerKey: "Order Date", render: (r) => r.order_date },
    {
      key: "expected_delivery",
      headerKey: "Expected Delivery",
      render: (r) => r.expected_delivery,
    },
    {
      key: "total",
      headerKey: "Total Amount",
      render: (r) =>
        r?.currency?.symbol
          ? `${r.currency.symbol} ${r.total_price ?? 0}`
          : nfCurrency(locale, r.total_price ?? 0),
    },
    {
      key: "actions",
      headerKey: "Actions",
      render: (r) => (
        <RowActions
          onView={() => {
            router.push(
              isSales
                ? `/dashboard/sales/orders/${r.id}`
                : `/dashboard/purchase/orders/${r.id}`
            );
          }}
          onEdit={() => {}}
          onSubmitForApproval={() => {}}
          onExport={() => {}}
          onAccept={() => {}}
          onReject={() => {}}
          onDelete={() => {}}
          permissions={{
            canEdit: false,
            canExport: false,
            canApprove: false,
            canAccept: false,
            canReject: false,
            canDelete: false,
          }}
          isLinkedPO
        />
      ),
    },
  ];

  return (
    <PurchaseTable
      rows={rows}
      loading={false}
      columns={columns}
      emptyI18nKey="noRecords"
    />
  );
}
