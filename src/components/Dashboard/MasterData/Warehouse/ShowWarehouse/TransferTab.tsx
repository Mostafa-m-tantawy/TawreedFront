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

export default function TransferTab({
  rows,
}: {
  rows: {
    id: string;
    source: string;
    destination: string;
    date: string;
    items: number;
    status: "Scheduled" | "Delivered";
  }[];
}) {
  const t = useTranslations("warehouse.transferTab");

  const highlight = (txt: string) =>
    txt.includes("(This Warehouse)") ? (
      <span>
        {txt.replace("(This Warehouse)", "")}
        <span className="text-primary"> {t("thisWarehouse")}</span>
      </span>
    ) : (
      txt
    );

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead className="min-w-[160px]">{t("id")}</TableHead>
            <TableHead>{t("source")}</TableHead>
            <TableHead>{t("destination")}</TableHead>
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
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell className="rounded-s-xl font-medium text-start">
                {r.id}
              </TableCell>
              <TableCell className="text-start">
                {highlight(r.source)}
              </TableCell>
              <TableCell className="text-start">
                {highlight(r.destination)}
              </TableCell>
              <TableCell className="text-start">{r.date}</TableCell>
              <TableCell className="text-start">{r.items}</TableCell>
              <TableCell className="rounded-e-xl text-right">
                {r.status === "Delivered" ? (
                  <Badge className="bg-green-100 text-green-700">
                    {t("delivered")}
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700">
                    {t("scheduled")}
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
