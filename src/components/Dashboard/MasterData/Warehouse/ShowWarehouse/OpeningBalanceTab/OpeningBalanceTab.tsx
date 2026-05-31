"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Add } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import OpeningBalanceDialog from "./OpeningBalanceDialog";
import OpeningBalanceTable from "./OpeningBalanceTable";
import api from "@/lib/api.client";
import { toast } from "sonner";

type OpeningItem = {
  id: number;
  product: any;
  quantity: number;
  price: number;
  total_price: number;
  expired_date: string | null;
  unit: {
    id: number;
    name: string;
  };
};

export default function OpeningBalanceTab({
  warehouseId,
  warehouseName,
}: {
  warehouseId: number;
  warehouseName: string;
}) {
  const t = useTranslations("warehouse.openingBalanceTab");
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<OpeningItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/warehouse/${warehouseId}/opening-transactions`,
        {
          params: { page, per_page: 5 },
        }
      );

      const data: any[] = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};
      const mapped: OpeningItem[] = data.map((x: any) => ({
        id: Number(x.id),
        product: x.Product ?? {},
        quantity: Number(x.quantity ?? 0),
        price: Number(x.price ?? 0),
        total_price: Number(x.total_price ?? 0),
        expired_date: x.expired_date ?? null,
        unit: x?.unit,
      }));

      setRows(mapped);
      setLastPage(meta?.last_page ?? 1);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          t("fetchFailed", { default: "Failed to load" })
      );
    } finally {
      setLoading(false);
    }
  }, [warehouseId, page, locale, t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSaved = () => {
    setOpen(false);
    // reload first page to show the newly-added records
    setPage(1);
    void load();
  };

  const showEmptyAdd = !loading && rows.length === 0;

  return (
    <>
      {/* When NO records: big dashed button */}
      {showEmptyAdd ? (
        <button
          type="button"
          className="w-full h-full ty-body-md text-secondary-400 mt-4 rounded-2xl border border-dashed divide-dashed border-secondary-400 p-12 flex-center gap-1 hover:border-primary-700 hover:text-primary-700 transition-colors"
          onClick={() => setOpen(true)}
          aria-label={t("addOpeningBalanceAria")}
          title={t("addOpeningBalanceAria")}
        >
          <Add size={24} className="text-inherit" />
          {t("addOpeningBalanceWithPlus")}
        </button>
      ) : (
        <div className="space-y-4 mt-2">
          <div className="flex justify-end">
            <Button
              size="sm"
              className="rounded-md"
              onClick={() => setOpen(true)}
            >
              <Add size={16} />
              {t("addOpeningBalance")}
            </Button>
          </div>

          <OpeningBalanceTable
            rows={rows}
            loading={loading}
            page={page}
            lastPage={lastPage}
            onPageChange={setPage}
          />
        </div>
      )}

      <OpeningBalanceDialog
        warehouseId={warehouseId}
        open={open}
        onOpenChange={setOpen}
        warehouseName={warehouseName}
        onSaved={handleSaved}
      />
    </>
  );
}
