"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import Pagination from "@/components/ui/pagination/pagination";
import { toast } from "sonner";

import ReturnsTable from "./ReturnsTable";
import ImportDialog from "@/components/ui/import-dialog";
import { AddCircle } from "iconsax-reactjs";

type ReturnRow = {
  id: number;
  code: string;
  date: string;
  type: string;
  source: string;
  linked_doc: string;
  products: number;
  status: "Approved" | "Draft" | "Cancelled";
};

export default function ReturnsList() {
  const t = useTranslations("");
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Mock load
  const load = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      setRows([
        {
          id: 1,
          code: "PR-1001",
          date: "6/15/2023",
          type: "Purchase Return",
          source: "Supplier A",
          linked_doc: "PO-2345",
          products: 5,
          status: "Approved",
        },
        {
          id: 2,
          code: "SR-1002",
          date: "6/15/2023",
          type: "Sales Return",
          source: "Customer B",
          linked_doc: "INV-5678",
          products: 8,
          status: "Draft",
        },
        {
          id: 3,
          code: "PR-1003",
          date: "6/15/2023",
          type: "Purchase Return",
          source: "Supplier C",
          linked_doc: "PO-3456",
          products: 56,
          status: "Cancelled",
        },
      ]);
      setLastPage(1);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows.filter((r) =>
    [r.code, r.type, r.source, r.linked_doc]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">{t("Returns")}</h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <Link href={"/dashboard/inventory/returns/create"}>
              <Button
                size="md"
                className="rounded-md font-normal flex gap-2 items-center"
              >
                <AddCircle size={20} />
                {t("Add Return")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              placeholder={t("Search for returns")}
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
          <ReturnsTable
            rows={filtered}
            loading={loading}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            permissions={{
              canView: true,
              canEdit: true,
              canDelete: true,
            }}
          />

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
