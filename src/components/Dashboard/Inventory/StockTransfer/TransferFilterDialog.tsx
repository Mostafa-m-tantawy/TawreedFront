"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import api from "@/lib/api.client";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import type { PageResult } from "@/types/common";

type WarehouseType = "Product" | "Finished Goods" | "Raw Material";

export type TransferFilters = {
  search: string;
  status: string;
  from_warehouses_id?: number | "";
  to_warehouses_id?: number | "";
};

type WH = { id: number; name: string; type?: WarehouseType };

export default function TransferFilterDialog({
  open,
  onOpenChange,
  initial,
  statuses,
  onApply,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: TransferFilters;
  statuses: string[];
  onApply: (f: TransferFilters) => void;
}) {
  const t = useTranslations("");

  const [local, setLocal] = React.useState<TransferFilters>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [fromWarehouseType, setFromWarehouseType] =
    React.useState<WarehouseType | null>(null);

  const whCacheRef = React.useRef<Record<number, WH>>({});

  const [fromName, setFromName] = React.useState<string>("");
  const [toName, setToName] = React.useState<string>("");

  React.useEffect(() => {
    setLocal(initial);
    setFromName(getWarehouseName(initial.from_warehouses_id));
    setToName(getWarehouseName(initial.to_warehouses_id));

    const fw = getWh(initial.from_warehouses_id);
    setFromWarehouseType((fw?.type as WarehouseType | undefined) ?? null);
  }, [initial]);

  const setFieldError = (
    key: "from_warehouses_id" | "to_warehouses_id",
    msg?: string
  ) =>
    setErrors((prev) => {
      const n = { ...prev };
      if (msg) n[key] = msg;
      else delete n[key];
      return n;
    });

  const getWh = (id?: number | ""): WH | undefined =>
    id ? whCacheRef.current[Number(id)] : undefined;

  const getWarehouseName = (id?: number | ""): string =>
    id ? whCacheRef.current[Number(id)]?.name ?? "" : "";

  const clearWHTypeErrors = () => {
    setFieldError("from_warehouses_id", undefined);
    setFieldError("to_warehouses_id", undefined);
  };

  const fetchWarehousesPage = React.useCallback(
    async (
      page: number,
      query: string,
      select_type?: "from" | "to"
    ): Promise<PageResult<{ id: number; name: string }>> => {
      const res = await api.get(`/admin/paginated-warehouses`, {
        params: {
          page,
          per_page: 20,
          search: query || undefined,
          status: "active",
          type:
            select_type === "to" ? fromWarehouseType ?? undefined : undefined,
        },
      });

      const rows: WH[] = (res?.data?.data ?? []).map((w: any) => ({
        id: w.id,
        name: w.name,
        type: w.type as WarehouseType | undefined,
      }));

      rows.forEach((w) => (whCacheRef.current[w.id] = w));

      const meta = res?.data?.meta ?? {};
      const items = rows
        .map((w) => ({ id: w.id, name: w.name }))
        .filter((w) =>
          select_type === "to"
            ? w.id !== Number(local.from_warehouses_id || 0)
            : true
        );

      return {
        items,
        page: meta?.current_page ?? page,
        lastPage: meta?.last_page ?? page,
        total: meta?.total ?? rows.length,
      };
    },
    [fromWarehouseType, local.from_warehouses_id]
  );

  const handleFromChange = (id: number) => {
    if (id) {
      const newWh = getWh(id);
      if (newWh?.type) setFromWarehouseType(newWh.type);
      clearWHTypeErrors();

      setLocal((p) => ({ ...p, from_warehouses_id: id, to_warehouses_id: "" }));
      setFromName(getWarehouseName(id));
      setToName("");
    } else {
      setLocal((p) => ({ ...p, from_warehouses_id: "" }));
      setFromWarehouseType(null);
      setFromName("");
      clearWHTypeErrors();
    }
  };

  const handleToChange = (id: number) => {
    if (id) {
      const newWh = getWh(id);
      const otherWh = getWh(local.from_warehouses_id || 0);
      if (newWh?.type && otherWh?.type && newWh.type !== otherWh.type) {
        setFieldError(
          "to_warehouses_id",
          t("Both warehouses must be the same type")
        );
        return;
      }
      clearWHTypeErrors();
      setLocal((p) => ({ ...p, to_warehouses_id: id }));
      setToName(getWarehouseName(id));
    } else {
      setLocal((p) => ({ ...p, to_warehouses_id: "" }));
      setToName("");
      clearWHTypeErrors();
    }
  };

  const handleApply = () => {
    onApply(local);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocal((p) => ({
      ...p,
      status: "",
      from_warehouses_id: "",
      to_warehouses_id: "",
    }));
    setFromName("");
    setToName("");
    setFromWarehouseType(null);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Filter")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status chips */}
          <div>
            <div className="ty-body-sm text-neutral-600">{t("Status")}</div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={local.status ? "outline" : "default"}
                onClick={() => setLocal((p) => ({ ...p, status: "" }))}
              >
                {t("All Status")}
              </Button>
              {statuses.map((s) => (
                <Button
                  key={s}
                  variant={local.status === s ? "default" : "outline"}
                  onClick={() => setLocal((p) => ({ ...p, status: s }))}
                >
                  {t(s)}
                </Button>
              ))}
            </div>
          </div>

          {/* Warehouses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="ty-body-sm">{t("From Warehouse")}</label>
              <div className="mt-3">
                <PagedSingleSelect
                  value={local.from_warehouses_id ?? ""}
                  display={fromName}
                  placeholder={t("Select From Warehouse")}
                  fetchPage={(page, query) =>
                    fetchWarehousesPage(page, query, "from")
                  }
                  onChange={handleFromChange}
                  t={t}
                  error={!!errors.from_warehouses_id}
                />
                {errors.from_warehouses_id && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.from_warehouses_id}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="ty-body-sm">{t("To Warehouse")}</label>
              <div className="mt-3">
                <PagedSingleSelect
                  value={local.to_warehouses_id ?? ""}
                  display={toName}
                  placeholder={t("Select To Warehouse")}
                  fetchPage={(page, query) =>
                    fetchWarehousesPage(page, query, "to")
                  }
                  onChange={handleToChange}
                  t={t}
                  error={!!errors.to_warehouses_id}
                  disabled={!local.from_warehouses_id}
                />
                {errors.to_warehouses_id && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.to_warehouses_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Clear / Cancel / Apply */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={handleClear}>
            {t("clear")}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleApply}>{t("Apply")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
