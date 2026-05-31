import { Input } from "@/components/ui/input";
import { SearchNormal } from "iconsax-reactjs";
import InventoryTable from "./InventoryTable";
import Pagination from "@/components/ui/pagination/pagination";
import { useState, useMemo } from "react";
import { DeleteState, Status } from "@/types/common";
import { toast } from "sonner";
import api from "@/lib/api.client";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import ProtectedElement from "@/components/ui/protected-element";
import InventoryFormDialog from "./InventoryFormDialog/InventoryFormDialog";
import { Inventory } from "@/types/inventory";
import InventoryCategoriesList from "./InventoryCategoriesList";

interface Props {
  inventoryType: any;
  inventoryData: Inventory[];
  t: any;
  loading: boolean;
  totalPages: number;
  page: number;
  handleSearchChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  search: string;
  status: Status;
  applyStatusFilter: (status: Status) => void;
  getInventory: () => void;
}

const categoryIds = [
  "finished-goods-category",
  "raw-material-category",
  "product-categories",
];

const isCatogory = (id: any) => categoryIds.includes(id);

const InventoryList = ({
  inventoryType,
  inventoryData,
  t,
  loading,
  totalPages,
  page,
  handleSearchChange,
  handlePageChange,
  search,
  status,
  applyStatusFilter,
  getInventory,
}: Props) => {
  const [deleteState, setDeleteState] = useState<DeleteState<Inventory>>({
    open: false,
    loading: false,
    item: null,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);

  const onView = (inventory: Inventory) => {};

  const onEdit = (inventory: Inventory) => {
    setEditingItem(inventory);
    setEditOpen(true);
  };

  const onDelete = (inventory: Inventory) => {
    setDeleteState({ open: true, loading: false, item: inventory });
  };

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      const endpoint =
        inventoryType.endpoints.delete + `/${deleteState.item.id}`;
      await api.delete(endpoint);
      toast.success(t("itemDeleted"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      getInventory();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  // ------- loading UI rules for the table ----------
  const isEmpty = inventoryData.length === 0;
  const tableLoadingClass = useMemo(
    () =>
      loading && !isEmpty ? "opacity-60 pointer-events-none select-none" : "",
    [loading, isEmpty]
  );
  const shouldHideTable = loading && isEmpty;

  return (
    <div className="p-4 rounded-md bg-white">
      <div className="p-4 flex justify-between gap-4 flex-wrap border-b border-neutral-white-300">
        <h1 className="ty-body-lg-2 text-primary-700">{t(inventoryType.id)}</h1>

        <ProtectedElement permissions={inventoryType.permissions.create}>
          <InventoryFormDialog
            inventoryType={inventoryType}
            onSuccess={getInventory}
          />
        </ProtectedElement>
      </div>

      <div className="mt-4">
        <div className="mb-6 grid sm:grid-cols-[1fr_auto] gap-4 sm:gap-2 items-center">
          <div>
            <Input
              type="text"
              placeholder={t("search")}
              className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
              leftIcon={<SearchNormal size={16} />}
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
              value={search}
            />
          </div>

          <div className="flex gap-2 items-center">
            {(["all", "active", "inactive"] as const).map((k) => {
              const selected = status === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => applyStatusFilter(k)}
                  className={[
                    "px-3 py-2 rounded-md ty-body-sm transition",
                    "border",
                    selected
                      ? "bg-primary-100 border-transparent text-primary-700"
                      : "bg-transparent border-transparent text-[#374151] hover:bg-neutral-white-100",
                  ].join(" ")}
                  aria-pressed={selected}
                >
                  {t(k)}
                </button>
              );
            })}
          </div>
        </div>

        {loading && shouldHideTable && <div>{t("loading")}</div>}
        {!shouldHideTable &&
          (isCatogory(inventoryType.id) ? (
            <div className={tableLoadingClass} aria-busy={loading && !isEmpty}>
              <InventoryCategoriesList
                type={inventoryType.id}
                inventoryData={inventoryData}
                permissions={inventoryType.permissions}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ) : (
            <>
              <div
                className={tableLoadingClass}
                aria-busy={loading && !isEmpty}
              >
                <InventoryTable
                  type={inventoryType.id}
                  inventoryData={inventoryData}
                  tableKeys={inventoryType.tableKeys}
                  permissions={inventoryType.permissions}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>

              <div className={`w-full mt-4 ${tableLoadingClass}`}>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          ))}

        <ProtectedElement permissions={inventoryType.permissions.delete}>
          <ConfirmDeleteDialog
            preview={deleteState.open}
            onOpenChange={(open) => {
              setDeleteState((prev) => ({ ...prev, open }));
            }}
            itemName={deleteState.item?.name || ""}
            deleteFn={handleDelete}
            isDeleting={deleteState.loading}
          />
        </ProtectedElement>

        <ProtectedElement permissions={inventoryType.permissions.edit}>
          <InventoryFormDialog
            mode="edit"
            open={editOpen}
            onOpenChange={setEditOpen}
            inventoryType={inventoryType}
            inventoryIdToEdit={editingItem?.id}
            initialInventory={editingItem || undefined}
            onSuccess={() => {
              setEditOpen(false);
              getInventory();
            }}
          />
        </ProtectedElement>
      </div>
    </div>
  );
};

export default InventoryList;
