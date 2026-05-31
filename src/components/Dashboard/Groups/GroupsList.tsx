import { Input } from "@/components/ui/input";
import { Group, GroupMember } from "@/types/group";
import { SearchNormal } from "iconsax-reactjs";
import GroupsTable from "./GroupsTable";
import Pagination from "@/components/ui/pagination/pagination";
import { useState, useMemo } from "react";
import { DeleteState } from "@/types/common";
import { toast } from "sonner";
import api from "@/lib/api.client";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import ProtectedElement from "@/components/ui/protected-element";
import GroupFormDialog from "./GroupFormDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MembersTable from "./MembersTable";

interface Props {
  permissions: {
    view: string;
    create: string;
    edit: string;
    delete: string;
  };
  type: string;
  title: string;
  groups: Group[];
  t: any;
  loading: boolean;
  totalPages: number;
  page: number;
  handleSearchChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  search: string;
  getGroups: () => void;
}

const GroupsList = ({
  permissions,
  type,
  title,
  groups,
  t,
  loading,
  totalPages,
  page,
  handleSearchChange,
  handlePageChange,
  search,
  getGroups,
}: Props) => {
  const [deleteState, setDeleteState] = useState<DeleteState<Group>>({
    open: false,
    loading: false,
    item: null,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const baseEndpoint =
    type === "customer" ? "/admin/customer-groups" : "/admin/supplier-groups";

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);

  const onView = (group: Group) => {
    setViewingGroup(group);
    setViewOpen(true);
    if (group.members) setMembers(group.members);
  };

  const onEdit = (group: Group) => {
    setEditingGroup(group);
    setEditOpen(true);
  };
  const onDelete = (group: Group) => {
    setDeleteState({ open: true, loading: false, item: group });
  };

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`${baseEndpoint}/${deleteState.item.id}`);
      toast.success(t("groupDeleted"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      getGroups();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const isEmpty = groups.length === 0;
  const tableLoadingClass = useMemo(
    () =>
      loading && !isEmpty ? "opacity-60 pointer-events-none select-none" : "",
    [loading, isEmpty]
  );
  const shouldHideTable = loading && isEmpty;

  return (
    <div className="p-4 rounded-md bg-white">
      <div className="p-4 flex justify-between gap-4 flex-wrap border-b border-neutral-white-300">
        <h1 className="ty-body-lg-2 text-primary-700">{t(title)}</h1>

        <ProtectedElement permissions={permissions.create}>
          <GroupFormDialog type={type} onSuccess={getGroups} />
        </ProtectedElement>
      </div>

      <div className="mt-4">
        <div className="mb-6">
          <Input
            type="text"
            placeholder={t("searchGroups")}
            className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
            leftIcon={<SearchNormal size={16} />}
            onChange={(e) => handleSearchChange(e.target.value)}
            value={search}
          />
        </div>

        {loading && shouldHideTable && <div>{t("loading")}</div>}

        {!shouldHideTable && (
          <>
            <div className={tableLoadingClass} aria-busy={loading && !isEmpty}>
              <GroupsTable
                permissions={permissions}
                type={type}
                groups={groups}
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
        )}

        <ProtectedElement permissions={permissions.delete}>
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

        <ProtectedElement permissions={permissions.edit}>
          <GroupFormDialog
            mode="edit"
            type={type}
            groupId={editingGroup?.id}
            initialGroup={editingGroup || undefined}
            open={editOpen}
            onOpenChange={setEditOpen}
            onSuccess={getGroups}
          />
        </ProtectedElement>

        <Dialog
          open={viewOpen}
          onOpenChange={(o) => {
            setViewOpen(o);
            if (!o) {
              setViewingGroup(null);
              setMembers([]);
            }
          }}
        >
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-center">
                <span className="text-secondary-700 ty-body-xl-2">
                  {t("Group Members")}{" "}
                  {viewingGroup ? `— ${viewingGroup.name}` : ""}
                </span>
              </DialogTitle>
            </DialogHeader>

            <MembersTable items={members} t={t} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GroupsList;
