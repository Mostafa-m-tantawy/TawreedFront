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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageResult } from "@/types/common";

export default function PagedSingleSelect({
  disabled,
  value,
  display,
  placeholder,
  fetchPage,
  onChange,
  t,
  isUnit,
  error,
}: {
  disabled?: boolean;
  value: number | "";
  display: string;
  placeholder: string;
  fetchPage: (
    page: number,
    query: string
  ) => Promise<PageResult<{ id: number; name: string }>>;
  onChange: (id: number, name: string, conversion_factor?: number) => void;
  t: any;
  isUnit?: boolean;
  error?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<
    { id: number; name: string; conversion_factor?: number }[]
  >([]);
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
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between h-13 border-input",
            error && "border-destructive"
          )}
        >
          {display || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]">
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
              items.map((it) => (
                <CommandItem
                  key={it.id}
                  onSelect={() => {
                    if (isUnit) {
                      onChange(it.id, it.name, it.conversion_factor);
                    } else {
                      onChange(it.id, it.name);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === it.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {it.name}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
