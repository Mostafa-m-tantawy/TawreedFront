"use client";

import * as React from "react";
import { useMemo } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useUsersSearch, fetchUserById, UserLite } from "./useUsersSearch";

type Props = {
  value: number | "";
  onChange: (id: number | "") => void;
  placeholder?: string;
  disabled?: boolean;
  roles?: string[];
  status?: string;
  department_id?: number;
  t: any;
  hasError?: boolean;
};

export default function ManagerCombobox({
  value,
  onChange,
  placeholder = "Select a manager",
  disabled,
  roles,
  status = "active",
  department_id,
  t,
  hasError,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const stableRoles = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [JSON.stringify(roles ?? [])]
  );
  const userSearchOpts = useMemo(
    () => ({
      roles: stableRoles,
      status,
      department_id,
      pageSize: 20,
    }),
    [stableRoles, status, department_id]
  );

  const { items, loading, hasMore, loadMore, setSearch } =
    useUsersSearch(userSearchOpts);

  const [selectedUser, setSelectedUser] = React.useState<UserLite | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (value && !items.find((u) => u.id === value)) {
        const u = await fetchUserById(Number(value));
        if (mounted) setSelectedUser(u);
      } else if (!value) {
        setSelectedUser(null);
      } else {
        const u = items.find((u) => u.id === value) || null;
        setSelectedUser(u);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [value, items]);

  // debounce the CommandInput search
  const debounced = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchChange = (q: string) => {
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => setSearch(q.trim()), 250);
  };
  React.useEffect(() => {
    return () => {
      if (debounced.current) clearTimeout(debounced.current);
    };
  }, []);

  // infinite scroll in the list
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      if (hasMore && !loading) loadMore();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-13 shadow-xs",
            hasError && "border-destructive"
          )}
        >
          <span className="max-w-[80%] truncate">
            {selectedUser ? `${selectedUser.name}` : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchUsers")}
            onValueChange={onSearchChange}
          />
          <CommandList onScroll={onScroll} className="max-h-64 overflow-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("loading")}</span>
              </div>
            ) : null}

            <CommandEmpty>{t("noRecords")}</CommandEmpty>

            {/* Pin currently selected user if it's not in the current page */}
            {selectedUser && !items.find((u) => u.id === selectedUser.id) && (
              <CommandGroup heading={t("Selected")}>
                <CommandItem
                  key={`sel-${selectedUser.id}`}
                  value={String(selectedUser.id)}
                  onSelect={() => {
                    onChange(selectedUser.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === selectedUser.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {selectedUser.name}
                  {/* {selectedUser.email ? (
                    <span className="ml-2 text-muted-foreground">
                      ({selectedUser.email})
                    </span>
                  ) : null} */}
                </CommandItem>
              </CommandGroup>
            )}

            {items.length && (
              <CommandGroup heading={t("Results")}>
                {items.map((u) => (
                  <CommandItem
                    key={u.id}
                    value={String(u.id)}
                    onSelect={() => {
                      onChange(u.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "ms-2 h-4 w-4",
                        value === u.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {u.name}
                    {/* {u.email ? (
                    <span className="ml-2 text-muted-foreground">
                      ({u.email})
                    </span>
                  ) : null} */}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {hasMore && (
              <div className="p-2 text-center text-xs text-muted-foreground">
                {loading ? t("loading") : t("Scroll to load more")}
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
