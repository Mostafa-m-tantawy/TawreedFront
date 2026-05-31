import { Button } from "@/components/ui/button";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import SkeletonsLoader from "@/components/ui/skeleton-loader";
import api from "@/lib/api.client";
import { Role } from "@/types/role";
import { Diamonds, Edit, Trash } from "iconsax-reactjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import RoleFormDialog from "./RoleFormDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProtectedElement from "@/components/ui/protected-element";

interface Props {
  activeRole: Role;
  setActiveRole: React.Dispatch<React.SetStateAction<Role>>;
  loading: boolean;
  roles: Role[];
  t: any;
  retry: () => void;
  onEditClick: (id: number) => void;
  children?: React.ReactNode;
}

const AvailableRoles = ({
  activeRole,
  setActiveRole,
  roles,
  loading,
  t,
  retry,
  onEditClick,
  children,
}: Props) => {
  const [isDeleteDialgOpen, setIsDeleteDialgOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const onDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteDialgOpen(true);
  };

  const handleDeleteRole = useCallback(async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`admin/roles/${roleToDelete.id}`);

      toast.success(t("roleDeleted"));
      setIsDeleteDialgOpen(false);
      setRoleToDelete(null);
      retry();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  }, [roleToDelete]);

  return (
    <div
      className="bg-white rounded-md border border-neutral-white-300"
      aria-label="Roles"
    >
      <h3 className="ty-body-md-2 text-secondary-500 px-4 p-5 border-b border-neutral-white-300">
        {t("Available Roles")}
      </h3>

      <div className="py-5">
        {loading && <SkeletonsLoader className="w-full px-4" />}

        {!loading && roles.length === 0 && (
          <div className="px-4 flex flex-col items-center justify-center text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Diamonds size={22} color="#6B7280" />
            </div>
            <p className="text-secondary-600 font-medium">
              {t("noRolesFound")}
            </p>
            <p className="text-secondary-500 text-sm max-w-md">
              {t("noRolesDesc")}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="outline" onClick={retry} aria-label="Retry">
                {t("Retry")}
              </Button>

              <ProtectedElement permissions="create-roles">
                <RoleFormDialog mode="create" onSuccess={retry} />
              </ProtectedElement>
            </div>
          </div>
        )}

        {!loading && roles.length > 0 && (
          <ul className="px-4 flex flex-col gap-4 max-h-[500px] overflow-auto">
            {roles.map((role) => (
              <li
                className="cursor-pointer hover:bg-gray-50 p-4 rounded-md flex justify-between items-center gap-4 flex-wrap"
                style={{
                  background:
                    role.id === activeRole?.id
                      ? "linear-gradient(90deg, #EEF2FF 0%, #F5F5FF 100%)"
                      : "",
                }}
                onClick={() => setActiveRole(role)}
                key={role.id}
                aria-label="Select role"
              >
                <div className="flex gap-2 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-md flex-center"
                    style={{
                      background:
                        role.id === activeRole?.id
                          ? "linear-gradient(90deg, #1E2C39 0%, #334E8E 100%)"
                          : "#F3F4F6",
                      color: role.id === activeRole?.id ? "#fff" : "#6B7280",
                    }}
                  >
                    <Diamonds size={20} />
                  </div>
                  <div>
                    <h6
                      className="ty-body-sm text-secondary-600"
                      aria-label="Role name"
                    >
                      {role.name}
                    </h6>

                    {role.description?.length > 100 ? (
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild className="mb-2 text-primary">
                            <p
                              className="text-body-xs text-[#6B7280] truncate max-w-[200px]"
                              aria-label="Role description"
                            >
                              {role.description}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end">
                            <p className="max-w-xs">{role.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <p
                        className="text-body-xs text-[#6B7280] truncate max-w-[200px]"
                        aria-label="Role description"
                      >
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
                {role.name !== "Admin" && (
                  <div>
                    <ProtectedElement permissions="delete-roles">
                      <button
                        type="button"
                        className="p-2 hover:bg-red-500 text-[#9CA3AF] hover:text-white rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(role);
                        }}
                        aria-label="Delete role"
                      >
                        <Trash size={16} />
                      </button>
                    </ProtectedElement>
                    <ProtectedElement permissions="edit-roles">
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-50 text-[#9CA3AF] rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(role.id);
                        }}
                        aria-label="Edit role"
                      >
                        <Edit size={16} />
                      </button>
                    </ProtectedElement>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {children}
      </div>

      <ProtectedElement permissions="delete-roles">
        <ConfirmDeleteDialog
          preview={isDeleteDialgOpen}
          onOpenChange={setIsDeleteDialgOpen}
          itemName={roleToDelete?.name || ""}
          deleteFn={handleDeleteRole}
          isDeleting={isDeleting}
        />
      </ProtectedElement>
    </div>
  );
};

export default AvailableRoles;
