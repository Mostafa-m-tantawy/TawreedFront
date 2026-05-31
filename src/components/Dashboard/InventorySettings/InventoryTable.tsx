import { useTranslations } from "next-intl";
import { Edit2, Trash } from "iconsax-reactjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedElement from "@/components/ui/protected-element";
import { Inventory } from "@/types/inventory";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StatusBadge from "@/components/ui/status-badge";

/** --- dot-path accessor: supports "a.b.c" keys --- */
function getByPath(obj: any, path?: string) {
  if (!path) return undefined;
  if (!path.includes(".")) return obj?.[path];
  return path
    .split(".")
    .reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

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

const InventoryTable = ({
  tableKeys,
  type,
  inventoryData,
  permissions,
  onEdit,
  onView,
  onDelete,
}: {
  tableKeys: string[];
  type: string;
  inventoryData: any[];
  permissions: {
    edit: string;
    delete: string;
    view: string;
    create: string;
  };
  onEdit: (g: Inventory) => void;
  onView: (g: Inventory) => void;
  onDelete: (g: Inventory) => void;
}) => {
  const t = useTranslations("");

  const renderCell = (row: any, key: string) => {
    // Use dot-path access for everything
    let value = getByPath(row, key);

    // Fallbacks for common shapes if a naked object is passed
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Try "name" field if present (e.g., parent object)
      if ("name" in value) value = value.name;
      // Else stringify short objects to avoid [object Object]
      else value = JSON.stringify(value);
    }

    // Status chips (keeps your existing heuristic)
    if (key.toLowerCase().includes("status")) {
      return <StatusBadge value={String(value ?? "")} />;
    }

    // Parent shortcut still works if someone uses "parent" as a key
    if (key === "parent") {
      return <>{row?.parent?.name ?? value ?? "-"}</>;
    }

    // Description with tooltip
    if (key.endsWith("description") || key === "description") {
      const txt = String(value ?? "");
      if (txt.length > 20) {
        return (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild className="mb-2 text-primary">
                <p
                  className="text-body-xs text-[#6B7280] truncate max-w-[200px]"
                  aria-label="Description"
                >
                  {txt}
                </p>
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                <p className="max-w-xs">{txt}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return <>{txt || "-"}</>;
    }

    // Array of values -> chips
    if (key === "values" || Array.isArray(value)) {
      const arr = Array.isArray(value) ? value : [];
      return (
        <div className="flex-center flex-wrap gap-2 pt-1 max-w-[200px] mx-auto">
          {arr.map((v: string, i: number) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 ty-body-xs text-primary-700"
            >
              {v}
            </span>
          ))}
          {!arr.length && <span>-</span>}
        </div>
      );
    }

    // Default renderer
    return <>{value ?? "-"}</>;
  };

  return (
    <div>
      <Table className="border-separate border-spacing-y-1 min-w-[700px]">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            {tableKeys.map((key) => (
              <TableHead className="text-center" key={key}>
                {key.includes(".") ? t(key.split(".")[0]) : t(key)}
              </TableHead>
            ))}
            <TableHead className="w-10">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0">
          {inventoryData.map((inventory, idx) => (
            <TableRow
              key={inventory.id}
              className="border-0 hover:bg-opacity-80"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              {tableKeys.map((key, index) => (
                <TableCell
                  key={key}
                  className={cn("text-center", index === 0 && "rounded-s-xl")}
                >
                  {renderCell(inventory, key)}
                </TableCell>
              ))}
              <TableCell className="rounded-e-xl">
                <RowActions
                  t={t}
                  permissions={permissions}
                  onView={() => onView(inventory)}
                  onEdit={() => onEdit(inventory)}
                  onDelete={() => onDelete(inventory)}
                />
              </TableCell>
            </TableRow>
          ))}

          {!inventoryData.length && (
            <TableRow>
              <TableCell
                colSpan={tableKeys.length + 1}
                className="h-24 text-center"
              >
                {t("noRecords")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
