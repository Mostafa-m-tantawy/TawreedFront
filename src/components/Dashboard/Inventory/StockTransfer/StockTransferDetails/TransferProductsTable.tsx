"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

export default function TransferProductsTable({
  rows,
}: {
  rows: {
    id: number;
    Product: any;
    quantity: number;
    unit: any;
  }[];
}) {
  const t = useTranslations("");

  return (
    <Table className="border-separate border-spacing-y-2 min-w-[760px]">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[160px]">{t("Product")}</TableHead>
          <TableHead className="w-[160px]">{t("SKU")}</TableHead>
          <TableHead className="w-[140px]">{t("quantity")}</TableHead>
          <TableHead className="w-[120px]">{t("Unit")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i} className="bg-primary-50">
            <TableCell className="rounded-s-xl">
              {r?.Product?.name || "-"}
            </TableCell>
            <TableCell>{r?.Product?.sku || "-"}</TableCell>
            <TableCell>{r?.quantity ?? "-"}</TableCell>
            <TableCell className="rounded-e-xl">
              {r?.unit?.name || "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
