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

export default function PaymentsTab({
  rows,
}: {
  rows: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
  }>;
}) {
  const t = useTranslations("");
  const locale = useLocale();

  return (
    <Table className="border-separate border-spacing-y-2 min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>{t("Payment ID")}</TableHead>
          <TableHead>{t("Date")}</TableHead>
          <TableHead>{t("Amount")}</TableHead>
          <TableHead>{t("Method")}</TableHead>
          <TableHead>{t("Reference")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} className="bg-primary-50">
            <TableCell className="rounded-s-xl">{r.id}</TableCell>
            <TableCell>{r.date}</TableCell>
            <TableCell>{nfCurrency(locale, r.amount)}</TableCell>
            <TableCell>{r.method}</TableCell>
            <TableCell className="rounded-e-xl">{r.reference}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
