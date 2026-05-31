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

import PurchaseInvoicesTable from "./PurchaseInvoicesTable";
import type { PurchaseInvoice } from "@/types/purchase-invoice";

import ExportMenu from "../Common/ExportMenu";
import ImportDialog from "@/components/ui/import-dialog";
import PurchaseFilterDialog from "../Common/PurchaseFilterDialog";
import ConfirmStatusDialog from "../PurchaseOrders/ConfirmPOStatusDialog"; // reuse same dialog

type InvoiceFilters = { search: string; status: string };

export default function PurchaseInvoicesList() {
  const t = useTranslations("");
  const router = useRouter();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "",
  });

  const [rows, setRows] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filterMetaData, setFilterMetaData] = useState({
    status: [] as string[],
  });

  const [deleteState, setDeleteState] = useState<DeleteState<PurchaseInvoice>>({
    open: false,
    loading: false,
    item: null,
  });

  // approve/reject dialog (reuse PO dialog)
  const [statusDlg, setStatusDlg] = useState<{
    open: boolean;
    action: "approve" | "reject";
    invoice: PurchaseInvoice | null;
    loading: boolean;
  }>({ open: false, action: "approve", invoice: null, loading: false });

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

      const res = await api.get("/admin/purchase-invoices", { params });
      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};

      setRows(data);
      setLastPage(meta?.last_page ?? page);
      // API shows this as `statuses`
      setFilterMetaData({ status: res?.data?.statuses ?? [] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // navigation
  const onView = (inv: PurchaseInvoice) =>
    router.push(`/dashboard/purchase/invoices/${inv.id}`);
  const onEdit = (inv: PurchaseInvoice) =>
    router.push(`/dashboard/purchase/invoices/${inv.id}/edit`);
  const onExport = (_inv: PurchaseInvoice) =>
    toast.success(t("Export started"));

  // status actions
  async function changeInvoiceStatus(
    invoiceId: number,
    action: "approve" | "reject"
  ) {
    const path =
      action === "approve"
        ? `/admin/purchase-invoices/approve/${invoiceId}`
        : `/admin/purchase-invoices/reject/${invoiceId}`;
    return api.post(path);
  }

  const onSubmitForApproval = async (inv: PurchaseInvoice) => {
    setLoading(true);
    try {
      // note: endpoint spelling per spec: "approvel"
      const path = `/admin/purchase-invoices/submit-for-approvel/${inv.id}`;
      await api.post(path);
      toast.success(t("purchaseInvoiceSubmitted"));
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("submitFailed"));
    } finally {
      setLoading(false);
    }
  };

  const onAccept = (inv: PurchaseInvoice) =>
    setStatusDlg({
      open: true,
      action: "approve",
      invoice: inv,
      loading: false,
    });

  const onReject = (inv: PurchaseInvoice) =>
    setStatusDlg({
      open: true,
      action: "reject",
      invoice: inv,
      loading: false,
    });

  const confirmStatus = async () => {
    if (!statusDlg.invoice) return;
    setStatusDlg((s) => ({ ...s, loading: true }));
    try {
      await changeInvoiceStatus(statusDlg.invoice.id, statusDlg.action);
      toast.success(
        statusDlg.action === "approve"
          ? t("purchaseInvoice.approvedToast")
          : t("purchaseInvoice.rejectedToast")
      );
      setStatusDlg((s) => ({ ...s, open: false, invoice: null }));
      await load();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("purchaseInvoice.failedToast")
      );
    } finally {
      setStatusDlg((s) => ({ ...s, loading: false }));
    }
  };

  // delete
  const onDelete = (inv: PurchaseInvoice) =>
    setDeleteState({ open: true, loading: false, item: inv });

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/purchase-invoices/${deleteState.item.id}`);
      toast.success(t("Deleted successfully"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      await load();
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
            {t("Purchase Invoices")}
          </h2>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <ExportMenu />
            <ProtectedElement permissions={"create-purchase-invoices"}>
              <Link href={"/dashboard/purchase/invoices/create"}>
                <Button size="md" className="rounded-md font-normal">
                  <AddCircle size={20} />
                  <span>{t("Add Purchase invoice")}</span>
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
          <PurchaseInvoicesTable
            rows={rows}
            loading={loading}
            onView={onView}
            onEdit={onEdit}
            onSubmitForApproval={onSubmitForApproval}
            onExport={onExport}
            onAccept={onAccept}
            onReject={onReject}
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
          setFilters(f as InvoiceFilters);
          setPage(1);
        }}
      />

      <ProtectedElement permissions={"delete-purchase-invoices"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
          itemName={
            deleteState.item?.invoice_number || deleteState.item?.code || ""
          }
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>

      <ConfirmStatusDialog
        poCode={
          statusDlg.invoice?.invoice_number || statusDlg.invoice?.code || ""
        }
        action={statusDlg.action}
        isOpen={statusDlg.open}
        onOpenChange={(open) => setStatusDlg((s) => ({ ...s, open }))}
        onConfirm={confirmStatus}
        loading={statusDlg.loading}
      />
    </section>
  );
}
