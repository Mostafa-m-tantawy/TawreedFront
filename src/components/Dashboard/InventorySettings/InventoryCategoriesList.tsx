"use client";

import * as React from "react";
import { Inventory } from "@/types/inventory";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useLocale, useTranslations } from "next-intl";
import ProtectedElement from "@/components/ui/protected-element";
import { Edit2, Trash } from "iconsax-reactjs";
import StatusBadge from "@/components/ui/status-badge";

type CategoryNode = Inventory & {
  children?: CategoryNode[];
};

type FlatNode = {
  node: CategoryNode;
  depth: number;
  path: (string | number)[];
};

type InventoryCategoriesListProps = {
  type: string;
  inventoryData: Inventory[];
  permissions: {
    edit: string;
    delete: string;
    view: string;
    create: string;
  };
  onEdit: (g: Inventory) => void;
  onView: (g: Inventory) => void;
  onDelete: (g: Inventory) => void;
};

function buildTree(items: Inventory[]): CategoryNode[] {
  const byId = new Map<number | string, CategoryNode>();
  const roots: CategoryNode[] = [];

  items.forEach((it) =>
    byId.set(it.id as number | string, { ...it, children: [] })
  );

  byId.forEach((node) => {
    const pid =
      (node as any).parent && (node as any).parent.id != null
        ? (node as any).parent.id
        : null;
    if (pid != null && byId.has(pid)) {
      byId.get(pid)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  // Optional sort
  const sortRec = (arr: CategoryNode[]) => {
    arr.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    arr.forEach((n) => n.children && sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

function flattenTree(
  nodes: CategoryNode[],
  depth = 0,
  path: (string | number)[] = []
): FlatNode[] {
  const out: FlatNode[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth, path: [...path, n.id] });
    if (n.children && n.children.length) {
      out.push(...flattenTree(n.children, depth + 1, [...path, n.id]));
    }
  }
  return out;
}

const ROW_INDENT_PX = 20;

function RowActions({
  permissions,
  onEdit,
  onView,
  onDelete,
  t,
}: {
  permissions: {
    edit: string;
    delete: string;
    view: string;
    create: string;
  };
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  t: any;
}) {
  return (
    <div className="flex-center gap-2">
      <ProtectedElement permissions={permissions.edit}>
        <button type="button" onClick={onEdit} aria-label={t("edit")}>
          <Edit2 size={20} />
        </button>
      </ProtectedElement>

      <ProtectedElement permissions={permissions.delete}>
        <button type="button" onClick={onDelete} aria-label={t("delete")}>
          <Trash size={20} />
        </button>
      </ProtectedElement>
    </div>
  );
}

const InventoryCategoriesList = ({
  type,
  inventoryData,
  permissions,
  onEdit,
  onView,
  onDelete,
}: InventoryCategoriesListProps) => {
  const t = useTranslations("");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const flat = React.useMemo(() => {
    const tree = buildTree(inventoryData || []);
    return flattenTree(tree);
  }, [inventoryData]);

  return (
    <div className="w-full overflow-auto">
      {flat.length === 0 ? (
        <div className="text-sm text-muted-foreground border p-6 text-center">
          {t("noRecords")}
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
          {flat.map(({ node, depth }, idx) => {
            const itemValue = String(node.id);

            return (
              <AccordionItem
                key={itemValue}
                value={itemValue}
                className="mb-2 border bg-muted/40"
                style={{
                  marginInlineStart: depth * ROW_INDENT_PX,
                  borderRadius: 12,
                  backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                  borderColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                }}
              >
                <div
                  aria-hidden
                  className={`${depth > 0 ? "opacity-50" : "opacity-0"}`}
                  style={{
                    position: "absolute",
                    insetBlockStart: 0,
                    insetBlockEnd: 0,
                    insetInlineStart: (depth - 0.5) * ROW_INDENT_PX,
                  }}
                />

                <div className="flex items-center justify-between gap-2 px-2 sm:px-3">
                  <AccordionTrigger className="flex-1 py-3">
                    <div className="flex items-center gap-2 text-left">
                      <span className="font-medium">{node.name}</span>
                      <StatusBadge value={(node as any).status} />
                    </div>
                  </AccordionTrigger>

                  <RowActions
                    t={t}
                    permissions={permissions}
                    onView={() => onView(node)}
                    onEdit={() => onEdit(node)}
                    onDelete={() => onDelete(node)}
                  />
                </div>

                <AccordionContent className="px-4 pb-4">
                  {/* Details */}
                  <div
                    className={`grid gap-2 text-sm ${
                      isRTL ? "text-right" : ""
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28">
                        {t("ID")}
                      </span>
                      <span className="font-mono">{String(node.id)}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-28">
                        {t("description")}
                      </span>
                      <span>{(node as any).description ?? "—"}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default InventoryCategoriesList;
