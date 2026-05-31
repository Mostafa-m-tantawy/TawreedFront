"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/pagination";
import { Filter, Upload, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import ExpiryTable from "./ExpiryTable";
import ImportDialog from "@/components/ui/import-dialog";

type ExpiryRow = {
  id: number;
  product: string;
  warehouse: string;
  batch: string;
  expiryDate: string;
  quantity: number;
  daysToExpiry: number;
};

export default function ExpiryManagement() {
  const t = useTranslations("");
  const [rows, setRows] = useState<ExpiryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [summary, setSummary] = useState({
    totalProducts: 0,
    expiring30: 0,
    critical7: 0,
  });

  // Mock data load
  const load = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      const mock: ExpiryRow[] = [
        {
          id: 1,
          product: "Product A",
          warehouse: "Main Warehouse",
          batch: "BAT-001",
          expiryDate: "6/15/2023",
          quantity: 50,
          daysToExpiry: 15,
        },
        {
          id: 2,
          product: "Product B",
          warehouse: "Supplier Warehouse",
          batch: "BAT-002",
          expiryDate: "6/15/2023",
          quantity: 100,
          daysToExpiry: 5,
        },
        {
          id: 3,
          product: "Product C",
          warehouse: "Main Warehouse",
          batch: "BAT-003",
          expiryDate: "6/15/2023",
          quantity: 56,
          daysToExpiry: 41,
        },
      ];

      setRows(mock);
      setSummary({
        totalProducts: mock.length,
        expiring30: mock.filter(
          (x) => x.daysToExpiry <= 30 && x.daysToExpiry > 7
        ).length,
        critical7: mock.filter((x) => x.daysToExpiry <= 7).length,
      });
      setLastPage(1);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows.filter((r) =>
    [r.product, r.warehouse, r.batch]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="h-full p-4 space-y-6">
      {/* Summary Cards */}
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        <h2 className="ty-body-xl-2 text-primary-700 mb-4">
          {t("Expiry Summary")}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 bg-[#F8F9FF] rounded-lg flex flex-col justify-center items-center text-center">
            <p className="text-neutral-white-800 text-sm font-medium">
              {t("Total Products")}
            </p>
            <h3 className="text-3xl font-semibold mt-1">
              {summary.totalProducts}
            </h3>
          </div>
          <div className="p-6 bg-[#FFF7E6] rounded-lg flex flex-col justify-center items-center text-center">
            <p className="text-neutral-white-800 text-sm font-medium">
              {t("Expiring in 30 Days")}
            </p>
            <h3 className="text-3xl font-semibold text-[#FF9F00] mt-1">
              {summary.expiring30}
            </h3>
          </div>
          <div className="p-6 bg-[#FFECEC] rounded-lg flex flex-col justify-center items-center text-center">
            <p className="text-neutral-white-800 text-sm font-medium">
              {t("Critical (7 Days)")}
            </p>
            <h3 className="text-3xl font-semibold text-[#F04438] mt-1">
              {summary.critical7.toString().padStart(2, "0")}
            </h3>
          </div>
        </div>
      </div>

      {/* Expiry Management */}
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">
            {t("Expiry Management")}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              placeholder={t("searchItems")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
            />
            <Button
              variant="secondary"
              className="rounded-full shadow-none font-normal w-full h-full bg-neutral-white-100"
              onClick={() => toast.info("Filter coming soon")}
            >
              <Filter className="w-4 h-4" />
              <span>{t("Filter")}</span>
            </Button>
          </div>

          {/* Table */}
          <ExpiryTable rows={filtered} loading={loading} />

          {/* Pagination */}
          <div className="my-4">
            <Pagination
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
