"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";
import clsx from "clsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProtectedElement from "@/components/ui/protected-element";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/status-badge";

export type TableAction<T> = {
  key: string;
  labelKey: string; // i18n key (e.g. "View")
  icon?: ReactNode;
  onClick: (row: T) => void;
  permission?: string; // e.g. "users.edit"
  danger?: boolean;
  hidden?: (row: T) => boolean; // optionally hide per row
  disabled?: (row: T) => boolean; // optionally disable per row
};

export type TableColumn<T> = {
  key: string;
  headerKey: string; // i18n key for column header
  width?: string | number;
  className?: string;
  // Either provide dataKey to read from row[key], or a render() fn
  dataKey?: keyof T;
  render?: (row: T) => ReactNode;
};

export type CommonMasterDataTableProps<T extends { id: string | number }> = {
  rows: T[];
  columns: TableColumn<T>[];

  // Optional image column (like your screenshots)
  image?: {
    // read the image url from this field
    srcKey?: keyof T;
    // main title text (if you want the image+title in a single cell)
    titleKey?: keyof T;
    // optional subtitle under the title
    subtitleKey?: keyof T;
    // which column index should host the image+title UI
    attachToColumnIndex?: number;
    // rounded chip style for the row container
    rounded?: boolean;
  };

  // Optional status chip (convert your row field -> pill)
  status?: {
    // read from this field (string like "Active" | "in-active")
    key: keyof T;
    map?: (value: string) => "active" | "inactive" | "warning";
    // i18n translate the string label
    translate?: boolean;
  };

  actions?: TableAction<T>[];
  emptyKey?: string; // i18n key for empty-state text
  striped?: boolean;
};

export default function CommonMasterDataTable<
  T extends { id: string | number }
>(props: CommonMasterDataTableProps<T>) {
  const {
    rows,
    columns,
    image,
    status,
    actions = [],
    emptyKey = "empty",
    striped = true,
  } = props;

  const t = useTranslations("");

  const renderCell = (row: T, col: TableColumn<T>, rowIndex: number) => {
    // If this is the designated "image+title" column, render avatar UI
    const attachIdx = image?.attachToColumnIndex ?? -1;
    const isImageCell = attachIdx >= 0 && columns[attachIdx]?.key === col.key;

    if (isImageCell) {
      const src = image?.srcKey ? String(row[image.srcKey] ?? "") : "";
      const title = image?.titleKey ? String(row[image.titleKey] ?? "") : "";
      const subtitle = image?.subtitleKey
        ? String(row[image.subtitleKey] ?? "")
        : "";

      return (
        <div className="flex items-center gap-3">
          {src ? (
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-slate-200">
              <Image src={src} alt={title} fill className="object-cover" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-xs font-medium text-slate-600">
              {title?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{title}</span>
            {subtitle ? (
              <span className="text-xs text-slate-500">{subtitle}</span>
            ) : null}
          </div>
        </div>
      );
    }

    if (col.render) return col.render(row);
    if (col.dataKey) return String(row[col.dataKey] ?? "—");
    return null;
  };

  const bgForRow = (idx: number) =>
    striped ? (idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB") : "transparent";

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-2">
        <TableHeader>
          <TableRow className="border-0">
            {columns.map((col) => (
              <TableHead key={col.key} style={{ width: col.width }}>
                {t(col.headerKey)}
              </TableHead>
            ))}
            {status && <TableHead className="w-32">{t("Status")}</TableHead>}
            {!!actions.length && (
              <TableHead className="w-10">{t("Actions")}</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="text-start">
          {rows.map((row, idx) => (
            <TableRow
              key={row.id}
              className={clsx(
                "border-0 hover:bg-opacity-80 text-start transition-colors"
              )}
              style={{
                borderRadius: 12,
                backgroundColor: bgForRow(idx),
              }}
            >
              {columns.map((col, cIdx) => (
                <TableCell
                  key={`${row.id}-${col.key}`}
                  className={clsx(cIdx === 0 && "rounded-s-xl", col.className)}
                >
                  {renderCell(row, col, idx)}
                </TableCell>
              ))}

              {status && (
                <TableCell>
                  {(() => {
                    const raw = String(row[status.key] ?? "");

                    return <StatusBadge value={raw} />;
                  })()}
                </TableCell>
              )}

              {!!actions.length && (
                <TableCell className="rounded-e-xl text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100"
                        aria-label={t("Actions")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-44">
                      {actions.map((a, i) => {
                        const item = (
                          <DropdownMenuItem
                            key={a.key}
                            onClick={() => a.onClick(row)}
                            disabled={a.disabled?.(row)}
                            className="p-0"
                          >
                            <div
                              className={cn(
                                "cursor-pointer px-4 py-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2"
                              )}
                            >
                              {a.icon} <span>{t(a.labelKey)}</span>
                            </div>
                          </DropdownMenuItem>
                        );

                        return (
                          <div key={a.key}>
                            {a.hidden?.(row) ? null : a.permission ? (
                              <ProtectedElement permissions={a.permission}>
                                {item}
                              </ProtectedElement>
                            ) : (
                              item
                            )}
                          </div>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}

          {!rows.length && (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length + (status ? 1 : 0) + (actions.length ? 1 : 0)
                }
                className="h-24 text-center"
              >
                {t(emptyKey)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
