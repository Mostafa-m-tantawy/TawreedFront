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
import { ProductGrid } from "../../../Products/ShowProduct/ProductTabs/GroupedProducts/ProductGrid";
import VariantSelector from "../../../Products/ShowProduct/ProductTabs/GroupedProducts/VariantSelector";

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
  unit?: { name: string };
  units?: any[];
  variant_attributes?: Array<{ name: string; values: string[] }>;
};

export default function ProductPickerDialog({
  warehouseId,
  trigger,
  onPick,
  initialKey,
  defaultOpen,
}: {
  warehouseId: number;
  trigger: React.ReactNode;
  onPick: (picked: {
    key: string;
    label: string;
    unit?: string;
    unitObject?: any;
    units?: any[];
    attributes?: any[];
  }) => void;
  initialKey?: string;
  defaultOpen?: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  const [open, setOpen] = React.useState(!!defaultOpen);
  const [loading, setLoading] = React.useState(false);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  const [catalog, setCatalog] = React.useState<PickableProduct[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);

  const [selected, setSelected] = React.useState<PickableProduct | null>(null);
  const [groupType, setGroupType] = React.useState<
    "Product" | "ProductVariant"
  >("Product");
  const [selectedVariantId, setSelectedVariantId] = React.useState<
    number | null
  >(null);

  const [search, setSearch] = React.useState("");
  const searchRef = React.useRef<string>("");

  const nf = (n?: number | null) =>
    typeof n === "number"
      ? new Intl.NumberFormat(locale || "en", {
          style: "currency",
          currency: "SAR",
        }).format(n)
      : "—";

  // ---------- mapping ----------
  const mapRawToPickable = React.useCallback(
    (p: any): PickableProduct => ({
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
        unit: p.unit,
      })),
    }),
    []
  );

  // ---------- fetch single product by id (best-effort) ----------
  const fetchProductById = React.useCallback(
    async (productId: number): Promise<PickableProduct | null> => {
      setLoadingDetails(true);
      try {
        // Try a product show endpoint; adjust if your API differs
        const res = await api.get(`admin/products/${productId}`);
        const raw = res?.data?.data ?? res?.data ?? null;
        if (raw) return mapRawToPickable(raw);
      } catch {
        // fallback: search the warehouse endpoint
        try {
          const res = await api.get(
            `admin/warehouse/${warehouseId}/opening-transactions/create`,
            { params: { search: String(productId), page: 1 } }
          );
          const items: any[] = res?.data?.data ?? [];
          const match = items.find((x: any) => Number(x?.id) === productId);
          if (match) return mapRawToPickable(match);
        } catch {
          /* ignore */
        }
      } finally {
        setLoadingDetails(false);
      }
      return null;
    },
    [warehouseId, mapRawToPickable]
  );

  // ---------- resolve a variant id to its parent product (best-effort) ----------
  const fetchProductByVariantId = React.useCallback(
    async (variantId: number): Promise<PickableProduct | null> => {
      try {
        // If you have /admin/product-variants/:id, use it here to get the parent product.
        // Fallback: search
        const res = await api.get(
          `admin/warehouse/${warehouseId}/opening-transactions/create`,
          { params: { search: String(variantId), page: 1 } }
        );
        const items: any[] = res?.data?.data ?? [];
        for (const raw of items) {
          const mapped = mapRawToPickable(raw);
          if (mapped.variants?.some((v) => v.id === variantId)) {
            return mapped;
          }
        }
      } catch {
        /* ignore */
      }
      return null;
    },
    [warehouseId, mapRawToPickable]
  );

  // ---------- list fetch ----------
  const fetchPage = React.useCallback(
    async (q: string, nextPage: number) => {
      setLoading(true);
      try {
        const res = await api.get(
          `admin/warehouse/${warehouseId}/opening-transactions/create`,
          { params: { search: q || undefined, page: nextPage } }
        );

        const items: any[] = res?.data?.data ?? [];
        const mapped: PickableProduct[] = items.map(mapRawToPickable);

        setCatalog((prev) => (nextPage === 1 ? mapped : [...prev, ...mapped]));

        const meta = res?.data?.meta || {};
        const more =
          typeof meta.current_page === "number" &&
          typeof meta.last_page === "number" &&
          meta.current_page < meta.last_page;

        setHasMore(more);
        setPage(nextPage);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [t, locale, warehouseId, mapRawToPickable]
  );

  // Initial load on open / search change
  React.useEffect(() => {
    if (!open) return;

    const q = search.trim();
    searchRef.current = q;

    setCatalog([]);
    setPage(1);
    setHasMore(false);

    const id = setTimeout(() => {
      fetchPage(q, 1);
    }, 350);

    return () => clearTimeout(id);
  }, [open, search, fetchPage]);

  React.useEffect(() => {
    if (!open) return;
    if (catalog.length === 0) fetchPage("", 1);
  }, [open]);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    fetchPage(searchRef.current, page + 1);
  }, [loading, hasMore, page, fetchPage]);

  const onSelect = (p: PickableProduct) => {
    setSelected(p);
    setSelectedVariantId(null);
    const type =
      p.has_variant && p.variants?.length ? "ProductVariant" : "Product";
    setGroupType(type);
  };

  // ---------- parse initialKey to preselect ----------
  const parseInitialKey = React.useMemo(() => {
    if (!initialKey)
      return null as
        | null
        | { kind: "product"; id: number }
        | { kind: "variant"; id: number };
    const [type, a] = String(initialKey).split(":");
    if (type === "Product" && a) return { kind: "product", id: Number(a) };
    if (type === "ProductVariant" && a)
      return { kind: "variant", id: Number(a) };
    return null;
  }, [initialKey]);

  // ---------- ensure preselection when editing ----------
  const ensurePreselection = React.useCallback(async () => {
    if (!parseInitialKey) return;

    if (parseInitialKey.kind === "product") {
      const pid = parseInitialKey.id;
      let product =
        catalog.find((c) => c.id === pid) || (await fetchProductById(pid));

      if (!product) {
        product = {
          id: pid,
          name: `#${pid}`,
          has_variant: false,
          variants: [],
        } as PickableProduct;
      }

      setSelected(product);
      setGroupType("Product");
      setSelectedVariantId(null);
      return;
    }

    // variant
    const vid = parseInitialKey.id;

    // If already in selected
    if (selected?.variants?.some((v) => v.id === vid)) {
      setGroupType("ProductVariant");
      setSelectedVariantId(vid);
      return;
    }

    // Try to resolve parent product
    const product =
      catalog.find((p) => p.variants?.some((v) => v.id === vid)) ||
      (await fetchProductByVariantId(vid));

    if (product) {
      setSelected(product);
      setGroupType("ProductVariant");
      setSelectedVariantId(vid);
    }
  }, [
    parseInitialKey,
    catalog,
    selected,
    fetchProductById,
    fetchProductByVariantId,
  ]);

  React.useEffect(() => {
    if (!open) return;
    if (!selected) ensurePreselection();
  }, [open, selected, ensurePreselection]);

  // ---------- confirm ----------
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

      const attributes =
        (variant?.attributeValues ?? []).map((av) => ({
          name: String(av.name),
          value: String(av.value),
        })) ?? [];

      onPick({
        key: `ProductVariant:${selectedVariantId}`,
        // label shows product and variant info if available
        label: `${selected.name} — ${
          variant?.sku ?? variant?.name ?? `#${selectedVariantId}`
        }`,
        unit: selected?.unit?.name,
        unitObject: selected?.unit,
        units: selected?.units,
        attributes: [...attributes, ...attributes],
      });
    } else {
      onPick({
        key: `Product:${selected.id}`,
        label: `${selected.name}${selected.sku ? ` • ${selected.sku}` : ""}`,
        unit: selected?.unit?.name,
        unitObject: selected?.unit,
        units: selected?.units,
      });
    }
    setOpen(false);
  };

  // ---------- helpers to pass attributes into VariantSelector ----------
  const initialSelectedAttributes = React.useMemo(() => {
    if (!selected || !selectedVariantId) return {};
    const v = selected.variants?.find((x) => x.id === selectedVariantId);
    const map: Record<string, string> = {};
    for (const av of v?.attributeValues ?? []) map[av.name] = String(av.value);
    return map;
  }, [selected, selectedVariantId]);

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
            {/* Left: Grid */}
            <div className="max-h-[60vh] overflow-auto">
              <ProductGrid
                products={catalog}
                selectedId={selected?.id ?? null}
                onSelect={onSelect}
                getPrice={nf}
                onEndReached={hasMore ? loadMore : undefined}
                loading={loading}
              />
              {!loading && hasMore && (
                <div className="mt-3 flex justify-center">
                  <Button variant="outline" size="sm" onClick={loadMore}>
                    {t("loadMore")}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Details */}
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

                  {groupType === "ProductVariant" && (
                    <VariantSelector
                      product={selected}
                      selectedVariantId={selectedVariantId}
                      onChange={(id) => {
                        if (id === selectedVariantId) return;
                        setSelectedVariantId(id);
                      }}
                      initialSelectedAttributes={initialSelectedAttributes}
                    />
                  )}

                  <div className="mt-auto flex items-center justify-end gap-2">
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button
                      onClick={confirm}
                      disabled={loading || loadingDetails}
                    >
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
