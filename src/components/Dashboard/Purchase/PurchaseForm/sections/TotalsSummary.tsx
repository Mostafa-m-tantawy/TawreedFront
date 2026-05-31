"use client";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import { computeTotals } from "@/lib/purchase/common-normalizers";
import type { PurchaseLineItem } from "@/types/purchase-invoice";
import { useTranslations, useLocale } from "next-intl";

export default function TotalsSummary({
  items,
}: {
  items: PurchaseLineItem[];
}) {
  const t = useTranslations("");
  const locale = useLocale();

  const { subtotal, tax, grand } = computeTotals(items);

  return (
    <div className="rounded-2xl bg-white p-6 space-y-2">
      <div className="flex justify-between gap-4 flex-wrap ty-body-md">
        <h4 className="text-[#6B7280]">{t("Subtotal:")}</h4>
        <span className="text-black">{nfCurrency(locale, subtotal)}</span>
      </div>
      <div className="flex justify-between gap-4 flex-wrap ty-body-md">
        <h4 className="text-[#6B7280]">{t("Tax:")}</h4>
        <span className="text-black">{nfCurrency(locale, tax)}</span>
      </div>
      <div className="flex justify-between gap-4 flex-wrap text-primary-700 pt-4 border-t border-neutral-white-300">
        <h4 className="ty-body-lg">{t("Grand Total:")}</h4>
        <span className="text-black ty-body-lg-2 ">
          {nfCurrency(locale, grand)}
        </span>
      </div>
    </div>
  );
}
