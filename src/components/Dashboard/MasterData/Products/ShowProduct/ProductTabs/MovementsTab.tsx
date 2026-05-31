// /components/products/tabs/MovementsTab.tsx
"use client";

import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  date: string;
  reason: string;
  in?: number | null;
  out?: number | null;
  total_after: number;
};

export default function MovementsTab({ rows }: { rows: Row[] }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const dir = locale?.startsWith("ar") ? "rtl" : "ltr";

  return (
    <div dir={dir} className="rounded-2xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {t("movements.title")}
        </h2>
        <a className="text-sm text-indigo-600 hover:underline" href="#">
          {t("movements.stockChanges")}
        </a>
      </div>

      <div className="mb-6 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-start gap-3 text-slate-600">
          <Info className="mt-0.5 h-4 w-4" />
          <div className="text-sm">
            <p>{t("movements.helperText")}</p>
            <div className="mt-1 flex flex-wrap gap-4">
              <span className="inline-flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-700">{t("movements.qtyIn")}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <ArrowDownLeft className="h-4 w-4 text-rose-600" />
                <span className="text-slate-700">{t("movements.qtyOut")}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl">
        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead>{t("movements.date")}</TableHead>
              <TableHead>{t("movements.reason")}</TableHead>
              <TableHead>{t("movements.added")}</TableHead>
              <TableHead>{t("movements.removed")}</TableHead>
              <TableHead>{t("movements.totalAfter")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow
                key={`${r.date}-${i}`}
                className="border-0"
                style={{
                  backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                  borderRadius: 12,
                }}
              >
                <TableCell className="rounded-s-xl">{r.date}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell className="text-emerald-700">
                  {r.in ? (
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" /> {r.in}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-rose-700">
                  {r.out ? (
                    <span className="inline-flex items-center gap-1">
                      <ArrowDownLeft className="h-4 w-4" /> {r.out}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="rounded-e-xl">{r.total_after}</TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("noRecords")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
