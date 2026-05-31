"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import ProductHeader from "./ProductHeader";
import ProductTabs from "./ProductTabs/ProductTabs";
import OverviewTab from "./ProductTabs/OverviewTab";
import MovementsTab from "./ProductTabs/MovementsTab";
import LinkedDocsTab from "./ProductTabs/LinkedDocsTab";
import VariantsTab from "./ProductTabs/VariantsTab";
import api from "@/lib/api.client";
import { useAuthStore } from "@/store/authStore";
import GroupedProductsTab from "./ProductTabs/GroupedProducts/GroupedProductsTab";
import ProtectedElement from "@/components/ui/protected-element";

type TabKey =
  | "overview"
  | "movements"
  | "documents"
  | "variants"
  | "groupedProducts";

type VariantAttribute = {
  id: number;
  name: Record<string, string> | string;
  values: Array<
    string | { id: number; name: Record<string, string> | string }
  > | null;
  status: string;
};

type ProductDetailsDTO = {
  // header
  title: string;
  sku: string;
  stock_qty: number;
  in_stock: boolean;
  image?: string | null;

  // overview basics
  description?: string | null;
  category?: string | null;
  brand?: string | null;

  // pricing & taxes
  price?: number | string | null; // sale_price
  purchase_price?: number | string | null;
  lowest_sale_price?: number | string | null;
  profit_margin?: number | string | null;
  tax_percent?: number | string | null; // legacy
  tax_1?: number | string | null;
  tax_2?: number | string | null;
  discount_type?: "percent" | "amount" | string | null;
  discount_value?: number | string | null;

  // identifiers & status
  barcode?: string | null;
  status?: string | null;

  // meta
  unit_name?: string | null;
  unit_short_code?: string | null;
  type?: string | null;
  flow?: string | null;
  has_variant?: boolean | null;
  track_inventory?: boolean | null;
  track_expiry_date?: boolean | null;
  tags?: string[] | null;
  notes?: string | null;

  // tabs
  movements: any[];
  documents: any[];
  variants: any[];
  variant_attributes: VariantAttribute[];

  // for variants tab (if you need it elsewhere)
  has_variants?: boolean;
};

async function fetchProduct(
  id: number,
  _lang: string
): Promise<ProductDetailsDTO> {
  const res = await api.get(`admin/products/${id}`);
  const p = res?.data?.data ?? {};

  // header
  const title = p.name ?? "";
  const sku = p.sku ?? "";

  // stock
  const stock_qty =
    typeof p.stock_qty === "number" ? p.stock_qty : p.track_inventory ? 0 : 0;
  const in_stock =
    typeof p.in_stock === "boolean" ? p.in_stock : (stock_qty ?? 0) > 0;

  // fallbacks for tabs (if backend omits them)
  const fakeMovements = [
    {
      id: `${id}-m1`,
      date: "2025-09-10",
      type: "purchase",
      reference: "PO-10231",
      qty: 25,
      from: "Supplier",
      to: "Main WH",
      note: "Initial stock",
    },
    {
      id: `${id}-m2`,
      date: "2025-09-13",
      type: "sale",
      reference: "SO-8840",
      qty: -6,
      from: "Main WH",
      to: "Customer",
      note: "Online order",
    },
  ];
  const fakeDocs = [
    {
      id: `${id}-d1`,
      title: "Purchase Invoice #10231",
      type: "invoice",
      url: "#",
      date: "2025-09-10",
    },
    {
      id: `${id}-d2`,
      title: "Warranty Card",
      type: "pdf",
      url: "#",
      date: "2025-09-11",
    },
  ];

  return {
    // header
    title,
    sku,
    stock_qty,
    in_stock,
    image: p.image ?? p.image ?? null,

    // overview basics
    description: p.description ?? "",
    category: p.category?.name ?? null,
    brand: p.brand_name ?? null,

    // pricing & taxes
    price: p.sale_price ?? null,
    purchase_price: p.purchase_price ?? null,
    lowest_sale_price: p.lowest_sale_price ?? null,
    profit_margin: p.profit_margin ?? null,
    tax_percent: p.tax_1 ?? null, // keep for back-compat
    tax_1: p.tax_1 ?? null,
    tax_2: p.tax_2 ?? null,
    discount_type: p.discount_type ?? null,
    discount_value: p.discount_value ?? null,

    // identifiers & status
    barcode: p.barcode ?? null,
    status: p.status ?? null,

    // meta
    unit_name: p.unit?.name ?? null,
    unit_short_code: p.unit?.short_code ?? null,
    type: p.type ?? null,
    flow: p.flow ?? null,
    has_variant: p.has_variant ?? p.has_variants ?? null,
    track_inventory: p.track_inventory ?? null,
    track_expiry_date: p.track_expiry_date ?? null,
    tags: Array.isArray(p.tags) ? p.tags : null,
    notes: p.notes ?? null,

    // tabs
    movements: p.movements ?? fakeMovements,
    documents: p.documents ?? fakeDocs,
    variants: p.variants ?? [],
    variant_attributes: Array.isArray(p.variant_attributes)
      ? p.variant_attributes
      : [],

    // optional alias used elsewhere
    has_variants: p?.has_variants ?? p?.has_variant,
  };
}

export default function ProductDetailsPage({ id }: { id: number }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const search = useSearchParams();

  const initialTab = (search.get("tab") as TabKey) || "overview";
  const [tab, setTab] = React.useState<TabKey>(initialTab);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ProductDetailsDTO | null>(null);

  const { hasPermission } = useAuthStore();

  React.useEffect(() => {
    const sp = new URLSearchParams(Array.from(search.entries()));
    if (sp.get("tab") !== tab) {
      sp.set("tab", tab);
      router.replace(`?${sp.toString()}`, { scroll: false });
    }
  }, [tab]);

  React.useEffect(() => {
    const urlTab = (search.get("tab") as TabKey) || "overview";
    if (urlTab !== tab) setTab(urlTab);
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchProduct(id, locale);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError(t("fetchFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, locale, t]);

  const isShowVariants = React.useMemo(() => {
    return hasPermission("view-product-variants") && data?.has_variant;
  }, [data?.has_variant, hasPermission]);

  const isShowGroupedProducts = React.useMemo(() => {
    return (
      hasPermission("view-grouped-products") &&
      data?.type === "grouped products"
    );
  }, [data?.type, hasPermission]);

  return (
    <div className="space-y-4 p-4">
      <div className="mb-4">
        <Link
          href={"/dashboard/products"}
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("backToProducts")}
        </Link>
      </div>

      {loading && (
        <div className="rounded-2xl border bg-white p-6">{t("loading")}</div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border bg-white p-6 text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <ProductHeader
            title={data.title}
            sku={data.sku}
            stockQty={data.stock_qty}
            inStock={data.in_stock}
            image={data.image}
          />

          <div className="mt-4 rounded-2xl bg-white">
            <ProductTabs
              active={tab}
              onChange={setTab}
              isShowGroupedProducts={isShowGroupedProducts}
              isShowVariants={isShowVariants}
            />

            {tab === "overview" && (
              <OverviewTab
                // basics
                description={data.description}
                brand={data.brand}
                category={data.category}
                sku={data.sku}
                barcode={data.barcode}
                status={data.status}
                // pricing & taxes
                hasVariants={data?.has_variants}
                price={data.price}
                purchasePrice={data.purchase_price}
                lowestSalePrice={data.lowest_sale_price}
                profitMargin={data.profit_margin}
                taxPercent={data.tax_percent} // legacy
                tax1={data.tax_1}
                tax2={data.tax_2}
                discountType={data.discount_type}
                discountValue={data.discount_value}
                // meta
                unitName={data.unit_name}
                unitShortCode={data.unit_short_code}
                type={data.type}
                flow={data.flow}
                hasVariant={data.has_variant}
                trackInventory={data.track_inventory}
                trackExpiryDate={data.track_expiry_date}
                tags={data.tags}
                notes={data.notes}
                currencyCode="SAR"
              />
            )}

            {tab === "movements" && <MovementsTab rows={data.movements} />}

            {tab === "documents" && <LinkedDocsTab docs={data.documents} />}

            {tab === "variants" && isShowVariants && (
              <VariantsTab productId={id} />
            )}

            {tab === "groupedProducts" && (
              <ProtectedElement permissions={"view-grouped-products"}>
                <GroupedProductsTab productId={id} />
              </ProtectedElement>
            )}
          </div>
        </>
      )}
    </div>
  );
}
