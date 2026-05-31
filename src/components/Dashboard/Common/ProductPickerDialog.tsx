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
import { toast } from "sonner";
import { SearchNormal } from "iconsax-reactjs";
import VariantSelector from "../MasterData/Products/ShowProduct/ProductTabs/GroupedProducts/VariantSelector";
import { ProductGrid } from "../MasterData/Products/ShowProduct/ProductTabs/GroupedProducts/ProductGrid";

type Attribute = { name: string; value: string };

export type PickableProduct = {
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
    attributeValues?: Attribute[];
    unit?: { name: string };
    allowed_quantity?: number;
    warehouse_quantity?: number;
  }>;
  unit?: { name: string };
  units?: any[];
  variant_attributes?: Array<{ name: string; values: string[] }>;
  allowed_quantity?: number;
  warehouse_quantity?: number;
  flow?: string;
};

type ProductPickerDialogProps = {
  trigger: React.ReactNode;
  onPick: (picked: {
    id: number;
    key: string;
    label: string;
    unit?: string;
    unitObject?: any;
    units?: any[];
    attributes?: Attribute[];
    allowed_quantity?: number;
    flow?: string;
  }) => void;
  initialKey?: string;
  defaultOpen?: boolean;
  /** fetch product list */
  fetchPage: (
    q: string,
    page: number
  ) => Promise<{
    products: PickableProduct[];
    hasMore: boolean;
  }>;
  /** fetch by id (for preselect) */
  fetchProductById?: (id: number) => Promise<PickableProduct | null>;
  /** fetch by variant id (for preselect) */
  fetchProductByVariantId?: (id: number) => Promise<PickableProduct | null>;
};

export default function ProductPickerDialog({
  trigger,
  onPick,
  initialKey,
  defaultOpen,
  fetchPage,
  fetchProductById,
  fetchProductByVariantId,
}: ProductPickerDialogProps) {
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

  // ---------- list fetch ----------
  const loadPage = React.useCallback(
    async (q: string, nextPage: number) => {
      setLoading(true);
      try {
        const { products, hasMore } = await fetchPage(q, nextPage);
        setCatalog((prev) =>
          nextPage === 1 ? products : [...prev, ...products]
        );
        setHasMore(hasMore);
        setPage(nextPage);
      } catch (e: any) {
        toast.error(e?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, t]
  );

  // ---------- parse initialKey ----------
  const parseInitialKey = React.useMemo(() => {
    if (!initialKey) return null;

    const [type, a] = String(initialKey).split(":");
    if (type === "Product" && a) return { kind: "product", id: Number(a) };
    if (type === "ProductVariant" && a)
      return { kind: "variant", id: Number(a) };
    return null;
  }, [initialKey]);

  // ---------- ensure preselection ----------
  const ensurePreselection = React.useCallback(async () => {
    if (!parseInitialKey) return;

    if (parseInitialKey.kind === "product" && fetchProductById) {
      const pid = parseInitialKey.id;
      const product =
        catalog.find((c) => c.id === pid) || (await fetchProductById(pid));
      if (product) {
        setSelected(product);
        setGroupType("Product");
      }
      return;
    }

    if (parseInitialKey.kind === "variant" && fetchProductByVariantId) {
      const vid = parseInitialKey.id;
      const product =
        catalog.find((p) => p.variants?.some((v) => v.id === vid)) ||
        (await fetchProductByVariantId(vid));
      if (product) {
        setSelected(product);
        setGroupType("ProductVariant");
        setSelectedVariantId(vid);
      }
    }
  }, [parseInitialKey, catalog, fetchProductById, fetchProductByVariantId]);

  React.useEffect(() => {
    if (!open) return;

    const q = search.trim();
    searchRef.current = q;
    setCatalog([]);
    setPage(1);
    setHasMore(false);

    const id = setTimeout(() => {
      loadPage(q, 1);
    }, 350);

    return () => clearTimeout(id);
  }, [open, search, loadPage]);

  React.useEffect(() => {
    if (open && !selected && catalog.length) ensurePreselection();
  }, [open, selected, ensurePreselection, catalog]);

  const loadMore = React.useCallback(() => {
    if (loading || !hasMore) return;
    loadPage(searchRef.current, page + 1);
  }, [loading, hasMore, page, loadPage]);

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
        id: selected.id,
        key: `ProductVariant:${selectedVariantId}`,
        label: `${selected.name} — ${
          variant?.sku ?? variant?.name ?? `#${selectedVariantId}`
        }`,
        unit: selected?.unit?.name,
        unitObject: selected?.unit,
        units: selected?.units,
        attributes,
        allowed_quantity: variant?.allowed_quantity,
        flow: selected?.flow,
      });
    } else {
      onPick({
        id: selected.id,
        key: `Product:${selected.id}`,
        label: `${selected.name}${selected.sku ? ` - ${selected.sku}` : ""}`,
        unit: selected?.unit?.name,
        unitObject: selected?.unit,
        units: selected?.units,
        allowed_quantity: selected?.allowed_quantity,
        flow: selected?.flow,
      });
    }
    setOpen(false);
  };

  // ---------- attributes for VariantSelector ----------
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
          {/* Search */}
          <div className="mb-3">
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

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Left: Grid */}
            <div className="max-h-[60vh] overflow-auto">
              <ProductGrid
                products={catalog}
                selectedId={selected?.id ?? null}
                onSelect={(p) => {
                  setSelected(p);
                  setSelectedVariantId(null);
                  setGroupType(
                    p.has_variant && p.variants?.length
                      ? "ProductVariant"
                      : "Product"
                  );
                }}
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
                      <div className="truncate ty-body-md">{selected.name}</div>
                      <div className="mt-1 ty-body-sm text-gray-500">
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
                      onChange={(id) => setSelectedVariantId(id)}
                      initialSelectedAttributes={initialSelectedAttributes}
                      key={selected?.id}
                    />
                  )}

                  <div className="mt-auto flex justify-end gap-2">
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
