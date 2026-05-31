"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchNormal, AddCircle } from "iconsax-reactjs";
import ProtectedElement from "@/components/ui/protected-element";
import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { DeleteState } from "@/types/common";
import { toast } from "sonner";
import api from "@/lib/api.client";
import ImportDialog from "@/components/ui/import-dialog";
import { Filter } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Mock fallback (used only when the real API fails)
import * as mock from "./mockStockAdjustments";
import AdjustmentTable from "./AdjustmentTable";
import ConfirmAdjustmentStatusDialog from "./ConfirmAdjustmentStatusDialog";

type Row = mock.AdjustmentRow;

type Filters = {
  search: string;
  status: mock.AdjustmentStatus | "";
};

export default function StockAdjustmentsList() {
  const t = useTranslations("");
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const [filterOpen] = useState(false); // placeholder for a future status filter dialog
  const [filters, setFilters] = useState<Filters>({ search: "", status: "" });

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [meta, setMeta] = useState({ statuses: [] as string[] });

  const [deleteState, setDeleteState] = useState<DeleteState<Row>>({
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

  const [searchDraft, setSearchDraft] = useState("");

  // Debounced search -> filters.search
  useEffect(() => {
    const h = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchDraft }));
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [searchDraft]);

  // Load list: try real API, fallback to mock on error
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      // Real endpoint (mirrors Stock Transfer behavior)
      const res = await api.get("/admin/stock-adjustments", { params });
      const data = (res?.data?.data ?? []) as Row[];
      const meta = res?.data?.meta ?? {};
      setRows(data);
      setLastPage(meta?.last_page ?? page);
      setMeta({ statuses: res?.data?.statuses ?? [] });
    } catch {
      // Fallback to mock
      const res = await mock.listAdjustments({
        page,
        per_page: 10,
        search: filters.search,
        status: filters.status,
      });
      setRows(res.data);
      setLastPage(res.meta?.last_page ?? page);
      setMeta({ statuses: res.statuses });
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Row actions (Approve/Reject/Cancel) — same pattern as transfers, with fallback
  const changeStatus = async (
    id: number,
    action: "approve" | "reject" | "cancel"
  ) => {
    const path =
      action === "approve"
        ? `/admin/stock-adjustment/approve/${id}`
        : action === "cancel"
        ? `/admin/stock-adjustment/cancel/${id}`
        : `/admin/stock-adjustment/reject/${id}`;
    try {
      return await api.post(path);
    } catch {
      await mock.changeStatus(id, action);
    }
  };

  const confirmStatus = async () => {
    if (!statusDlg.id) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changeStatus(statusDlg.id, statusDlg.action);
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

  const onApprove = (r: Row) =>
    setStatusDlg({
      open: true,
      action: "approve",
      id: r.id,
      code: r.code,
      loading: false,
    });
  const onReject = (r: Row) =>
    setStatusDlg({
      open: true,
      action: "reject",
      id: r.id,
      code: r.code,
      loading: false,
    });
  const onCancel = (r: Row) =>
    setStatusDlg({
      open: true,
      action: "cancel",
      id: r.id,
      code: r.code,
      loading: false,
    });

  const onSubmitForApproval = async (r: Row) => {
    try {
      await api.post(`/admin/stock-adjustment/submit-for-approval/${r.id}`);
      toast.success(t("Submitted for approval"));
    } catch {
      await mock.submitForApproval(r.id);
      toast.success(t("Submitted for approval (mock)"));
    } finally {
      await load();
    }
  };

  const onDelete = (r: Row) =>
    setDeleteState({ open: true, loading: false, item: r });
  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((p) => ({ ...p, loading: true }));
    try {
      await api.delete(`/admin/stock-adjustments/${deleteState.item.id}`);
    } catch {
      await mock.deleteAdjustment(deleteState.item.id);
    } finally {
      toast.success(t("Deleted successfully"));
      setDeleteState((p) => ({ ...p, open: false, item: null }));
      await load();
    }
  };

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">
            {t("Stock Adjustments")}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            {/* <ProtectedElement permissions={"create-stock-adjustment"}> */}
            <Link href={"/dashboard/inventory/stock-adjustments/create"}>
              <Button size="md" className="rounded-md font-normal">
                <AddCircle size={20} />
                <span>{t("Add Adjustment")}</span>
              </Button>
            </Link>
            {/* </ProtectedElement> */}
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              type="text"
              placeholder={t("searchAdjustments")}
              className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
              leftIcon={<SearchNormal size={16} />}
              value={searchDraft}
              onChange={(e) => {
                setSearchDraft(e.target.value);
                setPage(1);
              }}
            />

            <Button
              variant={"secondary"}
              className="rounded-full shadow-none font-normal w-full h-full bg-neutral-white-100"
              onClick={() => toast.info(t("Filter coming soon"))}
            >
              <Filter size={16} />
              <span>{t("Filter")}</span>
            </Button>
          </div>

          <div className="overflow-auto">
            <AdjustmentTable
              rows={rows}
              loading={loading}
              onView={(r) =>
                router.push(`/dashboard/inventory/stock-adjustments/${r.id}`)
              }
              onEdit={(r) =>
                router.push(
                  `/dashboard/inventory/stock-adjustments/${r.id}/edit`
                )
              }
              onSubmit={onSubmitForApproval}
              onApprove={onApprove}
              onReject={onReject}
              onCancel={onCancel}
              onDelete={onDelete}
              permissions={{
                canView: true, // hasPermission("view-stock-adjustment"),
                canEdit: true, // hasPermission("edit-stock-adjustment"),
                canExport: false,
                canApprove: true, // hasPermission("edit-stock-adjustment"),
                canAccept: true, // hasPermission("approve-stock-adjustment"),
                canReject: true, // hasPermission("reject-stock-adjustment"),
                canCancel: false,
                canDelete: true, // hasPermission("delete-stock-adjustment"),
              }}
            />
          </div>

          <div className="my-4">
            <Pagination
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <ProtectedElement permissions={"delete-stock-adjustment"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
          itemName={deleteState.item?.code || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>

      <ConfirmAdjustmentStatusDialog
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
