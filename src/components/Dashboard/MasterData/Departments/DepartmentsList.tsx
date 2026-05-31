"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { SearchNormal } from "iconsax-reactjs";
import Pagination from "@/components/ui/pagination/pagination";
import ProtectedElement from "@/components/ui/protected-element";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";

import api from "@/lib/api.client";
import { DeleteState } from "@/types/common";
import { Department } from "@/types/department";

import DepartmentsTable from "./DepartmentsTable";
import DepartmentFormDialog from "./DepartmentFormDialog";
import ImportDialog from "@/components/ui/import-dialog";

interface Props {
  title: string;
  departments: Department[];
  loading: boolean;
  totalPages: number;
  page: number;
  search: string;
  handleSearchChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  getDepartments: () => void;
}

const DepartmentsList = ({
  title,
  departments,
  loading,
  totalPages,
  page,
  search,
  handleSearchChange,
  handlePageChange,
  getDepartments,
}: Props) => {
  const t = useTranslations("");

  const [deleteState, setDeleteState] = useState<DeleteState<Department>>({
    open: false,
    loading: false,
    item: null,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const onEdit = (d: Department) => {
    setEditingDepartment(d);
    setEditOpen(true);
  };

  const onDelete = (d: Department) => {
    setDeleteState({ open: true, loading: false, item: d });
  };

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/departments/${deleteState.item.id}`);
      toast.success(t("departmentDeleted"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      getDepartments();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  // loading rules
  const isEmpty = departments.length === 0;
  const tableLoadingClass = useMemo(
    () =>
      loading && !isEmpty ? "opacity-60 pointer-events-none select-none" : "",
    [loading, isEmpty]
  );
  const shouldHideTable = loading && isEmpty;

  return (
    <div className="p-4">
      <div className="bg-white rounded-md p-4 pt-6">
        <div className="flex justify-between gap-4 flex-wrap pb-4 border-b border-neutral-white-300">
          <h1 className="ty-body-xl-2 text-primary-700">{t(title)}</h1>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />

            <ProtectedElement permissions="create-department">
              <DepartmentFormDialog onSuccess={getDepartments} />
            </ProtectedElement>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-6">
            <Input
              type="text"
              placeholder={t("searchDepartments")}
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
                <DepartmentsTable
                  departments={departments}
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
          )}

          <ProtectedElement permissions="delete-department">
            <ConfirmDeleteDialog
              preview={deleteState.open}
              onOpenChange={(open) =>
                setDeleteState((prev) => ({ ...prev, open }))
              }
              itemName={(deleteState.item?.name as string) || ""}
              deleteFn={handleDelete}
              isDeleting={deleteState.loading}
            />
          </ProtectedElement>

          <ProtectedElement permissions="edit-department">
            <DepartmentFormDialog
              mode="edit"
              departmentId={editingDepartment?.id}
              initialDepartment={editingDepartment || undefined}
              open={editOpen}
              onOpenChange={setEditOpen}
              onSuccess={getDepartments}
            />
          </ProtectedElement>
        </div>
      </div>
    </div>
  );
};

export default DepartmentsList;
