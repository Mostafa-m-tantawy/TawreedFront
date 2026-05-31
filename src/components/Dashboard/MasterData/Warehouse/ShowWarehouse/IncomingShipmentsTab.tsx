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

export default function IncomingShipmentsTab({
  rows,
}: {
  rows: {
    id: string;
    supplier: string;
    date: string;
    items: number;
    status: "Scheduled" | "Delivered";
  }[];
}) {
  const t = useTranslations("warehouse.incomingShipmentsTab");

  return (
    <div className="mt-4 overflow-x-auto">
      {/* same UI: border-separate, spacing between rows, zebra bg, rounded first/last cells */}
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead className="min-w-[200px]">{t("id")}</TableHead>
            <TableHead>{t("supplier")}</TableHead>
            <TableHead>{t("date")}</TableHead>
            <TableHead>{t("items")}</TableHead>
            <TableHead className="text-right">{t("status")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {rows.map((r, idx) => (
            <TableRow
              key={r.id}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB", // zebra like ProductsTable
              }}
            >
              <TableCell className="rounded-s-xl text-start font-medium">
                {r.id}
              </TableCell>
              <TableCell className="text-start">{r.supplier}</TableCell>
              <TableCell className="text-start">{r.date}</TableCell>
              <TableCell className="text-start">{r.items}</TableCell>
              <TableCell className="rounded-e-xl text-right">
                {r.status === "Scheduled" ? (
                  <Badge className="bg-amber-100 text-amber-700">
                    {t("scheduled")}
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700">
                    {t("delivered")}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow className="border-0">
              <TableCell
                colSpan={5}
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
