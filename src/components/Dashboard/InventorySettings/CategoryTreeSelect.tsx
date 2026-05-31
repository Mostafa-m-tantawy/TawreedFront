"use client";

// CategoryTreeSelect.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandInput } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

export type BasicCategory = {
  id: string | number;
  name: string;
  parent?: { id: string | number } | null;
  children?: BasicCategory[];
};

function isTreeShaped(nodes: BasicCategory[] | undefined): boolean {
  if (!nodes || nodes.length === 0) return true;
  return nodes.some((n) => Array.isArray(n.children));
}

function buildTreeFromFlat(items: BasicCategory[]): BasicCategory[] {
  const byId = new Map<
    string | number,
    BasicCategory & { children: BasicCategory[] }
  >();
  const roots: (BasicCategory & { children: BasicCategory[] })[] = [];

  items.forEach((it) => byId.set(it.id, { ...it, children: [] }));

  byId.forEach((node) => {
    const pid = node.parent?.id ?? null;
    if (pid != null && byId.has(pid)) {
      byId.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function flattenForSearch(
  nodes: BasicCategory[],
  depth = 0,
  path: (string | number)[] = []
) {
  const out: {
    node: BasicCategory;
    depth: number;
    path: (string | number)[];
  }[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth, path: [...path, n.id] });
    if (n.children && n.children.length)
      out.push(...flattenForSearch(n.children, depth + 1, [...path, n.id]));
  }
  return out;
}

export function CategoryTreeSelect({
  id,
  categories,
  value,
  onChange,
  placeholder = "Select category…",
  inputPlaceholder = "Search categories…",
  clearLabel = "Clear",
  disabled,
  className,
  allowParentSelection = true,
  leafOnly = false,
  noneOptionLabel = "No parent",
  emptyLabel = "No categories",
  rtl = false,
  error,
}: {
  id?: string;
  categories: BasicCategory[];
  value: string | number | null | undefined;
  onChange: (v: string | number | null) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  className?: string;
  allowParentSelection?: boolean;
  leafOnly?: boolean;
  noneOptionLabel?: string;
  emptyLabel?: string;
  rtl?: boolean;
  error?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string | number>>(
    new Set()
  );

  const tree = React.useMemo(() => {
    if (!categories) return [] as BasicCategory[];
    if (isTreeShaped(categories)) return categories as BasicCategory[];
    return buildTreeFromFlat(categories as BasicCategory[]);
  }, [categories]);

  const flat = React.useMemo(() => flattenForSearch(tree), [tree]);

  const current = React.useMemo(
    () => flat.find((f) => String(f.node.id) === String(value))?.node,
    [flat, value]
  );

  const toggleExpand = (id: string | number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSelect = (n: BasicCategory) => {
    const hasChildren = !!(n.children && n.children.length);
    if (leafOnly) return !hasChildren;
    if (!allowParentSelection && hasChildren) return false;
    return true;
  };

  const renderRows = (nodes: BasicCategory[], depth = 0): React.ReactNode => {
    return nodes.map((n) => {
      const hasChildren = !!(n.children && n.children.length);
      const isOpen = expanded.has(n.id);
      const selected = String(value ?? "") === String(n.id);

      return (
        <div key={n.id} className="w-full">
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 px-2 py-1.5 text-sm focus:outline-none hover:bg-accent/50 rounded-sm",
              depth > 0 && "border-l-2 border-border",
              selected && "bg-accent",
              !canSelect(n) && "opacity-60 cursor-default"
            )}
            onClick={() =>
              canSelect(n)
                ? (onChange(n.id), setOpen(false))
                : toggleExpand(n.id)
            }
            style={{ paddingInlineStart: 12 + depth * 20 }}
          >
            {hasChildren && (
              <span
                role="img"
                aria-hidden
                className="inline-flex h-4 w-4 items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(n.id);
                }}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : rtl ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
            <span className="flex-1 truncate text-start">{n.name}</span>
            {selected && <Check className="h-4 w-4 opacity-80" />}
          </button>
          {hasChildren && isOpen && (
            <div className="mt-0.5">{renderRows(n.children!, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const filteredTree = React.useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.toLowerCase();
    const filterRec = (arr: BasicCategory[]): BasicCategory[] =>
      arr
        .map((n) => {
          const selfMatch = n.name.toLowerCase().includes(q);
          const kids = n.children ? filterRec(n.children) : [];
          if (selfMatch || kids.length) return { ...n, children: kids };
          return null;
        })
        .filter(Boolean) as BasicCategory[];
    return filterRec(tree);
  }, [tree, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-13 border-input shadow-xs mt-2",
            className,
            error && "border-destructive"
          )}
          dir={rtl ? "rtl" : undefined}
        >
          <span className="truncate">
            {current ? current.name : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="center"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-1 px-2 pt-2">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={inputPlaceholder}
            />
            {/* {value != null && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(null)}
                title={clearLabel}
              >
                <X className="h-4 w-4" />
              </Button>
            )} */}
          </div>
          <CommandGroup
            className="max-h-64 overflow-y-auto py-2"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {filteredTree.length ? (
              renderRows(filteredTree)
            ) : (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                {emptyLabel}
              </div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryTreeSelect;
