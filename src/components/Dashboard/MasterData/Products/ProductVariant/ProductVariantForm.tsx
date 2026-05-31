"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api.client";
import { cn, extractFieldErrors, goToTop } from "@/lib/utils";
import { useVariantPrefill } from "./hooks";
import { VariantFormState, Status, DiscountType } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const topFieldsKeys = ["name", "sku", "barcode"];

export default function ProductVariantForm({
  mode,
  productId,
  variantId,
  baseProductName = "",
  baseSkuPrefix = "",
  backHref,
}: {
  mode: "create" | "edit";
  productId: number;
  variantId?: number;
  baseProductName?: string;
  baseSkuPrefix?: string;
  backHref: string;
}) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";
  const { loading, prefill } = useVariantPrefill(mode, productId, variantId);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [variantAttrs, setVariantAttrs] = useState<Record<number, string>>({});

  const [form, setForm] = useState<VariantFormState>({
    name: "",
    sku: "",
    barcode: "",
    purchase_price: "",
    sale_price: "",
    profit_margin: "",
    tax_1: "",
    tax_2: "",
    lowest_sale_price: "",
    discount_type: "",
    discount_value: "",
    status: "active",
    notes: "",
  });

  // initialize from prefill
  useMemo(() => {
    if (isEdit && prefill.edit) {
      const v = prefill.edit;
      setForm({
        name: v?.name || "",
        sku: v?.sku || "",
        barcode: v?.barcode || "",
        purchase_price: toStr(v?.purchase_price),
        sale_price: toStr(v?.sale_price),
        profit_margin: toStr(v?.profit_margin),
        tax_1: toStr(v?.tax_1),
        tax_2: toStr(v?.tax_2),
        lowest_sale_price: toStr(v?.lowest_sale_price),
        discount_type: (v?.discount_type as DiscountType) || "",
        discount_value: toStr(v?.discount_value),
        status: (v?.status as Status) || "active",
        notes: v?.notes || "",
      });
    } else if (!isEdit) {
      setForm((p) => ({
        ...p,
        name: baseProductName,
        sku:
          prefill.baseSku ||
          `${baseSkuPrefix ? baseSkuPrefix + "-" : ""}${simpleCode(
            baseProductName
          )}`,
      }));
    }
  }, [prefill]);

  useEffect(() => {
    if (!prefill.productAttributes?.length) return;

    const next: Record<number, string> = { ...variantAttrs };

    if (isEdit && prefill.edit?.attributeValues?.length) {
      prefill.productAttributes.forEach((attr: any) => {
        const found = prefill.edit.attributeValues.find(
          (av: any) => av?.name === attr?.name
        );
        if (found?.value != null) next[attr.id] = String(found.value);
      });
    } else {
      prefill.productAttributes.forEach((attr: any) => {
        if (
          Array.isArray(attr?.values) &&
          attr.values.length > 0 &&
          next[attr.id] == null
        ) {
          next[attr.id] = String(attr.values[0]);
        }
      });
    }

    setVariantAttrs(next);
  }, [prefill.productAttributes, isEdit, prefill.edit]);

  const setField = (k: keyof VariantFormState, v: any) => {
    setForm((p) => ({ ...p, [k]: v }));
    clearError(k);
  };

  const clearError = (k: string) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[k];
      return n;
    });

  const onNum = (k: keyof VariantFormState, raw: string) => {
    const v = raw.replace(",", ".");
    if (v === "" || /^-?\d*\.?\d*$/.test(v)) {
      setField(k, v);
      if (errors[k]) clearError(k);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("fieldRequired");
    if (!form.sku.trim()) e.sku = t("fieldRequired");

    // OPTIONAL: require all attributes to be chosen
    prefill.productAttributes?.forEach((a: any) => {
      if (!variantAttrs[a.id]) e[`attr_${a.id}`] = t("fieldRequired");
    });

    (
      [
        "purchase_price",
        "sale_price",
        "profit_margin",
        "tax_1",
        "tax_2",
        "lowest_sale_price",
        "discount_value",
      ] as const
    ).forEach((k) => {
      const v = form[k];
      if (v !== "" && Number.isNaN(Number(v))) e[k] = t("enterValidNumber");
      if (v !== "" && Number(v) < 0) e[k] = t("mustBeNonNegative");
    });
    if (
      form.discount_type &&
      !["percent", "amount"].includes(form.discount_type)
    )
      e.discount_type = t("invalidValue");
    if (form.status !== "active" && form.status !== "inactive")
      e.status = t("fieldRequired");
    setErrors(e);

    goToTop(topFieldsKeys, e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;

    // ✨ NEW: build API-ready "variant_attributes" object with string keys
    const variant_attributes: Record<string, string> = {};
    Object.entries(variantAttrs).forEach(([id, value]) => {
      if (value !== undefined && value !== null && value !== "")
        variant_attributes[String(id)] = String(value);
    });

    const payload: Record<string, unknown> = {
      product_id: productId,
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode?.trim() || null,
      purchase_price: n(form.purchase_price),
      sale_price: n(form.sale_price),
      profit_margin: n(form.profit_margin),
      tax_1: n(form.tax_1),
      tax_2: n(form.tax_2),
      lowest_sale_price: n(form.lowest_sale_price),
      discount_type: form.discount_type !== "none" ? form.discount_type : null,
      discount_value: n(form.discount_value),
      status: form.status,
      notes: form.notes?.trim() || null,
      // 👇 include attributes
      variant_attributes,
    };

    setSubmitting(true);
    try {
      if (isEdit && variantId) {
        await api.put(`/admin/product-variants/${variantId}`, payload);
        toast.success(t("variantUpdated"));
      } else {
        await api.post(`/admin/product-variants`, payload);
        toast.success(t("variantCreated"));
      }

      router.push(`/dashboard/products/${productId}?tab=variants`);
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      goToTop(topFieldsKeys, fieldErrors);

      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateFailed") : t("createFailed"))
        );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (form.discount_type == "none") {
      onNum("discount_value", "0");
    }
  }, [form.discount_type]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        <Link href={backHref} className="ty-body-sm text-primary-700 w-fit">
          ← {t("Back to {cap}", { cap: t("Variants") })}
        </Link>
        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit ? t("Edit Variant") : t("Add New Variant")}
        </h1>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6"
        aria-busy={submitting || loading}
      >
        {/* Attributes */}
        <div className="rounded-2xl bg-white p-6 space-y-4">
          <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
            {t("Attributes")}
          </p>

          {loading ? (
            <div className="py-4 text-muted-foreground">{t("loading")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prefill.productAttributes?.map((attr: any) => (
                <div key={attr.id}>
                  <Label>{attr.name}</Label>
                  <Select
                    value={variantAttrs[attr.id] ?? ""}
                    onValueChange={(v) =>
                      setVariantAttrs((p) => ({ ...p, [attr.id]: v }))
                    }
                    disabled={submitting || loading}
                  >
                    <SelectTrigger
                      className={cn(
                        "mt-4",
                        errors[`attr_${attr.id}`] && "border-destructive"
                      )}
                    >
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(attr.values ?? []).map((v: string) => (
                        <SelectItem key={v} value={String(v)}>
                          {String(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`attr_${attr.id}`] && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors[`attr_${attr.id}`]}
                    </p>
                  )}
                </div>
              ))}
              {errors.variant_attributes && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.variant_attributes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Basic */}
        <div className="rounded-2xl bg-white p-6 space-y-4">
          <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
            {t("Basic Information")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t("Variant Name")}
              placeholder={t("Variant Name")}
              value={form.name}
              onChange={(e) => {
                setField("name", e.target.value);
              }}
              disabled={submitting || loading}
              error={errors.name}
            />
            <Input
              label={t("SKU / Barcode")}
              placeholder={t("SKU / Barcode")}
              value={form.sku}
              onChange={(e) => {
                setField("sku", e.target.value);
              }}
              disabled={submitting || loading}
              error={errors.sku}
            />
          </div>
          <Input
            label={t("barcode")}
            placeholder={t("barcode")}
            value={form.barcode}
            onChange={(e) => setField("barcode", e.target.value)}
            disabled={submitting || loading}
            error={errors.barcode}
          />
        </div>

        {/* Pricing (exactly endpoint fields) */}
        <div className="rounded-2xl bg-white p-6 space-y-4">
          <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
            {t("Pricing")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t("Purchase Price")}
              placeholder={t("Purchase Price")}
              value={form.purchase_price}
              onChange={(e) => onNum("purchase_price", e.target.value)}
              disabled={submitting || loading}
              error={errors.purchase_price}
            />
            <Input
              label={t("Sale Price")}
              placeholder={t("Sale Price")}
              value={form.sale_price}
              onChange={(e) => onNum("sale_price", e.target.value)}
              disabled={submitting || loading}
              error={errors.sale_price}
            />
            <Input
              label={t("Lowest Sale Price")}
              placeholder={t("Lowest Sale Price")}
              value={form.lowest_sale_price}
              onChange={(e) => onNum("lowest_sale_price", e.target.value)}
              disabled={submitting || loading}
              error={errors.lowest_sale_price}
            />
            <Input
              label={t("Profit Margin")}
              placeholder={t("Profit Margin")}
              value={form.profit_margin}
              onChange={(e) => onNum("profit_margin", e.target.value)}
              disabled={submitting || loading}
              error={errors.profit_margin}
            />
            <Input
              label={t("Tax 1")}
              placeholder={t("Tax 1")}
              value={form.tax_1}
              onChange={(e) => onNum("tax_1", e.target.value)}
              disabled={submitting || loading}
              error={errors.tax_1}
            />
            <Input
              label={t("Tax 2")}
              placeholder={t("Tax 2")}
              value={form.tax_2}
              onChange={(e) => onNum("tax_2", e.target.value)}
              disabled={submitting || loading}
              error={errors.tax_2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t("Discount Type")}</Label>
              <Select
                value={form.discount_type}
                onValueChange={(v) =>
                  setField("discount_type", v as DiscountType)
                }
                disabled={submitting || loading}
              >
                <SelectTrigger
                  className={cn(
                    "mt-4",
                    errors.discount_type && "border-destructive"
                  )}
                >
                  <SelectValue placeholder={t("Select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("None")}</SelectItem>
                  <SelectItem value="percent">{t("Percent")}</SelectItem>
                  <SelectItem value="amount">{t("Amount")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.discount_type && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.discount_type}
                </p>
              )}
            </div>
            <Input
              label={t("Discount Value")}
              placeholder={t("Discount Value")}
              value={form.discount_value}
              onChange={(e) => onNum("discount_value", e.target.value)}
              disabled={
                form.discount_type === "none" ||
                !form.discount_type ||
                submitting ||
                loading
              }
              error={errors.discount_value}
            />
          </div>
        </div>

        {/* Status + Notes */}
        <div className="rounded-2xl bg-white p-6 space-y-4">
          <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
            {t("Additional Details")}
          </p>
          <div>
            <Label>{t("Status")}</Label>
            <div className="mt-4 flex items-center gap-6">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={form.status === "active"}
                  onChange={() => setField("status", "active")}
                  disabled={submitting || loading}
                />
                <span>{t("Active")}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={form.status === "inactive"}
                  onChange={() => setField("status", "inactive")}
                  disabled={submitting || loading}
                />
                <span>{t("in-active")}</span>
              </label>
            </div>
            {errors.status && (
              <p className="mt-1 text-sm text-destructive">{errors.status}</p>
            )}
          </div>

          <div>
            <Label>{t("Internal Notes")}</Label>
            <Textarea
              placeholder={t("Notes visible only to staff")}
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              disabled={submitting || loading}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" size="lg" disabled={submitting || loading}>
            {submitting && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            )}
            {isEdit ? t("Save Changes") : t("Create Variant")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function n(s: string) {
  return s === "" ? null : Number(s);
}
function toStr(v?: number | string | null) {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && isFinite(n) ? String(n) : "";
}
function simpleCode(s: string) {
  return (s || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x.replace(/[^A-Za-z0-9]/g, "").toUpperCase())
    .join("-");
}
