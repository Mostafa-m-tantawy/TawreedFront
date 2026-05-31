"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type ProductLite = {
  id: number;
  name: string;
  sku?: string | null;
  image?: string | null;
  sale_price?: number | null;
  has_variant?: boolean;
  variants?: any[];
};

export function ProductGrid({
  products,
  selectedId,
  onSelect,
  getPrice,
  loading = false,
  hasMore = false,
  onEndReached,
  emptyText = "noRecords",
}: {
  products: ProductLite[];
  selectedId: number | null;
  onSelect: (p: ProductLite) => void;
  getPrice: (n?: number | null) => string;

  /** (optional) props for server-side flow */
  loading?: boolean;
  hasMore?: boolean;
  onEndReached?: () => void;
  emptyText?: string;
}) {
  const t = useTranslations("");
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  // fire onEndReached when sentinel intersects
  React.useEffect(() => {
    if (!onEndReached) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          onEndReached();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [onEndReached, hasMore, loading]);

  return (
    <div className="space-y-3">
      {/* grid */}
      <div className="grid sm:grid-cols-2 gap-2">
        {products.map((p) => (
          <button
            key={p.id}
            className={cn(
              "p-2 flex gap-2 flex-wrap border rounded-md transition-colors hover:bg-slate-50 text-left",
              selectedId === p.id
                ? "border-primary-400 bg-primary-50"
                : "border-primary-100"
            )}
            onClick={() => onSelect(p)}
          >
            {p.image && (
              <img
                src={p.image}
                alt={p.name}
                className="w-16 h-16 rounded-md object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="truncate ty-body-sm text-neutral-black-800">
                {p.name}
              </div>
              <div className="mt-1 ty-body-xs text-[#6B7280]">
                SKU: {p.sku || "—"}
              </div>
              <div className="mt-2 ty-body-sm text-primary-600">
                {getPrice(p.sale_price)}
              </div>
            </div>
          </button>
        ))}

        {/* skeletons while loading and grid has some content (progressive) */}
        {loading &&
          products.length > 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="p-2 flex gap-2 border border-primary-100 rounded-md"
            >
              <div className="w-16 h-16 rounded-md bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
      </div>

      {/* empty state (when not loading and no products) */}
      {!loading && products.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-6">
          {t(emptyText)}
        </div>
      )}

      {/* bottom loader */}
      {loading && products.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-6">
          {t("loading")}
        </div>
      )}

      {/* intersection sentinel for infinite scroll */}
      <div ref={sentinelRef} />

      {/* fallback manual loader (in case parent doesn’t use IntersectionObserver) */}
      {!loading && hasMore && !onEndReached && (
        <div className="flex justify-center">
          <span className="text-sm text-primary-600">More available…</span>
        </div>
      )}
    </div>
  );
}
