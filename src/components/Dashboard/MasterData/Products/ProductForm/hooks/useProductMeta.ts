"use client";

import { useCallback, useState } from "react";
import api from "@/lib/api.client";
import { MetaRes, ProductAPI, ProductFlow } from "../types";

export function useProductMeta(kind: "service" | "physical") {
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [meta, setMeta] = useState<Required<MetaRes>>({
    statuses: ["active", "inactive"],
    categories: [
      { id: 1, name: "Finished Goods" },
      { id: 2, name: "Raw Material" },
    ],
    discount_types: ["none", "amount", "percent"],
    product_flows: ["product", "raw_material", "finished_good"],
    taxes: [],
  });

  const loadCreateMeta = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const res = await api.get<MetaRes>(`/admin/products/create`, {
        params: { type: kind },
      });
      const data = res?.data ?? {};
      setMeta((prev) => ({
        ...prev,
        ...(data.statuses ? { statuses: data.statuses } : {}),
        ...(data.categories ? { categories: data.categories } : {}),
        ...(data.discount_types ? { discount_types: data.discount_types } : {}),
        ...(kind === "physical" && data.product_flows
          ? { product_flows: data.product_flows as ProductFlow[] }
          : {}),
        ...(data.taxes ? { taxes: data.taxes } : {}),
      }));
    } finally {
      setLoadingMeta(false);
    }
  }, [kind]);

  const loadEditData = useCallback(
    async (id: number) => {
      setLoadingMeta(true);
      try {
        const res = await api.get(`/admin/products/${id}/edit`);
        const m: MetaRes = {
          statuses: res?.data?.statuses,
          categories: res?.data?.categories,
          discount_types: res?.data?.discount_types,
          product_flows: res?.data?.product_flows,
          taxes: res?.data?.taxes,
        };
        setMeta((prev) => ({
          ...prev,
          ...(m.statuses ? { statuses: m.statuses } : {}),
          ...(m.categories ? { categories: m.categories } : {}),
          ...(m.discount_types ? { discount_types: m.discount_types } : {}),
          ...(kind === "physical" && m.product_flows
            ? { product_flows: m.product_flows as ProductFlow[] }
            : {}),
          ...(m.taxes ? { taxes: m.taxes } : {}),
        }));

        const product: ProductAPI | undefined = res?.data?.product;
        return product;
      } finally {
        setLoadingMeta(false);
      }
    },
    [kind]
  );

  return { meta, loadingMeta, loadCreateMeta, loadEditData };
}
