"use client";

import api from "@/lib/api.client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AvailableRoles from "./AvailableRoles";
import { ModuleResource, Role } from "@/types/role";
import Pagination from "@/components/ui/pagination/pagination";
import RolePermissions from "./RolePermissions";
import RoleFormDialog from "./RoleFormDialog";
import ProtectedElement from "@/components/ui/protected-element";

const RolesAndPermissions = () => {
  const t = useTranslations("");
  const [loading, setLoading] = useState(false);
  const [reFetchRoles, setReFetchRoles] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeRole, setActiveRole] = useState<Role>({
    id: 0,
    name: "",
    description: "",
    permissions: [],
  });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number>();

  const [allModules, setAllModules] = useState<ModuleResource[]>([]);

  useEffect(() => {
    if (roles.length === 0) return;
    const stillExists = roles.find((r) => r.id === activeRole?.id);
    if (!stillExists) setActiveRole(roles[0]);
  }, [roles]);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        const res = await api.get("/admin/roles/create");
        const list = res.data?.modules || [];

        setAllModules(list);
      } catch (error) {
        console.log(error);
      }
    };
    getPermissions();
  }, []);

  useEffect(() => {
    const getRoles = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/roles", {
          params: {
            page,
            per_page: 5,
          },
        });
        const list = res.data?.data || [];

        setRoles(list);
        setTotalPages(res.data?.meta?.last_page || 1);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    getRoles();
  }, [reFetchRoles]);

  const retry = () => setReFetchRoles((s) => !s);

  const onPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const onEdit = (id: number) => {
    setEditingId(id);
    setOpen(true);
  };

  return (
    <ProtectedElement permissions="view-roles">
      <section className="flex flex-col p-6" aria-label="Roles & Permissions">
        <div className="flex justify-between gap-4 flex-wrap">
          <div>
            <h1 className="ty-body-xl-2 text-primary-700 mb-1">
              {t("Roles & Permissions")}
            </h1>
            <p className="ty-body-md text-secondary-500">{t("rolesDesc")}</p>
          </div>

          <ProtectedElement permissions="create-roles">
            <RoleFormDialog mode="create" onSuccess={retry} />
          </ProtectedElement>
        </div>

        <div className="mt-6 grid xl:grid-cols-3 gap-4 flex-1 max-h-full">
          <div className="xl:col-span-1">
            <AvailableRoles
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              roles={roles}
              loading={loading}
              t={t}
              retry={retry}
              onEditClick={onEdit}
            >
              <div className="w-full mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            </AvailableRoles>
          </div>
          <ProtectedElement permissions={"edit-roles"}>
            <div
              className="xl:col-span-2 overflow-auto"
              aria-label="Permissions"
            >
              <RolePermissions
                activeRole={activeRole}
                allModules={allModules}
                loading={loading}
                t={t}
              />
            </div>
          </ProtectedElement>
        </div>

        <ProtectedElement permissions={"edit-roles"}>
          <RoleFormDialog
            mode="edit"
            roleId={editingId}
            open={open}
            onOpenChange={setOpen}
            onSuccess={retry}
          />
        </ProtectedElement>
      </section>
    </ProtectedElement>
  );
};

export default RolesAndPermissions;
