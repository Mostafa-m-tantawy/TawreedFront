"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import debounce from "lodash.debounce";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AddCircle, People, SearchNormal } from "iconsax-reactjs";

import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedElement from "@/components/ui/protected-element";
import Pagination from "@/components/ui/pagination/pagination";
import SmartTable, { TableAction, TableColumn } from "./CommonMasterDataTable";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { Trash2 } from "lucide-react";
import ImportDialog from "@/components/ui/import-dialog";

type IdLike = string | number;

export type MasterDataListHandle = {
  reload: () => void;
};

export type MasterDataListProps<Row extends { id: IdLike; name?: string }> = {
  type: string;
  titleKey: string;
  endpoint: string;
  extraParams?: Record<string, unknown>;
  mapResponse?: (res: any) => { rows: Row[]; lastPage: number };
  columns: TableColumn<Row>[];
  image?: Parameters<typeof SmartTable<Row>>[0]["image"];
  status?: Parameters<typeof SmartTable<Row>>[0]["status"];
  actions?: TableAction<Row>[];
  createPermission?: string;
  deletePermission?: string;
  createHref?: string;
  createLabelKey?: string;
  searchPlaceholderKey?: string;
  emptyKey?: string;
  perPage?: number;
  apiSearchKey?: string;
  apiPageKey?: string;
  apiPerPageKey?: string;
  transformSearchValue?: (v: string) => string;
  framed?: boolean;
};

function MasterDataListInner<Row extends { id: IdLike; name?: string }>(
  props: MasterDataListProps<Row>,
  ref: React.Ref<MasterDataListHandle>
) {
  const {
    type,
    titleKey,
    endpoint,
    extraParams,
    mapResponse,
    columns,
    image,
    status,
    actions = [],
    createPermission,
    deletePermission,
    createHref,
    createLabelKey = "Create",
    searchPlaceholderKey = "Search",
    emptyKey = "empty",
    perPage = 10,
    apiSearchKey = "search",
    apiPageKey = "page",
    apiPerPageKey = "per_page",
    transformSearchValue,
    framed = true,
  } = props;

  const t = useTranslations("");

  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    per_page: perPage,
    search: "",
  });
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadCounter, setReloadCounter] = useState(0);

  // --- delete state (for ConfirmDeleteDialog) ---
  const [deleteState, setDeleteState] = useState<{
    open: boolean;
    loading: boolean;
    item: Row | null;
  }>({ open: false, loading: false, item: null });

  useImperativeHandle(ref, () => ({
    reload: () => setReloadCounter((c) => c + 1),
  }));

  const debouncedSetSearchParam = useCallback(
    debounce((value: string) => {
      setParams((prev) => ({ ...prev, page: 1, search: value }));
    }, 500),
    []
  );

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page }));

  const queryParams = useMemo(() => {
    return {
      ...(extraParams || {}),
      [apiPageKey]: params.page,
      [apiPerPageKey]: params.per_page,
      [apiSearchKey]: transformSearchValue
        ? transformSearchValue(params.search)
        : params.search,
    } as Record<string, unknown>;
  }, [
    params,
    extraParams,
    apiPageKey,
    apiPerPageKey,
    apiSearchKey,
    transformSearchValue,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function getList() {
      setLoading(true);
      try {
        const resp = await api.get(endpoint, { params: queryParams });
        const raw = resp.data;

        const { rows: mappedRows, lastPage } = mapResponse
          ? mapResponse(raw)
          : ({
              rows: (raw?.data ?? []) as Row[],
              lastPage: raw?.meta?.last_page ?? 1,
            } as { rows: Row[]; lastPage: number });

        if (!cancelled) {
          setRows(mappedRows);
          setTotalPages(lastPage || 1);
        }
      } catch (err: any) {
        if (!cancelled)
          toast.error(err?.response?.data?.message || t("fetchFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    getList();
    return () => {
      cancelled = true;
    };
  }, [endpoint, JSON.stringify(queryParams), reloadCounter]);

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedSetSearchParam(value);
  }

  // --- delete flow ---
  async function handleDelete() {
    if (!deleteState.item) return;
    setDeleteState((s) => ({ ...s, loading: true }));
    try {
      // conventional REST: DELETE {endpoint}/{id}
      await api.delete(`${endpoint}/${deleteState.item.id}`);
      toast.success(t("deletedSuccessfully"));
      setDeleteState({ open: false, loading: false, item: null });
      setReloadCounter((c) => c + 1); // refresh table
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("deleteFailed"));
      setDeleteState((s) => ({ ...s, loading: false }));
    }
  }

  const internalActions: TableAction<Row>[] = useMemo(() => {
    return [
      ...(actions || []),
      {
        key: "delete",
        labelKey: "Delete",
        variant: "destructive",
        permission: deletePermission,
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onClick: (row: Row) =>
          setDeleteState({ open: true, loading: false, item: row }),
      } as TableAction<Row>,
    ];
  }, [actions]);

  const isEmpty = rows.length === 0;
  const tableLoadingClass =
    loading && !isEmpty ? "opacity-60 pointer-events-none select-none" : "";
  const shouldHideTable = loading && isEmpty;

  const viewGroupsPermission =
    type === "customer" ? "view-customer-groups" : "view-supplier-groups";

  return (
    <div className="p-4">
      <div className="bg-white rounded-md p-4 pt-6">
        <div className="flex justify-between gap-4 flex-wrap pb-4 border-b border-neutral-white-300">
          <h1 className="ty-body-xl-2 text-primary-700">{t(titleKey)}</h1>

          <div className="flex gap-4 flex-wrap">
            <ProtectedElement permissions={viewGroupsPermission}>
              <Link href={`/dashboard/groups?type=${type}`}>
                <Button
                  variant={"secondary"}
                  size={"md"}
                  className="rounded-md font-normal"
                >
                  <People size={24} />
                  <span>{t("viewGroups")}</span>
                </Button>
              </Link>
            </ProtectedElement>

            <ImportDialog />

            {createHref && createPermission && (
              <ProtectedElement permissions={createPermission}>
                <Link href={createHref}>
                  <Button size="sm">
                    <AddCircle size={16} />
                    <span>{t(createLabelKey)}</span>
                  </Button>
                </Link>
              </ProtectedElement>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-6">
            <Input
              type="text"
              placeholder={t(searchPlaceholderKey)}
              className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
              leftIcon={<SearchNormal size={16} />}
              onChange={(e) => handleSearchChange(e.target.value)}
              value={search}
            />
          </div>

          {loading && shouldHideTable && <div>{t("loading")}</div>}

          {!shouldHideTable && (
            <>
              <div
                className={tableLoadingClass}
                aria-busy={loading && !isEmpty}
              >
                <SmartTable<Row>
                  rows={rows}
                  columns={columns}
                  image={image}
                  status={status}
                  actions={internalActions}
                  emptyKey={emptyKey}
                />
              </div>

              <div className={`w-full mt-4 ${tableLoadingClass}`}>
                <Pagination
                  currentPage={params.page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>

        {/* delete confirmation */}
        <ProtectedElement permissions={deletePermission || "*"}>
          <ConfirmDeleteDialog
            preview={deleteState.open}
            onOpenChange={(open) =>
              setDeleteState((prev) => ({ ...prev, open }))
            }
            itemName={deleteState.item?.name || ""}
            deleteFn={handleDelete}
            isDeleting={deleteState.loading}
          />
        </ProtectedElement>
      </div>
    </div>
  );
}

const MasterDataList = forwardRef(MasterDataListInner) as <
  R extends { id: IdLike; name?: string }
>(
  p: MasterDataListProps<R> & { ref?: React.Ref<MasterDataListHandle> }
) => ReturnType<typeof MasterDataListInner>;

export default MasterDataList;
