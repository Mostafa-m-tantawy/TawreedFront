"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

import api from "@/lib/api.client";
import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";

import type { PageResult } from "@/types/common";
import type { TransferItem } from "@/types/transfer";
import TransferItemsTable from "./TransferItemsTable";
import NoteField from "@/components/Dashboard/Purchase/PurchaseForm/sections/NoteField";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import { extractFieldErrors, goToTop } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type WarehouseType = "Product" | "Finished Goods" | "Raw Material";

type FormState = {
  from_warehouses_id: number | "";
  to_warehouses_id: number | "";
  notes: string;
  items: TransferItem[];
  status?: string;
};

type Perms = { canCreate?: boolean; canEdit?: boolean };
type WH = { id: number; name: string; type?: WarehouseType };

const normalizeItemFromEdit = (it: any): TransferItem => {
  const productId =
    it?.product_id ??
    it?.Product?.id ??
    it?.product?.id ??
    it?.productable_id ??
    it?.productable?.id ??
    null;

  const productLabel =
    it?.product_label ??
    it?.Product?.name ??
    it?.product?.name ??
    it?.sku ??
    (productId ? `#${productId}` : "");

  const type =
    it?.productable_type &&
    String(it.productable_type).toLowerCase() === "productvariant"
      ? "ProductVariant"
      : "Product";

  return {
    productKey: productId ? `${type}:${productId}` : "",
    productLabel,
    quantity: Number(it?.quantity ?? 0),
    unit: it?.unit ? { id: it.unit.id, name: it.unit.name } : null,
    unit_id: it?.unit?.id,
    attributes: it?.attributes ?? [],
    units: it?.units,
    allowed_quantity: it?.warehouse_quantity,
  };
};

const TOP_FIELD_KEYS = ["from_warehouses_id", "to_warehouses_id", "items"];

export default function TransferForm({
  mode,
  id,
  canCreate = true,
  canEdit = true,
}: {
  mode: "create" | "edit";
  id?: number;
} & Perms) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<FormState>({
    from_warehouses_id: "",
    to_warehouses_id: "",
    notes: "",
    items: [],
  });
  const [fromWarehouseType, setFromWarehouseType] =
    useState<WarehouseType | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const warehouseMapRef = useRef<Record<number, WH>>({});
  const getWh = (id?: number) => (id ? warehouseMapRef.current[id] : undefined);

  const [warehouseMap, setWarehouseMap] = useState<Record<number, WH>>({});

  const onChange = (patch: Partial<FormState>) =>
    setValues((v) => ({ ...v, ...patch }));

  /** ---------------- Warehouses fetcher ---------------- */
  const fetchWarehousesPage = useCallback(
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
          type: select_type === "to" ? fromWarehouseType : undefined,
        },
      });

      const rows: WH[] = (res?.data?.data ?? []).map((w: any) => ({
        id: w.id,
        name: w.name,
        type: w.type as WarehouseType | undefined,
      }));

      rows.forEach((w) => (warehouseMapRef.current[w.id] = w));

      const meta = res?.data?.meta ?? {};
      return {
        items: rows
          .map((w) => ({ id: w.id, name: w.name }))
          .filter((w) =>
            select_type === "to" ? w.id !== values.from_warehouses_id : true
          ),
        page: meta?.current_page ?? page,
        lastPage: meta?.last_page ?? page,
        total: meta?.total ?? rows.length,
      };
    },
    [fromWarehouseType, values.from_warehouses_id]
  );

  /** ---------------- Edit load ---------------- */
  const loadEdit = useCallback(
    async (tid: number) => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/transfer-transactions/${tid}/edit`);
        const d = res?.data?.data ?? res?.data ?? {};

        if (d.status == "Approved") {
          router.push("/dashboard/inventory/stock-transfer");

          return;
        }

        const from = d?.fromwarehouse;
        const to = d?.towarehouse;

        if (from?.id) {
          warehouseMapRef.current[from.id] = {
            id: from.id,
            name: from.name,
            type: from.type,
          };
        }
        if (to?.id) {
          warehouseMapRef.current[to.id] = {
            id: to.id,
            name: to.name,
            type: to.type,
          };
        }
        setWarehouseMap((m) => ({
          ...m,
          ...(from?.id ? { [from.id]: warehouseMapRef.current[from.id]! } : {}),
          ...(to?.id ? { [to.id]: warehouseMapRef.current[to.id]! } : {}),
        }));

        setValues({
          from_warehouses_id: from?.id ?? d?.from_warehouse_id ?? "",
          to_warehouses_id: to?.id ?? d?.to_warehouse_id ?? "",
          notes: d?.notes ?? "",
          items: (d?.items ?? []).map(normalizeItemFromEdit),
          status: d?.status,
        });
      } catch (e: any) {
        toast.error(e?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (isEdit && id) loadEdit(id);
  }, [isEdit, id, loadEdit]);

  /** ---------------- Validation (same-type rule only) ---------------- */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.from_warehouses_id) e.from_warehouses_id = t("fieldRequired");
    if (!values.to_warehouses_id) e.to_warehouses_id = t("fieldRequired");

    const from = values.from_warehouses_id
      ? warehouseMap[Number(values.from_warehouses_id)] ||
        getWh(Number(values.from_warehouses_id))
      : undefined;
    const to = values.to_warehouses_id
      ? warehouseMap[Number(values.to_warehouses_id)] ||
        getWh(Number(values.to_warehouses_id))
      : undefined;

    if (from?.type && to?.type && from.type !== to.type) {
      e.to_warehouses_id = t("Both warehouses must be the same type");
    }

    if (!values.items?.length) e.items = t("Add at least one item");
    (values.items || []).forEach((r, idx) => {
      if (!r.productKey) e[`items.${idx}.productable_id`] = t("fieldRequired");
      if (!r.quantity || Number(r.quantity) <= 0)
        e[`items.${idx}.quantity`] = t("Must be > 0");
      if (!r.unit?.id) e[`items.${idx}.unit_id`] = t("fieldRequired");
    });

    setFormErrors(e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  /** ---------------- Save ---------------- */
  const buildPayload = (action: "draft" | "submit") => ({
    from_warehouse_id: Number(values.from_warehouses_id),
    to_warehouse_id: Number(values.to_warehouses_id),
    notes: values.notes || null,
    status: isEdit ? values.status : action === "submit" ? "Pending" : "Draft",
    items: (values.items || []).map((r) => {
      const [typeRaw, rawId] = String(r.productKey).split(":");
      const productable_type =
        typeRaw?.toLowerCase() === "productvariant"
          ? "ProductVariant"
          : "Product";
      return {
        productable_type,
        productable_id: Number(rawId || 0),
        quantity: Number(r.quantity || 0),
        unit_id: r.unit?.id,
      };
    }),
  });

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        if (!canEdit) {
          toast.error(t("You don't have permission to edit transfers."));
          return;
        }
        await api.put(
          `/admin/transfer-transactions/${id}`,
          buildPayload(action)
        );
      } else {
        if (!canCreate) {
          toast.error(t("You don't have permission to create transfers."));
          return;
        }
        await api.post(`/admin/transfer-transactions`, buildPayload(action));
      }
      toast.success(
        action === "submit" ? t("Submitted for approval") : t("Saved as draft")
      );
      router.push("/dashboard/inventory/stock-transfer");
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};

      if (Object.keys(fieldErrors).length) {
        setFormErrors(fieldErrors);
        goToTop(TOP_FIELD_KEYS, fieldErrors);
        toast.error(t("Please fix the highlighted fields"));
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          t("unknownError");
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  /** ---------------- Handlers (regular selects; no type logic) ---------------- */
  const SAME_TYPE_MSG = t("Both warehouses must be the same type");
  const getWarehouseById = (id?: number) =>
    id ? warehouseMap[id] || warehouseMapRef.current[id] : undefined;

  const clearWHTypeErrors = () =>
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n.from_warehouses_id;
      delete n.to_warehouses_id;
      return n;
    });

  const setFieldError = (
    key: "from_warehouses_id" | "to_warehouses_id",
    msg: string
  ) => setFormErrors((prev) => ({ ...prev, [key]: msg }));

  const getWarehouseName = (id: number | "") =>
    id
      ? warehouseMap[Number(id)]?.name ||
        warehouseMapRef.current[Number(id)]?.name ||
        ""
      : "";

  const handleFromWarehouseChange = useCallback(
    (id: number | "") => {
      if (id) {
        const newWh = getWarehouseById(Number(id));
        const otherWh = getWarehouseById(Number(values.to_warehouses_id || 0));

        if (newWh?.type) setFromWarehouseType(newWh.type);

        // if (newWh?.type && otherWh?.type && newWh.type !== otherWh.type) {
        //   toast.error(SAME_TYPE_MSG);
        //   setFieldError("from_warehouses_id", SAME_TYPE_MSG);
        //   return;
        // }
        clearWHTypeErrors();
        onChange({ from_warehouses_id: id });
        onChange({ to_warehouses_id: "", items: [] });
        if (newWh) setWarehouseMap((m) => ({ ...m, [newWh.id]: newWh }));
      } else {
        onChange({ from_warehouses_id: "" });
        clearWHTypeErrors();
      }
    },
    [onChange, values.to_warehouses_id, t]
  );

  const handleToWarehouseChange = useCallback(
    (id: number | "") => {
      if (id) {
        const newWh = getWarehouseById(Number(id));
        const otherWh = getWarehouseById(
          Number(values.from_warehouses_id || 0)
        );
        if (newWh?.type && otherWh?.type && newWh.type !== otherWh.type) {
          toast.error(SAME_TYPE_MSG);
          setFieldError("to_warehouses_id", SAME_TYPE_MSG);
          return;
        }
        clearWHTypeErrors();
        onChange({ to_warehouses_id: id });
        if (newWh) setWarehouseMap((m) => ({ ...m, [newWh.id]: newWh }));
      } else {
        onChange({ to_warehouses_id: "" });
        clearWHTypeErrors();
      }
    },
    [onChange, values.from_warehouses_id, t]
  );

  const onApprove = () => save("submit");
  const onSaveDraft = () => save("draft");
  const onCancel = () => router.push("/dashboard/inventory/stock-transfer");

  /** ---------------- UI ---------------- */
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/stock-transfer"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Transfers")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t(isEdit ? "Edit Transfer" : "Create Transfer")}
        </h1>

        <HeaderActions
          mode={isEdit ? "edit" : "create"}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={disabled}
        />
      </div>

      {/* top meta */}
      <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("From Warehouse")}</Label>
          <div className="mt-4">
            <PagedSingleSelect
              value={values.from_warehouses_id || ""}
              display={getWarehouseName(values.from_warehouses_id)}
              placeholder={t("Select From Warehouse")}
              fetchPage={(page, query) =>
                fetchWarehousesPage(page, query, "from")
              }
              onChange={handleFromWarehouseChange}
              t={t}
              error={!!formErrors.from_warehouses_id}
            />
            {formErrors.from_warehouses_id && (
              <p className="mt-1 text-sm text-destructive">
                {formErrors.from_warehouses_id}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>{t("To Warehouse")}</Label>
          <div className="mt-4">
            <PagedSingleSelect
              value={values.to_warehouses_id || ""}
              display={getWarehouseName(values.to_warehouses_id)}
              placeholder={t("Select To Warehouse")}
              fetchPage={(page, query) =>
                fetchWarehousesPage(page, query, "to")
              }
              onChange={handleToWarehouseChange}
              t={t}
              error={!!formErrors.to_warehouses_id}
              disabled={!values.from_warehouses_id}
            />
            {formErrors.to_warehouses_id && (
              <p className="mt-1 text-sm text-destructive">
                {formErrors.to_warehouses_id}
              </p>
            )}
          </div>
        </div>
      </div>

      <TransferItemsTable
        rows={values.items}
        onChange={(items) => onChange({ items })}
        formErrors={formErrors}
        fromWarehouseId={values.from_warehouses_id}
      />

      <NoteField
        value={values.notes}
        onChange={(notes) => onChange({ notes })}
        error={formErrors.notes}
      />
    </div>
  );
}
