"use client";
import { cn } from "@/lib/utils";
import { PO_STATUS_MAP } from "@/lib/purchase/purchase-orders/status.map";
import { PI_STATUS_MAP } from "@/lib/purchase/purchase-invoices/status.map";

const DEFAULT_STYLE = "bg-gray-100 text-gray-700";

export default function StatusPill({
  value,
  type = "order",
}: {
  value?: string;
  type?: "order" | "invoice";
}) {
  if (!value) {
    return (
      <span className={cn("px-3 py-1 rounded-full ty-body-sm", DEFAULT_STYLE)}>
        -
      </span>
    );
  }

  const key = value as keyof typeof PO_STATUS_MAP;
  const map =
    type === "invoice" ? (PI_STATUS_MAP as any) : (PO_STATUS_MAP as any);
  const style =
    map[key]?.bg && map[key]?.text
      ? `${map[key].bg} ${map[key].text}`
      : DEFAULT_STYLE;
  const label = map[key]?.label || value;

  return (
    <span className={cn("px-3 py-1 rounded-full ty-body-sm", style)}>
      {label}
    </span>
  );
}
