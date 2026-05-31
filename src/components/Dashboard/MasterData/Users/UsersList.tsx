"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SearchNormal, AddCircle } from "iconsax-reactjs";

import api from "@/lib/api.client";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/pagination";
import ProtectedElement from "@/components/ui/protected-element";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { DeleteState } from "@/types/common";
import { User } from "@/types/user";
import UsersTable from "./UsersTable";
import { Button } from "@/components/ui/button";
import ImportDialog from "@/components/ui/import-dialog";

export default function UsersList({
  users,
  loading,
  totalPages,
  page,
  search,
  handleSearchChange,
  handlePageChange,
  refetch,
}: {
  users: User[];
  loading: boolean;
  totalPages: number;
  page: number;
  search: string;
  handleSearchChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  refetch: () => void;
}) {
  const t = useTranslations("");
  const router = useRouter();

  const [deleteState, setDeleteState] = useState<DeleteState<User>>({
    open: false,
    loading: false,
    item: null,
  });

  const onView = (u: User) => router.push(`/dashboard/users/${u.id}`);
  const onEdit = (u: User) => router.push(`/dashboard/users/${u.id}/edit`);
  const onCreate = () => router.push(`/dashboard/users/create`);
  const onDelete = (u: User) =>
    setDeleteState({ open: true, loading: false, item: u });

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/users/${deleteState.item.id}`);
      toast.success(t("userDeleted"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const onChangeStatus = async (u: User) => {
    const next = u.status === "active" ? "inactive" : "active";

    try {
      await api.post(`/admin/user/change-status/${u.id}/${next}`);

      toast.success(
        next === "active"
          ? t("userActivated") ?? t("userUpdated")
          : t("userDeactivated") ?? t("userUpdated")
      );

      refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("updateFailed"));
    }
  };

  const isEmpty = users.length === 0;
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
          <h1 className="ty-body-xl-2 text-primary-700">{t("Users")}</h1>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />
            <ProtectedElement permissions="create-users">
              <Button size="sm" onClick={onCreate}>
                <AddCircle size={16} />
                {t("Add User")}
              </Button>
            </ProtectedElement>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-6">
            <Input
              type="text"
              placeholder={t("searchUsers")}
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
                <UsersTable
                  users={users}
                  onView={onView}
                  onChangeStatus={onChangeStatus}
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

          <ProtectedElement permissions="delete-users">
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
    </div>
  );
}
