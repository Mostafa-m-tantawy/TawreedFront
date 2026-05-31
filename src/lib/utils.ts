import { PickableProduct } from "@/components/Dashboard/Common/ProductPickerDialog";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract server form fields errors
export const extractFieldErrors = (err: any): Record<string, string> => {
  const data = err?.response?.data ?? err?.data ?? {};
  const errs = data?.errors ?? {};
  const out: Record<string, string> = {};

  Object.entries(errs).forEach(([key, val]) => {
    if (Array.isArray(val)) out[key] = String(val[0]);
    else if (typeof val === "string") out[key] = val;
  });

  return out;
};

export const goToTop = (topKeys: string[], errors: Record<string, string>) => {
  let isGoTop = false;

  Object.keys(errors).forEach((k) => {
    if (topKeys.includes(k)) {
      isGoTop = true;
    }
  });

  if (isGoTop) {
    const dashboardContainer = document.getElementById("dashboardContainer");

    dashboardContainer?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

// Product Mappers
export const mapRawToPickable = (p: any): PickableProduct => ({
  id: Number(p.id),
  name: String(p.name ?? ""),
  sku: p.sku ?? null,
  image: p.image ?? null,
  sale_price: p.sale_price == null ? null : Number(p.sale_price),
  has_variant: Boolean(p.has_variant),
  unit: p.unit,
  units: p?.units || [],
  variants: (p.product_variants ?? p.variants ?? []).map((v: any) => ({
    id: Number(v.id),
    name: String(v.name ?? ""),
    sku: v.sku ?? null,
    sale_price: v.sale_price == null ? null : Number(v.sale_price),
    attributeValues: v?.attributeValues ?? [],
    unit: v?.unit ?? p.unit,
    allowed_quantity: v?.allowed_quantity ?? v?.warehouse_quantity,
  })),
  allowed_quantity: p?.allowed_quantity ?? p?.warehouse_quantity,
  flow: p?.flow,
});
