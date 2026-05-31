"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProtectedElement from "@/components/ui/protected-element";

import api from "@/lib/api.client";
import { extractFieldErrors, goToTop } from "@/lib/utils";

import BasicInfo from "./sections/BasicInfo";
import Pricing from "./sections/Pricing";
import Inventory from "./sections/Inventory";
import Expiry from "./sections/Expiry";
import AdditionalOptions from "./sections/AdditionalOptions";
import VariantsToggle from "./sections/VariantsToggle";

import {
  Props,
  FormValues,
  ProductAPI,
  ProductFlow,
  DiscountType,
  Status,
  Category,
} from "./types";
import UnitSection from "./sections/UnitSection";
import VariantAttributesSection from "./sections/VariantAttributesSection";
import { useAuthStore } from "@/store/authStore";
import { PageResult } from "@/types/common";

/* ---------------------- helpers: UI <-> API mapping ---------------------- */

const FLOW_UI_TO_API: Record<string, string> = {
  product: "Product",
  finished_good: "Finished Goods",
  raw_material: "Raw Material",
};

const FLOW_API_TO_UI: Record<string, ProductFlow> = {
  Product: "product",
  "Finished Goods": "finished_good",
  "Raw Material": "raw_material",
};

function strOrEmpty(n?: number | null) {
  const num = Number(n);
  return typeof num === "number" && isFinite(num) ? String(num) : "";
}

function parseNumberLike(s: string): number | null {
  if (s === "" || s == null) return null;
  const v = Number(String(s).replace(",", "."));
  return Number.isFinite(v) ? v : null;
}

function toTagsArray(s: string): string[] | null {
  const arr = s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  return arr.length ? arr : null;
}

const topFieldsKeys = [
  "name",
  "sku",
  "brand_name",
  "category_id",
  "purchase_price",
  "sale_price",
];

/* --------------------------- main form component ------------------------- */

export default function ProductForm({ mode, productId, kind }: Props) {
  const t = useTranslations("");
  const locale = useLocale();
  const router = useRouter();
  const isEdit = mode === "edit";

  const labelMap: Record<string, { add: string; edit: string }> = {
    service: {
      add: t("Add Service Product"),
      edit: t("Edit Service Product"),
    },
    physical: {
      add: t("Add Product"),
      edit: t("Edit Product"),
    },
    "grouped-product": {
      add: t("Add Grouped Product"),
      edit: t("Edit Grouped Product"),
    },
  };

  const label = isEdit ? labelMap[kind]?.edit : labelMap[kind]?.add;

  // meta
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [statuses, setStatuses] = useState<Status[]>(["active", "inactive"]);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([
    "none",
    "amount",
    "percent",
  ]);
  const [productFlows, setProductFlows] = useState<ProductFlow[]>([
    "product",
    "raw_material",
    "finished_good",
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  const [attributes, setAttributes] = useState<{ id: number; name: string }[]>(
    []
  );

  const { hasPermission } = useAuthStore();

  // form
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    sku: "",
    description: "",
    category_id: "",
    brand_name: "",
    image: null,

    purchase_price: "",
    sale_price: "",
    profit_margin: "",

    tax_1: "",
    tax_2: "",
    lowest_sale_price: "",

    discount_type: "none",
    discount_value: "",

    product_flow: "product",
    has_variants: false,
    track_inventory: false,
    track_expiry: false,
    expiry_date: "",

    barcode: "",
    tags: "",
    status: "active",
    notes: "",
  });
  const [imageToEdit, setImageToEdit] = useState<any[]>([]);
  const [unitId, setUnitId] = useState<number | "">("");
  const [variantAttributeIds, setVariantAttributeIds] = useState<number[]>([]); // authoritative for API

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* -------------------------- derived: auto margin -------------------------- */

  async function fetchAllPages<T>(
    url: string,
    locale: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const perPage = params.per_page ?? 100;
    let page = 1;
    let lastPage = 1;
    const out: T[] = [];

    do {
      const res = await api.get(url, {
        params: { ...params, page, per_page: perPage },
      });
      const data: T[] = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};
      out.push(...data);
      lastPage = meta?.last_page ?? page;
      page += 1;
    } while (page <= lastPage);

    return out;
  }

  // Cacl Profit Margin automatically

  // useEffect(() => {
  //   const purchase = parseFloat(formValues.purchase_price);
  //   const sale = parseFloat(formValues.sale_price);
  //   if (isFinite(purchase) && isFinite(sale) && purchase > 0) {
  //     const m = ((sale - purchase) / purchase) * 100;
  //     setFormValues((p) => ({
  //       ...p,
  //       profit_margin: Number.isFinite(m) ? m.toFixed(2) : "",
  //     }));
  //   } else {
  //     setFormValues((p) => ({ ...p, profit_margin: "" }));
  //   }
  // }, [formValues.purchase_price, formValues.sale_price]);

  useEffect(() => {
    // console.log();
    if (formValues.product_flow)
      loadCategoriesByType(FLOW_UI_TO_API[formValues.product_flow]);
  }, [formValues.product_flow]);

  /* ------------------------------- meta loaders ------------------------------ */

  // load base meta by type
  const loadCreateMeta = async () => {
    setLoadingMeta(true);
    try {
      const res = await api.get(`/admin/products/create/${kind}`);

      const flows: string[] = res?.data?.flows ?? [];
      const types: string[] = res?.data?.types ?? [];
      const stats: string[] = res?.data?.status ?? [];
      const sku: string = res?.data?.sku ?? "";

      if (stats?.length) {
        const ss = stats.filter((s) => s === "active" || s === "inactive");
        if (ss.length) setStatuses(ss as Status[]);
      }
      if (flows?.length && isPhysicalOrGroupedProduct) {
        setProductFlows(
          flows
            .map((f) => FLOW_API_TO_UI[f] as ProductFlow)
            .filter(Boolean) as ProductFlow[]
        );

        // await loadCategoriesByType(FLOW_API_TO_UI[flows[0]]);
      }

      if (sku) {
        setFormValues((prev) => ({
          ...prev,
          sku,
        }));
      }
      await Promise.all([loadUnits(), loadAttributes()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadCategoriesByType = async (type: string) => {
    try {
      const res = await api.get(`/admin/products/categories/${type}`);

      const cats: Category[] = res?.data?.data ?? [];
      setCategories(cats);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    }
  };

  const loadUnits = async () => {
    try {
      const rows = await fetchAllPages<any>("/admin/units", locale, {
        status: "active",
      });

      setUnits(rows);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("fetchFailed"));
    }
  };

  const loadAttributes = async () => {
    const rows = await fetchAllPages<any>("/admin/product-attributes", locale, {
      status: "active",
    });

    setAttributes(
      rows.map((a) => ({
        id: a.id,
        name: a.name,
      }))
    );
  };

  // edit hydrate
  const loadEditData = async (id: number) => {
    setLoadingMeta(true);
    try {
      const res = await api.get(`/admin/products/${id}/edit`);

      // meta from edit
      if (Array.isArray(res?.data?.status)) {
        const ss = res.data.status.filter(
          (s: string) => s === "active" || s === "inactive"
        );
        if (ss.length) setStatuses(ss as Status[]);
      }
      if (Array.isArray(res?.data?.flows) && isPhysicalOrGroupedProduct) {
        setProductFlows(
          res.data.flows
            .map((f: string) => FLOW_API_TO_UI[f])
            .filter(Boolean) as ProductFlow[]
        );
      }
      // await loadCategoriesByType(kind);
      await Promise.all([loadUnits(), loadAttributes()]);

      const p: ProductAPI | undefined = res?.data?.product;
      if (p) hydrateFromAPI(p);
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (isEdit && productId) loadEditData(productId);
    else loadCreateMeta();
  }, [isEdit, productId, kind, locale]);

  /* ------------------------------- API -> UI -------------------------------- */

  function hydrateFromAPI(p: ProductAPI) {
    setFormValues((prev) => ({
      ...prev,
      name: p.name ?? "",
      sku: p.sku ?? "",
      description: p.description ?? "",
      category_id: p?.category?.id ?? (p as any)?.["product_category_id"] ?? "",
      brand_name: (p as any).brand_name ?? p.brand_name ?? "",
      image: null,
      barcode: p.barcode ?? "",

      purchase_price: strOrEmpty(p.purchase_price),
      sale_price: strOrEmpty(p.sale_price),
      profit_margin: strOrEmpty((p as any).profit_margin ?? p.profit_margin),

      tax_1: strOrEmpty((p as any).tax_1 ?? p.tax_1),
      tax_2: strOrEmpty((p as any).tax_2 ?? p.tax_2),
      lowest_sale_price: strOrEmpty(p.lowest_sale_price),

      discount_type: ((p as any).discount_type ?? "none") as DiscountType,
      discount_value: strOrEmpty((p as any).discount_value),

      product_flow: FLOW_API_TO_UI[(p as any).flow ?? "Product"] ?? "product",
      has_variants: !!(p as any).has_variant || !!p.has_variants,
      track_inventory: !!(p as any).track_inventory || !!p.track_inventory,
      track_expiry: !!(p as any).track_expiry_date || !!p.track_expiry,
      expiry_date: p.expiry_date ?? "",

      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      status: p.status ?? "active",
      notes: p.notes ?? "",
    }));

    if (p.image) {
      setImageToEdit([
        {
          id: 1,
          url: p.image,
          name: "",
          mime: "image/*",
        },
      ]);
    }

    // unit id
    const uId =
      (p as any).unit_id ??
      (p as any).unit?.id ??
      (p as any).unit?.data?.id ??
      "";
    setUnitId(uId || "");

    // variant attribute IDs
    const vIds =
      (p as any).product_variant_attributes ??
      (p as any).variant_attributes?.map((a: any) => a.id) ??
      [];
    setVariantAttributeIds(Array.isArray(vIds) ? vIds : []);
  }

  /* --------------------------------- UI ops -------------------------------- */

  const onChangeText = (k: keyof FormValues, v: string) => {
    setFormValues((p) => ({ ...p, [k]: v }));
    if (formErrors[k as string]) clearFieldError(k as string);
  };

  const onChangeSelect = (k: keyof FormValues, v: string) => {
    setFormValues((p) => ({ ...p, [k]: v as any }));
    if (formErrors[k as string]) clearFieldError(k as string);
  };

  const onNum = (k: keyof FormValues, v: string) => {
    const vv = v.replace(",", ".");
    if (vv === "" || /^-?\d*\.?\d*$/.test(vv)) {
      setFormValues((p) => ({ ...p, [k]: vv }));
      if (formErrors[k as string]) clearFieldError(k as string);
    }
  };

  const onToggle = (k: keyof FormValues, v: boolean) => {
    setFormValues((p) => ({ ...p, [k]: v as any }));
    if (formErrors[k as string]) clearFieldError(k as string);
  };

  const onFile = (f: File | null) => setFormValues((p) => ({ ...p, image: f }));

  const onSelectCategory = (id: number | "") => {
    setFormValues((p) => ({ ...p, category_id: id }));
    if (formErrors.category_id) clearFieldError("category_id");
  };

  const clearFieldError = (k: string) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  /* -------------------------------- validate -------------------------------- */

  const isPhysicalOrGroupedProduct = useMemo(() => {
    return ["physical", "grouped-product"].includes(kind);
  }, [kind]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formValues.name.trim()) e.name = t("fieldRequired");
    if (!formValues.sku.trim()) e.sku = t("fieldRequired");
    if (!["active", "inactive"].includes(formValues.status))
      e.status = t("fieldRequired");

    if (isPhysicalOrGroupedProduct) {
      if (!formValues.product_flow) e.product_flow = t("fieldRequired");
      if (formValues.category_id === "") e.category_id = t("fieldRequired");
      if (unitId === "") e.unit_id = t("fieldRequired");
    }

    if (formValues.discount_type !== "none" && !formValues.discount_value) {
      e.discount_value = t("fieldRequired");
    }

    setFormErrors(e);
    goToTop(topFieldsKeys, e);
    return Object.keys(e).length === 0;
  };

  /* --------------------------------- submit --------------------------------- */

  const onSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const isPhysical = kind === "physical";

      const fd = new FormData();
      // required
      const kindToSend = kind === "grouped-product" ? "grouped products" : kind;
      fd.append("type", kindToSend);
      fd.append("name", formValues.name.trim());
      fd.append("sku", formValues.sku.trim());
      fd.append("brand_name", formValues.brand_name.trim());

      // optional/basic
      if (formValues.description)
        fd.append("description", formValues.description.trim());

      if (formValues.barcode) fd.append("barcode", formValues.barcode.trim());

      // pricing/taxes
      const purchase = parseNumberLike(formValues.purchase_price);
      const sale = parseNumberLike(formValues.sale_price);
      const margin = parseNumberLike(formValues.profit_margin);
      const tax1 = parseNumberLike(formValues.tax_1);
      const tax2 = parseNumberLike(formValues.tax_2);
      const lsp = parseNumberLike(formValues.lowest_sale_price);

      if (purchase != null) fd.append("purchase_price", String(purchase));
      if (sale != null) fd.append("sale_price", String(sale));
      if (margin != null) fd.append("profit_margin", String(margin));
      if (tax1 != null) fd.append("tax_1", String(tax1));
      if (tax2 != null) fd.append("tax_2", String(tax2));
      if (lsp != null) fd.append("lowest_sale_price", String(lsp));

      // discount
      if (formValues.discount_type === "none") {
        fd.append("discount_type", "");
        fd.append("discount_value", "");
      } else {
        fd.append("discount_type", formValues.discount_type);
        const dv = parseNumberLike(formValues.discount_value);
        if (dv != null) fd.append("discount_value", String(dv));
      }

      if (isPhysicalOrGroupedProduct) {
        fd.append(
          "track_inventory",
          String(Number(!!formValues.track_inventory))
        );
        fd.append(
          "track_expiry_date",
          String(Number(!!formValues.track_expiry))
        );

        fd.append("unit_id", String(unitId));

        // variants
        if (isPhysical) {
          fd.append(
            "flow",
            FLOW_UI_TO_API[formValues.product_flow] || "Product"
          );
          fd.append(
            "product_category_id",
            formValues.category_id ? String(formValues.category_id) : ""
          );

          fd.append("has_variant", String(Number(formValues.has_variants)));
          if (variantAttributeIds.length) {
            variantAttributeIds.forEach((id) =>
              fd.append("product_variant_attributes[]", String(id))
            );
          } else {
            fd.append("product_variant_attributes", "");
          }
        }
      }

      // tags
      const tags = toTagsArray(formValues.tags);
      if (tags) tags.forEach((tag) => fd.append("tags[]", tag));

      fd.append("status", formValues.status);
      if (formValues.notes) fd.append("notes", formValues.notes.trim());

      // image
      if (formValues.image) {
        if (typeof formValues.image !== "string")
          fd.append("image", formValues.image);
      }

      // permissions: create vs edit
      if (isEdit && productId) {
        fd.append("_method", "PUT");

        await api.post(`/admin/products/${productId}`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(t("productUpdated"));
      } else {
        // Create (POST)
        await api.post(`/admin/products`, fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success(t("productCreated"));
      }

      router.push("/dashboard/products");
    } catch (err: any) {
      const fieldErrors = extractFieldErrors?.(err) ?? {};
      if (Object.keys(fieldErrors).length) {
        setFormErrors(fieldErrors);
        goToTop(topFieldsKeys, fieldErrors);
      } else {
        toast.error(
          err?.response?.data?.message ||
            (isEdit ? t("updateFailed") : t("createFailed"))
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUnitsPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/units`, {
      params: {
        page,
        per_page: 20,
        status: "active",
        name: query || undefined,
      },
    });

    const items =
      (res?.data?.data ?? []).map((u: any) => ({
        id: u.id,
        name: u.name,
      })) ?? [];

    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  const fetchAttributesPage = async (
    page: number,
    query: string
  ): Promise<PageResult<{ id: number; name: string }>> => {
    const res = await api.get(`/admin/product-attributes`, {
      params: {
        page,
        per_page: 20,
        status: "active",
        search: query || undefined,
      },
    });

    const items =
      (res?.data?.data ?? []).map((a: any) => ({
        id: a.id,
        name: a.name || String(a.id),
      })) ?? [];

    const meta = res?.data?.meta ?? {};
    return {
      items,
      page: meta?.current_page ?? page,
      lastPage: meta?.last_page ?? page,
      total: meta?.total ?? items.length,
    };
  };

  const unitName = useMemo(
    () => units.find((u) => u.id === unitId)?.name ?? "",
    [units, unitId]
  );

  const attrLabels = useMemo(
    () =>
      attributes
        .filter((a) => variantAttributeIds.includes(a.id))
        .map((a) => a.name),
    [attributes, variantAttributeIds]
  );

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3">
        <Link
          href={"/dashboard/products"}
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("Back to {cap}", { cap: t("Products") })}
        </Link>

        <h1 className="ty-body-xl-2 text-primary-700">{label}</h1>
      </div>

      <form onSubmit={onSubmit} aria-busy={submitting}>
        <div className="space-y-5">
          {/* Basic Information  */}
          <ProtectedElement permissions="view-product-category">
            <BasicInfo
              kind={kind}
              values={formValues}
              imageToEdit={imageToEdit}
              setImageToEdit={setImageToEdit}
              errors={formErrors}
              disabled={submitting || loadingMeta}
              categories={categories}
              productFlows={productFlows}
              onChangeText={onChangeText}
              onChangeSelect={onChangeSelect}
              onFile={onFile}
              onSelectCategory={onSelectCategory}
              isPhysicalOrGrouped={isPhysicalOrGroupedProduct}
              isEditing={!!productId}
            />
          </ProtectedElement>

          {/* Pricing + Variants */}
          <div className="rounded-2xl bg-white p-6">
            <div className="flex justify-between gap-4 flex-wrap mb-4 mt-2 border-b border-neutral-white-300 pb-4">
              <p className="ty-body-md-2 text-[#111827]">
                {kind === "physical" && formValues.has_variants
                  ? t("Variant Attributes")
                  : t("Pricing")}
              </p>
              {kind === "physical" &&
                hasPermission("view-product-attribute") && (
                  <VariantsToggle
                    values={formValues}
                    disabled={submitting}
                    onToggle={onToggle}
                  />
                )}
            </div>

            {kind === "physical" && formValues.has_variants ? (
              <ProtectedElement permissions="view-product-attribute">
                <VariantAttributesSection
                  disabled={submitting || loadingMeta}
                  selectedIds={variantAttributeIds}
                  selectedLabels={attrLabels}
                  fetchPage={fetchAttributesPage}
                  onToggleId={(id, name) => {
                    setVariantAttributeIds((prev) =>
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id]
                    );
                    if (!attributes.find((a) => a.id === id))
                      setAttributes((prev) => [...prev, { id, name }]);
                  }}
                  onClear={() => setVariantAttributeIds([])}
                  error={formErrors.attributes}
                />
              </ProtectedElement>
            ) : (
              <Pricing
                kind={kind}
                values={formValues}
                errors={formErrors}
                disabled={submitting}
                discountTypes={discountTypes}
                onNum={onNum}
                onSelect={onChangeSelect}
                onToggle={onToggle}
              />
            )}
          </div>

          {/* Inventory / Expiry only for physical */}
          {isPhysicalOrGroupedProduct && (
            <>
              <Inventory
                values={formValues}
                disabled={submitting}
                onToggle={onToggle}
              />
              <Expiry
                values={formValues}
                errors={formErrors}
                disabled={submitting}
                onToggle={onToggle}
                onChangeText={onChangeText}
              />
            </>
          )}

          {/* Additional options (Status/Notes/Tags) */}
          <AdditionalOptions
            values={formValues}
            statuses={statuses}
            errors={formErrors}
            disabled={submitting}
            onChangeText={onChangeText}
            onSelectStatus={(s) => onChangeSelect("status", s)}
          />

          {/* Unit selector + Variant attributes (simple demo UI) */}
          <ProtectedElement permissions="view-units">
            {isPhysicalOrGroupedProduct && (
              <UnitSection
                disabled={submitting || loadingMeta}
                unitId={unitId}
                unitName={unitName}
                fetchPage={fetchUnitsPage}
                onChange={(id, name) => {
                  setUnitId(id);
                  // ensure the chosen unit appears immediately in display
                  if (!units.find((u) => u.id === id))
                    setUnits((prev) => [...prev, { id, name }]);
                  if (formErrors.unit_id) clearFieldError("unit_id");
                }}
                error={formErrors.unit_id}
              />
            )}
          </ProtectedElement>

          {/* Actions (create/edit permission gates) */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={submitting || loadingMeta}
            >
              {submitting && (
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
              )}
              {t("Save Product")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
