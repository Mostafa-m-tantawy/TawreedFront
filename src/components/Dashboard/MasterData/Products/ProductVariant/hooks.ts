// /components/products/variants/hooks.ts
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api.client";

export function useVariantPrefill(
  mode: "create" | "edit",
  productId: number,
  variantId?: number
) {
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<{
    baseSku?: string;
    edit?: any;
    productAttributes?: any[];
  }>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (mode === "edit" && variantId) {
          const res = await api.get(
            `/admin/product-variants/${variantId}/edit`
          );
          setPrefill({
            edit: res?.data?.productVariant ?? res?.data?.data ?? {},
            productAttributes: res?.data?.product_attributes,
          });
        } else {
          const res = await api.get(`/admin/product-variants/create`, {
            params: { product_id: productId },
          });
          setPrefill({
            baseSku: res?.data?.data?.sku ?? res?.data?.sku,
            productAttributes: res?.data?.product_attributes,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, productId, variantId]);

  return { loading, prefill };
}
