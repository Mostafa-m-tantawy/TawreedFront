"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FormValues = {
  date: string;
  warehouse_id: number | "";
  notes: string;
  items: {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    system_qty: number;
    counted_qty: number;
    variance: number;
  }[];
  status?: string;
};

export default function StockCountForm({
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
    notes: "",
    items: [],
  });

  const onChange = (patch: Partial<FormValues>) =>
    setValues((v) => ({ ...v, ...patch }));

  // ------- fetch warehouse dropdown ----------
  const fetchWarehousesPage = React.useCallback(
    async (page: number, query: string) => {
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
    },
    []
  );

  // ------- load product items for warehouse ----------
  const loadProducts = React.useCallback(async (warehouse_id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/stock-count-products`, {
        params: { warehouse_id },
      });
      const items = (res?.data?.data ?? []).map((p: any, idx: number) => ({
        id: idx + 1,
        product_id: p.id,
        name: p.name,
        sku: p.sku,
        system_qty: Number(p.system_qty ?? 0),
        counted_qty: Number(p.system_qty ?? 0),
        variance: 0,
      }));
      setValues((v) => ({ ...v, items }));
    } catch {
      // fallback mock
      const mock = [
        { id: 10, name: "Product A", sku: "ST-111", system_qty: 12 },
        { id: 11, name: "Product B", sku: "ST-112", system_qty: 12 },
        { id: 12, name: "Product C", sku: "ST-113", system_qty: 8 },
      ];
      setValues((v) => ({
        ...v,
        items: mock.map((p, idx) => ({
          id: idx + 1,
          product_id: p.id,
          name: p.name,
          sku: p.sku,
          system_qty: p.system_qty,
          counted_qty: p.system_qty,
          variance: 0,
        })),
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // ------- variance calculation ----------
  const updateCountedQty = (index: number, counted_qty: number) => {
    setValues((v) => {
      const items = [...v.items];
      const row = { ...items[index] };
      row.counted_qty = counted_qty;
      row.variance = counted_qty - row.system_qty;
      items[index] = row;
      return { ...v, items };
    });
  };

  const totalVariance = React.useMemo(
    () => values.items.reduce((sum, it) => sum + it.variance, 0),
    [values.items]
  );

  // ------- validation ----------
  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.date) e.date = t("fieldRequired");
    if (!values.warehouse_id) e.warehouse_id = t("fieldRequired");
    if (!values.items.length) e.items = t("No items to count");
    setErrors(e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  // ------- build payload ----------
  const buildPayload = (action: "draft" | "submit") => ({
    date: values.date,
    warehouse_id: Number(values.warehouse_id),
    notes: values.notes || null,
    status: isEdit ? values.status : action === "submit" ? "Pending" : "Draft",
    items: values.items.map((r) => ({
      product_id: r.product_id,
      system_qty: r.system_qty,
      counted_qty: r.counted_qty,
      variance: r.variance,
    })),
  });

  // ------- save ----------
  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && id) {
        await api.put(`/admin/stock-counts/${id}`, buildPayload(action));
      } else {
        await api.post(`/admin/stock-counts`, buildPayload(action));
      }
      toast.success(
        action === "submit" ? t("Submitted for approval") : t("Saved as draft")
      );
      router.push("/dashboard/inventory/stock-counts");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("unknownError"));
    } finally {
      setLoading(false);
    }
  };

  // ===================== UI =====================
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/stock-counts"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Stock Counts")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">{t("Stock Count")}</h1>

        <HeaderActions
          mode={isEdit ? "edit" : "create"}
          onApprove={() => save("submit")}
          onSaveDraft={() => save("draft")}
          onCancel={() => router.push("/dashboard/inventory/stock-counts")}
          loading={loading}
        />
      </div>

      {/* --- Top Card --- */}
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
              placeholder={t("Select Warehouse")}
              fetchPage={(page, query) => fetchWarehousesPage(page, query)}
              onChange={(id) => {
                onChange({ warehouse_id: id });
                if (id) loadProducts(Number(id));
              }}
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

        {/* Note */}
        <div className="col-span-full">
          <Label>{t("Note (Optional)")}</Label>
          <Textarea
            placeholder={t("write any note you want")}
            value={values.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      {/* --- Products Count Table --- */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">{t("Products Count")}</h2>
          <p className="text-sm">
            {t("Total Variance")}:{" "}
            <span
              className={totalVariance >= 0 ? "text-green-600" : "text-red-600"}
            >
              {totalVariance >= 0 ? `+${totalVariance}` : totalVariance}
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table className="border-separate border-spacing-y-1">
            <TableHeader>
              <TableRow className="bg-neutral-50 text-gray-700">
                <TableHead>{t("Product")}</TableHead>
                <TableHead>{t("SKU")}</TableHead>
                <TableHead className="text-center">{t("System Qty")}</TableHead>
                <TableHead className="text-center">
                  {t("Counted Qty")}
                </TableHead>
                <TableHead className="text-center">{t("Variance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {values.items.map((it, idx) => (
                <TableRow key={it.id} className="bg-white shadow-sm">
                  <TableCell>{it.name}</TableCell>
                  <TableCell>{it.sku}</TableCell>
                  <TableCell className="text-center">{it.system_qty}</TableCell>
                  <TableCell className="text-center">
                    <input
                      type="number"
                      className="w-20 text-center border rounded-md"
                      value={it.counted_qty}
                      onChange={(e) =>
                        updateCountedQty(idx, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell
                    className={`text-center ${
                      it.variance > 0
                        ? "text-green-600"
                        : it.variance < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {it.variance > 0 ? `+${it.variance}` : it.variance}
                  </TableCell>
                </TableRow>
              ))}
              {!values.items.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-400 p-4"
                  >
                    {t("No products loaded")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
