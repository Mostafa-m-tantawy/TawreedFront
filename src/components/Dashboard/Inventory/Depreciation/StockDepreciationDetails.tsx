"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import api from "@/lib/api.client";
import { toast } from "sonner";

import SectionCard from "@/components/Dashboard/Purchase/ShowPurchase/sections/SectionCard";
import KeyValueGrid from "@/components/Dashboard/Purchase/ShowPurchase/sections/KeyValueGrid";
import StatusPill from "@/components/Dashboard/Purchase/ShowPurchase/sections/StatusPill";
import ExportMenu from "@/components/Dashboard/Purchase/Common/ExportMenu";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// mock fallback (only if API fails)
import * as mock from "./mockStockDepreciation";

type Depreciation = {
  id: number;
  code: string;
  date: string;
  warehouse?: { id: number; name: string } | null;
  product?: { id: number; name: string } | null;
  qtyWrittenOff: number;
  reason: string;
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Cancelled";
  notes?: string | null;
  createdBy?: { id: number; name: string } | null;
  updatedBy?: { id: number; name: string } | null;
};

export default function DepreciationDetails({ id }: { id: number }) {
  const t = useTranslations("");
  const locale = useLocale();

  const [dep, setDep] = useState<Depreciation | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Real API first
      const res = await api.get(`/admin/stock-depreciations/${id}`);
      const raw = res?.data?.data ?? res?.data?.depreciation ?? res?.data; // support a few shapes

      const normalized: Depreciation = {
        id: Number(raw?.id ?? id),
        code: String(raw?.code ?? `DEP-${id}`),
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
        qtyWrittenOff: Number(
          raw?.qtyWrittenOff ?? raw?.qty_written_off ?? raw?.quantity ?? 0
        ),
        reason: String(raw?.reason ?? ""),
        status: (raw?.status || "Draft") as Depreciation["status"],
        notes: raw?.notes ?? null,
        createdBy: raw?.createdBy ?? raw?.created_by ?? null,
        updatedBy: raw?.updatedBy ?? raw?.updated_by ?? null,
      };

      setDep(normalized);
    } catch {
      // Mock fallback
      const m = await mock.getAdjustment(id);
      setDep({
        id: m.id,
        code: m.code ?? `DEP-${m.id}`,
        date: m.date,
        warehouse: m.warehouse ?? null,
        product: m.product ?? null,
        qtyWrittenOff: (m as any).qtyWrittenOff ?? 0, // mock uses qtyWrittenOff
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

  if (!dep) return null;

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/depreciation"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to depreciation")}
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
              {t("Depreciation Details")}
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

          <SectionCard>
            <KeyValueGrid
              cols={3}
              items={[
                { label: t("Code"), value: dep.code },
                { label: t("Date"), value: dep.date || "-" },
                {
                  label: t("Status"),
                  value: dep.status && <StatusPill value={dep.status} />,
                },
                { label: t("Warehouse"), value: dep.warehouse?.name ?? "-" },
                { label: t("Product"), value: dep.product?.name ?? "-" },
                {
                  label: t("Qty Written-off"),
                  value: String(dep.qtyWrittenOff ?? 0),
                },
                { label: t("Reason"), value: dep.reason || "-" },
                {
                  label: t("Notes"),
                  value: dep.notes ? String(dep.notes) : "-",
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
}
