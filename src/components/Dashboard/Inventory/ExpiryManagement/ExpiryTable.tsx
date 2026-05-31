"use client";
import React from "react";
import PurchaseTable, {
  type Column,
} from "@/components/Dashboard/Purchase/Common/PurchaseTable";

type ExpiryRow = {
  id: number;
  product: string;
  warehouse: string;
  batch: string;
  expiryDate: string;
  quantity: number;
  daysToExpiry: number;
};

export default function ExpiryTable({
  rows,
  loading,
}: {
  rows: ExpiryRow[];
  loading?: boolean;
}) {
  const colorForDays = (days: number) => {
    if (days <= 7) return "text-[#F04438]"; // red
    if (days <= 30) return "text-[#FF9F00]"; // orange
    return "text-[#12B76A]"; // green
  };

  const columns: Column<ExpiryRow>[] = [
    {
      key: "product",
      headerKey: "Product",
      className: "min-w-[160px]",
      render: (r) => <span className="font-medium">{r.product}</span>,
    },
    {
      key: "warehouse",
      headerKey: "Warehouse",
      className: "min-w-[160px]",
      render: (r) => r.warehouse,
    },
    {
      key: "batch",
      headerKey: "Batch/Lot",
      className: "min-w-[120px]",
      render: (r) => r.batch,
    },
    {
      key: "expiryDate",
      headerKey: "Expiry Date",
      className: "min-w-[140px]",
      render: (r) => r.expiryDate,
    },
    {
      key: "quantity",
      headerKey: "Quantity",
      className: "min-w-[100px]",
      render: (r) => r.quantity,
    },
    {
      key: "daysToExpiry",
      headerKey: "Days to Expiry",
      className: "min-w-[140px]",
      render: (r) => (
        <span className={`${colorForDays(r.daysToExpiry)} font-medium`}>
          {r.daysToExpiry} days
        </span>
      ),
    },
  ];

  return <PurchaseTable rows={rows} loading={loading} columns={columns} />;
}
