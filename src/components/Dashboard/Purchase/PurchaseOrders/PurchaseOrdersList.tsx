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

import PurchaseOrdersTable from "./PurchaseOrdersTable";
import type { PurchaseOrder } from "@/types/purchase-order";
import ExportMenu from "../Common/ExportMenu";
import ImportDialog from "@/components/ui/import-dialog";
import PurchaseFilterDialog, {
  POFilters,
} from "../Common/PurchaseFilterDialog";
import ConfirmStatusDialog from "./ConfirmPOStatusDialog";

export default function PurchaseOrdersList() {
  const t = useTranslations("");
  const router = useRouter();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<POFilters>({ search: "", status: "" });

  const [rows, setRows] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filterMetaData, setFilterMetaData] = useState({
    status: [],
  });

  const [deleteState, setDeleteState] = useState<DeleteState<PurchaseOrder>>({
    open: false,
    loading: false,
    item: null,
  });
  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject" | "cancel";
    po: PurchaseOrder | null;
    loading: boolean;
  }>({ open: false, action: "approve", po: null, loading: false });

  // debounce search
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
      const params: any = { page, per_page: 20 };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const res = await api.get("/admin/purchase-orders", { params });

      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};

      setRows(data);
      setLastPage(meta?.last_page ?? page);
      setFilterMetaData({ status: res?.data?.statuses ?? [] });
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // row handlers
  const onView = (po: PurchaseOrder) =>
    router.push(`/dashboard/purchase/orders/${po.id}`);

  const onEdit = (po: PurchaseOrder) =>
    router.push(`/dashboard/purchase/orders/${po.id}/edit`);

  const onExport = (_po: PurchaseOrder) => toast.success(t("Export started"));

  const onSubmitForApproval = async (po: PurchaseOrder) => {
    setLoading(true);
    try {
      const path = `admin/purchase-orders/submit-for-approvel/${po.id}`;

      await api.post(path);

      toast.success(t("purchaseOrderSubmitted"));
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };
  const onAccept = (po: PurchaseOrder) =>
    setStatusDlg({ open: true, action: "approve", po, loading: false });

  const onReject = (po: PurchaseOrder) =>
    setStatusDlg({ open: true, action: "reject", po, loading: false });

  const onCancel = (po: PurchaseOrder) =>
    setStatusDlg({ open: true, action: "cancel", po, loading: false });

  const onDelete = (po: PurchaseOrder) =>
    setDeleteState({ open: true, loading: false, item: po });

  const onAddInvoice = (po: PurchaseOrder) =>
    router.push(`/dashboard/purchase/invoices/create?po=${po.id}`);

  async function changePOStatus(
    purchaseOrderId: number,
    action: "approve" | "reject" | "cancel"
  ) {
    const path =
      action === "approve"
        ? `/admin/purchase-orders/approve/${purchaseOrderId}`
        : action === "cancel"
        ? `/admin/purchase-orders/cancel/${purchaseOrderId}`
        : `/admin/purchase-orders/reject/${purchaseOrderId}`;
    return api.post(path);
  }

  const confirmStatus = async () => {
    if (!statusDlg.po) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changePOStatus(statusDlg.po.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("purchaseOrder.approvedToast")
          : statusDlg.action === "cancel"
          ? t("purchaseOrder.canceledToast")
          : t("purchaseOrder.rejectedToast")
      );
      setStatusDlg((s) => ({ ...s, open: false, po: null }));
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("purchaseOrder.failedToast"));
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/purchase-orders/${deleteState.item.id}`, {
        params: {
          status: deleteState.item.status,
        },
      });

      toast.success(t("Deleted successfully"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        {/* header */}
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">
            {t("Purchase Order")}
          </h2>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <ExportMenu />

            <ProtectedElement permissions={"create-purchase-orders"}>
              <Link href={"/dashboard/purchase/orders/create"}>
                <Button size="md" className="rounded-md font-normal">
                  <AddCircle size={20} />
                  <span>{t("Add Purchase order")}</span>
                </Button>
              </Link>
            </ProtectedElement>
          </div>
        </div>

        {/* search + filter */}
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
              {t("All Status")} <ArrowDown2 size={20} />
            </Button>
          </div>

          {/* table */}
          <PurchaseOrdersTable
            rows={rows}
            loading={loading}
            onView={onView}
            onEdit={onEdit}
            onSubmitForApproval={onSubmitForApproval}
            onExport={onExport}
            onAccept={onAccept}
            onAddInvoice={onAddInvoice}
            onReject={onReject}
            onCancel={onCancel}
            onDelete={onDelete}
          />

          {/* pager */}
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <PurchaseFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initial={filters}
        statuses={filterMetaData.status}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      <ProtectedElement permissions={"delete-purchase-orders"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
          itemName={deleteState.item?.code || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>

      <ConfirmStatusDialog
        poCode={statusDlg.po?.code || ""}
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </section>
  );
}
