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
import ExportMenu from "../../../Purchase/Common/ExportMenu";
import { Transfer } from "@/types/transfer";
import TransferProductsTable from "./TransferProductsTable";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** ====================== Main component ====================== */
const StockTransferDetails = ({ id }: { id: number }) => {
  const t = useTranslations("");
  const locale = useLocale();

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(false);

  // const [events, setEvents] = useState<ActivityLog[]>([]);
  // const [eventsLoading, setEventsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/transfer-transactions/${id}`);

      const raw: Transfer =
        res?.data?.data ?? res?.data?.transfer_transaction ?? res?.data;
      setTransfer(raw ?? null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, locale, t]);

  // const loadActivity = useCallback(async () => {
  //   setEventsLoading(true);
  //   try {
  //     const res = await api.get<ActivityLog[] | { data: ActivityLog[] }>(
  //       `/admin/transfer-transactions/get-activity-logs/${id}`
  //     );
  //     const rows: ActivityLog[] = Array.isArray(res?.data)
  //       ? (res.data as ActivityLog[])
  //       : (res?.data as any)?.data ?? [];
  //     setEvents(rows);
  //   } catch (e: any) {
  //     toast.error(
  //       e?.response?.data?.message || t("transfer.activityLoadFailed")
  //     );
  //   } finally {
  //     setEventsLoading(false);
  //   }
  // }, [id, locale, t]);

  useEffect(() => {
    void load();
    // void loadActivity();
  }, [load]); // loadActivity

  if (!transfer) return null;

  const createdBy = transfer.createdBy ? transfer.createdBy.name : "-";
  const updatedBy = transfer.updatedBy ? transfer.updatedBy.name : "-";
  const fromWarehouse = transfer.fromWarehouse?.name ?? "-";
  const toWarehouse = transfer.toWarehouse?.name ?? "-";
  const status = transfer.status ?? "-";
  const notes = transfer.notes ?? "";

  const items = Array.isArray(transfer.items) ? transfer.items : [];

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/dashboard/inventory/stock-transfer"
        className="ty-body-sm text-primary-700"
      >
        ← {t("Back to Transfers")}
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
              {t("Transfer Details")}
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
                { label: t("From Warehouse"), value: fromWarehouse },
                { label: t("To Warehouse"), value: toWarehouse },
                { label: t("createdBy"), value: createdBy },
                { label: t("updatedBy"), value: updatedBy },
                {
                  label: t("Status"),
                  value: status && <StatusPill value={status} />,
                },
                { label: t("Notes"), value: notes || "-" },
              ]}
            />
          </SectionCard>

          {/* Tabs: Products / Activity Log */}
          <TabbedPanel
            tabs={[
              {
                key: "products",
                label: t("Products"),
                content: <TransferProductsTable rows={items} />,
              },
              {
                key: "activity",
                label: t("Activity Log"),
                content: <div className="p-4"></div>,
              },
            ]}
          />
        </>
      )}
    </div>
  );
};

export default StockTransferDetails;
