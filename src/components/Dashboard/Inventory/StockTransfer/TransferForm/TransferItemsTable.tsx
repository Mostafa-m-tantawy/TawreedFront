"use client";
import * as React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Add, Trash } from "iconsax-reactjs";
import ProductPickerDialog from "@/components/Dashboard/Common/ProductPickerDialog";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import api from "@/lib/api.client";
import { cn, mapRawToPickable } from "@/lib/utils";
import type { TransferItem } from "@/types/transfer";
import { useTranslations } from "next-intl";
import ProductAttributesSlider from "@/components/Dashboard/MasterData/Warehouse/ShowWarehouse/OpeningBalanceTab/ProductAttributesSlider";

const emptyRow: TransferItem = {
  productKey: "",
  productLabel: "",
  quantity: "",
  unit: null,
  unit_id: undefined,
  track_expiry_date: false,
  expiry_date: null,
  attributes: [],
  units: {},
};

export default function TransferItemsTable({
  rows,
  onChange,
  formErrors,
  fromWarehouseId,
}: {
  rows: TransferItem[];
  onChange: (next: TransferItem[]) => void;
  formErrors: Record<string, string>;
  fromWarehouseId?: number | "";
}) {
  const t = useTranslations("");

  const addRow = () => onChange([...(rows || []), { ...emptyRow }]);
  const updateAt = (i: number, patch: Partial<TransferItem>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeAt = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  const fetchUnitsPage = async (product: any, page: number, query: string) => {
    const PER_PAGE = 20;
    const units = product?.units?.dervied_unit
      ? [
          {
            id: product?.originalUnit?.id,
            name: product?.originalUnit?.name,
            conversion_factor: product?.originalUnit?.conversion_factor,
          },
          ...product?.units?.dervied_unit,
        ]
      : [];
    const q = (query || "").toLowerCase();
    const filtered = units.filter(
      (u: any) =>
        !q ||
        String(u?.name || "")
          .toLowerCase()
          .includes(q)
    );
    const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const current = Math.min(Math.max(page || 1, 1), lastPage);
    const start = (current - 1) * PER_PAGE;
    return {
      items: filtered.slice(start, start + PER_PAGE).map((u: any) => ({
        id: u.id,
        name: u.name,
        conversion_factor: u.conversion_factor,
      })),
      page: current,
      lastPage,
      total: filtered.length,
    };
  };

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="ty-body-md-2 mb-3">{t("Products")}</p>
      <Table className="border-separate border-spacing-y-2 min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">{t("Product")}</TableHead>
            <TableHead className="min-w-[140px]">{t("quantity")}</TableHead>
            <TableHead className="min-w-[160px]">{t("unit")}</TableHead>
            <TableHead className="min-w-[160px]">{t("expiryDate")}</TableHead>
            <TableHead className="w-[56px]" />
          </TableRow>
        </TableHeader>
        <TableBody className="ty-body-sm text-neutral-black-800">
          {rows.map((r, i) => (
            <TableRow key={i} className="bg-primary-50">
              <TableCell className="rounded-s-xl">
                <div className="space-y-1">
                  <ProductPickerDialog
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start h-13 shadow-xs",

                          (formErrors[`items.${i}.productable_id`] ||
                            formErrors[`productable`]) &&
                            "border-destructive"
                        )}
                      >
                        {r.productLabel || t("selectProductPlaceholder")}
                      </Button>
                    }
                    onPick={({
                      key,
                      label,
                      unitObject,
                      units,

                      attributes,
                      allowed_quantity,
                    }) =>
                      updateAt(i, {
                        productKey: key,
                        productLabel: label,
                        unit: unitObject ?? null,
                        originalUnit: unitObject ?? null,
                        units: units || {},
                        attributes,
                        allowed_quantity,
                      })
                    }
                    fetchPage={async (q, page) => {
                      if (!fromWarehouseId)
                        return {
                          products: [],
                          hasMore: false,
                        };

                      const res = await api.get(
                        `admin/paginated-warehouse-product-list/${fromWarehouseId}`,
                        {
                          params: {
                            search: q,
                            page,
                          },
                        }
                      );
                      return {
                        products: (res.data?.data ?? []).map(mapRawToPickable),
                        hasMore:
                          (res.data?.meta?.current_page ?? 1) <
                          (res.data?.meta?.last_page ?? 1),
                      };
                    }}
                    fetchProductById={async (id) => {
                      const res = await api.get(`admin/products/${id}`);
                      return mapRawToPickable(res.data.data);
                    }}
                    fetchProductByVariantId={async (vid) => {
                      const res = await api.get(
                        `admin/product-variants/${vid}`
                      );
                      return mapRawToPickable(
                        res.data?.data?.product ?? res.data?.data
                      );
                    }}
                    initialKey={r.productKey}
                  />

                  {r.attributes && (
                    <ProductAttributesSlider attributes={r.attributes} />
                  )}

                  {(formErrors[`items.${i}.productable_id`] ||
                    formErrors[`productable`]) && (
                    <p className="mt-1 text-sm text-destructive text-start">
                      {formErrors[`items.${i}.productable_id`] ||
                        formErrors[`productable`]}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Input
                  type="number"
                  value={
                    r.quantity === null || r.quantity === undefined
                      ? ""
                      : String(r.quantity)
                  }
                  placeholder="0"
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    if (v === "" || /^-?\d*\.?\d*$/.test(v))
                      updateAt(i, { quantity: v === "" ? "" : Number(v) });
                  }}
                  aria-label={t("quantity")}
                  className="bg-white"
                  max={r.allowed_quantity ?? undefined}
                  min={0}
                  error={formErrors[`items.${i}.quantity`]}
                />
              </TableCell>

              <TableCell>
                <PagedSingleSelect
                  disabled={false}
                  value={r?.unit?.id || ""}
                  display={r?.unit?.name || ""}
                  placeholder={t("Search or select unit")}
                  fetchPage={(page, query) => fetchUnitsPage(r, page, query)}
                  onChange={(id, name, conversion_factor) =>
                    updateAt(i, {
                      unit: { id, name, conversion_factor },
                      unit_id: id,
                    })
                  }
                  t={t}
                  isUnit
                  error={!!formErrors[`items.${i}.unit_id`]}
                />
                {formErrors[`items.${i}.unit_id`] && (
                  <p className="mt-1 text-sm text-destructive text-start">
                    {formErrors[`items.${i}.unit_id`]}
                  </p>
                )}
              </TableCell>

              <TableCell>
                {r.track_expiry_date ? (
                  <Input
                    type="date"
                    value={r.expiry_date || ""}
                    onChange={(e) =>
                      updateAt(i, { expiry_date: e.target.value || null })
                    }
                    error={
                      formErrors[`items.${i}.expiry_date`] ||
                      formErrors[`items.${i}.expired_date`]
                    }
                  />
                ) : (
                  t("N/A")
                )}
              </TableCell>

              <TableCell className="rounded-e-xl">
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow"
                >
                  <Trash className="h-4 w-4 text-muted-foreground" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-600 ty-body-sm"
          disabled={!!!fromWarehouseId}
        >
          <Add size={16} className="text-inherit" /> {t("addProductRow")}
        </button>
      </div>
      {formErrors.items && (
        <p className="mt-1 text-sm text-destructive text-start">
          {formErrors.items}
        </p>
      )}
    </div>
  );
}
