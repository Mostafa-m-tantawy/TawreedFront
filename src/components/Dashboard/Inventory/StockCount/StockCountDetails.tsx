"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api.client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import TabbedPanel from "@/components/Dashboard/Purchase/ShowPurchase/sections/TabbedPanel";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";
import PurchaseTable from "@/components/Dashboard/Purchase/Common/PurchaseTable";

type StockCountItem = {
  id: number;
  product_name: string;
  sku: string;
  system_qty: number;
  counted_qty: number;
  variance: number;
};

type StockCount = {
  id: number;
  reference_number: string;
  date: string;
  notes?: string;
  total_variance: number;
  status: string;
  items: StockCountItem[];
};

export default function StockCountDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [stockCount, setStockCount] = useState<StockCount | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 🔹 Attempt to fetch real API (keep for future use)
      const res = await api.get(`/admin/stock-counts/${id}`);
      const raw: StockCount =
        res?.data?.data ?? res?.data?.stock_count ?? res?.data;

      if (raw) {
        setStockCount(raw);
      } else {
        throw new Error("No data");
      }
    } catch (e: any) {
      const mock: StockCount = {
        id,
        reference_number: "ST-1001",
        date: "2023-06-15",
        status: "Draft",
        notes: "Monthly inventory count",
        total_variance: -3,
        items: [
          {
            id: 1,
            product_name: "Product A",
            sku: "PRD-1001",
            system_qty: 10,
            counted_qty: 8,
            variance: -2,
          },
          {
            id: 2,
            product_name: "Product B",
            sku: "PRD-1002",
            system_qty: 10,
            counted_qty: 8,
            variance: -2,
          },
          {
            id: 3,
            product_name: "Product C",
            sku: "PRD-1003",
            system_qty: 14,
            counted_qty: 15,
            variance: 1,
          },
        ],
      };

      setStockCount(mock);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!stockCount)
    return (
      <div className="p-6">
        <p className="ty-body-md text-neutral-600">{t("loading")}...</p>
      </div>
    );

  const {
    reference_number,
    date,
    notes,
    total_variance,
    status,
    items = [],
  } = stockCount;

  const formattedDate = date ? new Date(date).toLocaleDateString(locale) : "-";

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/dashboard/inventory/stock-counts"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Stock Counts")}
      </Link>

      {/* Header actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
        <h1 className="ty-body-xl-2 text-primary-700">{t("Stock Count")}</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            disabled={loading}
            size="md"
            className="rounded-md font-normal"
          >
            <Printer size={18} />
            {t("Print")}
          </Button>
          <ExportMenu />
        </div>
      </div>

      {/* Header details card */}
      <SectionCard>
        <KeyValueGrid
          cols={3}
          items={[
            { label: t("Reference Number"), value: reference_number || "-" },
            { label: t("Created on"), value: formattedDate },
            {
              label: t("Status"),
              value: <StatusPill value={status ?? "-"} />,
            },
            {
              label: t("Total Variance"),
              value: (
                <span
                  className={
                    total_variance > 0
                      ? "text-green-600"
                      : total_variance < 0
                      ? "text-red-600"
                      : "text-neutral-700"
                  }
                >
                  {total_variance > 0 ? `+${total_variance}` : total_variance}
                </span>
              ),
            },
            { label: t("Notes"), value: notes || "-" },
          ]}
        />
      </SectionCard>

      {/* Tabs section */}
      <TabbedPanel
        tabs={[
          {
            key: "products",
            label: t("Products"),
            content: (
              <PurchaseTable
                rows={items}
                loading={loading}
                columns={[
                  {
                    key: "product",
                    headerKey: "Product",
                    render: (r) => r.product_name,
                  },
                  {
                    key: "sku",
                    headerKey: "SKU",
                    render: (r) => r.sku,
                  },
                  {
                    key: "system_qty",
                    headerKey: "System Qty",
                    render: (r) => r.system_qty,
                  },
                  {
                    key: "counted_qty",
                    headerKey: "Counted Qty",
                    render: (r) => r.counted_qty,
                  },
                  {
                    key: "variance",
                    headerKey: "Variance",
                    render: (r) => (
                      <span
                        className={
                          r.variance > 0
                            ? "text-green-600"
                            : r.variance < 0
                            ? "text-red-600"
                            : "text-neutral-700"
                        }
                      >
                        {r.variance > 0 ? `+${r.variance}` : r.variance}
                      </span>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: "activity",
            label: t("Activity Log"),
            content: <div className="p-4">{t("noActivityYet")}</div>,
          },
        ]}
      />
    </div>
  );
}
