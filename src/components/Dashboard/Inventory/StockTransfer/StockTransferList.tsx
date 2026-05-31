"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchNormal, ArrowDown2, AddCircle } from "iconsax-reactjs";
import ProtectedElement from "@/components/ui/protected-element";
import Pagination from "@/components/ui/pagination/pagination";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { DeleteState } from "@/types/common";
import { toast } from "sonner";
import api from "@/lib/api.client";
import TransferFilterDialog, { TransferFilters } from "./TransferFilterDialog";
import ConfirmTransferStatusDialog from "./ConfirmTransferStatusDialog";
import StockTransferTable, { type TransferRow } from "./StockTransferTable";
import { useAuthStore } from "@/store/authStore";
import ImportDialog from "@/components/ui/import-dialog";
import { Filter } from "lucide-react";

type Row = TransferRow;

export default function TransferList() {
  const t = useTranslations("");
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TransferFilters>({
    search: "",
    status: "",
  });

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
      const params: any = { page, per_page: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.from_warehouses_id)
        params.from_warehouses_id = filters.from_warehouses_id;
      if (filters.to_warehouses_id)
        params.to_warehouses_id = filters.to_warehouses_id;

      // LIST endpoint from screenshot
      const res = await api.get("/admin/transfer-transactions", { params });
      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};
      setRows(data);
      setLastPage(meta?.last_page ?? page);
      setMeta({ statuses: res?.data?.statuses ?? [] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.from_warehouses_id,
    filters.to_warehouses_id,
    page,
    t,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const changeStatus = async (
    id: number,
    action: "approve" | "reject" | "cancel"
  ) => {
    const path =
      action === "approve"
        ? `/admin/transfer/approve/${id}`
        : action === "cancel"
        ? `/admin/transfer/cancel/${id}`
        : `/admin/transfer/reject/${id}`;
    return api.post(path);
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
          ? t("Canceled")
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

  const onSubmitForApproval = async (r: Row) => {
    try {
      await api.post(`/admin/transfer/submit-for-approval/${r.id}`); // from screenshot
      toast.success(t("Submitted for approval"));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("submitFailed"));
    }
  };

  const onDelete = (r: Row) =>
    setDeleteState({ open: true, loading: false, item: r });
  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((p) => ({ ...p, loading: true }));
    try {
      await api.delete(`/admin/transfer/${deleteState.item.id}`);
      toast.success(t("Deleted successfully"));
      setDeleteState((p) => ({ ...p, open: false, item: null }));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((p) => ({ ...p, loading: false }));
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
            {t("Stock Transfers")}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <ProtectedElement permissions={"create-transfer-transaction"}>
              <Link href={"/dashboard/inventory/stock-transfer/create"}>
                <Button size="md" className="rounded-md font-normal">
                  <AddCircle size={20} />
                  <span>{t("New Transfer")}</span>
                </Button>
              </Link>
            </ProtectedElement>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_160px] gap-4 mb-6">
            <Input
              type="text"
              placeholder={t("search")}
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
              onClick={() => setFilterOpen(true)}
            >
              <Filter size={16} />
              <span>{t("Filter")}</span>
            </Button>
          </div>

          <div className="overflow-auto">
            <StockTransferTable
              rows={rows}
              loading={loading}
              onView={(r) =>
                router.push(`/dashboard/inventory/stock-transfer/${r.id}`)
              }
              onEdit={(r) =>
                router.push(`/dashboard/inventory/stock-transfer/${r.id}/edit`)
              }
              onSubmit={onSubmitForApproval}
              onApprove={onApprove}
              onReject={onReject}
              onCancel={onCancel}
              onDelete={onDelete}
              permissions={{
                canView: hasPermission("view-transfer-transaction"),
                canEdit: hasPermission("view-transfer-transaction"),
                canExport: true,
                canApprove: hasPermission("edit-transfer-transaction"),
                canAccept: hasPermission("approve-transfer-transaction"),
                canReject: hasPermission("reject-transfer-transaction"),
                canCancel: false,
                canDelete: hasPermission("delete-transfer-transaction"),
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

      <TransferFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initial={filters}
        statuses={meta.statuses}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      <ProtectedElement permissions={"delete-transfer-transaction"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
          itemName={deleteState.item?.code || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>

      <ConfirmTransferStatusDialog
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
