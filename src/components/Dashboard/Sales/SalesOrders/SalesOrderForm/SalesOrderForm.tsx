"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { extractFieldErrors, goToTop } from "@/lib/utils";

import type { PurchaseLineItem as SalesLineItem } from "@/types/purchase-invoice";
import TotalsSummary from "@/components/Dashboard/Purchase/PurchaseForm/sections/TotalsSummary";
import NoteField from "@/components/Dashboard/Purchase/PurchaseForm/sections/NoteField";
import ProductsTable from "@/components/Dashboard/Purchase/PurchaseForm/sections/ProductsTable";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import SalesPartyAndMeta from "./SalesPartyAndMeta";
import { normalizeSalesItem } from "../sales-order-helpers";

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
  customer_id: number | "";
  code: string; // SO number
  order_date: string; // "YYYY-MM-DD"
  expected_delivery: string; // "YYYY-MM-DD"
  payment_terms: string | "";
  currency_id: string;
  notes: string;
  items: SalesLineItem[];
  initialCustomer?: { id: number; name: string };
  status?: string;
};

type FieldErrors = Record<string, string>;

const TOP_FIELD_KEYS = [
  "customer_id",
  "code",
  "order_date",
  "expected_delivery",
  "payment_terms",
  "currency",
];

export default function SalesOrderForm({
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
    customer_id: "",
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
      // Reuse purchase-order create bootstrap until SO meta endpoint exists
      const res = await api.get("/admin/purchase-orders/create");

      const code = res?.data?.code ?? "";
      setValues((v) => ({ ...v, code: code?.replace("PO-", "SO-") }));

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

  const loadEdit = async (sid: number) => {
    setLoading(true);
    try {
      /**
       * MOCKED EDIT DATA (until backend endpoint ready)
       * If/when the API exists, swap this out for:
       *   const res = await api.get(`/admin/sales-orders/${sid}/edit`)
       *   ... map and setValues(...) like in purchase form.
       */
      const today = new Date().toISOString().slice(0, 10);
      // hydrate meta via PO bootstrap (so selects work)
      const res = await api.get("/admin/purchase-orders/create");
      setMeta({
        terms: res.data?.payment_terms?.map((t: any) => t.name) || [],
        currencies: res?.data?.currencies ?? [],
      });

      const mocked = {
        customer: { id: 99, name: "Acme Corp" },
        code: `SO-${new Date().getFullYear()}-967`,
        order_date: today,
        expected_delivery: today,
        payment_terms: "Net 30",
        currency_id: meta.currencies?.[0]?.id ?? 120,
        notes: "Please ship ASAP.",
        status: "Draft",
        sales_order_items: [
          {
            productKey: "product:101",
            productLabel: "Sample Product",
            quantity: 1,
            unit_price: 1200,
            tax_percent: 14,
            expiry_date: "",
            unit: { id: 1, name: "PCS", conversion_factor: 1 },
          },
        ],
      } as any;

      setValues({
        customer_id: mocked?.customer?.id ?? "",
        code: mocked.code ?? "",
        order_date: (mocked.order_date ?? "").slice(0, 10),
        expected_delivery: (mocked.expected_delivery ?? "").slice(0, 10),
        payment_terms: mocked.payment_terms ?? "",
        currency_id: String(mocked.currency_id ?? "120"),
        notes: mocked.notes ?? "",
        items: (mocked.sales_order_items ?? []).map(normalizeSalesItem),
        initialCustomer: mocked.customer,
        status: mocked.status,
      });
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

    if (!values.customer_id) e.customer_id = t("fieldRequired");
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
    customer_id: Number(values.customer_id),
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
          toast.error(t("You don't have permission to edit sales orders."));
          return;
        }
        // CHANGED to sales-orders
        await api.put(`/admin/sales-orders/${id}`, buildPayload(action));
      } else {
        if (!canCreate) {
          toast.error(t("You don't have permission to create sales orders."));
          return;
        }
        // CHANGED to sales-orders
        await api.post(`/admin/sales-orders`, buildPayload(action));
      }

      toast.success(
        action === "submit"
          ? t("salesOrderSubmitted")
          : t("salesOrderSavedDraft")
      );
      router.push("/dashboard/sales/orders");
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
  const onCancel = () => router.push("/dashboard/sales/orders");

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/sales/orders"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Sales")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit ? t("Edit Sales") : t("Add Sales")}
        </h1>
        <HeaderActions
          mode={mode}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={disabled}
        />
      </div>

      <SalesPartyAndMeta
        values={{
          customer_id: values.customer_id,
          code: values.code,
          order_date: values.order_date,
          expected_delivery: values.expected_delivery,
          payment_terms: values.payment_terms,
          currency_id: values.currency_id,
        }}
        onChange={onChange}
        termsList={meta.terms}
        currencies={meta.currencies}
        formErrors={formErrors}
        initialCustomer={values.initialCustomer}
      />

      <ProductsTable
        items={values.items}
        onItemsChange={(items) => onChange({ items })}
        formErrors={formErrors}
        isMock
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
