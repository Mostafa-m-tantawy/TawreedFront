"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Edit2, Eye, Refresh, Trash } from "iconsax-reactjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProtectedElement from "@/components/ui/protected-element";
import { User } from "@/types/user";
import StatusBadge from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

function RowActions({
  status,
  onView,
  onChangeStatus,
  onEdit,
  onDelete,
  t,
}: {
  status: string;
  onView?: () => void;
  onChangeStatus?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  t: any;
}) {
  const isActive = status === "active";
  const statusBtnTitle = isActive ? t("deactivatetUser") : t("activatetUser");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-neutral-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[124px] p-0">
        <ProtectedElement permissions="edit-users">
          <DropdownMenuItem
            className="p-0"
            onClick={onView}
            aria-label={t("show")}
          >
            <div className="cursor-pointer px-4 py-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Eye size={20} /> <span>{t("show")}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>

        <DropdownMenuSeparator className="my-0" />

        <ProtectedElement permissions="activate-users">
          <DropdownMenuItem
            className="p-0"
            onClick={onChangeStatus}
            aria-label={statusBtnTitle}
          >
            <div className="cursor-pointer px-4 py-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Refresh size={20} /> <span>{statusBtnTitle}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>

        <DropdownMenuSeparator className="my-0" />

        <ProtectedElement permissions="edit-users">
          <DropdownMenuItem
            className="p-0"
            onClick={onEdit}
            aria-label={t("editUser")}
          >
            <div className="cursor-pointer px-4 py-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Edit2 size={20} /> <span>{t("Edit")}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>

        <DropdownMenuSeparator className="my-0" />

        <ProtectedElement permissions="delete-users">
          <DropdownMenuItem
            className="p-0"
            onClick={onDelete}
            aria-label={t("deleteUser")}
          >
            <div className="cursor-pointer px-4 py-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Trash size={20} /> <span>{t("Delete")}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersTable({
  users,
  onView,
  onChangeStatus,
  onEdit,
  onDelete,
}: {
  users: User[];
  onView: (u: User) => void;
  onChangeStatus: (u: User) => void;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  const t = useTranslations("");

  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border-separate border-spacing-y-1">
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead>{t("User Name")}</TableHead>
            <TableHead>{t("E-mail")}</TableHead>
            <TableHead>{t("Phone Number")}</TableHead>
            <TableHead>{t("Role")}</TableHead>
            <TableHead>{t("Status")}</TableHead>
            <TableHead className="w-16">{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {users.map((u, idx) => (
            <TableRow
              key={u.id}
              className="border-0 hover:bg-opacity-80 text-start"
              style={{
                borderRadius: 12,
                backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
              }}
            >
              <TableCell scope="row" className="rounded-s-xl">
                {u.name}
              </TableCell>
              <TableCell className="truncate max-w-[280px]" title={u.email}>
                {u.email}
              </TableCell>
              <TableCell className="truncate max-w-[280px]" title={u.phone}>
                {u.phone || "-"}
              </TableCell>
              <TableCell>{u.role?.name ?? "—"}</TableCell>
              <TableCell>
                <StatusBadge value={u.status} />
              </TableCell>
              <TableCell className="rounded-e-xl">
                <RowActions
                  t={t}
                  status={u.status}
                  onView={() => onView(u)}
                  onChangeStatus={() => onChangeStatus(u)}
                  onEdit={() => onEdit(u)}
                  onDelete={() => onDelete(u)}
                />
              </TableCell>
            </TableRow>
          ))}

          {!users.length && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("noUsers")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
