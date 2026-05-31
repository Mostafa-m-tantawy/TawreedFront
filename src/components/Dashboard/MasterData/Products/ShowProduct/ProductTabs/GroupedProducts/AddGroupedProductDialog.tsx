"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "./ProductGrid";
import VariantSelector from "./VariantSelector";
import QuantityInput from "./QuantityInput";
import { ScanLine } from "lucide-react";
import { AddCircle, SearchNormal } from "iconsax-reactjs";

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
    attributeValues?: { name: string; value: string }[];
  }>;
  variant_attributes?: Array<{ name: string; values: string[] }>;
};

export default function AddGroupedProductDialog({
  productId,
  onSuccess,
}: {
  productId: number;
  onSuccess?: () => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [catalog, setCatalog] = React.useState<PickableProduct[]>([]);
  const [selected, setSelected] = React.useState<PickableProduct | null>(null);

  const [groupableType, setGroupableType] = React.useState<
    "Product" | "ProductVariant"
  >("Product");
  const [selectedVariantId, setSelectedVariantId] = React.useState<
    number | null
  >(null);
  const [quantity, setQuantity] = React.useState(1);

  // --- small, local debounce
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // prevent race conditions (ignore late responses)
  const lastReqId = React.useRef(0);

  const nf = (n?: number | null) =>
    typeof n === "number"
      ? new Intl.NumberFormat(locale || "en", {
          style: "currency",
          currency: "SAR",
        }).format(n)
      : "—";

  const normalize = (rows: any[]): PickableProduct[] =>
    (rows ?? []).map((p: any) => ({
      id: Number(p.id),
      name: String(p.name ?? ""),
      sku: p.sku ?? null,
      image: p.image ?? null,
      sale_price:
        p.sale_price === null || p.sale_price === undefined
          ? null
          : Number(p.sale_price),
      has_variant: Boolean(p.has_variant),
      variants: (p.product_variants ?? p.variants ?? []).map((v: any) => ({
        id: Number(v.id),
        name: String(v.name ?? ""),
        sku: v.sku ?? null,
        sale_price:
          v.sale_price === null || v.sale_price === undefined
            ? null
            : Number(v.sale_price),
        attributeValues: v?.attributeValues ?? [],
      })),
    }));

  const loadPicker = React.useCallback(
    async (q: string) => {
      setLoading(true);
      const reqId = ++lastReqId.current;

      try {
        const res = await api.get("/admin/grouped-products/create", {
          params: {
            product_id: productId,
            search: q || undefined,
          },
        });

        const rows = res?.data?.data ?? res?.data?.products ?? [];
        const normalized = normalize(rows);

        if (reqId !== lastReqId.current) return;

        setCatalog(normalized);
        if (!normalized.length) {
          setSelected(null);
        } else if (!selected || !normalized.find((x) => x.id === selected.id)) {
          setSelected(normalized[0]);
          setSelectedVariantId(null);
          setGroupableType(
            normalized[0].has_variant && normalized[0].variants?.length
              ? "ProductVariant"
              : "Product"
          );
        }
      } catch (e: any) {
        if (reqId !== lastReqId.current) return;
        toast.error(e?.response?.data?.message || t("fetchFailed"));
      } finally {
        if (reqId === lastReqId.current) setLoading(false);
      }
    },
    [productId, selected, t]
  );

  React.useEffect(() => {
    if (!open) return;
    loadPicker(debouncedSearch);
  }, [debouncedSearch, open, loadPicker]);

  const resetState = () => {
    setSearch("");
    setSelectedVariantId(null);
    setQuantity(1);
    setGroupableType("Product");
  };

  const submit = async () => {
    if (!selected) return;

    const payload: any = {
      product_id: productId,
      quantity,
      groupable_type: groupableType,
      groupable_id:
        groupableType === "Product" ? selected.id : selectedVariantId,
    };

    if (!payload.groupable_id) {
      toast.error(t("validation.selectVariant"));
      return;
    }

    try {
      setLoading(true);
      await api.post("/admin/grouped-products", payload);
      toast.success(t("saved"));
      setOpen(false);
      resetState();
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (p: PickableProduct) => {
    setSelected(p);
    setSelectedVariantId(null);
    const type =
      p.has_variant && p.variants?.length ? "ProductVariant" : "Product";
    setGroupableType(type);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <AddCircle size={16} /> {t("grouped.add")}
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-[80vw] w-[80vw] gap-0 p-0 overflow-auto">
        <DialogHeader className="p-4 border-b border-neutral-white-300">
          <DialogTitle>
            <span className="ty-body-lg">{t("grouped.selectProduct")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
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
            <Button variant="secondary" className="h-full">
              <ScanLine className="h-4 w-4" />
              <span className="ml-2">
                {t("grouped.scan", { default: "Scan" })}
              </span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="max-h-[60vh] overflow-auto">
              <ProductGrid
                products={catalog}
                selectedId={selected?.id ?? null}
                onSelect={onSelect}
                getPrice={nf}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 min-h-[200px]">
              <div className="w-full h-[1px] lg:w-[1px] lg:h-full bg-neutral-white-300"></div>

              {selected ? (
                <div className="flex h-full flex-col gap-4 flex-1">
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
                        {t("sku")}: {selected.sku || "—"}
                      </div>
                      <div className="mt-2 ty-body-md text-primary-600">
                        {nf(selected.sale_price)}
                      </div>
                    </div>
                  </div>

                  {groupableType === "ProductVariant" &&
                    selected.has_variant && (
                      <VariantSelector
                        product={selected}
                        selectedVariantId={selectedVariantId}
                        onChange={setSelectedVariantId}
                      />
                    )}

                  <div className="mt-auto grid grid-cols-1 gap-4 sm:grid-cols-1 pb-6 lg:pb-0">
                    <QuantityInput value={quantity} onChange={setQuantity} />

                    <Button
                      className="h-12 px-8 w-full sm:w-auto"
                      disabled={loading}
                      onClick={submit}
                    >
                      {t("grouped.confirmSelection")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="w-full flex-center text-slate-500 flex-1">
                  {loading ? t("loading") : t("grouped.selectAnItem")}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
