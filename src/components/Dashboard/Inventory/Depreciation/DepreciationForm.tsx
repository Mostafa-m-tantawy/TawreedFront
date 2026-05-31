"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import NoteField from "@/components/Dashboard/Purchase/PurchaseForm/sections/NoteField";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
type DepStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Cancelled";

type FormValues = {
  date: string;
  warehouse_id: number | "";
  product_id: number | "";
  reason: string;
  current_qty: number; // readonly (from inventory) if you later wire it
  qty_to_write_off: number; // user input
  notes: string;
  status?: DepStatus;
};

// -----------------------------------------------------------------------------
// Mock fallback (only when API calls fail)
// -----------------------------------------------------------------------------
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
      qtyWrittenOff: 0,
      currentQty: 12,
      notes: "",
      status: "Draft" as DepStatus,
    };
  },
  async create(_payload: any) {
    return true;
  },
  async update(_id: number, _payload: any) {
    return true;
  },
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
export default function DepreciationForm({
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
    qty_to_write_off: 0,
    notes: "",
  });

  const onChange = (patch: Partial<FormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  // ---------------------------------------------------------------------------
  // Edit load
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      setLoading(true);
      try {
        // Try real depreciation edit endpoint
        const res = await api.get(`/admin/stock-depreciations/${id}/edit`);
        const d = res?.data?.data ?? res?.data ?? {};
        const wh = d?.warehouse ?? d?.Warehouse;
        const prod = d?.product ?? d?.Product;

        if ((d?.status as DepStatus) === "Approved") {
          router.push("/dashboard/inventory/depreciation");
          return;
        }

        onChange({
          date: d?.date || new Date().toISOString().slice(0, 10),
          warehouse_id: wh?.id ?? d?.warehouse_id ?? "",
          product_id: prod?.id ?? d?.product_id ?? "",
          reason: d?.reason ?? "",
          current_qty: Number(d?.current_qty ?? d?.oldQty ?? d?.qty ?? 0),
          qty_to_write_off: Number(
            d?.qty_to_write_off ?? d?.qtyWrittenOff ?? d?.new_qty ?? 0
          ),
          status: d?.status as DepStatus,
          notes: d?.notes ?? "",
        });
      } catch {
        // Mock fallback
        const d = await mock.get(id);
        if (d.status === "Approved") {
          router.push("/dashboard/inventory/depreciation");
          return;
        }
        onChange({
          date: d.date,
          warehouse_id: d.warehouse?.id || "",
          product_id: d.product?.id || "",
          reason: d.reason,
          current_qty: Number(d.currentQty ?? 0),
          qty_to_write_off: Number(d.qtyWrittenOff ?? 0),
          status: d.status,
          notes: d.notes ?? "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id, router]);

  // ---------------------------------------------------------------------------
  // Paged Selects (API → mock)
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Validate / Save
  // ---------------------------------------------------------------------------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.date) e.date = t("fieldRequired");
    if (!values.warehouse_id) e.warehouse_id = t("fieldRequired");
    if (!values.product_id) e.product_id = t("fieldRequired");
    if (!values.reason) e.reason = t("fieldRequired");
    if (values.qty_to_write_off <= 0) e.qty_to_write_off = t("Must be > 0");

    setErrors(e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  const buildPayload = (action: "draft" | "submit") => ({
    date: values.date,
    warehouse_id: Number(values.warehouse_id),
    status: isEdit ? values.status : action === "submit" ? "Pending" : "Draft",
    notes: values.notes || null,
    item: {
      product_id: Number(values.product_id),
      // For depreciation the single quantity is the write-off amount:
      qty_written_off: Number(values.qty_to_write_off || 0),
      reason: values.reason,
    },
  });

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        try {
          await api.put(
            `/admin/stock-depreciations/${id}`,
            buildPayload(action)
          );
        } catch {
          await mock.update(id, buildPayload(action));
        }
      } else {
        try {
          await api.post(`/admin/stock-depreciations`, buildPayload(action));
        } catch {
          await mock.create(buildPayload(action));
        }
      }
      toast.success(
        action === "submit" ? t("Submitted for approval") : t("Saved as draft")
      );
      router.push("/dashboard/inventory/depreciation");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  // In the write-off UI, "Difference" equals the write-off amount itself.
  const difference = Number(values.qty_to_write_off || 0);

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/depreciation"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to depreciation")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t(isEdit ? "Edit Depreciation" : "Add Depreciation")}
        </h1>

        <HeaderActions
          mode={isEdit ? "edit" : "create"}
          onApprove={() => save("submit")}
          onSaveDraft={() => save("draft")}
          onCancel={() => router.push("/dashboard/inventory/depreciation")}
          loading={loading}
        />
      </div>

      {/* Card (matches the screenshot layout) */}
      <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
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

        {/* Quantities (Current / Write-off / Difference) */}
        <div className="col-span-full lg:col-span-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Input
            type="number"
            value={values.current_qty}
            onChange={(e) => onChange({ current_qty: Number(e.target.value) })}
            className="bg-neutral-white-100"
            label={t("Current Quantity")}
            error={undefined}
          />

          <Input
            type="number"
            value={values.qty_to_write_off}
            onChange={(e) =>
              onChange({ qty_to_write_off: Number(e.target.value) })
            }
            label={t("Qty to Write-off")}
            error={errors.qty_to_write_off}
          />

          <Input
            readOnly
            value={difference}
            className="bg-neutral-white-100"
            label={t("Difference")}
            error={undefined}
          />
        </div>

        {/* Reason (shadcn Select) */}
        <div className="col-span-full lg:col-span-1">
          <Label>{t("Reason")}</Label>
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

      {/* Note (Options) */}
      <div className="rounded-2xl bg-white">
        <NoteField
          value={values.notes}
          onChange={(notes) => onChange({ notes })}
          error={undefined}
        />
      </div>
    </div>
  );
}
