"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api.client";
import ProductPickerDialog from "./ProductDialogPicker";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import PagedSingleSelect from "../../../Products/ProductForm/controls/PagedSingleSelect";
import { nfCurrency } from "@/components/Dashboard/InventorySettings/InventoryFormDialog/helpers";
import ProductAttributesSlider from "./ProductAttributesSlider";
import { ProductUnit } from "@/types/product";

type Row = {
  productKey: string | "";
  productLabel?: string;
  qty: number;
  cost: number;
  expiry: string;
  track_expiry_date?: boolean;
  unit?: ProductUnit;
  originalUnit?: ProductUnit;
  units: any;
  attributes?: any[];
};

type FieldKey = "product" | "qty" | "cost" | "expiry" | "unit" | "unit_id";

type RowErrors = Record<number, Partial<Record<FieldKey, string>>>;

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
};

export default function OpeningBalanceDialog({
  open,
  onOpenChange,
  warehouseId,
  warehouseName,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  warehouseId: number;
  warehouseName: string;
  onSaved: () => void;
}) {
  const t = useTranslations("warehouse.openingBalanceDialog");
  const locale = useLocale();

  const [rows, setRows] = React.useState<Row[]>([
    {
      ...initialRow,
    },
  ]);

  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [rowErrors, setRowErrors] = React.useState<RowErrors>({});

  const setFieldError = (rowIdx: number, field: FieldKey, msg: string) =>
    setRowErrors((prev) => ({
      ...prev,
      [rowIdx]: { ...(prev[rowIdx] ?? {}), [field]: msg },
    }));

  const clearFieldError = (rowIdx: number, field: FieldKey) =>
    setRowErrors((prev) => {
      const copy = { ...(prev || {}) };
      const row = { ...(copy[rowIdx] ?? {}) };
      delete row[field];
      copy[rowIdx] = row;
      return copy;
    });

  const update = (i: number, patch: Partial<Row>) => {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    );
    if ("qty" in patch) clearFieldError(i, "qty");
    if ("cost" in patch) clearFieldError(i, "cost");
    if ("expiry" in patch) clearFieldError(i, "expiry");
    if ("unit" in patch) clearFieldError(i, "unit_id");
    if ("productKey" in patch || "productLabel" in patch)
      clearFieldError(i, "product");
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        ...initialRow,
      },
    ]);

  const delRow = (i: number) => {
    setRows((r) => r.filter((_, idx) => idx !== i));
    setRowErrors((prev) => {
      const next = { ...(prev || {}) };
      delete next[i];

      const shifted: RowErrors = {};
      Object.keys(next)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((oldIdx) => {
          shifted[oldIdx > i ? oldIdx - 1 : oldIdx] = next[oldIdx];
        });
      return shifted;
    });
  };

  const line = (r: Row) => Number(r.qty || 0) * Number(r.cost || 0) || 0;
  const total = rows.reduce((s, r) => s + line(r), 0);

  const mapServerKey = (
    key: string
  ): { idx: number; field: FieldKey } | null => {
    const m = key.match(/^products\.(\d+)\.(.+)$/);
    if (!m) return null;
    const idx = Number(m[1]);
    const apiField = m[2];
    let field: FieldKey | null = null;
    if (apiField === "quantity") field = "qty";
    else if (apiField === "price") field = "cost";
    else if (apiField === "expired_date") field = "expiry";
    else if (apiField === "productable_type" || apiField === "productable_id")
      field = "product";
    else return null;
    return { idx, field };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFormError(null);
      setRowErrors({});

      const cleaned = rows
        .filter((r) => r.productKey && Number(r.qty) > 0)
        .map((r) => {
          const [productable_type, idStr] = String(r.productKey).split(":");
          return {
            productable_type: productable_type as "Product" | "ProductVariant",
            productable_id: Number(idStr),
            quantity: Number(r.qty),
            price: Number(r.cost),
            expired_date:
              r.track_expiry_date && r.expiry ? `${r.expiry}T00:00:00` : null,
            unit_id: r?.unit?.id,
          };
        });

      if (!cleaned.length) {
        setFormError(t("noValidRows"));
        setSaving(false);
        return;
      }

      await api.post(`/admin/warehouse/${warehouseId}/opening-transactions`, {
        products: cleaned,
      });

      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      // default top-level message
      const fallbackMsg =
        e?.response?.data?.message ||
        t("saveFailed", { default: "Save failed" });

      if (e?.response?.status === 422 && e?.response?.data?.errors) {
        const serverErrors = e.response.data.errors as Record<string, string[]>;
        const next: RowErrors = {};
        Object.entries(serverErrors).forEach(([key, messages]) => {
          const mapped = mapServerKey(key);
          if (!mapped) return;
          const first = messages?.[0] ?? fallbackMsg;
          next[mapped.idx] = {
            ...(next[mapped.idx] ?? {}),
            [mapped.field]: first,
          };
        });
        setRowErrors(next);

        const onlyFieldErrors = Object.keys(serverErrors).every((k) =>
          /^products\.\d+\./.test(k)
        );
        setFormError(onlyFieldErrors ? null : fallbackMsg);
      } else {
        setFormError(fallbackMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    if (!open) {
      setRowErrors({});
      setFormError(null);
      setRows([
        {
          ...initialRow,
        },
      ]);
    }
  }, [open]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[80vw] w-[80vw] gap-0 p-0 overflow-x-hidden">
        <DialogHeader className="p-4 border-b border-neutral-white-300">
          <DialogTitle>
            <span className="ty-body-lg">{t("title")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-auto max-h-[600px]">
          {formError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 mx-4 px-4 py-2 text-sm text-rose-700">
              {formError}
            </div>
          )}

          <div className="space-y-2 px-4">
            <Label htmlFor="warehouse">{t("warehouseLabel")}</Label>
            <Input
              id="warehouse"
              value={warehouseName}
              readOnly
              className="bg-primary-50 border-[#C5C6D8]"
            />
          </div>

          {/* TABLE */}
          <div className="px-4">
            <div>
              <Table className="border-separate border-spacing-y-2 min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[260px]">
                      {t("product")}
                    </TableHead>
                    <TableHead className="min-w-[180px]">
                      {t("quantity")}
                    </TableHead>

                    <TableHead className="min-w-[180px]">{t("unit")}</TableHead>

                    <TableHead className="min-w-[180px]">
                      {t("unitCost")}
                    </TableHead>

                    <TableHead className="min-w-[180px]">
                      {t("expiryDate")}
                    </TableHead>
                    <TableHead className="min-w-[180px]">
                      {t("lineTotal")}
                    </TableHead>
                    <TableHead className="w-[56px]" />
                  </TableRow>
                </TableHeader>

                <TableBody className="ty-body-sm text-neutral-black-800">
                  {rows.map((r, i) => {
                    const rErr = rowErrors[i] ?? {};
                    return (
                      <TableRow key={i} className="bg-primary-50">
                        {/* Product */}
                        <TableCell className="rounded-s-xl">
                          <div className="space-y-1">
                            <ProductPickerDialog
                              warehouseId={warehouseId}
                              initialKey={r.productKey}
                              onPick={({
                                key,
                                label,
                                unitObject,
                                units,
                                attributes,
                              }) =>
                                update(i, {
                                  productKey: key,
                                  productLabel: label,
                                  unit: unitObject ?? null,
                                  originalUnit: unitObject ?? null,
                                  units: units || {},
                                  attributes,
                                })
                              }
                              trigger={
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={`w-full justify-start h-13 shadow-xs ${
                                    rErr.product ? "border-destructive" : ""
                                  }`}
                                  aria-invalid={!!rErr.product}
                                >
                                  {r.productLabel ||
                                    t("selectProductPlaceholder")}
                                </Button>
                              }
                            />
                            {r.attributes && (
                              <ProductAttributesSlider
                                attributes={r.attributes}
                              />
                            )}
                            {rErr.product && (
                              <p className="text-rose-600 text-xs">
                                {rErr.product}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Qty */}
                        <TableCell>
                          <div className="grid grid-cols-[1fr_auto] gap-1 items-center">
                            <div>
                              <Input
                                type="number"
                                value={r.qty}
                                onChange={(e) => {
                                  update(i, { qty: Number(e.target.value) });
                                }}
                                aria-label={t("quantity")}
                                className={`bg-white`}
                                aria-invalid={!!rErr.qty}
                                error={rErr.qty}
                                min={0}
                              />
                            </div>
                            {/* {r.unit && <div>{r.unit.name}</div>} */}
                          </div>
                        </TableCell>

                        {/* Unit */}
                        <TableCell>
                          <PagedSingleSelect
                            disabled={false}
                            value={r?.unit?.id || ""}
                            display={r?.unit?.name || ""}
                            placeholder={t("Search or select unit")}
                            fetchPage={(page, query) =>
                              fetchUnitsPage(r, page, query)
                            }
                            onChange={(id, name, conversion_factor) => {
                              update(i, {
                                unit: {
                                  id,
                                  name,
                                  conversion_factor: conversion_factor || 0,
                                },
                              });
                            }}
                            t={t}
                            isUnit
                            error={!!rErr.unit_id}
                          />
                        </TableCell>

                        {/* Unit cost */}
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={r.cost}
                              onChange={(e) => {
                                update(i, { cost: Number(e.target.value) });
                              }}
                              aria-label={t("unitCost")}
                              className={`bg-white`}
                              aria-invalid={!!rErr.cost}
                              error={rErr.cost}
                            />

                            {r?.unit?.conversion_factor
                              ? r?.unit?.conversion_factor > 1 && (
                                  <p className="text-xs text-neutral-600">
                                    {t("baseUnitCostLabel")}
                                    {r.originalUnit?.name || ""}:{" "}
                                    {nfCurrency(
                                      locale,
                                      r.cost / r.unit.conversion_factor
                                    )}
                                  </p>
                                )
                              : ""}
                          </div>
                        </TableCell>

                        {/* Expiry */}
                        <TableCell>
                          {r.track_expiry_date ? (
                            <Input
                              type="date"
                              min={today}
                              value={r.expiry}
                              onChange={(e) =>
                                update(i, { expiry: e.target.value })
                              }
                              aria-label={t("expiryDate")}
                              className={`bg-white`}
                              aria-invalid={!!rErr.expiry}
                              error={rErr.expiry}
                            />
                          ) : (
                            t("N/A")
                          )}
                        </TableCell>

                        {/* Line total */}
                        <TableCell className="font-medium">
                          {nfCurrency(locale, line(r))}
                        </TableCell>

                        {/* Delete */}
                        <TableCell className="rounded-e-xl">
                          <button
                            type="button"
                            onClick={() => delRow(i)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white shadow"
                            aria-label={t("removeRowAria")}
                            title={t("removeRowAria")}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-600 ty-body-sm"
                aria-label={t("addProductRow")}
                title={t("addProductRow")}
              >
                <Plus size={16} className="text-inherit" /> {t("addProductRow")}
              </button>
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="px-4 my-4">
          <div className="flex justify-end mb-4">
            <div className="rounded-lg px-6 py-3 ty-body-md bg-primary-50">
              {t("total")} :{" "}
              <span className="font-semibold">
                {t("currencySymbol")}
                {total.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="md"
              className="rounded-md"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="default"
              size="md"
              className="rounded-md"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
