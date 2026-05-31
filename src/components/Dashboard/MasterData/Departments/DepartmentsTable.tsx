"use client";

import * as React from "react";
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
import { Department } from "@/types/department";
import ProtectedElement from "@/components/ui/protected-element";
import StatusBadge from "@/components/ui/status-badge";

function RowActions({
  onEdit,
  onDelete,
  t,
}: {
  onEdit: () => void;
  onDelete: () => void;
  t: any;
}) {
  return (
    <div className="flex-center gap-2">
      <ProtectedElement permissions="edit-department">
        <button type="button" onClick={onEdit} aria-label={t("editDepartment")}>
          <Edit2 size={20} aria-hidden />
        </button>
      </ProtectedElement>

      <ProtectedElement permissions="delete-department">
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("deleteDepartment")}
        >
          <Trash size={20} aria-hidden />
        </button>
      </ProtectedElement>
    </div>
  );
}

const DepartmentsTable = ({
  departments,
  onEdit,
  onDelete,
}: {
  departments: Department[];
  onEdit: (d: Department) => void;
  onDelete: (d: Department) => void;
}) => {
  const t = useTranslations("");

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead scope="col">{t("ID")}</TableHead>
            <TableHead scope="col">{t("Department Name")}</TableHead>
            <TableHead scope="col">{t("Status")}</TableHead>
            <TableHead scope="col" className="w-16">
              {t("Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {departments.map((d, idx) => (
            <TableRow
              key={d.id}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell scope="row" className="rounded-s-xl text-start">
                {d.id}
              </TableCell>

              <TableCell
                className="max-w-[260px] truncate"
                title={d.name as string}
              >
                {d.name as string}
              </TableCell>

              <TableCell>
                <StatusBadge value={d.status} />
              </TableCell>

              <TableCell className="rounded-e-xl">
                <RowActions
                  t={t}
                  onEdit={() => onEdit(d)}
                  onDelete={() => onDelete(d)}
                />
              </TableCell>
            </TableRow>
          ))}

          {!departments.length && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t("noDepartments")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DepartmentsTable;
