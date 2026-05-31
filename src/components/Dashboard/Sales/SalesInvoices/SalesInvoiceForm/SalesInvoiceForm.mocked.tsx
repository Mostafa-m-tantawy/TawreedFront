"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

import { extractFieldErrors, goToTop } from "@/lib/utils";
import NoteField from "@/components/Dashboard/Purchase/PurchaseForm/sections/NoteField";
import TotalsSummary from "@/components/Dashboard/Purchase/PurchaseForm/sections/TotalsSummary";
import ProductsTable from "@/components/Dashboard/Purchase/PurchaseForm/sections/ProductsTable";
import SalesInvoicePartyAndMeta from "./SalesInvoicePartyAndMeta";
import HeaderActions from "@/components/Dashboard/Purchase/PurchaseForm/sections/HeaderActions";
import { PurchaseLineItem } from "@/types/purchase-invoice";

type Perms = { canCreate?: boolean; canEdit?: boolean };

export type Customer = { id: number; name: string };

type FormState = {
  customer_id: number | "";
  code: string;
  invoice_date: string;
  so_id: number | "";
  payment_terms: string | "";
  note: string;
  items: PurchaseLineItem[];
  status?: string;
  customer?: Customer;
};

type FieldErrors = Record<string, string>;

const TOP_FIELD_KEYS = [
  "customer_id",
  "code",
  "invoice_date",
  "so_id",
  "payment_terms",
  "items",
];

// Mock data helpers
const mockDelay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

const mockTerms = ["Net 30 Days", "Due on Receipt", "End of Month"];

const mockItems: any[] = [
  {
    productKey: "Product:1",
    productLabel: "Product A",
    quantity: 2,
    unit_price: 2.0,
    tax_percent: 10,
    expiry_date: null,
    unit_id: 1,
    unit: { id: 1, name: "pcs", conversion_factor: 1 },
  },
];

const mockInvoice = {
  id: 101,
  customer_id: 1,
  code: "SI-2025-001",
  invoice_date: "2025-08-28",
  so_id: 10,
  payment_terms: "Net 30 Days",
  note: "Thank you for your business!",
  items: mockItems,
  status: "Draft",
  customer: { id: 1, name: "Acme Corp" },
};

export default function SalesInvoiceForm({
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
  const searchParams = useSearchParams();
  const soIdFromQuery = Number(searchParams.get("so") ?? 0);

  const [loading, setLoading] = useState(false);
  const [termsList, setTermsList] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [values, setValues] = useState<FormState>({
    customer_id: "",
    code: "",
    invoice_date: "",
    so_id: "",
    payment_terms: "",
    note: "",
    items: [],
  });

  /** -------------------------- helpers -------------------------- */
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

  /** -------------------------- mocked loaders -------------------------- */
  const loadCreate = async () => {
    setLoading(true);
    await mockDelay();
    setValues((v) => ({
      ...v,
      code: "SI-2025-NEW",
      invoice_date: "2025-08-28",
    }));
    setTermsList(mockTerms);
    setLoading(false);
  };

  const loadSO = async () => {
    if (!soIdFromQuery) return;
    setLoading(true);
    await mockDelay();
    onChange({
      customer_id: 1,
      so_id: soIdFromQuery,
    });
    setLoading(false);
  };

  const loadEdit = async (invoiceId: number) => {
    setLoading(true);
    await mockDelay();
    const d = { ...mockInvoice, id: invoiceId };
    if (d.status === "Approved") {
      router.push("/dashboard/sales/invoices");
      return;
    }
    setTermsList(mockTerms);
    setValues({
      customer_id: d.customer_id,
      code: d.code,
      invoice_date: d.invoice_date,
      so_id: d.so_id,
      payment_terms: d.payment_terms,
      note: d.note,
      status: d.status,
      items: d.items,
      customer: d.customer,
    });
    setLoading(false);
  };

  useEffect(() => {
    if (isEdit && id) loadEdit(id);
    else {
      loadCreate();
      loadSO();
    }
  }, [isEdit, id]);

  /** -------------------------- validation -------------------------- */
  const validate = (): boolean => {
    const e: FieldErrors = {};

    if (!values.customer_id) e.customer_id = t("fieldRequired");
    if (!values.code) e.code = t("fieldRequired");
    if (!values.invoice_date) e.invoice_date = t("fieldRequired");
    if (!values.payment_terms) e.payment_terms = t("fieldRequired");
    if (!values.so_id) e.so_id = t("fieldRequired");

    const validItems = values.items ?? [];
    if (!validItems.length) e.items = t("Add at least one item");

    validItems.forEach((r, idx) => {
      if (!r?.quantity || Number(r.quantity) <= 0)
        e[`items.${idx}.quantity`] = t("Must be > 0");
      if (r?.unit_price == null || Number(r.unit_price) < 0)
        e[`items.${idx}.unit_price`] = t("Invalid price");
      if (r?.tax_percent != null && Number(r.tax_percent) < 0)
        e[`items.${idx}.tax_percent`] = t("Invalid tax");
      if (r?.unit_id == null) e[`items.${idx}.unit_id`] = t("fieldRequired");
    });

    setFormErrors(e);
    goToTop(TOP_FIELD_KEYS, e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  /** -------------------------- mocked submit -------------------------- */
  const buildPayload = (action: "draft" | "submit") => {
    const status = isEdit
      ? values.status
      : action === "submit"
      ? "Pending"
      : "Draft";

    return {
      customer_id: Number(values.customer_id || values.customer?.id),
      code: values.code,
      invoice_date: toIsoDateTime(values.invoice_date),
      sales_order_id: values.so_id ? Number(values.so_id) : null,
      payment_terms: values.payment_terms?.toString?.() ?? "",
      notes: values.note || null,
      status,
      items: (values.items ?? []).map((r) => ({
        productable_type: "Product",
        productable_id: 1,
        quantity_delivered: Number(r.quantity ?? 0),
        price: Number(r.unit_price ?? 0),
        tax: Number(r.tax_percent ?? 0),
        expired_date: r.expiry_date || null,
        unit_id: r.unit?.id ?? r.unit_id ?? null,
      })),
    };
  };

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;

    setLoading(true);
    await mockDelay();

    try {
      const payload = buildPayload(action);
      console.log("Mock save payload:", payload);

      toast.success(
        action === "submit"
          ? t("salesInvoiceSubmitted") || "Sales Invoice submitted"
          : t("savedDraft") || "Saved as draft"
      );
      router.push("/dashboard/sales/invoices");
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      if (Object.keys(fieldErrors).length) {
        setFormErrors(fieldErrors);
        goToTop(TOP_FIELD_KEYS, fieldErrors);
        toast.error(t("Please fix the highlighted fields"));
      } else {
        toast.error(err?.message || t("unknownError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const onApprove = () => save("submit");
  const onSaveDraft = () => save("draft");
  const onCancel = () => router.push("/dashboard/sales/invoices");

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  /** -------------------------- UI -------------------------- */
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/sales/invoices"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Sales")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">{t("Sales Invoices")}</h1>
        <HeaderActions
          mode={mode}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={disabled}
        />
      </div>

      <SalesInvoicePartyAndMeta
        values={{
          customer_id: values.customer_id,
          code: values.code,
          invoice_date: values.invoice_date,
          so_id: values.so_id,
          payment_terms: values.payment_terms,
        }}
        termsList={termsList}
        soDisabled={!!soIdFromQuery || !values.customer_id}
        onChange={(p) => onChange(p)}
        formErrors={formErrors as any}
      />

      <ProductsTable
        items={values.items}
        onItemsChange={(items) => onChange({ items })}
        formErrors={formErrors}
        isInvoice
        purchaseOrderId={values.so_id}
        isMock
      />

      <TotalsSummary items={values.items} />

      <NoteField
        value={values.note}
        onChange={(note) => onChange({ note })}
        error={formErrors.note}
      />
    </div>
  );
}
