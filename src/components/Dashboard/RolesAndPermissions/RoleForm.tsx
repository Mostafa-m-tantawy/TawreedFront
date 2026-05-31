"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import api from "@/lib/api.client";
import { Button } from "@/components/ui/button";

type UserRes = {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
};
type Permission = { id: number; name: string };
type ModuleRes = { id: number; name: string; permissions: Permission[] | null };

type RoleRes = {
  id: number;
  name: string | null;
  description: string | null;
  users: UserRes[];
  permissions: Permission[];
};

type Props = {
  mode: "create" | "edit";
  roleId?: number;
  redirectTo?: string;
  onSuccess?: (roleId: number) => void;
};

export default function RoleForm({
  mode,
  roleId,
  redirectTo = "/dashboard/roles-and-permissions",
  onSuccess,
}: Props) {
  const t = useTranslations("");
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // users
  const [users, setUsers] = useState<UserRes[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set()
  );

  // permissions
  const [modules, setModules] = useState<ModuleRes[]>([]);
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(
    new Set()
  );

  const userLabel = (u: UserRes) =>
    u?.name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    u?.email ||
    `#${u.id}`;

  // Load users + modules (+ role if edit)
  useEffect(() => {
    const load = async () => {
      if (isEdit && !roleId) return;
      setLoading(true);
      try {
        if (isEdit) {
          const { data } = await api.get<{
            users: UserRes[];
            modules: ModuleRes[];
            role: RoleRes;
          }>(`/admin/roles/${roleId}/edit`);

          setUsers(data.users ?? []);
          setModules(data.modules ?? []);

          setName(data.role?.name ?? "");
          setDescription(data.role?.description ?? "");
          setSelectedUserIds(
            new Set((data.role?.users ?? []).map((u) => u.id))
          );
          setSelectedPermIds(
            new Set((data.role?.permissions ?? []).map((p) => p.id))
          );
        } else {
          const { data } = await api.get<{
            users: UserRes[];
            modules: ModuleRes[];
          }>(`/admin/roles/create`);
          setUsers(data.users ?? []);
          setModules(data.modules ?? []);
          setName("");
          setDescription("");
          setSelectedUserIds(new Set());
          setSelectedPermIds(new Set());
        }
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            t("fetchFailed", { default: "Failed to fetch." })
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, roleId, t]);

  // Users
  const toggleUser = (id: number) =>
    setSelectedUserIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  // Permissions
  const togglePerm = (id: number) =>
    setSelectedPermIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  const moduleAllSelected = (m: ModuleRes) => {
    const ids = (m.permissions ?? []).map((p) => p.id);
    return ids.length > 0 && ids.every((id) => selectedPermIds.has(id));
  };

  const toggleModuleAll = (m: ModuleRes, checked: boolean) => {
    const ids = (m.permissions ?? []).map((p) => p.id);
    setSelectedPermIds((prev) => {
      const n = new Set(prev);
      for (const id of ids) {
        if (checked) {
          n.add(id);
        } else {
          n.delete(id);
        }
      }
      return n;
    });
  };

  const permCount = useMemo(() => selectedPermIds.size, [selectedPermIds.size]);

  // Submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("nameRequired", { default: "Name is required." }));
      return;
    }
    // Your API requires at least 1 permission
    if (selectedPermIds.size === 0) {
      toast.error(
        t("permissionsRequired", { default: "Select at least one permission." })
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        user_ids: Array.from(selectedUserIds),
        permission_ids: Array.from(selectedPermIds),
      };

      if (isEdit) {
        const res = await api.put<{ data: RoleRes }>(
          `/admin/roles/${roleId}`,
          payload
        );
        toast.success(t("roleUpdated", { default: "Role updated." }));
        onSuccess?.(res.data?.data?.id ?? roleId!);
        router.push(redirectTo);
      } else {
        const res = await api.post<{ data: RoleRes }>(`/admin/roles`, payload);
        toast.success(t("roleCreated", { default: "Role created." }));
        onSuccess?.(res.data?.data?.id ?? 0);
        router.push(redirectTo);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (isEdit
            ? t("updateRoleFailed", { default: "Failed to update role." })
            : t("createRoleFailed", { default: "Failed to create role." }))
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-6">
      <header className="mb-6">
        <h1 className="ty-body-xl-2 text-primary-700">
          {isEdit
            ? t("Update Role", { default: "Update Role" })
            : t("Create Role", { default: "Create Role" })}
        </h1>
        <p className="ty-body-md text-secondary-500">
          {isEdit
            ? t("updateRoleDesc", {
                default:
                  "Change the role name, description, users, and permissions.",
              })
            : t("createRoleDesc", {
                default:
                  "Define a role, add a description, assign users, and select permissions.",
              })}
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-6 max-w-4xl">
        {/* Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            {t("Name", { default: "Name" })}
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder={t("roleNamePlaceholder", { default: "e.g. Manager" })}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || submitting}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            {t("Description", { default: "Description" })}
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={4}
            placeholder={t("roleDescPlaceholder", {
              default: "Short description (optional)",
            })}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || submitting}
          />
        </div>

        {/* Users */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("Users", { default: "Users" })}
          </label>
          <div className="max-h-72 overflow-auto rounded border p-2 space-y-1">
            {loading ? (
              <div className="h-24 animate-pulse rounded bg-gray-100" />
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("noUsers", { default: "No users available." })}
              </p>
            ) : (
              users.map((u) => {
                const checked = selectedUserIds.has(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => toggleUser(u.id)}
                      disabled={submitting}
                    />
                    <span className="text-sm text-gray-700">
                      {userLabel(u)}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t("Permissions", { default: "Permissions" })}{" "}
              <span className="text-gray-400">({permCount})</span>
            </label>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded bg-gray-100" />
              <div className="h-20 animate-pulse rounded bg-gray-100" />
              <div className="h-20 animate-pulse rounded bg-gray-100" />
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t("noPermissions", {
                default: "No permissions available. Please configure modules.",
              })}
            </p>
          ) : (
            <div className="space-y-4">
              {modules.map((m) => (
                <div key={m.id} className="rounded border">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="font-medium text-gray-800">{m.name}</div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={moduleAllSelected(m)}
                        onChange={(e) => toggleModuleAll(m, e.target.checked)}
                        disabled={submitting}
                      />
                      {t("Select all", { default: "Select all" })}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3">
                    {(m.permissions ?? []).map((p) => {
                      const checked = selectedPermIds.has(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 rounded border px-2 py-2 text-sm hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={() => togglePerm(p.id)}
                            disabled={submitting}
                          />
                          <span className="truncate">{p.name}</span>
                        </label>
                      );
                    })}
                    {(m.permissions ?? []).length === 0 && (
                      <div className="col-span-full text-sm text-gray-500">
                        {t("noModulePerms", {
                          default: "No permissions in this module.",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(redirectTo)}
            disabled={submitting}
          >
            {t("Cancel", { default: "Cancel" })}
          </Button>
          <Button type="submit" disabled={submitting || loading}>
            {submitting && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
            )}
            {isEdit
              ? t("Save Changes", { default: "Save Changes" })
              : t("Create", { default: "Create" })}
          </Button>
        </div>
      </form>
    </section>
  );
}
