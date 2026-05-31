// QuotationsList.tsx
"use client";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import { AddCircle, SearchNormal } from "iconsax-reactjs";
import { Filter } from "lucide-react";

import QuotationsTable from "./QuotationsTable";
import type { DeleteState } from "@/types/common";
import * as api from "./salesQuotations.api";
import type { QuotationRow, QuotationStatus } from "./mockSalesQuotations";
import ImportDialog from "@/components/ui/import-dialog";
import ExportMenu from "../../Purchase/Common/ExportMenu";

type Filters = { search: string; status: QuotationStatus | "" };

export default function QuotationsList() {
  const t = useTranslations("");
  const router = useRouter();

  // search + filters (debounced searchDraft -> filters.search)
  const [filters, setFilters] = useState<Filters>({ search: "", status: "" });
  const [searchDraft, setSearchDraft] = useState("");

  // table + paging meta
  const [rows, setRows] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState({
    statuses: [] as QuotationStatus[],
  });

  // delete dialog state
  const [deleteState, setDeleteState] = useState<DeleteState<QuotationRow>>({
    open: false,
    loading: false,
    item: null,
  });

  // debounce search
  useEffect(() => {
    const h = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchDraft }));
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [searchDraft]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listQuotations({
        page,
        per_page: 10,
        // map search to both fields for mock/BE compatibility
        search: filters.search,
        customer: filters.search,
        status: filters.status,
      } as any);
      setRows(res.data);
      setLastPage(res.meta?.last_page ?? page);
      setMeta({ statuses: res.statuses });
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // actions
  const onApprove = async (r: QuotationRow) => {
    await api.approveQuotation(r.id);
    toast.success(t("Approved"));
    await load();
  };

  const onConvert = async (r: QuotationRow) => {
    try {
      await api.convertToOrder(r.id);
      toast.success(t("Converted to Sales Order"));
      // Optionally navigate to created SO:
      // router.push(`/dashboard/sales/orders/${res.salesOrderId}`);
    } catch (e: any) {
      toast.error(e?.message ?? t("operationFailed"));
    }
  };

  const onDelete = (r: QuotationRow) =>
    setDeleteState({ open: true, loading: false, item: r });

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((p) => ({ ...p, loading: true }));
    try {
      await api.deleteQuotation(deleteState.item.id);
      toast.success(t("Deleted successfully"));
    } finally {
      setDeleteState((p) => ({
        ...p,
        open: false,
        item: null,
        loading: false,
      }));
      await load();
    }
  };

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">
            {t("Sales Quotations")}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <div className="flex items-center gap-2">
              <ExportMenu />
              <Link href={"/dashboard/sales/quotations/create"}>
                <Button size="md" className="rounded-md font-normal">
                  <AddCircle size={20} />
                  <span>{t("Add Quotation")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              type="text"
              placeholder={t("searchSalesQuotations")}
              className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
              leftIcon={<SearchNormal size={16} />}
              value={searchDraft}
              onChange={(e) => {
                setSearchDraft(e.target.value);
                setPage(1);
              }}
            />
            <Button
              variant="secondary"
              className="rounded-full shadow-none font-normal w-full h-full bg-neutral-white-100"
              onClick={() => toast.info("Filter coming soon")}
            >
              <Filter className="w-4 h-4" />
              <span>{t("All Status")}</span>
            </Button>
          </div>

          {/* Table */}
          <QuotationsTable
            rows={rows}
            loading={loading}
            onView={(r) => router.push(`/dashboard/sales/quotations/${r.id}`)}
            onEdit={(r) =>
              router.push(`/dashboard/sales/quotations/${r.id}/edit`)
            }
            onApprove={onApprove}
            onConvert={onConvert}
            onDelete={onDelete}
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

      {/* Dialogs */}
      <ConfirmDeleteDialog
        preview={deleteState.open}
        onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
        itemName={deleteState.item?.code || ""}
        deleteFn={handleDelete}
        isDeleting={deleteState.loading}
      />
    </section>
  );
}
