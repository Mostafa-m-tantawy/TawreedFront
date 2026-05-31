"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Trash } from "iconsax-reactjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api.client";
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
import Pagination from "@/components/ui/pagination/pagination";
import { Badge } from "@/components/ui/badge";
import AddGroupedProductDialog from "./AddGroupedProductDialog";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";

export type GroupableType = "Product" | "ProductVariant" | string;

export type GroupedRow = {
  id: number;
  quantity: number;
  groupable_type: GroupableType;
  groupable_id: number;
  base_product: {
    id: number;
    name: string;
    sku: string;
  } | null;
  groupable: {
    id: number;
    name: string;
    sku?: string | null;
    image?: string | null;
    sale_price?: number | null;
  } | null;
};

const PER_PAGE = 8;

export default function GroupedProductsTab({
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
  const [rows, setRows] = React.useState<GroupedRow[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [deleteState, setDeleteState] = React.useState({
    open: false,
    loading: false,
    itemId: null as number | null,
    itemName: "",
  });

  // --- fetch list ---
  const fetchGrouped = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/grouped-products", {
        params: { product_id: productId, page, per_page: PER_PAGE },
      });

      const list: any[] = res?.data?.data ?? res?.data?.items ?? [];

      const normalized: GroupedRow[] = list.map((g: any) => ({
        id: Number(g.id),
        quantity: Number(g.quantity ?? 1),
        groupable_type: String(
          g.groupable_type ?? g.groupable?.type ?? "Product"
        ),
        groupable_id: Number(g.groupable_id ?? g.groupable?.id ?? 0),
        base_product: g.base_product
          ? {
              id: Number(g.base_product.id),
              name: String(g.base_product.name ?? ""),
              sku: String(g.base_product.sku ?? ""),
            }
          : null,
        groupable: g.groupable
          ? {
              id: Number(g.groupable.id),
              name: String(g.groupable.name ?? ""),
              sku: g.groupable.sku ?? null,
              image: g.groupable.image ?? null,
              sale_price:
                g.groupable.sale_price === null ||
                g.groupable.sale_price === undefined
                  ? null
                  : Number(g.groupable.sale_price),
            }
          : null,
      }));

      // meta
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
              (meta?.total ?? normalized.length) / (meta?.per_page ?? PER_PAGE)
            )
          )
      );

      setRows(normalized);
      setPage(current);
      setTotalPages(last);
    } catch (e: any) {
      setError(t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [productId, page, t]);

  React.useEffect(() => {
    fetchGrouped();
  }, [fetchGrouped]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  };

  const onDelete = (row: GroupedRow) => {
    setDeleteState({
      open: true,
      loading: false,
      itemId: row.id,
      itemName: row.groupable?.name || `#${row.id}`,
    });
  };

  const doDelete = async () => {
    if (!deleteState.itemId) return;
    setDeleteState((s) => ({ ...s, loading: true }));
    try {
      await api.delete(`/admin/grouped-products/${deleteState.itemId}`);
      toast.success(t("variants.deleted"));
      setDeleteState({
        open: false,
        loading: false,
        itemId: null,
        itemName: "",
      });
      fetchGrouped();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("deleteFailed"));
      setDeleteState((s) => ({ ...s, loading: false }));
    }
  };

  return (
    <div dir={dir} className="rounded-2xl bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {t("grouped.title", { default: "Grouped Products" })}
          </h2>
          <p className="text-sm text-slate-500">
            {t("grouped.subtitle", {
              default:
                "Bundle products or variants as components of this product",
            })}
          </p>
        </div>

        <ProtectedElement permissions={"create-grouped-products"}>
          <AddGroupedProductDialog
            productId={productId}
            onSuccess={() => {
              fetchGrouped();
            }}
          />
        </ProtectedElement>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white p-6">{t("loading")}</div>
      )}
      {!loading && error && (
        <div className="rounded-2xl border bg-white p-6 text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl">
          <Table className="border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="border-0">
                <TableHead>{t("grouped.item")}</TableHead>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead className="w-28">{t("grouped.quantity")}</TableHead>
                <TableHead className="w-28">
                  {t("grouped.type", { default: "Type" })}
                </TableHead>
                <TableHead className="w-24">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow
                  key={r.id}
                  className="border-0"
                  style={{
                    backgroundColor: i % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                    borderRadius: 12,
                  }}
                >
                  <TableCell className="rounded-s-xl">
                    <div className="flex items-center gap-3">
                      {r.groupable?.image && (
                        <img
                          src={r.groupable.image}
                          alt={r.groupable.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-slate-900">
                          {r.groupable?.name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">#{r.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {r.groupable?.sku || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {typeof r.groupable?.sale_price === "number"
                      ? nfCurrency(locale, r.groupable!.sale_price!)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-slate-700">
                      {r.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.groupable_type}</Badge>
                  </TableCell>
                  <TableCell className="rounded-e-xl">
                    <div className="flex items-center gap-2">
                      <ProtectedElement permissions={"delete-grouped-products"}>
                        <button
                          onClick={() => onDelete(r)}
                          className="rounded-lg p-2 text-rose-700 hover:bg-rose-50"
                          aria-label={t("delete")}
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("noRecords")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 w-full">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <ProtectedElement permissions={"delete-grouped-products"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((s) => ({ ...s, open }))}
          itemName={deleteState.itemName}
          deleteFn={doDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>
    </div>
  );
}
