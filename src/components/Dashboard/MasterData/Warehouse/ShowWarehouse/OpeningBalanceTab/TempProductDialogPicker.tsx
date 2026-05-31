"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import api from "@/lib/api.client";
import { toast } from "sonner";

import { SearchNormal } from "iconsax-reactjs";
import VariantSelector from "../../../Products/ShowProduct/ProductTabs/GroupedProducts/VariantSelector";
import { ProductGrid } from "../../../Products/ShowProduct/ProductTabs/GroupedProducts/ProductGrid";

type PickableProduct = {
  id: number;
  name: string;
  sku?: string | null;
  image?: string | null;
  sale_price?: number | null;
  has_variant?: boolean;
  variants?: Array<{
    id: number;
    name: string;
    sku?: string | null;
    sale_price?: number | null;
    attributeValues?: { name: string; value: string }[];
  }>;
  variant_attributes?: Array<{ name: string; values: string[] }>;
};

export default function ProductPickerDialog({
  warehouseId,
  trigger,
  onPick,
}: {
  warehouseId: number;
  trigger: React.ReactNode;
  onPick: (picked: { key: string; label: string }) => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [catalog, setCatalog] = React.useState<PickableProduct[]>([]);
  const [selected, setSelected] = React.useState<PickableProduct | null>(null);
  const [groupType, setGroupType] = React.useState<
    "Product" | "ProductVariant"
  >("Product");
  const [selectedVariantId, setSelectedVariantId] = React.useState<
    number | null
  >(null);

  const [search, setSearch] = React.useState("");

  const nf = (n?: number | null) =>
    typeof n === "number"
      ? new Intl.NumberFormat(locale || "en", {
          style: "currency",
          currency: "SAR",
        }).format(n)
      : "—";

  // Used create endpoint
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/warehouse/${warehouseId}/opening-transactions/create`
      );
      const products: any[] = res?.data?.products ?? [];

      const normalized: PickableProduct[] = products.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name ?? ""),
        sku: p.sku ?? null,
        image: p.image ?? null,
        sale_price:
          p.sale_price === null || p.sale_price === undefined
            ? null
            : Number(p.sale_price),
        has_variant: Boolean(p.has_variant),
        variants: (p.variants ?? p.product_variants ?? []).map((v: any) => ({
          id: Number(v.id),
          name: String(v.name ?? ""),
          sku: v.sku ?? null,
          sale_price:
            v.sale_price === null || v.sale_price === undefined
              ? null
              : Number(v.sale_price),
          attributes: v.attributes ?? v.variant_attributes ?? undefined,
        })),
        variant_attributes: (p.variant_attributes ?? []).map((a: any) => ({
          name: String(a.name),
          values: (a.values ?? []).map((x: any) => String(x)),
        })),
      }));

      setCatalog(normalized);
      if (normalized.length) {
        setSelected(normalized[0]);
        const firstType =
          normalized[0].has_variant && normalized[0].variants?.length
            ? "ProductVariant"
            : "Product";
        setGroupType(firstType);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [warehouseId, t, locale]);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) =>
      [p.name, p.sku].some((s) => (s || "").toLowerCase().includes(q))
    );
  }, [catalog, search]);

  const onSelect = (p: PickableProduct) => {
    setSelected(p);
    setSelectedVariantId(null);
    const type =
      p.has_variant && p.variants?.length ? "ProductVariant" : "Product";
    setGroupType(type);
  };

  const confirm = () => {
    if (!selected) return;

    if (groupType === "ProductVariant") {
      if (!selectedVariantId) {
        toast.error(
          t("validation.selectVariant", { default: "Select a variant first" })
        );
        return;
      }
      const variant =
        selected.variants?.find((v) => v.id === selectedVariantId) || null;
      onPick({
        key: `ProductVariant:${selectedVariantId}`,
        label: `${selected.name} — ${
          variant?.sku ?? variant?.name ?? `#${selectedVariantId}`
        }`,
      });
    } else {
      onPick({
        key: `Product:${selected.id}`,
        label: `${selected.name}${selected.sku ? ` • ${selected.sku}` : ""}`,
      });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="!max-w-[80vw] w-[80vw] gap-0 p-0 overflow-auto">
        <DialogHeader className="p-4 border-b border-neutral-white-300">
          <DialogTitle>
            <span className="ty-body-lg">{t("grouped.selectProduct")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="mb-3 grid grid-cols-[1fr] gap-2">
            <div className="relative">
              <Input
                placeholder={t("grouped.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={
                  <SearchNormal size={16} className="text-secondary-400" />
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="max-h-[60vh] overflow-auto">
              <ProductGrid
                products={filtered}
                selectedId={selected?.id ?? null}
                onSelect={onSelect}
                getPrice={nf}
              />
            </div>

            <div className="flex flex-col gap-4 min-h-[200px]">
              {!selected ? (
                <p className="text-slate-500 m-auto">
                  {loading ? t("loading") : t("grouped.selectAnItem")}
                </p>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap">
                    {selected.image && (
                      <img
                        src={selected.image}
                        className="w-20 h-20 rounded-md object-cover"
                        alt={selected.name}
                      />
                    )}
                    <div className="text-start">
                      <div className="truncate ty-body-md text-neutral-black-800">
                        {selected.name}
                      </div>
                      <div className="mt-1 ty-body-sm text-[#6B7280]">
                        SKU: {selected.sku || "—"}
                      </div>
                      <div className="mt-2 ty-body-md text-primary-600">
                        {nf(selected.sale_price)}
                      </div>
                    </div>
                  </div>

                  {groupType === "ProductVariant" && selected.has_variant && (
                    <VariantSelector
                      product={selected}
                      selectedVariantId={selectedVariantId}
                      onChange={setSelectedVariantId}
                    />
                  )}

                  <div className="mt-auto flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={confirm} disabled={loading}>
                      {t("grouped.confirmSelection")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
