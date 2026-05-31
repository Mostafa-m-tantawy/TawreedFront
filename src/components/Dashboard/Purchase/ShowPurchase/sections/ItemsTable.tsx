"use client";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "next-intl";

export type DisplayItem = {
  product_name?: string | null;
  sku?: string | null;
  quantity?: number | null;
  quantity_receive?: number | null;
  unit?: string | null;
  unit_price?: number | null;
  tax_percent?: number | null;
  expiry_date?: string | null;
  line_total?: number | null;
  warehouse: {
    name: string;
  } | null;
};

export default function ItemsTable({
  rows,
  isInvoice = false,
  currency,
}: {
  rows: DisplayItem[];
  isInvoice?: boolean;
  currency?: string;
}) {
  const t = useTranslations("");
  const locale = useLocale();

  return (
    <Table className="border-separate border-spacing-y-2 min-w-[760px]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[220px]">{t("Product")}</TableHead>

          {isInvoice && (
            <TableHead className="w-[100px]">{t("Warehouse")}</TableHead>
          )}

          {!isInvoice && (
            <TableHead className="w-[140px]">{t("Quantity Ordered")}</TableHead>
          )}

          <TableHead className="w-[160px]">{t("Received Quantity")}</TableHead>

          <TableHead className="w-[120px]">{t("Unit")}</TableHead>
          <TableHead className="w-[140px]">{t("Unit Cost")}</TableHead>
          {isInvoice && (
            <TableHead className="w-[100px]">{t("Tax %")}</TableHead>
          )}

          <TableHead className="w-[160px]">{t("Expiry Date")}</TableHead>
          <TableHead className="w-[140px]">{t("Line Total")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i} className="bg-primary-50">
            <TableCell className="rounded-s-xl">
              <div className="font-medium">{r.product_name || "-"}</div>
              {r.sku && (
                <div className="text-xs text-muted-foreground">{r.sku}</div>
              )}
            </TableCell>
            {isInvoice && (
              <TableCell>
                {r?.warehouse?.name != null ? `${r.warehouse.name}` : "-"}
              </TableCell>
            )}
            {!isInvoice && <TableCell>{r.quantity ?? "-"}</TableCell>}
            <TableCell>{r.quantity_receive ?? "-"}</TableCell>
            <TableCell>{r.unit ?? "-"}</TableCell>
            <TableCell>
              {r.unit_price != null
                ? currency
                  ? `${currency} ${r.unit_price}`
                  : `${nfCurrency(locale, r.unit_price)}`
                : "-"}
            </TableCell>
            {isInvoice && (
              <TableCell>
                {r.tax_percent != null ? `${r.tax_percent}%` : "-"}
              </TableCell>
            )}

            <TableCell>{r.expiry_date || "-"}</TableCell>
            <TableCell className="rounded-e-xl">
              {r.line_total != null
                ? currency
                  ? `${currency} ${r.line_total}`
                  : `${nfCurrency(locale, r.line_total)}`
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
