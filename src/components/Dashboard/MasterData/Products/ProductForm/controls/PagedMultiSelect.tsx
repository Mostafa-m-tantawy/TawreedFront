"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageResult } from "@/types/common";

export default function PagedMultiSelect({
  disabled,
  selected,
  selectedLabels,
  placeholder,
  fetchPage,
  onToggle,
  t,
  error,
}: {
  disabled?: boolean;
  selected: number[];
  selectedLabels: string[];
  placeholder: string;
  fetchPage: (
    page: number,
    query: string
  ) => Promise<PageResult<{ id: number; name: string }>>;
  onToggle: (id: number, name: string) => void;
  onClear?: () => void;
  t: any;
  error?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(
    async (p = 1, q = "") => {
      setLoading(true);
      try {
        const res = await fetchPage(p, q);
        setItems(res.items);
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  React.useEffect(() => {
    if (open) load(1, query);
  }, [open, query, load]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between h-13 border-input",
            error && "border-destructive"
          )}
          disabled={disabled}
        >
          {selectedLabels.length ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((l, i) => (
                <span
                  key={i}
                  className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs "
                >
                  {l}
                </span>
              ))}
            </div>
          ) : (
            <span className="opacity-70">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[360px]">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="p-3 text-sm opacity-70">{t("loading")}</div>
            )}
            {!loading && items.length === 0 && (
              <CommandEmpty>{t("noRecords")}</CommandEmpty>
            )}
            {!loading &&
              items.map((it) => {
                const isOn = selected.includes(it.id);
                return (
                  <CommandItem
                    key={it.id}
                    onSelect={() => onToggle(it.id, it.name)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isOn ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {it.name}
                  </CommandItem>
                );
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
