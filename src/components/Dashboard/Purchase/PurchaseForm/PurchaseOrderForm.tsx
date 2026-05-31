"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { extractFieldErrors, goToTop } from "@/lib/utils";

import ProductsTable from "./sections/ProductsTable";
import TotalsSummary from "./sections/TotalsSummary";
import NoteField from "./sections/NoteField";
import HeaderActions from "./sections/HeaderActions";
import OrderPartyAndMeta from "./sections/OrderPartyAndMeta";

import type { PurchaseLineItem } from "@/types/purchase-invoice";
import { normalizePurchaseItem } from "../po-helpers";

type Perms = {
  canCreate?: boolean;
  canEdit?: boolean;
};

type MetaState = {
  terms: Array<string>;
  currencies: Array<{
    id: number;
    title: string;
    symbol: string;
    code: string;
  }>;
};

type FormState = {
  supplier_id: number | "";
  code: string;
  order_date: string; // "YYYY-MM-DD"
  expected_delivery: string; // "YYYY-MM-DD"
  payment_terms: string | "";
  currency_id: string;
  notes: string;
  items: PurchaseLineItem[];
  initialSupplier?: { id: number; name: string };
  status?: string;
};

type FieldErrors = Record<string, string>;

const TOP_FIELD_KEYS = [
  "supplier_id",
  "code",
  "order_date",
  "expected_delivery",
  "payment_terms",
  "currency",
];

export default function PurchaseOrderForm({
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

  /** -------------------------- meta + ui state -------------------------- */
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<MetaState>({
    terms: [],
    currencies: [],
  });

  const [values, setValues] = useState<FormState>({
    supplier_id: "",
    code: "",
    order_date: "",
    expected_delivery: "",
    payment_terms: "",
    currency_id: "120",
    notes: "",
    items: [],
  });

  const [formErrors, setFormErrors] = useState<FieldErrors>({});

  /** ------------------------------ helpers ------------------------------ */
  const clearFieldError = (k: keyof FormState | string) =>
    setFormErrors((p) => {
      if (!p[k as string]) return p;
      const n = { ...p };
      delete n[k as string];
      return n;
    });

  const onChange = (patch: Partial<FormState>) => {
    setValues((v) => ({ ...v, ...patch }));
    Object.keys(patch).forEach((k) => clearFieldError(k));
  };

  const toIsoDateTime = (d: string) => (d ? `${d}T00:00:00` : "");

  /** ------------------------------ loaders ------------------------------ */
  const loadCreate = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/purchase-orders/create");

      const code = res?.data?.code ?? "";
      setValues((v) => ({ ...v, code: code }));

      setMeta({
        terms: res.data?.payment_terms?.map((t: any) => t.name) || [],
        currencies: res?.data?.currencies ?? [],
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadEdit = async (pid: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/purchase-orders/${pid}/edit`);

      setMeta({
        terms: res.data?.payment_terms?.map((t: any) => t.name) || [],
        currencies: res?.data?.currencies ?? [],
      });

      const d =
        res.data.purchase_order || res.data.data || res.data.PurchaseOrder;
      if (d) {
        if (d.status == "Approved") {
          router.push("/dashboard/purchase/orders");

          return;
        }

        setValues({
          supplier_id: d?.supplier?.id ?? d.supplier_id ?? "",
          code: d.code ?? d.code ?? "",
          order_date: (d.order_date ?? "").slice(0, 10),
          expected_delivery: (
            d.expected_delivery ??
            d.expected_delivery ??
            ""
          ).slice(0, 10),
          payment_terms: d.payment_terms ?? "",
          currency_id: (d?.currency_id || d.currency?.id) ?? "",
          notes: d.notes ?? "",
          items: (d.purchase_order_items ?? []).map(normalizePurchaseItem),

          initialSupplier: d.supplier,
          status: d.status,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit && id) loadEdit(id);
    else loadCreate();
  }, [isEdit, id]);

  /** ---------------------------- validation ---------------------------- */
  const validate = (): boolean => {
    const e: FieldErrors = {};

    if (!values.supplier_id) e.supplier_id = t("fieldRequired");
    if (!values.order_date) e.order_date = t("fieldRequired");
    if (!values.expected_delivery) e.expected_delivery = t("fieldRequired");
    if (!values.payment_terms) e.payment_terms = t("fieldRequired");

    const curId = values.currency_id;
    if (!curId) e.currency_id = t("fieldRequired");

    const validItems = values.items ?? [];
    if (!validItems.length) e.items = t("Add at least one item");

    validItems.forEach((r, idx) => {
      if (!r.quantity || Number(r.quantity) <= 0)
        e[`items.${idx}.quantity`] = t("Must be > 0");
      if (r.unit_price == null || Number(r.unit_price) < 0)
        e[`items.${idx}.unit_price`] = t("Invalid price");
      if (r.tax_percent != null && Number(r.tax_percent) < 0)
        e[`items.${idx}.tax_percent`] = t("Invalid tax");
    });

    setFormErrors(e);
    goToTop(TOP_FIELD_KEYS, e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  /** ------------------------------ submit ------------------------------ */
  const buildPayload = (action: "draft" | "submit") => ({
    supplier_id: Number(values.supplier_id),
    code: values.code || undefined,
    order_date: toIsoDateTime(values.order_date),
    expected_delivery: toIsoDateTime(values.expected_delivery),
    currency_id: values.currency_id!,
    payment_terms: values.payment_terms,
    notes: values.notes || null,
    status: isEdit ? values.status : action === "submit" ? "Pending" : "Draft",
    items: (values.items ?? []).map((r) => {
      const key = r.productKey.split(":");
      const productableType = key[0];
      const productId = Number(key[1]);

      return {
        productable_type: productableType,
        productable_id: productId,
        quantity: Number(r.quantity ?? 0),
        price: Number(r.unit_price ?? 0),
        tax: Number(r.tax_percent ?? 0),
        expired_date: r.expiry_date || null,
        unit_id: r?.unit?.id,
      };
    }),
  });

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        if (!canEdit) {
          toast.error(t("You don't have permission to edit purchase orders."));
          return;
        }
        await api.put(`/admin/purchase-orders/${id}`, buildPayload(action));
      } else {
        if (!canCreate) {
          toast.error(
            t("You don't have permission to create purchase orders.")
          );
          return;
        }
        await api.post(`/admin/purchase-orders`, buildPayload(action));
      }

      toast.success(
        action === "submit"
          ? t("purchaseOrderSubmitted")
          : t("purchaseOrderSavedDraft")
      );
      router.push("/dashboard/purchase/orders");
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

  const onApprove = () => save("submit");
  const onSaveDraft = () => save("draft");
  const onCancel = () => router.push("/dashboard/purchase/orders");

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/purchase/orders"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Purchase")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">{t("Purchase Order")}</h1>
        <HeaderActions
          mode={mode}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={disabled}
        />
      </div>

      <OrderPartyAndMeta
        values={{
          supplier_id: values.supplier_id,
          code: values.code,
          order_date: values.order_date,
          expected_delivery: values.expected_delivery,
          payment_terms: values.payment_terms,
          currency_id: values.currency_id,
        }}
        termsList={meta.terms}
        currencies={meta.currencies}
        onChange={(p) => onChange(p)}
        formErrors={formErrors}
        initialSupplier={values.initialSupplier}
      />

      <ProductsTable
        items={values.items}
        onItemsChange={(items) => onChange({ items })}
        formErrors={formErrors}
      />

      <TotalsSummary items={values.items} />

      <NoteField
        value={values.notes}
        onChange={(notes) => onChange({ notes })}
        error={formErrors.notes}
      />
    </div>
  );
}
