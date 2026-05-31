"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale, useTranslations } from "next-intl";
import type { PurchaseLineItem } from "@/types/purchase-invoice";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Add, Trash } from "iconsax-reactjs";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import api from "@/lib/api.client";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import ProductPickerDialog from "@/components/Dashboard/Common/ProductPickerDialog";
import { mapRawToPickable } from "@/lib/utils";
import ProductAttributesSlider from "@/components/Dashboard/MasterData/Warehouse/ShowWarehouse/OpeningBalanceTab/ProductAttributesSlider";
import { PageResult } from "@/types/common";

const initialRow = {
  productKey: "",
  productLabel: "",
  qty: 0,
  cost: 0,
  expiry: "",
  unit: {
    id: 0,
    name: "",
    conversion_factor: 0,
  },
  units: {},
  product_id: 0,
  key: "",
  name: "",
  sku: "",
  quantity: 0,
  unit_price: 0,
  tax_percent: 0,
  expiry_date: "",
  received_quantity: 0,
  line_total: 0,
  track_expiry_date: false,
  attributes: [],
  unit_id: 0,
  warehouse_id: 0,
};

export default function ProductsTable({
  items,
  onItemsChange,
  formErrors,
  isInvoice = false,
  purchaseOrderId,
  isMock,
}: {
  items: PurchaseLineItem[];
  onItemsChange: (next: PurchaseLineItem[]) => void;
  formErrors: Record<string, string>;
  isInvoice?: boolean;
  purchaseOrderId?: number | "";
  isMock?: boolean;
}) {
  const t = useTranslations("warehouse.openingBalanceDialog");
  const locale = useLocale();

  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [warehouseNames, setWarehouseNames] = React.useState<
    Record<number, string>
  >({});

  const add = () =>
    onItemsChange([
      ...items,
      {
        ...initialRow,
      },
    ]);

  const updateAt = (idx: number, patch: Partial<PurchaseLineItem>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onItemsChange(next);
  };

  const removeAt = (idx: number) =>
    onItemsChange(items.filter((_, i) => i !== idx));

  const line = (r: PurchaseLineItem) => {
    const base = Number(r.quantity || 0) * Number(r.unit_price || 0);
    if (!isInvoice) return base;
    const tax = Number(r.tax_percent || 0);
    return base * (1 + tax / 100);
  };

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

    const q = (query || "").trim().toLowerCase();

    const filtered = units.filter((u: any) => {
      const match =
        !q ||
        String(u?.name || "")
          .toLowerCase()
          .includes(q);
      return match;
    });

    const lastPage = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const currentPage = Math.min(Math.max(page || 1, 1), lastPage);
    const start = (currentPage - 1) * PER_PAGE;

    const items = filtered.slice(start, start + PER_PAGE).map((u: any) => ({
      id: u.id,
      name: u.name,
      conversion_factor: u.conversion_factor,
    }));

    return {
      items,
      page: currentPage,
      lastPage,
      total: filtered.length,
    };
  };

  const fetchWarehousesPage = async (
    flow: string,
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    console.log(flow);

    const res = await api.get(
      `/admin/purchase-invoices/get-product-warehouses/${flow || ""}`,
      {
        params: { page, per_page: 20, name: query || undefined },
      }
    );
    const items =
      (res?.data?.data ?? []).map((u: any) => ({ id: u.id, name: u.name })) ??
      [];
    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  React.useEffect(() => {
    if (!isInvoice) return;
    const next: Record<number, string> = {};
    for (const r of items) {
      if (r?.warehouse_id && r?.warehouse?.name) {
        next[r.warehouse_id] = r.warehouse.name;
      }
    }
    // merge to avoid wiping names learned during interaction
    if (Object.keys(next).length) {
      setWarehouseNames((prev) => ({ ...next, ...prev }));
    }
  }, [isInvoice, items]);

  return (
    <div className="rounded-2xl bg-white p-6">
      <p className="ty-body-md-2 mb-4">{t("Products")}</p>

      <div className="px-4">
        <Table className="border-separate border-spacing-y-2 min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[260px]">{t("product")}</TableHead>
              <TableHead className="min-w-[140px]">{t("quantity")}</TableHead>
              <TableHead className="min-w-[160px]">{t("unitCost")}</TableHead>

              {isInvoice && (
                <TableHead className="min-w-[140px]">{t("Tax %")}</TableHead>
              )}

              {isInvoice && (
                <TableHead className="min-w-[140px]">
                  {t("Warehouse")}
                </TableHead>
              )}

              <TableHead className="min-w-[160px]">{t("unit")}</TableHead>
              <TableHead className="min-w-[160px]">{t("expiryDate")}</TableHead>
              <TableHead className="min-w-[160px]">{t("lineTotal")}</TableHead>
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>

          <TableBody className="ty-body-sm text-neutral-black-800">
            {items.map((r, i) => (
              <TableRow key={i} className="bg-primary-50">
                {/* Product */}
                <TableCell className="rounded-s-xl">
                  <div className="space-y-1">
                    <ProductPickerDialog
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start h-13 shadow-xs"
                        >
                          {r.productLabel || t("selectProductPlaceholder")}
                        </Button>
                      }
                      onPick={({
                        id,
                        key,
                        label,
                        unitObject,
                        units,
                        attributes,
                        allowed_quantity,
                        flow,
                      }) =>
                        updateAt(i, {
                          id,
                          productKey: key,
                          productLabel: label,
                          unit: unitObject ?? null,
                          originalUnit: unitObject ?? null,
                          units: units || {},
                          attributes,
                          allowed_quantity,
                          flow,
                        })
                      }
                      fetchPage={async (q, page) => {
                        const path = isMock
                          ? "admin/paginated-physical-products"
                          : isInvoice
                          ? `admin/purchase-invoices/get-products/${purchaseOrderId}`
                          : "admin/purchase-orders/get-products";
                        const res = await api.get(path, {
                          params: {
                            search: q,
                            page,
                          },
                        });
                        return {
                          products: res.data.data.map(mapRawToPickable),
                          hasMore:
                            res.data.meta?.current_page <
                            res.data.meta?.last_page,
                        };
                      }}
                      fetchProductById={async (id) => {
                        const res = await api.get(`admin/products/${id}`);
                        return mapRawToPickable(res.data.data);
                      }}
                      fetchProductByVariantId={async (variantId) => {
                        const res = await api.get(
                          `admin/product-variants/${variantId}`
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

                {/* Quantity */}
                <TableCell>
                  <div className="grid grid-cols-[1fr_auto] gap-1 items-center">
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
                        if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
                          updateAt(i, {
                            quantity: v === "" ? ("" as any) : Number(v),
                          });
                        }
                      }}
                      aria-label={t("quantity")}
                      className="bg-white"
                      error={
                        formErrors[`items.${i}.quantity`] ||
                        !!formErrors[`quantity_receive`]
                      }
                      min={0}
                      max={r.allowed_quantity ?? undefined}
                    />
                  </div>
                </TableCell>

                {/* Unit cost */}
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={r.unit_price}
                      onChange={(e) => {
                        const v = e.target.value.replace(",", ".");
                        if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
                          updateAt(i, {
                            unit_price: v === "" ? ("" as any) : Number(v),
                          });
                        }
                      }}
                      aria-label={t("unitCost")}
                      className="bg-white"
                      error={
                        formErrors[`items.${i}.unit_price`] ||
                        formErrors[`items.${i}.price`]
                      }
                    />

                    {r?.unit?.conversion_factor
                      ? r?.unit?.conversion_factor > 1 && (
                          <p className="text-xs text-neutral-600">
                            {t("baseUnitCostLabel")}
                            {r.originalUnit?.name || ""}:{" "}
                            {nfCurrency(
                              locale,
                              r.unit_price / r.unit.conversion_factor
                            )}
                          </p>
                        )
                      : ""}
                  </div>
                </TableCell>

                {isInvoice && (
                  <TableCell>
                    <Input
                      type="number"
                      value={
                        r.tax_percent === null || r.tax_percent === undefined
                          ? ""
                          : String(r.tax_percent)
                      }
                      onChange={(e) => {
                        const v = e.target.value.replace(",", ".");
                        if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
                          updateAt(i, {
                            tax_percent: v === "" ? ("" as any) : Number(v),
                          });
                        }
                      }}
                      aria-label={t("Tax %")}
                      className="bg-white"
                      error={formErrors[`items.${i}.tax_percent`]}
                    />
                  </TableCell>
                )}

                {isInvoice && (
                  <TableCell>
                    <div>
                      <PagedSingleSelect
                        key={items[i]?.warehouse_id || "wh-empty"} // optional: remount when ID appears
                        disabled={false}
                        value={items[i]?.warehouse_id || ""} // ← controlled by row
                        display={
                          // Prefer object from row; fall back to cache
                          items[i]?.warehouse?.name ??
                          (items[i]?.warehouse_id
                            ? warehouseNames[items[i].warehouse_id]
                            : "") ??
                          ""
                        }
                        placeholder={t("Select a Warehouse")}
                        fetchPage={(page, query) =>
                          fetchWarehousesPage(r.flow || "", page, query)
                        }
                        onChange={(id, name) => {
                          // cache label for instant display (even before row gets a full object)
                          setWarehouseNames((prev) => ({
                            ...prev,
                            [id]: name || `#${id}`,
                          }));

                          // write both to the row so edit state is self-contained
                          updateAt(i, {
                            warehouse_id: Number(id) as any,
                            warehouse: {
                              id: Number(id),
                              name: name || `#${id}`,
                            },
                          });
                        }}
                        t={t}
                        error={!!formErrors[`items.${i}.warehouse_id`]}
                      />
                      {formErrors[`items.${i}.warehouse_id`] && (
                        <p className="mt-1 text-sm text-destructive text-start">
                          {formErrors[`items.${i}.warehouse_id`]}
                        </p>
                      )}
                    </div>
                  </TableCell>
                )}

                {/* Unit */}
                <TableCell>
                  <PagedSingleSelect
                    disabled={false}
                    value={r?.unit?.id || ""}
                    display={r?.unit?.name || ""}
                    placeholder={t("Search or select unit")}
                    fetchPage={(page, query) => fetchUnitsPage(r, page, query)}
                    onChange={(id, name, conversion_factor) => {
                      updateAt(i, {
                        unit: {
                          id,
                          name,
                          conversion_factor: conversion_factor || 0,
                        },
                      });
                    }}
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

                {/* Expiry */}
                <TableCell>
                  {r.track_expiry_date ? (
                    <Input
                      type="date"
                      min={today}
                      value={r.expiry_date || ""}
                      onChange={(e) =>
                        updateAt(i, { expiry_date: e.target.value || null })
                      }
                      aria-label={t("expiryDate")}
                      className="bg-white"
                      error={
                        formErrors[`items.${i}.expiry_date`] ??
                        formErrors[`items.${i}.expired_date`]
                      }
                    />
                  ) : (
                    t("N/A")
                  )}
                </TableCell>

                {/* Line total (pre-tax) */}
                <TableCell className="font-medium">
                  {nfCurrency(locale, line(r))}
                </TableCell>

                {/* Delete */}
                <TableCell className="rounded-e-xl">
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow"
                    aria-label={t("removeRowAria")}
                    title={t("removeRowAria")}
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
            onClick={add}
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-600 ty-body-sm"
            aria-label={t("addProductRow")}
            title={t("addProductRow")}
            disabled={isInvoice ? !purchaseOrderId : false}
          >
            <Add size={16} className="text-inherit" /> {t("addProductRow")}
          </button>
        </div>
      </div>

      {formErrors.items && (
        <p className="mt-1 text-sm text-destructive text-start">
          {formErrors.items}
        </p>
      )}
    </div>
  );
}
