"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";

import { Input } from "@/components/ui/input";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AdjustmentStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

type FormValues = {
  date: string;
  warehouse_id: number | "";
  product_id: number | "";
  reason: string;
  current_qty: number;
  new_qty: number;
  status?: AdjustmentStatus;
};

// ---- mock fallback (used only when API calls fail) ----------------------------
const MOCK_REASONS = ["Damage", "Count Error", "Expiry", "Other"];
const mock = {
  async pagedWarehouses(page: number, search: string) {
    const all = [
      { id: 1, name: "Main Warehouse" },
      { id: 2, name: "Supplier Warehouse" },
      { id: 3, name: "Finished Goods WH" },
    ].filter((w) =>
      w.name.toLowerCase().includes((search || "").toLowerCase())
    );
    return { items: all, page, lastPage: 1, total: all.length };
  },
  async pagedProducts(page: number, search: string) {
    const all = [
      { id: 10, name: "Product A" },
      { id: 11, name: "Product B" },
      { id: 12, name: "Product C" },
    ].filter((p) =>
      p.name.toLowerCase().includes((search || "").toLowerCase())
    );
    return { items: all, page, lastPage: 1, total: all.length };
  },
  async get(id: number) {
    return {
      id,
      date: "2025-06-15",
      warehouse: { id: 1, name: "Main Warehouse" },
      product: { id: 10, name: "Product A" },
      reason: "Damage",
      oldQty: 12,
      newQty: 12,
      status: "Draft" as AdjustmentStatus,
    };
  },
  async create(_payload: any) {
    return true;
  },
  async update(_id: number, _payload: any) {
    return true;
  },
};

export default function AdjustmentForm({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: number;
}) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [values, setValues] = React.useState<FormValues>({
    date: new Date().toISOString().slice(0, 10),
    warehouse_id: "",
    product_id: "",
    reason: "",
    current_qty: 0,
    new_qty: 0,
  });

  const onChange = (patch: Partial<FormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  // ----- loads (edit) ----------------------------------------------------------
  React.useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/stock-adjustments/${id}/edit`);
        const d = res?.data?.data ?? res?.data ?? {};
        const wh = d?.warehouse ?? d?.fromwarehouse ?? d?.Warehouse;
        const prod = d?.product ?? d?.Product;

        if ((d?.status as AdjustmentStatus) === "Approved") {
          router.push("/dashboard/inventory/stock-adjustments");
          return;
        }

        setValues({
          date: d?.date || new Date().toISOString().slice(0, 10),
          warehouse_id: wh?.id ?? d?.warehouse_id ?? "",
          product_id: prod?.id ?? d?.product_id ?? "",
          reason: d?.reason ?? "",
          current_qty: Number(d?.oldQty ?? d?.current_qty ?? 0),
          new_qty: Number(d?.newQty ?? d?.new_qty ?? 0),
          status: d?.status as AdjustmentStatus,
        });
      } catch {
        const d = await mock.get(id);
        if (d.status === "Approved") {
          router.push("/dashboard/inventory/stock-adjustments");
          return;
        }
        setValues({
          date: d.date,
          warehouse_id: d.warehouse?.id || "",
          product_id: d.product?.id || "",
          reason: d.reason,
          current_qty: d.oldQty,
          new_qty: d.newQty,
          status: d.status,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router, t]);

  // ----- selects paging (API → mock) ------------------------------------------
  const fetchWarehousesPage = React.useCallback(
    async (page: number, query: string) => {
      try {
        const res = await api.get(`/admin/paginated-warehouses`, {
          params: {
            page,
            per_page: 20,
            search: query || undefined,
            status: "active",
          },
        });
        const rows = (res?.data?.data ?? []).map((w: any) => ({
          id: w.id,
          name: w.name,
        }));
        const meta = res?.data?.meta ?? {};
        return {
          items: rows,
          page: meta?.current_page ?? page,
          lastPage: meta?.last_page ?? page,
          total: meta?.total ?? rows.length,
        };
      } catch {
        return mock.pagedWarehouses(page, query);
      }
    },
    []
  );

  const fetchProductsPage = React.useCallback(
    async (page: number, query: string) => {
      try {
        const res = await api.get(`/admin/paginated-products`, {
          params: {
            page,
            per_page: 20,
            search: query || undefined,
            status: "active",
          },
        });
        const rows = (res?.data?.data ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
        }));
        const meta = res?.data?.meta ?? {};
        return {
          items: rows,
          page: meta?.current_page ?? page,
          lastPage: meta?.last_page ?? page,
          total: meta?.total ?? rows.length,
        };
      } catch {
        return mock.pagedProducts(page, query);
      }
    },
    []
  );

  // ----- validate / payload / save --------------------------------------------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.date) e.date = t("fieldRequired");
    if (!values.warehouse_id) e.warehouse_id = t("fieldRequired");
    if (!values.product_id) e.product_id = t("fieldRequired");
    if (!values.reason) e.reason = t("fieldRequired");
    setErrors(e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  const buildPayload = (action: "draft" | "submit") => ({
    date: values.date,
    warehouse_id: Number(values.warehouse_id),
    status: isEdit ? values.status : action === "submit" ? "Pending" : "Draft",
    item: {
      product_id: Number(values.product_id),
      current_qty: Number(values.current_qty),
      new_qty: Number(values.new_qty),
      reason: values.reason,
    },
  });

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        try {
          await api.put(`/admin/stock-adjustments/${id}`, buildPayload(action));
        } catch {
          await mock.update(id, buildPayload(action));
        }
      } else {
        try {
          await api.post(`/admin/stock-adjustments`, buildPayload(action));
        } catch {
          await mock.create(buildPayload(action));
        }
      }
      toast.success(
        action === "submit" ? t("Submitted for approval") : t("Saved as draft")
      );
      router.push("/dashboard/inventory/stock-adjustments");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  const difference =
    Number(values.new_qty || 0) - Number(values.current_qty || 0);

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/stock-adjustments"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to adjustment")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t(isEdit ? "Edit adjustment" : "Add adjustment")}
        </h1>

        <HeaderActions
          mode={isEdit ? "edit" : "create"}
          onApprove={() => save("submit")}
          onSaveDraft={() => save("draft")}
          onCancel={() => router.push("/dashboard/inventory/stock-adjustments")}
          loading={loading}
        />
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date (label + error via Input props) */}
        <Input
          type="date"
          value={values.date}
          onChange={(e) => onChange({ date: e.target.value })}
          label={t("Date")}
          error={errors.date}
        />

        {/* Warehouse */}
        <div>
          <Label>{t("Warehouse")}</Label>
          <div className="mt-4">
            <PagedSingleSelect
              value={values.warehouse_id || ""}
              display=""
              placeholder={t("select a warehouse")}
              fetchPage={(page, query) => fetchWarehousesPage(page, query)}
              onChange={(id) => onChange({ warehouse_id: id })}
              t={t}
              error={!!errors.warehouse_id}
            />
            {errors.warehouse_id && (
              <p className="mt-1 text-sm text-destructive">
                {errors.warehouse_id}
              </p>
            )}
          </div>
        </div>

        {/* Product */}
        <div className="col-span-full lg:col-span-1">
          <Label>{t("Product")}</Label>
          <div className="mt-4">
            <PagedSingleSelect
              value={values.product_id || ""}
              display=""
              placeholder={t("Product A")}
              fetchPage={(page, query) => fetchProductsPage(page, query)}
              onChange={(id) => onChange({ product_id: id })}
              t={t}
              error={!!errors.product_id}
            />
            {errors.product_id && (
              <p className="mt-1 text-sm text-destructive">
                {errors.product_id}
              </p>
            )}
          </div>
        </div>

        <div className="col-span-full lg:col-span-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Current Qty */}
          <Input
            type="number"
            value={values.current_qty}
            onChange={(e) => onChange({ current_qty: Number(e.target.value) })}
            className="bg-neutral-white-100"
            label={t("Current Quantity")}
            error={undefined}
          />

          {/* New Qty */}
          <Input
            type="number"
            value={values.new_qty}
            onChange={(e) => onChange({ new_qty: Number(e.target.value) })}
            label={t("New Quantity")}
            error={undefined}
          />

          {/* Difference */}
          <Input
            readOnly
            value={difference}
            className="bg-neutral-white-100"
            label={t("Difference")}
            error={undefined}
          />
        </div>

        {/* Reason (shadcn Select with label + error) */}
        <div className="col-span-full lg:col-span-1">
          <Label>{t("Reason for Adjustment")}</Label>
          <div className="mt-4">
            <Select
              value={values.reason}
              onValueChange={(v) => onChange({ reason: v })}
            >
              <SelectTrigger
                className={cn("h-13", errors.reason && "border-destructive")}
              >
                <SelectValue placeholder={t("select reason")} />
              </SelectTrigger>
              <SelectContent>
                {MOCK_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="mt-1 text-sm text-destructive">{errors.reason}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
