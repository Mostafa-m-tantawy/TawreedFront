"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import api from "@/lib/api.client";

import WarehouseHeader from "./WarehouseHeader";
import OpeningBalanceTab from "./OpeningBalanceTab/OpeningBalanceTab";
import InventoryStockTab from "./InventoryStockTab";
import IncomingShipmentsTab from "./IncomingShipmentsTab";
import OutgoingShipmentsTab from "./OutgoingShipmentsTab";
import TransferTab from "./TransferTab";
import WarehouseTabsHeader from "./WarehouseTabsHeader";
import { ViewWarehouse, Warehouse } from "@/types/warehouse";

type TabKey = "opening" | "stock" | "incoming" | "outgoing" | "transfer";

const TAB_VALUES: TabKey[] = [
  "opening",
  "stock",
  "incoming",
  "outgoing",
  "transfer",
];
const isTab = (v: string | null): v is TabKey =>
  !!v && (TAB_VALUES as string[]).includes(v);

const DEFAULT_TABS: Pick<
  ViewWarehouse,
  "openingBalance" | "stock" | "incoming" | "outgoing" | "transfers"
> = {
  openingBalance: { exists: false },
  stock: [
    {
      product: "Widget A",
      sku: "WA-001",
      qty: 1500,
      unit: "PCS",
      reorder: 300,
      status: "in",
    },
    {
      product: "Widget B",
      sku: "WB-002",
      qty: 34,
      unit: "PCS",
      reorder: 20,
      status: "out",
    },
  ],
  incoming: [
    {
      id: "IN-001",
      supplier: "Acme Supplies",
      date: "2024-11-30",
      items: 5,
      status: "Scheduled",
    },
  ],
  outgoing: [
    {
      id: "OUT-001",
      destination: "Retail Store #12",
      date: "2024-11-25",
      items: 3,
      status: "Delivered",
    },
  ],
  transfers: [
    {
      id: "TR-001",
      source: "Central",
      destination: "West Hub",
      date: "2024-11-29",
      items: 2,
      status: "Scheduled",
    },
  ],
};

function normalizeCapacity(v: Warehouse["capacity"]): string {
  if (v == null || v === "") return "—";
  if (typeof v === "string") return v;
  return `${v.toLocaleString()} units`;
}

function toViewModel(apiData: Warehouse): ViewWarehouse {
  return {
    id: apiData.id,
    name: apiData.name ?? "—",
    address: apiData.address ?? "—",
    manager: apiData.manager?.name ?? "—",
    phone: apiData.contact_number ?? "—",
    capacity: normalizeCapacity(apiData.capacity),
    status: apiData.status === "inactive" ? "inactive" : "active",
    ...DEFAULT_TABS, // keep your UI alive until backend provides these
  };
}

export default function ShowWarehouse({ id }: { id: number }) {
  const t = useTranslations("warehouse");
  const locale = useLocale();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTab = React.useMemo<TabKey>(
    () =>
      isTab(searchParams.get("tab"))
        ? (searchParams.get("tab") as TabKey)
        : "opening",
    []
  );

  const [tab, setTab] = React.useState<TabKey>(initialTab);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<ViewWarehouse | null>(null);

  React.useEffect(() => {
    const qTab = searchParams.get("tab");
    const next = isTab(qTab) ? (qTab as TabKey) : "opening";
    setTab((prev) => (prev === next ? prev : next));
  }, [searchParams]);

  const handleTabChange = (next: TabKey) => {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/admin/warehouses/${id}`);
        const view = toViewModel(res.data?.data);
        if (!cancelled) setData(view);
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

  return (
    <div className="space-y-4 p-4">
      <div className="mb-4">
        <Link
          href="/dashboard/warehouses"
          className="ty-body-sm text-primary-700 w-fit"
        >
          ← {t("backToWarehouses")}
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
          <WarehouseHeader
            name={data.name}
            address={data.address}
            manager={data.manager}
            phone={data.phone}
            capacity={data.capacity}
            status={data.status}
          />

          <div className="mt-4 rounded-2xl bg-white">
            <WarehouseTabsHeader active={tab} onChange={handleTabChange} />
            <div className="px-6 pb-6 pt-4">
              {tab === "opening" && (
                <OpeningBalanceTab warehouseId={id} warehouseName={data.name} />
              )}
              {tab === "stock" && <InventoryStockTab rows={[]} />}
              {tab === "incoming" && (
                <IncomingShipmentsTab rows={data.incoming} />
              )}
              {tab === "outgoing" && (
                <OutgoingShipmentsTab rows={data.outgoing} />
              )}
              {tab === "transfer" && <TransferTab rows={data.transfers} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
