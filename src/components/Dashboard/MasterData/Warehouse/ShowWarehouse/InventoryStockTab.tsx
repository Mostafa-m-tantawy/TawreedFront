"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

export default function InventoryStockTab({
  rows,
}: {
  rows: {
    product: string;
    sku: string;
    qty: number;
    unit: string;
    reorder: number;
    status: "in" | "out";
  }[];
}) {
  const t = useTranslations("warehouse.inventoryStockTab");

  return (
    <div className="mt-4 overflow-x-auto">
      {/* same UI as ProductsTable: border-separate, zebra rows, rounded ends */}
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead className="min-w-[220px]">{t("productName")}</TableHead>
            <TableHead>{t("sku")}</TableHead>
            <TableHead>{t("quantity")}</TableHead>
            <TableHead>{t("unit")}</TableHead>
            <TableHead>{t("reorderLevel")}</TableHead>
            <TableHead className="text-right">{t("status")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {rows.map((r, idx) => (
            <TableRow
              key={`${r.sku}-${idx}`}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell className="rounded-s-xl font-medium text-start">
                {r.product}
              </TableCell>
              <TableCell className="text-start">{r.sku}</TableCell>
              <TableCell className="text-start">{r.qty}</TableCell>
              <TableCell className="text-start">{r.unit}</TableCell>
              <TableCell className="text-start">{r.reorder}</TableCell>
              <TableCell className="rounded-e-xl text-right">
                {r.status === "in" ? (
                  <Badge className="bg-green-100 text-green-700">
                    {t("inStock")}
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">
                    {t("outOfStock")}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow className="border-0">
              <TableCell
                colSpan={6}
                className="h-24 text-center bg-[#F8FAFC] rounded-xl"
              >
                {t("empty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
