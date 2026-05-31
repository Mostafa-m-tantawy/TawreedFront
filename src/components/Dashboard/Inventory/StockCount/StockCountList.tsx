"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { toast } from "sonner";
import { AddCircle, SearchNormal } from "iconsax-reactjs";
import { Filter } from "lucide-react";
import ProtectedElement from "@/components/ui/protected-element";

import StockCountTable from "./StockCountTable";
import type { DeleteState } from "@/types/common";

import * as api from "./stockCounts.api";
import type { StockCountRow } from "./mockStockCounts";
import ImportDialog from "@/components/ui/import-dialog";
import ConfirmStockCountStatusDialog from "./ConfirmStockCountStatusDialog";

type Filters = { search: string; status: string | "" };

export default function StockCountsList() {
  const t = useTranslations("");
  const router = useRouter();

  const [filters, setFilters] = useState<Filters>({ search: "", status: "" });
  const [searchDraft, setSearchDraft] = useState("");

  const [rows, setRows] = useState<StockCountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState({ statuses: [] as string[] });

  const [deleteState, setDeleteState] = useState<DeleteState<StockCountRow>>({
    open: false,
    loading: false,
    item: null,
  });

  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject" | "cancel";
    id: number | null;
    code: string;
    loading: boolean;
  }>({ open: false, action: "approve", id: null, code: "", loading: false });

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
      const res = await api.listCounts({
        page,
        per_page: 10,
        search: filters.search,
        status: filters.status as any,
      });
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
  const onSubmitForApproval = async (r: StockCountRow) => {
    await api.submitForApproval(r.id);
    toast.success(t("Submitted for approval"));
    await load();
  };

  const onApprove = (r: StockCountRow) =>
    setStatusDlg({
      open: true,
      action: "approve",
      id: r.id,
      code: r.code,
      loading: false,
    });

  const onReject = (r: StockCountRow) =>
    setStatusDlg({
      open: true,
      action: "reject",
      id: r.id,
      code: r.code,
      loading: false,
    });

  const onCancel = (r: StockCountRow) =>
    setStatusDlg({
      open: true,
      action: "cancel",
      id: r.id,
      code: r.code,
      loading: false,
    });

  const confirmStatus = async () => {
    if (!statusDlg.id) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await api.changeStatus(statusDlg.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("Approved")
          : statusDlg.action === "cancel"
          ? t("Cancelled")
          : t("Rejected")
      );
      setStatusDlg((s) => ({ ...s, open: false }));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("operationFailed"));
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  const onDelete = (r: StockCountRow) =>
    setDeleteState({ open: true, loading: false, item: r });
  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((p) => ({ ...p, loading: true }));
    try {
      await api.deleteCount(deleteState.item.id);
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
          <h2 className="ty-body-xl-2 text-primary-700">{t("Stock Counts")}</h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <Link href={"/dashboard/inventory/stock-counts/create"}>
              <Button size="md" className="rounded-md font-normal">
                <AddCircle size={20} />
                <span>{t("Start Count")}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              type="text"
              placeholder={t("searchCount")}
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
              <span>{t("Filter")}</span>
            </Button>
          </div>

          {/* Table */}
          <StockCountTable
            rows={rows}
            loading={loading}
            onView={(r) =>
              router.push(`/dashboard/inventory/stock-counts/${r.id}`)
            }
            onEdit={(r) =>
              router.push(`/dashboard/inventory/stock-counts/${r.id}/edit`)
            }
            onSubmit={onSubmitForApproval}
            onApprove={onApprove}
            onReject={onReject}
            onCancel={onCancel}
            onDelete={onDelete}
            permissions={{
              canView: true,
              canEdit: true,
              canExport: true,
              canApprove: true, // submit from Draft
              canAccept: true, // accept when Pending
              canReject: true, // reject when Pending
              canCancel: false,
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

      {/* Dialogs */}
      {/* <ProtectedElement permissions={"delete-stock-count"}> */}
      <ConfirmDeleteDialog
        preview={deleteState.open}
        onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
        itemName={deleteState.item?.code || ""}
        deleteFn={handleDelete}
        isDeleting={deleteState.loading}
      />
      {/* </ProtectedElement> */}

      <ConfirmStockCountStatusDialog
        code={statusDlg.code}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </section>
  );
}
