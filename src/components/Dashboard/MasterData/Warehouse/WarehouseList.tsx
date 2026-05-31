"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/pagination";
import ProtectedElement from "@/components/ui/protected-element";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";

import { ExportCurve, Filter, SearchNormal } from "iconsax-reactjs";
import { PlusCircle } from "lucide-react";

import api from "@/lib/api.client";
import WarehouseTable from "./WarehouseTable";
import WarehousesFilterDialog, {
  WarehouseFilters,
} from "./WarehousesFilterDialog";
import { Warehouse } from "@/types/warehouse";
import ImportDialog from "@/components/ui/import-dialog";
import { DeleteState } from "@/types/common";

const WarehouseList = () => {
  const t = useTranslations("");
  const router = useRouter();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<WarehouseFilters>({
    search: "",
    status: "",
    type: "",
  });

  // debounce search
  const [searchDraft, setSearchDraft] = useState("");
  useEffect(() => {
    const h = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchDraft }));
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [searchDraft]);

  // ---------- table data ----------
  const [rows, setRows] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // meta options for filters coming from backend
  const [filterMetaData, setFilterMetaData] = useState<{
    types: string[];
    statuses: string[];
  }>({ types: [], statuses: [] });

  // ---------- delete ----------
  const [deleteState, setDeleteState] = useState<DeleteState<Warehouse>>({
    open: false,
    loading: false,
    item: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 10,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status)
        params.status = filters.status !== "all" ? filters.status : "";
      if (filters.type)
        params.type = filters.type !== "all" ? filters.type : "";

      const res = await api.get("/admin/warehouses", { params });

      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};

      setRows(data as Warehouse[]);
      setLastPage(meta?.last_page ?? page);

      setFilterMetaData({
        types: res?.data?.types ?? [],
        statuses: res?.data?.statuses ?? [],
      });
    } finally {
      setLoading(false);
    }
  }, [page, filters.search, filters.status, filters.type]);

  useEffect(() => {
    void load();
  }, [load]);

  // ---------- row actions ----------
  const onView = (w: Warehouse) => router.push(`/dashboard/warehouses/${w.id}`);
  const onEdit = (w: Warehouse) =>
    router.push(`/dashboard/warehouses/${w.id}/edit`);

  const onDelete = (w: Warehouse) =>
    setDeleteState({ open: true, loading: false, item: w });

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/warehouses/${deleteState.item.id}`);
      toast.success(t("warehouseDeleted"));
      setDeleteState({ open: false, loading: false, item: null });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("deleteFailed"));
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const canCreate = useMemo(() => true, []); // or gate via permissions if you want

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">{t("Warehouses")}</h2>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />

            <ProtectedElement permissions={"create-warehouse"}>
              <Link href={"/dashboard/warehouses/create"}>
                <Button size="md" className="rounded-md font-normal">
                  <PlusCircle size={20} />
                  <span className="mr-1">{t("Add Warehouse")}</span>
                </Button>
              </Link>
            </ProtectedElement>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-auto">
          {/* Top controls */}
          <div className="grid grid-cols-[1fr_105px] gap-4 mb-6">
            <div>
              <Input
                type="text"
                placeholder={t("searchWarehouse")}
                className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
                leftIcon={<SearchNormal size={16} />}
                value={searchDraft}
                onChange={(e) => {
                  setSearchDraft(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <Button
                variant="secondary"
                className="rounded-full shadow-none font-normal w-full h-full bg-neutral-white-100"
                onClick={() => setFilterOpen(true)}
              >
                <Filter size={16} />
                <span>{t("Filter")}</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <WarehouseTable
            warehouses={rows}
            loading={loading}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Filters dialog */}
      <WarehousesFilterDialog
        metaData={filterMetaData}
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initial={filters}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      {/* Delete confirm */}
      <ProtectedElement permissions={"delete-warehouse"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((p) => ({ ...p, open }))}
          itemName={deleteState.item?.name || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>
    </section>
  );
};

export default WarehouseList;
