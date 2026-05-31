"use client";

import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import ItemsTable from "./ItemsTable";
import { useLocale, useTranslations } from "next-intl";
import { mapPOItemsToDisplay } from "../../po-helpers";

export default function ItemsTab({
  currency,
  rows,
  isInvoice,
}: {
  currency?: string;
  rows: any[];
  isInvoice?: boolean;
}) {
  const t = useTranslations("");
  const locale = useLocale();

  const mappedRows = mapPOItemsToDisplay(rows);

  const total = mappedRows.reduce((acc, r) => acc + (r.line_total ?? 0), 0);

  return (
    <div>
      <ItemsTable rows={mappedRows} isInvoice={isInvoice} currency={currency} />

      <div className="flex justify-end mt-4 pb-4">
        <div className="px-8 py-4 rounded-xl bg-primary-50 ty-body-md">
          {t("Total :")}{" "}
          {currency
            ? currency + " " + total.toFixed(2)
            : nfCurrency(locale, total)}
        </div>
      </div>
    </div>
  );
}
