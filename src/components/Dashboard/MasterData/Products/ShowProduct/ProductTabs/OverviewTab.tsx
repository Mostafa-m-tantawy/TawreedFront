"use client";

import { useTranslations, useLocale } from "next-intl";

export default function OverviewTab({
  // basics
  description,
  brand,
  category,
  sku,
  barcode,
  status,

  // prices & taxes
  price,
  purchasePrice,
  lowestSalePrice,
  profitMargin,
  taxPercent,
  tax1,
  tax2,
  discountType,
  discountValue,
  hasVariants,

  // meta
  unitName,
  unitShortCode,
  type,
  flow,
  hasVariant,
  trackInventory,
  trackExpiryDate,
  tags,
  notes,

  currencyCode = "SAR",
}: {
  // basics
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  sku?: string | null;
  barcode?: string | null;
  status?: string | null;

  // prices & taxes (numbers may arrive as strings)
  price?: number | string | null; // sale_price
  purchasePrice?: number | string | null;
  lowestSalePrice?: number | string | null;
  profitMargin?: number | string | null;
  taxPercent?: number | string | null; // legacy
  tax1?: number | string | null;
  tax2?: number | string | null;
  discountType?: "percent" | "amount" | string | null;
  discountValue?: number | string | null;

  // meta
  unitName?: string | null; // e.g., "Kilogram"
  unitShortCode?: string | null; // e.g., "KG"
  type?: string | null; // e.g., "physical"
  flow?: string | null; // e.g., "Product"
  hasVariant?: boolean | null;
  trackInventory?: boolean | null;
  trackExpiryDate?: boolean | null;
  tags?: string[] | null;
  notes?: string | null;

  hasVariants?: boolean;

  currencyCode?: string;
}) {
  const t = useTranslations("productOverview");
  const locale = useLocale();
  const dir = locale?.startsWith("ar") ? "rtl" : "ltr";

  // --- helpers ---
  const label = (k: string, fallback: string) => {
    try {
      const v = t(k);
      return v || fallback;
    } catch {
      return fallback;
    }
  };

  const toNum = (v: unknown): number | null => {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const n = Number.parseFloat(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const fmtCurrency = (n: unknown) => {
    const x = toNum(n);
    return x !== null
      ? new Intl.NumberFormat(locale || "en", {
          style: "currency",
          currency: currencyCode,
          currencyDisplay: locale.startsWith("ar") ? "name" : "code",
        }).format(x)
      : "—";
  };

  const fmtPercent = (n: unknown) => {
    const x = toNum(n);
    return x !== null ? `${x}%` : "—";
  };

  const fmtDiscount = (type: unknown, value: unknown) => {
    if (!type) return "—";
    const t = String(type).toLowerCase();
    if (value === null || value === undefined || value === "") return "—";
    if (t === "percent") return `${toNum(value) ?? value}%`;
    if (t === "amount") return fmtCurrency(value);
    return "—";
  };

  const yesNo = (b: unknown) =>
    b === true ? label("yes", "Yes") : b === false ? label("no", "No") : "—";

  const statusBadge =
    status === "active"
      ? "rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700"
      : "rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700";

  // prefer tax1/tax2 if present; fall back to legacy taxPercent
  const tax1Display = tax1 ?? taxPercent;
  const tax2Display = tax2;

  return (
    <div dir={dir} className="rounded-2xl bg-white p-6">
      <h2 className="mb-6 ty-body-lg-2 text-primary-700">
        {label("overview.title", "Overview")}
      </h2>

      {/* Description */}
      <div className="mb-6">
        <div className="ty-body-xs text-[#6B7280]">
          {label("overview.description", "Description")}
        </div>
        <p className="mt-1 ty-body-sm text-[#111827]">
          {description?.trim() ? description : "—"}
        </p>
      </div>

      {/* Top meta (SKU, Barcode, Status) */}
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">SKU</div>
          <div className="mt-1 text-[#111827]">{sku ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">{label("barcode", "Barcode")}</div>
          <div className="mt-1 text-[#111827]">{barcode ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">{label("status", "Status")}</div>
          <div className="mt-1">
            <span className={statusBadge}>
              {status === "active"
                ? label("active", "Active")
                : label("inactive", "Inactive")}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      {!hasVariants && (
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">
              {label("overview.price", "Sale Price")}
            </div>
            <div className="mt-1 text-[#111827]">{fmtCurrency(price)}</div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">
              {label("purchasePrice", "Purchase Price")}
            </div>
            <div className="mt-1 text-[#111827]">
              {fmtCurrency(purchasePrice)}
            </div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">
              {label("lowestSalePrice", "Lowest Sale Price")}
            </div>
            <div className="mt-1 text-[#111827]">
              {fmtCurrency(lowestSalePrice)}
            </div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">
              {label("profitMargin", "Profit Margin")}
            </div>
            <div className="mt-1 text-[#111827]">
              {fmtPercent(profitMargin)}
            </div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">{label("tax1", "Tax 1")}</div>
            <div className="mt-1 text-[#111827]">{fmtPercent(tax1Display)}</div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
            <div className="text-[#6B7280]">{label("tax2", "Tax 2")}</div>
            <div className="mt-1 text-[#111827]">{fmtPercent(tax2Display)}</div>
          </div>
          <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3 md:col-span-3">
            <div className="text-[#6B7280]">
              {label("discount", "Discount")}
            </div>
            <div className="mt-1 text-[#111827]">
              {fmtDiscount(discountType, discountValue)}
            </div>
          </div>
        </div>
      )}

      {/* Classification */}
      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">
            {label("overview.category", "Category")}
          </div>
          <div className="mt-1 text-[#111827]">{category ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">
            {label("overview.brand", "Brand")}
          </div>
          <div className="mt-1 text-[#111827]}">{brand ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">{label("unit", "Unit")}</div>
          <div className="mt-1 text-[#111827]">
            {unitName
              ? `${unitName}${unitShortCode ? ` (${unitShortCode})` : ""}`
              : "—"}
          </div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">{label("type", "Type")}</div>
          <div className="mt-1 text-[#111827] capitalize">{type ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">{label("flow", "Flow")}</div>
          <div className="mt-1 text-[#111827]">{flow ?? "—"}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">
            {label("hasVariants", "Has Variants")}
          </div>
          <div className="mt-1 text-[#111827]">{yesNo(hasVariant)}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">
            {label("trackInventory", "Track Inventory")}
          </div>
          <div className="mt-1 text-[#111827]">{yesNo(trackInventory)}</div>
        </div>
        <div className="rounded-md ty-body-md bg-[#F8FAFC] px-4 py-3">
          <div className="text-[#6B7280]">
            {label("trackExpiry", "Track Expiry Date")}
          </div>
          <div className="mt-1 text-[#111827]">{yesNo(trackExpiryDate)}</div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <div className="ty-body-xs text-[#6B7280]">{label("tags", "Tags")}</div>
        <div className="mt-1 ty-body-sm text-[#111827]">
          {Array.isArray(tags) && tags.length ? tags.join(", ") : "—"}
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <div className="ty-body-xs text-[#6B7280]">
          {label("notes", "Internal Notes")}
        </div>
        <p className="mt-1 ty-body-sm text-[#111827]">
          {notes?.trim() ? notes : "—"}
        </p>
      </div>
    </div>
  );
}
