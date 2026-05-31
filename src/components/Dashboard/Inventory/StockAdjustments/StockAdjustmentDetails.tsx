"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api.client";
import { toast } from "sonner";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import TabbedPanel from "@/components/Dashboard/Purchase/ShowPurchase/sections/TabbedPanel";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// mock fallback used only if API fails
import * as mock from "./mockStockAdjustments";

// Adjust to your backend type if you already have one
type Adjustment = {
  id: number;
  code: string;
  date: string;
  warehouse?: { id: number; name: string } | null;
  product?: { id: number; name: string } | null;
  oldQty: number;
  newQty: number;
  reason: string;
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Cancelled";
  notes?: string | null; // optional, for parity with transfer
  createdBy?: { id: number; name: string } | null;
  updatedBy?: { id: number; name: string } | null;
};

const StockAdjustmentDetails = ({ id }: { id: number }) => {
  const t = useTranslations("");
  const locale = useLocale();

  const [adj, setAdj] = useState<Adjustment | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try real endpoint (parity with transfer details call)
      const res = await api.get(`/admin/stock-adjustments/${id}`);
      const raw = res?.data?.data ?? res?.data?.adjustment ?? res?.data; // support a few possible shapes

      // Normalize into our Adjustment shape
      const normalized: Adjustment = {
        id: Number(raw?.id ?? id),
        code: String(raw?.code ?? `ADJ-${id}`),
        date: String(raw?.date ?? raw?.created_at ?? ""),
        warehouse:
          raw?.warehouse ??
          raw?.Warehouse ??
          (raw?.warehouse_id
            ? { id: raw.warehouse_id, name: raw.warehouse_name ?? "-" }
            : null),
        product:
          raw?.product ??
          raw?.Product ??
          (raw?.product_id
            ? { id: raw.product_id, name: raw.product_name ?? "-" }
            : null),
        oldQty: Number(raw?.oldQty ?? raw?.current_qty ?? 0),
        newQty: Number(raw?.newQty ?? raw?.new_qty ?? 0),
        reason: String(raw?.reason ?? ""),
        status: (raw?.status || "Draft") as Adjustment["status"],
        notes: raw?.notes ?? null,
        createdBy: raw?.createdBy ?? raw?.created_by ?? null,
        updatedBy: raw?.updatedBy ?? raw?.updated_by ?? null,
      };

      setAdj(normalized);
    } catch {
      // Fallback to mock if API not ready
      const m = await mock.getAdjustment(id);
      setAdj({
        id: m.id,
        code: m.code ?? `ADJ-${m.id}`,
        date: m.date,
        warehouse: m.warehouse ?? null,
        product: m.product ?? null,
        oldQty: m.oldQty,
        newQty: m.newQty,
        reason: m.reason,
        status: m.status,
        notes: null,
        createdBy: null,
        updatedBy: null,
      });
    } finally {
      setLoading(false);
    }
  }, [id, locale, t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!adj) return null;

  const difference = Math.abs(Number(adj.newQty) - Number(adj.oldQty));

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/stock-adjustments"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to adjustment")}
      </Link>

      {loading && (
        <div className="rounded-2xl border bg-white p-6 mt-6">
          {t("loading")}
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
            <h1 className="ty-body-xl-2 text-primary-700">
              {t("Adjustment Details")}
            </h1>

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

          {/* Header card */}
          <SectionCard>
            <KeyValueGrid
              cols={3}
              items={[
                { label: t("Code"), value: adj.code },
                { label: t("Date"), value: adj.date || "-" },
                {
                  label: t("Status"),
                  value: adj.status && <StatusPill value={adj.status} />,
                },
                {
                  label: t("Warehouse"),
                  value: adj.warehouse?.name ?? "-",
                },
                {
                  label: t("Product"),
                  value: adj.product?.name ?? "-",
                },
                { label: t("Reason"), value: adj.reason || "-" },
                { label: t("Old Qty"), value: String(adj.oldQty ?? 0) },
                { label: t("New Qty"), value: String(adj.newQty ?? 0) },
                { label: t("Difference"), value: String(difference) },
                {
                  label: t("Notes"),
                  value: adj.notes ? String(adj.notes) : "-",
                },
              ]}
            />
          </SectionCard>

          <div className="rounded-2xl bg-white p-6">
            <p className="ty-body-md-2 pb-4 border-b border-neutral-white-300">
              {t("Activity Log")}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default StockAdjustmentDetails;
