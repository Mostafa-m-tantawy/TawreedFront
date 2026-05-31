// SalesQuotationForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PagedSingleSelect from "@/components/Dashboard/MasterData/Products/ProductForm/controls/PagedSingleSelect";
import { PageResult } from "@/types/common";
import api from "@/lib/api.client";
import { extractFieldErrors, goToTop } from "@/lib/utils";

import type { PurchaseLineItem as SalesLineItem } from "@/types/purchase-invoice";
import ProductsTable from "@/components/Dashboard/Purchase/PurchaseForm/sections/ProductsTable";
import TotalsSummary from "@/components/Dashboard/Purchase/PurchaseForm/sections/TotalsSummary";
import NoteField from "@/components/Dashboard/Purchase/PurchaseForm/sections/NoteField";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import Link from "next/link";

// ---------------- Types ----------------
type Perms = { canCreate?: boolean; canEdit?: boolean };

type QuotationItemPayload = {
  product: string;
  qty: number;
  price: number;
  discount: number;
  tax: number;
};

type QuotationPayload = {
  customer: string; // for mock BE: name or id string
  date: string; // ISO datetime
  validity_days: number;
  notes: string;
  status: "Draft" | "Approved";
  items: QuotationItemPayload[];
};

type FormState = {
  customer_id: number | "";
  customer_name?: string;
  quotation_date: string; // YYYY-MM-DD
  validity_days: number | ""; // days
  status: "Draft" | "Approved";
  notes: string;
  items: SalesLineItem[];
};

type FieldErrors = Record<string, string>;

const TOP_FIELD_KEYS = ["customer_id", "quotation_date", "validity_days"];

// ---------------- Component ----------------
export default function SalesQuotationForm({
  mode,
  id,
  canCreate = true,
  canEdit = true,
  onCreate,
  onUpdate,
}: {
  mode: "create" | "edit";
  id?: number;
  onCreate?: (payload: QuotationPayload) => Promise<any> | any;
  onUpdate?: (qid: number, payload: QuotationPayload) => Promise<any> | any;
} & Perms) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});

  // Top fields (inline)
  const [values, setValues] = useState<FormState>({
    customer_id: "",
    customer_name: "",
    quotation_date: "",
    validity_days: "",
    status: "Draft",
    notes: "",
    items: [],
  });

  // ---------------- Customer fetch (paged) ----------------
  const fetchCustomersPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/customers`, {
      params: { page, per_page: 10, name: query || undefined },
    });
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

  // ---------------- Loaders (minimal) ----------------
  useEffect(() => {
    // If you have a quotations edit endpoint, map into the same FormState here.
    // For now, keep empty (mock/new).
    // Example (pseudo):
    // if (isEdit && id) { const q = await getQuotation(id); setValues(...); }
  }, [isEdit, id]);

  // ---------------- Helpers ----------------
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

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!values.customer_id) e.customer_id = t("fieldRequired");
    if (!values.quotation_date) e.quotation_date = t("fieldRequired");
    const vdays = Number(values.validity_days);
    if (values.validity_days === "" || isNaN(vdays) || vdays < 0)
      e.validity_days = t("Invalid value");
    if (!values.items?.length) e.items = t("Add at least one item");

    (values.items ?? []).forEach((r, idx) => {
      if (!r.productKey) e[`items.${idx}.product`] = t("Required");
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

  const buildPayload = (status: "Draft" | "Approved"): QuotationPayload => {
    const items: QuotationItemPayload[] = (values.items ?? []).map((r) => {
      const [productable_type, idStr] = r.productKey.split(":");
      return {
        product: r.productLabel || `${productable_type}#${idStr}`,
        qty: Number(r.quantity ?? 0),
        price: Number(r.unit_price ?? 0),
        discount: Number((r as any).discount ?? 0),
        tax: Number(r.tax_percent ?? 0),
      };
    });

    return {
      customer: values.customer_name || String(values.customer_id),
      date: toIsoDateTime(values.quotation_date),
      validity_days: Number(values.validity_days ?? 0),
      notes: values.notes || "",
      status,
      items,
    };
  };

  const save = async (intent: "draft" | "approve") => {
    if (!validate()) return;

    const status = intent === "approve" ? "Approved" : "Draft";
    setLoading(true);
    try {
      if (isEdit) {
        if (!canEdit) {
          toast.error(t("You don't have permission to edit quotations."));
          return;
        }
        if (onUpdate && id) await onUpdate(id, buildPayload(status));
      } else {
        if (!canCreate) {
          toast.error(t("You don't have permission to create quotations."));
          return;
        }
        if (onCreate) await onCreate(buildPayload(status));
      }
      toast.success(
        intent === "approve" ? t("quotationApproved") : t("quotationSavedDraft")
      );
      router.push("/dashboard/sales/quotations");
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

  const onSaveDraft = () => save("draft");
  const onApprove = () => save("approve");
  const onCancel = () => router.push("/dashboard/sales/quotations");

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  // ---------------- UI ----------------
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/sales/quotations"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Sales")}
      </Link>

      {/* Actions */}
      <div className="t-2 flex justify-between items-center flex-wrap gap-4">
        <h2 className="ty-body-xl-2 text-primary-700">
          {t(isEdit ? "Edit Quotation" : "Add Quotation")}
        </h2>

        <HeaderActions
          mode={mode}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={loading}
        />
      </div>

      {/* Top fields (inline, like your reference component) */}
      <div className="rounded-2xl bg-white p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer */}
        <div>
          <Label>{t("Customer")}</Label>
          <div className="mt-4">
            <PagedSingleSelect
              disabled={false}
              value={values.customer_id || ""}
              display={values.customer_name || ""}
              placeholder={t("select a customer")}
              fetchPage={fetchCustomersPage}
              onChange={(id, name) =>
                onChange({ customer_id: id, customer_name: name })
              }
              t={t}
              error={!!formErrors.customer_id}
            />
          </div>
          {formErrors.customer_id && (
            <p className="mt-1 text-sm text-destructive text-start">
              {formErrors.customer_id}
            </p>
          )}
        </div>

        {/* Quotation Date */}
        <div>
          <Input
            type="date"
            label={t("Quotation Date")}
            value={values.quotation_date}
            onChange={(e) => onChange({ quotation_date: e.target.value })}
            error={formErrors.quotation_date}
          />
        </div>

        {/* Validity Period (days) */}
        <div>
          <Input
            type="number"
            min={0}
            label={t("Validity Period (days)")}
            placeholder={t("enter days")}
            value={values.validity_days}
            onChange={(e) =>
              onChange({ validity_days: Number(e.target.value || 0) })
            }
            error={formErrors.validity_days}
          />
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable
        items={values.items}
        onItemsChange={(items) => onChange({ items })}
        formErrors={formErrors}
        isMock
      />

      {/* Totals */}
      <TotalsSummary items={values.items} />

      {/* Notes */}
      <NoteField
        value={values.notes}
        onChange={(notes) => onChange({ notes })}
        error={formErrors.notes}
      />
    </div>
  );
}
