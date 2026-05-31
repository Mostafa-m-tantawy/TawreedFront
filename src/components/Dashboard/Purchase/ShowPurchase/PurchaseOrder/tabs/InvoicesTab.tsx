"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useLocale, useTranslations } from "next-intl";
import { Eye } from "iconsax-reactjs";
import Link from "next/link";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import StatusPill from "../../sections/StatusPill";

export default function InvoicesTab({
  rows,
  currency,
  isSales,
}: {
  rows: Array<{
    id: number;
    code: string;
    invoice_date: string;
    total_amount: number;
    status: string;
  }>;
  currency?: string;
  isSales?: boolean;
}) {
  const t = useTranslations("");
  const locale = useLocale();

  return (
    <div className="overflow-x-auto">
      <Table className="border-separate border-spacing-y-2 min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("Invoice ID")}</TableHead>
            <TableHead>{t("Date")}</TableHead>
            <TableHead>{t("Amount")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead>{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className="bg-primary-50">
              <TableCell className="rounded-s-xl underline text-primary-700">
                {r.code}
              </TableCell>
              <TableCell>{r.invoice_date}</TableCell>
              <TableCell>
                {currency
                  ? `${currency} ${r.total_amount}`
                  : nfCurrency(locale, r.total_amount)}
              </TableCell>
              <TableCell>
                <StatusPill value={r.status} type="invoice" />
              </TableCell>
              <TableCell className="rounded-e-xl">
                <Link
                  href={
                    isSales
                      ? `/dashboard/sales/invoices/${r.id}`
                      : `/dashboard/purchase/invoices/${r.id}`
                  }
                >
                  <button
                    type="button"
                    className="flex-center gap-2 text-primary-600 ty-body-sm"
                  >
                    <Eye size={20} />
                    {t("View")}
                  </button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4 pb-4">
        <div className="px-8 py-4 rounded-xl bg-primary-50 ty-body-md">
          {t("Total :")}{" "}
          {nfCurrency(
            locale,
            rows.reduce((a, b) => a + b.total_amount, 0)
          )}
        </div>
      </div>
    </div>
  );
}
