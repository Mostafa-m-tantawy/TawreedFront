import SkeletonsLoader from "@/components/ui/skeleton-loader";
import { Diamonds } from "iconsax-reactjs";
import { useEffect, useMemo, useState } from "react";
import { ModuleResource, Permission, Role } from "@/types/role";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api.client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  activeRole: Role & { permissions?: Permission[] };
  allModules?: ModuleResource[];
  loading: boolean;
  t: (key: string) => string;
  onUpdated?: () => void;
}

const RolePermissions = ({
  activeRole,
  allModules,
  loading,
  t,
  onUpdated,
}: Props) => {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [initial, setInitial] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const modules = useMemo(() => {
    const m = (allModules || []).map((mod) => ({
      ...mod,
      permissions: (mod.permissions || [])
        .slice()
        .sort((a, b) =>
          (a.display_name || a.name).localeCompare(b.display_name || b.name)
        ),
    }));
    return m.sort((a, b) => a.name.localeCompare(b.name));
  }, [allModules]);

  const empty = !loading && (!modules || modules.length === 0);

  useEffect(() => {
    const ids = new Set((activeRole?.permissions || []).map((p) => p.id));
    setSelected(ids);
    setInitial(new Set(ids));
  }, [activeRole?.id, activeRole?.permissions]);

  const moduleAllChecked = (perms: Permission[]) =>
    perms.length > 0 && perms.every((p) => selected.has(p.id));
  const moduleIndeterminate = (perms: Permission[]) => {
    const any = perms.some((p) => selected.has(p.id));
    return any && !moduleAllChecked(perms);
  };

  const toggleModuleAll = (perms: Permission[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      perms.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
      return next;
    });
  };

  const togglePerm = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const equalSets = (a: Set<number>, b: Set<number>) =>
    a.size === b.size && Array.from(a).every((x) => b.has(x));
  const dirty = !equalSets(initial, selected);

  const handleSave = async () => {
    if (!activeRole?.id) return;
    try {
      setSaving(true);
      await api.put(`/admin/roles/${activeRole.id}`, {
        name: activeRole.name,
        description: activeRole.description,
        permission_ids: Array.from(selected),
      });
      toast.success(t("permissionsSaved"));
      setInitial(new Set(selected));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-white rounded-md border border-neutral-white-300">
      <div className="px-4 p-5 border-b border-neutral-white-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="ty-body-md-2 text-secondary-500">
              {t("permissionsFor")} {activeRole?.name || "N/A"}
            </h3>
            <p className="ty-body-xs text-[#6B7280]">
              {activeRole?.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? t("saving") || "Saving..." : t("save")}
            </Button>
            <Button
              type="button"
              variant={"outline"}
              className="px-3 py-1.5 rounded-md border text-sm bg-white hover:bg-neutral-50"
              disabled={!dirty || saving}
              onClick={() => {
                setSelected(new Set(initial));
              }}
            >
              {t("revert")}
            </Button>
          </div>
        </div>
      </div>

      <div className="py-5">
        {loading && <SkeletonsLoader className="w-full px-4" />}

        {!loading && empty && (
          <div className="px-4 flex flex-col items-center justify-center text-center gap-3 py-10">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Diamonds size={22} color="#6B7280" />
            </div>
            <p className="text-secondary-600 font-medium">
              {t("noPermissionsFound")}
            </p>
            <p className="text-secondary-500 text-sm max-w-md">
              {t("noPermissionsDesc")}
            </p>
          </div>
        )}
        <div className="max-h-[800px] overflow-auto px-4 ">
          {!loading && !empty && (
            <Accordion type="multiple" className="w-full space-y-2">
              {modules.map((mod, idx) => {
                const perms = mod.permissions || [];
                const allChecked = moduleAllChecked(perms);
                const indeterminate = moduleIndeterminate(perms);

                return (
                  <AccordionItem
                    key={mod.id ?? mod.name}
                    value={String(mod.id ?? mod.name)}
                    className="rounded-md border overflow-hidden bg-white"
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <AccordionTrigger className="text-secondary-700 ty-body-md-2 px-0 hover:no-underline">
                        {mod.name}
                      </AccordionTrigger>

                      <label className="inline-flex items-center gap-2 text-sm text-secondary-700 cursor-pointer">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(v) =>
                            toggleModuleAll(perms, Boolean(v))
                          }
                          data-indeterminate={indeterminate || undefined}
                          aria-checked={indeterminate ? "mixed" : allChecked}
                        />
                        {t("selectAll") || "Select all"}
                      </label>
                    </div>

                    <AccordionContent className="px-4 pb-4">
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {perms.map((p) => {
                          const checked = selected.has(p.id);
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-3 rounded-md border bg-white px-3 py-2 hover:bg-neutral-50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => togglePerm(p.id)}
                              />
                              <span className="ty-body-sm text-secondary-700 truncate">
                                {p.name}
                                {/* {p.display_name || p.name} */}
                              </span>

                              {/* <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    p.name || p.name
                                  );
                                }}
                              >
                                <Copy size={20} />
                              </button> */}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
