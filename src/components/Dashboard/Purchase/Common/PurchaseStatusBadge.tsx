"use client";
import { cn } from "@/lib/utils";

export type StatusToken = string;
export type StatusStyle = { bg: string; text: string; label: string };

export default function PurchaseStatusBadge({
  value,
  map,
}: {
  value: StatusToken;
  map: Record<StatusToken, StatusStyle>;
}) {
  const v = map[value] ?? Object.values(map)[0];
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        v.bg,
        v.text
      )}
    >
      {v.label}
    </span>
  );
}
