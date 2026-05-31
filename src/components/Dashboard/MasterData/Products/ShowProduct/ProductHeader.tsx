"use client";

import { useTranslations, useLocale } from "next-intl";
import clsx from "clsx";
import { Box, Tag, Image as ImageIcon } from "iconsax-reactjs";

export default function ProductHeader({
  title,
  sku,
  stockQty,
  inStock,
  image,
  unitsLabel,
}: {
  title?: string | null;
  sku?: string | null;
  stockQty?: number | string | null;
  inStock?: boolean | null;
  image?: string | null;
  unitsLabel?: string;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  const toNum = (v: unknown): number | null => {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const n = Number.parseFloat(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const qtyNum = toNum(stockQty);
  const qtyFmt =
    qtyNum !== null
      ? new Intl.NumberFormat(locale || "en").format(qtyNum)
      : "—";

  const name = title?.trim() || "—";
  const code = sku?.trim() || "—";
  const units = unitsLabel || t("units");

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-3xl bg-white">
      <div className={clsx("grid gap-4 md:grid-cols-[240px_1fr]")}>
        {/* image */}
        <div className="relative h-40 md:h-48 w-full overflow-hidden rounded-s-2xl">
          {image ? (
            <img
              src={image}
              alt={name}
              className="absolute inset-0 h-full w-full object-contain bg-[#F8FAFC]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC]">
              <div className="flex items-center gap-2 text-[#6B7280]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <ImageIcon size={20} />
                </span>
                <span className="ty-body-md">{initials || t("noImage")}</span>
              </div>
            </div>
          )}

          {/* <div className="absolute left-3 top-3">
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium shadow",
                inStockBool
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              )}
              aria-live="polite"
            >
              <span className="h-2 w-2 rounded-full bg-current opacity-70" />
              {inStockBool ? t("inStock") : t("outOfStock")}
            </span>
          </div> */}
        </div>

        {/* meta */}
        <div className="flex flex-col justify-center gap-3 p-4">
          <h1
            className="ty-body-xl-2 text-primary-700 line-clamp-2"
            title={name}
          >
            {name}
          </h1>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-[#F8FAFC] px-4 py-3 flex gap-2 flex-wrap">
              <div className="w-8 h-8 flex items-center justify-center bg-primary-100 rounded-full text-primary-700">
                <Tag size={16} />
              </div>
              <div>
                <div className="ty-body-xs text-[#6B7280]">
                  {t("productSku")}
                </div>
                <div className="mt-1 ty-body-sm text-black">{code}</div>
              </div>
            </div>

            <div className="rounded-md bg-[#F8FAFC] px-4 py-3 flex gap-2 flex-wrap">
              <div className="w-8 h-8 flex items-center justify-center bg-[#F5F1CC] rounded-full text-[#B29049]">
                <Box size={16} />
              </div>
              <div>
                <div className="ty-body-xs text-[#6B7280]">
                  {t("currentStock")}
                </div>
                <div className="mt-1 ty-body-sm text-black">
                  {qtyFmt} {units}
                </div>
              </div>
            </div>
          </div>

          <p className="ty-body-xs text-[#6B7280]">{t("headerSubtitle")}</p>
        </div>
      </div>
    </div>
  );
}
