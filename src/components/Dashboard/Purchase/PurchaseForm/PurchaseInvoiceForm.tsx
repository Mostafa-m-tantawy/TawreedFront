"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { extractFieldErrors, goToTop } from "@/lib/utils";

import ProductsTable from "./sections/ProductsTable";
import TotalsSummary from "./sections/TotalsSummary";
import NoteField from "./sections/NoteField";
import HeaderActions from "./sections/HeaderActions";
import InvoicePartyAndMeta from "./sections/InvoicePartyAndMeta";

import type { PurchaseLineItem } from "@/types/purchase-invoice";
import { Supplier } from "@/types/common-master-data";
import { normalizePurchaseItem } from "../po-helpers";

type Perms = { canCreate?: boolean; canEdit?: boolean };

type FormState = {
  supplier_id: number | "";
  code: string;
  invoice_date: string; // "YYYY-MM-DD"
  po_id: number | "";
  payment_terms: string | "";
  note: string;
  items: PurchaseLineItem[];
  status?: string;
  supplier?: Supplier;
};

type FieldErrors = Record<string, string>;

const TOP_FIELD_KEYS = [
  "supplier_id",
  "code",
  "invoice_date",
  "po_id",
  "payment_terms",
  "items",
];

export default function PurchaseInvoiceForm({
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
  const poId = Number(searchParams.get("po") ?? 0);

  /** -------------------------- meta + ui state -------------------------- */
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<FormState>({
    supplier_id: "",
    code: "",
    invoice_date: "",
    po_id: "",
    payment_terms: "",
    note: "",
    items: [],
  });

  const [formErrors, setFormErrors] = useState<FieldErrors>({});

  const [termsList, setTermsList] = useState<string[]>([]);

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
      const res = await api.get("/admin/purchase-invoices/create");

      setValues((v) => ({ ...v, code: res?.data?.code ?? "" }));

      const terms = res.data?.payment_terms ?? [];

      setTermsList(terms.map((t: any) => t.name));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadPO = async () => {
    if (!poId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/purchase-orders/${poId}`);
      const po = res.data?.data;

      if (po) {
        const supplier = po.supplier;

        onChange({
          supplier_id: supplier.id,
          po_id: po.id,
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const loadEdit = async (invoiceId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/purchase-invoices/${invoiceId}/edit`);
      const d =
        res.data.purchaseInvoice || res.data.purchase_invoice || res.data.data;

      const terms = res.data?.payment_terms ?? [];

      setTermsList(terms.map((t: any) => t.name));

      if (d) {
        if (d.status == "Approved") {
          router.push("/dashboard/purchase/invoices");

          return;
        }
        setValues({
          supplier_id: d.supplier?.id ?? d.supplier_id ?? "",
          code: d.code ?? "",
          invoice_date: (d.invoice_date ?? "").slice(0, 10),
          po_id: d.purchase_order?.id ?? "",
          payment_terms: d.payment_terms ?? "",
          note: d.notes ?? "",
          status: d.status,
          items: (d.purchase_invoice_items ?? []).map(normalizePurchaseItem),

          // items: (d.purchase_invoice_items ?? []).map((it: any) => {
          //   const key =
          //     it.productable_type && it.productable_id
          //       ? `${it.productable_type}:${it.productable_id}`
          //       : it.product_id
          //       ? `Product:${it.product_id}`
          //       : "";

          //   return {
          //     productKey: key,
          //     productLabel:
          //       it.product?.name ?? it.product_name ?? it.variant?.name ?? "",
          //     quantity: it.quantity_receive ?? it.quantity ?? 0,
          //     unit_price: it.price ?? 0,
          //     tax_percent: it.tax ?? 0,
          //     expiry_date: it.expired_date ?? null,
          //     unit_id: it.unit_id ?? it.unit?.id ?? null,
          //     unit: it.unit ?? it.product?.unit ?? null,
          //     warehouse_id: it.warehouse_id ?? d.warehouse_id ?? null,
          //     attributes:
          //       it.variant?.attributeValues?.map((av: any) => ({
          //         name: String(av.name),
          //         value: String(av.value),
          //       })) ?? [],
          //   };
          // }),
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
    else {
      loadCreate();
      loadPO();
    }
  }, [isEdit, id]);

  /** ---------------------------- validation ---------------------------- */
  const validate = (): boolean => {
    const e: FieldErrors = {};

    if (!values.supplier_id) e.supplier_id = t("fieldRequired");
    if (!values.code) e.code = t("fieldRequired");
    if (!values.invoice_date) e.invoice_date = t("fieldRequired");
    if (!values.payment_terms) e.payment_terms = t("fieldRequired");
    if (!values.po_id) e.po_id = t("fieldRequired");

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
      if (!r?.warehouse && !r?.warehouse_id)
        e[`items.${idx}.warehouse_id`] = t("fieldRequired");
    });

    setFormErrors(e);
    goToTop(TOP_FIELD_KEYS, e);
    if (Object.keys(e).length)
      toast.error(t("Please fix the highlighted fields"));
    return Object.keys(e).length === 0;
  };

  /** ------------------------------ submit ------------------------------ */
  const buildPayload = (action: "draft" | "submit") => {
    const status = isEdit
      ? values.status
      : action === "submit"
      ? "Pending"
      : "Draft";

    return {
      supplier_id: Number(values.supplier_id || values.supplier?.id),
      code: values.code,
      invoice_date: toIsoDateTime(values.invoice_date),
      purchase_order_id: values.po_id ? Number(values.po_id) : null,
      payment_terms: values.payment_terms?.toString?.() ?? "",
      notes: values.note || null,
      status,
      items: (values.items ?? []).map((r) => {
        let productable_type = "Product";
        let productable_id: number | null = null;
        if (r?.productKey) {
          const [type, idStr] = String(r.productKey).split(":");
          productable_type = type || "Product";
          productable_id = Number(idStr || 0) || null;
        }

        return {
          productable_type,
          productable_id,
          quantity_receive: Number(r.quantity ?? 0),
          price: Number(r.unit_price ?? 0),
          tax: Number(r.tax_percent ?? 0),
          expired_date: r.expiry_date || null,
          warehouse_id: r?.warehouse?.id ? Number(r.warehouse.id) : null,
          unit_id: r.unit?.id ?? null,
        };
      }),
    };
  };

  const save = async (action: "draft" | "submit") => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        if (!canEdit) {
          toast.error(t("You don't have permission to edit purchase invoices"));
          return;
        }
        await api.put(`/admin/purchase-invoices/${id}`, buildPayload(action));
      } else {
        if (!canCreate) {
          toast.error(
            t("You don't have permission to create purchase invoices")
          );
          return;
        }
        await api.post(`/admin/purchase-invoices`, buildPayload(action));
      }

      toast.success(
        action === "submit" ? t("purchaseInvoiceSubmitted") : t("savedDraft")
      );
      router.push("/dashboard/purchase/invoices");
    } catch (err: any) {
      console.log(err);

      const fieldErrors = extractFieldErrors?.(err) ?? {};

      if (Object.keys(fieldErrors).length) {
        setFormErrors(fieldErrors);
        goToTop(TOP_FIELD_KEYS, fieldErrors);
        if (fieldErrors.quantity_receive) {
          toast.error(fieldErrors.quantity_receive);
        } else {
          toast.error(t("Please fix the highlighted fields"));
        }
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
  const onCancel = () => router.push("/dashboard/purchase/invoices");

  const disabled = useMemo(
    () => loading || (isEdit ? !canEdit : !canCreate),
    [loading, isEdit, canCreate, canEdit]
  );

  /** -------------------------------- UI -------------------------------- */
  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/purchase/invoices"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Purchase")}
      </Link>

      <div className="mt-2 flex justify-between items-center flex-wrap gap-4">
        <h1 className="ty-body-xl-2 text-primary-700">
          {t("Purchase Invoices")}
        </h1>
        <HeaderActions
          mode={mode}
          onApprove={onApprove}
          onSaveDraft={onSaveDraft}
          onCancel={onCancel}
          loading={disabled}
        />
      </div>

      <InvoicePartyAndMeta
        values={{
          supplier_id: values.supplier_id,
          code: values.code,
          invoice_date: values.invoice_date,
          po_id: values.po_id,
          payment_terms: values.payment_terms,
        }}
        termsList={termsList}
        poDisabled={!!poId || !values.supplier_id}
        onChange={(p) => {
          onChange(p);
        }}
        formErrors={formErrors as any}
      />

      <ProductsTable
        items={values.items}
        onItemsChange={(items) => onChange({ items })}
        formErrors={formErrors}
        isInvoice
        purchaseOrderId={values.po_id}
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
