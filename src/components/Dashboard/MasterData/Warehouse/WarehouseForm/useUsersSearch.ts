// hooks/useUsersSearch.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api.client";

export type UserLite = {
  id: number;
  name: string;
  email?: string | null;
  status?: string;
};

type UsersListResponse = {
  data: Array<{
    id: number;
    name: string;
    email: string | null;
    status: string;
  }>;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
};

type UseUsersSearchOpts = {
  pageSize?: number;
  status?: string; // e.g. "active"
  roles?: string[]; // e.g. ["manager"]
  department_id?: number; // optional filter
};

export function useUsersSearch(opts?: UseUsersSearchOpts) {
  const pageSize = opts?.pageSize ?? 20;

  const [items, setItems] = useState<UserLite[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Create a **stable key** for opts to use in hook deps
  const optKey = useMemo(
    () =>
      JSON.stringify({
        status: opts?.status ?? null,
        roles: Array.isArray(opts?.roles) ? opts!.roles : [],
        department_id: opts?.department_id ?? null,
        pageSize, // include in key so changes reset list correctly
      }),
    [
      opts?.status,
      opts?.department_id,
      pageSize,
      JSON.stringify(opts?.roles ?? []),
    ]
  );

  const lastQueryKey = useRef<string>("");

  const fetchPage = useCallback(async () => {
    setLoading(true);
    let mounted = true;
    try {
      const parsed = JSON.parse(optKey);
      const params: any = {
        page,
        per_page: parsed.pageSize,
      };
      if (search) params.search = search;
      if (parsed.status) params.status = parsed.status;
      if (parsed.department_id) params.department_id = parsed.department_id;
      if (parsed.roles?.length) params.roles = parsed.roles;

      const res = await api.get<UsersListResponse>("/admin/users", { params });
      if (!mounted) return;

      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};

      const mapped: UserLite[] = data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
      }));

      // Reset list if the query "shape" changed or we’re at page 1
      const queryKeyNow = JSON.stringify({ search, optKey });
      if (lastQueryKey.current !== queryKeyNow || page === 1) {
        setItems(mapped);
      } else {
        setItems((prev) => [...prev, ...mapped]);
      }
      lastQueryKey.current = queryKeyNow;

      const lastPage = meta?.last_page ?? page;
      setHasMore(page < lastPage);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [page, search, optKey]);

  // Trigger fetch when page/search/optKey change
  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  const resetAndSearch = (q: string) => {
    setSearch(q);
    setPage(1); // effect will run once with page=1
  };

  const loadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  const refresh = () => {
    setPage(1); // let the effect refetch using current search + opts
  };

  return {
    items,
    loading,
    hasMore,
    page,
    setPage,
    search,
    setSearch: resetAndSearch,
    loadMore,
    refresh,
  };
}

/** Keep selected manager visible even if it's not on the current page */
export async function fetchUserById(id: number): Promise<UserLite | null> {
  try {
    const res = await api.get<any>(`/admin/users/${id}`);
    const u = res?.data?.data ?? res?.data?.user ?? res?.data;
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, status: u.status };
  } catch {
    return null;
  }
}
