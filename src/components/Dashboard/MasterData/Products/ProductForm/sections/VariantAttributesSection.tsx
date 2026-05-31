"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
// import Pagination from "@/components/ui/pagination/pagination";

type PageFetcher = (
  page: number,
  query: string
) => Promise<{
  items: { id: number; name: string }[];
  page: number;
  lastPage: number;
  total: number;
}>;

export default function VariantAttributesSection({
  disabled,
  selectedIds,
  selectedLabels,
  fetchPage,
  onToggleId,
  onClear,
  error,
}: {
  disabled: boolean;
  selectedIds: number[];
  selectedLabels: string[];
  fetchPage: PageFetcher;
  onToggleId: (id: number, name: string) => void;
  onClear?: () => void;
  error?: string;
}) {
  const t = useTranslations("");

  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [lastPage, setLastPage] = React.useState(1);
  const [items, setItems] = React.useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const h = setTimeout(() => {
      void load(1, query);
    }, 300);
    return () => clearTimeout(h);
  }, [query]);

  React.useEffect(() => {
    void load(page, query);
  }, []); // initial

  async function load(p: number, q: string) {
    setLoading(true);
    try {
      const res = await fetchPage(p, q);
      setItems(res.items);
      setPage(res.page);
      setLastPage(res.lastPage);
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id: number, name: string) => {
    if (disabled) return;
    onToggleId(id, name);
  };

  function handlePageChange(page: number) {
    setPage(page);
  }

  const selectedCount = selectedIds.length;

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-3">
        {onClear && selectedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled}
          >
            {t("Clear")}
          </Button>
        )}
      </div> */}

      {/* Search */}
      <div className="mb-3 sm:w-[50%]">
        <Input
          placeholder={t("Search or select attributes")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          aria-label={t("search")}
        />
      </div>

      {/* List of checkboxes */}
      <div>
        <div className="max-h-64 overflow-auto divide-y">
          {loading && (
            <div className="p-3 text-sm text-neutral-500">{t("Loading…")}</div>
          )}
          {!loading && items.length === 0 && (
            <div className="p-3 text-sm text-neutral-500">
              {t("noResults.")}
            </div>
          )}
          {!loading &&
            items.map((it) => {
              const checked = selectedIds.includes(it.id);
              return (
                <label
                  key={it.id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer",
                    disabled && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={() => toggle(it.id, it.name)}
                    disabled={disabled}
                  />
                  <span className="text-sm">{it.name}</span>
                </label>
              );
            })}
        </div>

        {/* Pagination controls */}
        {/* <Pagination
          currentPage={page}
          totalPages={lastPage}
          onPageChange={handlePageChange}
        /> */}
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}

      <p className="mt-2 text-xs text-neutral-500">
        {t("selectAttributesHint")}
      </p>
    </div>
  );
}
