"use client";

import ProtectedElement from "@/components/ui/protected-element";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Group } from "@/types/group";
import GroupsList from "./GroupsList";
import debounce from "lodash.debounce";
import api from "@/lib/api.client";
import { toast } from "sonner";

// NEW: navigation hooks
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const GROUPS = [
  {
    id: "customer",
    name: "Customers Groups",
    permissions: {
      view: "view-customer-groups",
      create: "create-customer-groups",
      edit: "edit-customer-groups",
      delete: "delete-customer-groups",
    },
  },
  {
    id: "supplier",
    name: "Suppliers Groups",
    permissions: {
      view: "view-supplier-groups",
      create: "create-supplier-groups",
      edit: "edit-supplier-groups",
      delete: "delete-supplier-groups",
    },
  },
] as const;

const groupsPermissions = [...GROUPS.map((g) => g.permissions.view)];

const Groups = () => {
  const t = useTranslations("");
  const { hasPermission } = useAuthStore();

  // Router & URL state
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Compute the default allowed group once
  const defaultGroup = useMemo(() => {
    if (hasPermission("view-customer-groups")) return GROUPS[0];
    if (hasPermission("view-supplier-groups")) return GROUPS[1];
    return null;
  }, [hasPermission]);

  const [activeGroup, setActiveGroup] = useState<
    (typeof GROUPS)[number] | null
  >(defaultGroup);
  const [initialized, setInitialized] = useState(false);

  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    search: "",
    page: 1,
    per_page: 10,
  });
  const [search, setSearchInput] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setParams((prev) => ({
        ...prev,
        search: value,
        page: 1,
      }));
    }, 500),
    []
  );

  function handleSearchChange(value: string) {
    setSearchInput(value);
    debouncedSearch(value);
  }

  function handlePageChange(page: number) {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  }

  // 🔹 Sync active group *from* URL on mount & when ?group changes
  useEffect(() => {
    const qp = searchParams.get("type");
    const candidate = GROUPS.find((g) => g.id === qp) ?? null;
    const allowed = candidate
      ? hasPermission(candidate.permissions.view)
      : false;

    const next = allowed ? candidate : defaultGroup;

    // If user has no allowed group, keep null (ProtectedElement will hide content)
    setActiveGroup(next);

    // Ensure URL reflects the actual chosen/allowed group (or remove)
    const sp = new URLSearchParams(searchParams.toString());
    if (next?.id) {
      if (qp !== next.id) {
        sp.set("type", next.id);
        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
      }
    } else if (qp) {
      // No access to requested group -> clean param
      sp.delete("type");
      router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`, {
        scroll: false,
      });
    }

    setInitialized(true);
  }, [searchParams, defaultGroup, hasPermission, pathname, router]);

  useEffect(() => {
    if (!initialized) return;

    async function getGroups() {
      if (!activeGroup) return;
      setLoading(true);
      try {
        const baseEndpoint =
          activeGroup.id === "customer"
            ? "/admin/customer-groups"
            : "/admin/supplier-groups";

        const response = await api.get(baseEndpoint, {
          params: {
            ...params,
            name: search, // backend expects `name` for search term
            type: activeGroup.id,
          },
        });

        const resData = response.data;
        setGroups(resData.data || []);
        setTotalPages(resData.meta?.last_page || 1);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    }

    getGroups();
  }, [params, activeGroup, initialized, search, t]);

  const handleSwitchGroup = (group: (typeof GROUPS)[number]) => {
    if (activeGroup?.id === group.id) return;

    setActiveGroup(group);

    const sp = new URLSearchParams(searchParams.toString());
    sp.set("type", group.id);
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <ProtectedElement permissions={groupsPermissions}>
      <section className="lg:h-full grid lg:grid-cols-[auto_1fr] gap-4">
        <div className="h-fit lg:h-full lg:min-w-64 bg-white">
          <div className="p-4 border-b border-neutral-white-300">
            <h4 className="text-body-md-2 text-secondary-500">{t("Groups")}</h4>
          </div>

          <ul className="p-4 space-y-4">
            {GROUPS.map((group) => (
              <ProtectedElement
                key={group.id}
                permissions={group.permissions.view}
              >
                <li>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-4 py-3 text-start ty-body-sm text-secondary-500 rounded-md",
                      activeGroup?.id === group.id && "bg-primary-50"
                    )}
                    onClick={() => handleSwitchGroup(group)}
                  >
                    {t(group.name)}
                  </button>
                </li>
              </ProtectedElement>
            ))}
          </ul>
        </div>

        <div className="p-4 overflow-auto">
          {activeGroup && (
            <ProtectedElement permissions={activeGroup.permissions.view}>
              <GroupsList
                permissions={activeGroup.permissions}
                type={activeGroup.id}
                title={activeGroup.name}
                groups={groups}
                t={t}
                loading={loading}
                totalPages={totalPages}
                page={params.page}
                search={search}
                handleSearchChange={handleSearchChange}
                handlePageChange={handlePageChange}
                getGroups={() => {
                  // Keep URL page in sync if you also want:
                  const sp = new URLSearchParams(searchParams.toString());
                  sp.set("page", "1");
                  router.push(`${pathname}?${sp.toString()}`, {
                    scroll: false,
                  });

                  setParams((prev) => ({
                    ...prev,
                    page: 1,
                  }));
                }}
              />
            </ProtectedElement>
          )}
        </div>
      </section>
    </ProtectedElement>
  );
};

export default Groups;
