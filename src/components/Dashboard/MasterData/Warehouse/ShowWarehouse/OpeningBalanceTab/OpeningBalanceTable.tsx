"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton";
import { useLocale, useTranslations } from "next-intl";
import Pagination from "@/components/ui/pagination/pagination";

const Skeleton =
  ShadcnSkeleton ??
  (({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className ?? ""}`}
    />
  ));

type OpeningItem = {
  id: number;
  quantity: number;
  price: number;
  total_price: number;
  expired_date: string | null; // ISO date or null
  product: any;
  unit: any;
};

export default function OpeningBalanceTable({
  rows,
  loading,
  page,
  lastPage,
  onPageChange,
}: {
  rows: OpeningItem[];
  loading?: boolean;
  page: number;
  lastPage: number;
  onPageChange: (p: number) => void;
}) {
  const t = useTranslations("warehouse.openingBalanceTab");
  const locale = useLocale();

  const showEmpty = !loading && rows.length === 0;

  const getName = (p: any) =>
    p?.product?.name ? `${p?.product?.name} - ${p?.name}` : p?.name || "—";
  const getSku = (p: any) => p?.sku ?? p?.product?.sku ?? "—";

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale || "en", {
      style: "currency",
      currency: "SAR",
      currencyDisplay: locale.startsWith("ar") ? "name" : "code",
    }).format(n || 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <Table
          className="border-separate border-spacing-y-2 min-w-[760px]"
          style={
            loading && rows.length !== 0
              ? { pointerEvents: "none", opacity: 0.6 }
              : {}
          }
        >
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[260px]">
                {t("table.product")}
              </TableHead>
              <TableHead className="min-w-[260px]">
                {t("table.attributes")}
              </TableHead>
              <TableHead className="w-[120px]">{t("table.qty")}</TableHead>
              <TableHead className="w-[120px]">{t("table.unit")}</TableHead>
              <TableHead className="w-[140px]">{t("table.unitCost")}</TableHead>
              <TableHead className="w-[160px]">
                {t("table.expiryDate")}
              </TableHead>
              <TableHead className="w-[160px]">
                {t("table.lineTotal")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="ty-body-sm text-neutral-black-800">
            {loading &&
              rows.length === 0 &&
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={`sk-${i}`} className="bg-primary-50">
                  <TableCell className="rounded-s-xl">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="rounded-e-xl">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {/* Data rows */}
            {!showEmpty &&
              rows.map((r, i) => (
                <TableRow
                  key={r.id}
                  className="hover:bg-opacity-80"
                  style={{
                    borderRadius: 12,
                    backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                  }}
                >
                  <TableCell className="rounded-s-xl">
                    <div className="font-medium">{getName(r.product)}</div>
                    <div className="text-xs text-slate-500">
                      {getSku(r.product)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {r?.product?.attributeValues &&
                        r?.product.attributeValues.map((av: any, i: number) => (
                          <span
                            key={av.name + i}
                            className="inline-flex items-center rounded-full px-3 py-1 ty-body-xs border"
                            style={{
                              color: i % 2 === 0 ? "#B29049" : "#1E2C39",
                              backgroundColor:
                                i % 2 === 0 ? "#F6F2E9" : "#DAE1F1",
                              borderColor: i % 2 === 0 ? "#EAE1CC" : "#B4C2E4",
                            }}
                          >
                            {av.name}: {av.value}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>{r?.unit?.name}</TableCell>
                  <TableCell>{fmtMoney(r.price)}</TableCell>
                  <TableCell>
                    {r.expired_date
                      ? new Date(r.expired_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="rounded-e-xl font-medium">
                    {fmtMoney(r.total_price)}
                  </TableCell>
                </TableRow>
              ))}

            {showEmpty && (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center">
                  {t("noOpenings")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pager */}
      <div className="p-3">
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
