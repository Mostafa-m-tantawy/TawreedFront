"use client";

import ProtectedElement from "@/components/ui/protected-element";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Inventory as InventoryType } from "@/types/inventory";
import InventoryList from "./InventoryList";
import debounce from "lodash.debounce";
import api from "@/lib/api.client";
import { toast } from "sonner";
import { INVENTORY_CATEGORIES } from "@/lib/static-data";
import { Status } from "@/types/common";

const inventoryPermissions = [
  ...INVENTORY_CATEGORIES.map((g) => g.permissions.view),
];

const Inventory = () => {
  const t = useTranslations("");
  const { hasPermission } = useAuthStore();

  const defaultInventoryCategory = useMemo(() => {
    for (const cat of INVENTORY_CATEGORIES) {
      if (hasPermission(cat.permissions.view)) return cat;
    }
    return null;
  }, [hasPermission]);

  const [activeInventory, setActiveInventory] = useState(
    defaultInventoryCategory
  );

  const [loading, setLoading] = useState(false);

  const [params, setParams] = useState({
    search: "",
    page: 1,
    per_page: 10,
    status: "all",
  });
  const [search, setSearchInput] = useState("");

  const [inventoryData, setInventoryData] = useState<InventoryType[]>([]);
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

  const applyStatusFilter = (status: Status) => {
    setParams((prev) => ({
      ...prev,
      status,
    }));
  };

  useEffect(() => {
    async function getInventory() {
      if (!activeInventory) return;
      setLoading(true);

      try {
        const listEndpoint = activeInventory.endpoints.list;
        const searchKey = activeInventory.searchKey || "search";

        const response = await api.get(listEndpoint, {
          params: {
            ...params,
            [searchKey]: search,
            status: params.status === "all" ? undefined : params.status,
          },
        });

        const resData = response.data;
        setInventoryData(resData.data || []);
        setTotalPages(resData.meta?.last_page || 1);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t("fetchFailed"));
      } finally {
        setLoading(false);
      }
    }

    getInventory();
  }, [params]);

  useEffect(() => {
    setSearchInput("");
    setParams((prev) => ({
      ...prev,
      search: "",
      page: 1,
    }));
  }, [activeInventory]);

  return (
    <ProtectedElement permissions={inventoryPermissions}>
      <section className="md:h-full grid lg:grid-cols-[auto_1fr] gap-4">
        <div className="h-fit lg:h-full lg:min-w-64 bg-white">
          <div className="p-4 border-b border-neutral-white-300">
            <h4 className="text-body-md-2 text-secondary-500">
              {t("Inventory Data")}
            </h4>
          </div>

          <ul className="p-4 space-y-4">
            {INVENTORY_CATEGORIES.map((inventory) => (
              <ProtectedElement
                key={inventory.id}
                permissions={inventory.permissions.view}
              >
                <li key={inventory.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full px-4 py-3 text-start ty-body-sm text-secondary-500 rounded-md",
                      activeInventory?.id === inventory.id && "bg-primary-50"
                    )}
                    onClick={() => setActiveInventory(inventory)}
                  >
                    {t(inventory.id)}
                  </button>
                </li>
              </ProtectedElement>
            ))}
          </ul>
        </div>
        <div className="p-4 overflow-auto">
          {activeInventory && (
            <ProtectedElement permissions={activeInventory.permissions.view}>
              <InventoryList
                inventoryType={activeInventory}
                inventoryData={inventoryData}
                t={t}
                loading={loading}
                totalPages={totalPages}
                page={params.page}
                search={search}
                handleSearchChange={handleSearchChange}
                handlePageChange={handlePageChange}
                applyStatusFilter={applyStatusFilter}
                status={params.status as Status}
                getInventory={() => {
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

export default Inventory;
