"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { AddCircle, Edit2, Trash } from "iconsax-reactjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedElement from "@/components/ui/protected-element";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { DeleteState } from "@/types/common";
import Pagination from "@/components/ui/pagination/pagination";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";

type APIVariant = {
  id: number;
  name: string;
  sku: string;
  sale_price?: number | string | null;
  purchase_price?: number | string | null;
  status: "active" | "inactive" | string;
  attributeValues?: { name: string; value: string }[];
};

const PER_PAGE = 5;

export default function VariantsTab({
  productId,
  currencyCode = "SAR",
}: {
  productId: number;
  currencyCode?: string;
}) {
  const router = useRouter();
  const t = useTranslations("product");
  const locale = useLocale();
  const dir = locale?.startsWith("ar") ? "rtl" : "ltr";

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<APIVariant[]>([]);
  const [deleteState, setDeleteState] = React.useState<DeleteState<APIVariant>>(
    {
      open: false,
      loading: false,
      item: null,
    }
  );

  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);

  // --- fetch list ---
  const fetchVariants = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/product-variants", {
        params: { product_id: productId, page, per_page: PER_PAGE },
      });

      // normalize list
      const list: any[] =
        res?.data?.data ?? res?.data?.variants ?? res?.data ?? [];

      const normalized: APIVariant[] = list.map((v: any) => ({
        id: Number(v.id),
        name: String(v.name ?? ""),
        sku: String(v.sku ?? ""),
        sale_price:
          v.sale_price === null || v.sale_price === undefined
            ? null
            : Number(v.sale_price),
        purchase_price:
          v.purchase_price === null || v.purchase_price === undefined
            ? null
            : Number(v.purchase_price),
        status: (v.status as APIVariant["status"]) ?? "inactive",
        attributeValues: v?.attributeValues ?? [],
      }));
      setRows(normalized);

      const meta = res?.data?.meta ??
        res?.data?.pagination ?? {
          current_page: res?.data?.current_page,
          last_page: res?.data?.last_page,
          per_page: res?.data?.per_page,
          total: res?.data?.total,
        };

      const current = Number(
        meta?.current_page ?? meta?.currentPage ?? page ?? 1
      );
      const last = Number(
        meta?.last_page ??
          meta?.lastPage ??
          Math.max(
            1,
            Math.ceil(
              (meta?.total ?? normalized.length) /
                (meta?.per_page ?? PER_PAGE ?? 10)
            )
          )
      );

      const tot = Number(meta?.total ?? normalized.length);

      setPage(current);
      setTotalPages(last);
      setTotal(tot);
    } catch {
      setError(t("variants.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [productId, page, t]);

  React.useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const onEdit = (v: APIVariant) => {
    router.push(`/dashboard/products/${productId}/edit-variant/${v.id}`);
  };

  const onDelete = (v: APIVariant) => {
    setDeleteState({ open: true, loading: false, item: v });
  };

  const handleDelete = async () => {
    const item = deleteState.item;
    if (!item) return;

    setDeleteState((prev) => ({ ...prev, loading: true }));

    try {
      await api.delete(`/admin/product-variants/${item.id}`);
      toast.success(t("variants.deleted"));
      setDeleteState({ open: false, loading: false, item: null });

      fetchVariants();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("deleteFailed"));
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const deletingId = deleteState.loading ? deleteState.item?.id : undefined;

  return (
    <div dir={dir} className="rounded-2xl bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {t("variants.title")}
          </h2>
          <p className="text-sm text-slate-500">{t("variants.subtitle")}</p>
        </div>

        <ProtectedElement permissions={"create-product-variants"}>
          <Link href={`/dashboard/products/${productId}/add-variant`}>
            <Button size="sm">
              <AddCircle size={16} />
              <span>{t("variants.addVariant")}</span>
            </Button>
          </Link>
        </ProtectedElement>
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-2xl border bg-white p-6">{t("loading")}</div>
      )}
      {!loading && error && (
        <div className="rounded-2xl border bg-white p-6 text-rose-600">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl">
          <Table className="border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="border-0">
                <TableHead>{t("variants.variantName")}</TableHead>
                <TableHead className="text-center">
                  {t("variants.attributes")}
                </TableHead>
                <TableHead>{t("variants.purchasePrice")}</TableHead>
                <TableHead>{t("variants.salePrice")}</TableHead>
                <TableHead>{t("variants.status")}</TableHead>
                <TableHead className="w-24">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((v, i) => (
                <TableRow
                  key={v.id}
                  className="border-0"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                    borderRadius: 12,
                  }}
                >
                  <TableCell className="rounded-s-xl">
                    <div className="font-medium text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.sku}</div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {v?.attributeValues &&
                        v.attributeValues.map((av, i) => (
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

                  <TableCell className="whitespace-nowrap">
                    {typeof v.purchase_price === "number"
                      ? nfCurrency(locale, v.purchase_price)
                      : "—"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {typeof v.sale_price === "number"
                      ? nfCurrency(locale, v.sale_price)
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <span
                      className={
                        v.status === "active"
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
                          : "rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700"
                      }
                    >
                      {v.status === "active" ? t("active") : t("inactive")}
                    </span>
                  </TableCell>

                  <TableCell className="rounded-e-xl">
                    <div className="flex items-center gap-3">
                      <ProtectedElement permissions={"edit-product-variants"}>
                        <button
                          onClick={() => onEdit(v)}
                          className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50"
                          aria-label={t("edit")}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </ProtectedElement>

                      <ProtectedElement permissions={"delete-product-variants"}>
                        <button
                          onClick={() => onDelete(v)}
                          className="rounded-lg p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          aria-label={t("delete")}
                          disabled={deletingId === v.id}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </ProtectedElement>
                    </div>
                  </TableCell>
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
      )}

      <div className={"w-full mt-4"}>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <ProtectedElement permissions={"delete-product-variants"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((prev) => ({ ...prev, open }))}
          itemName={deleteState.item?.name || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>
    </div>
  );
}
