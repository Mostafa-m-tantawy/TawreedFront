"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Add,
  CloseCircle,
  Edit2,
  Export,
  Eye,
  SaveRemove,
  Send2,
  TickCircle,
  Trash,
} from "iconsax-reactjs";

type Permissions = {
  canView?: boolean;
  canEdit?: boolean;
  canExport?: boolean;
  canApprove?: boolean;
  canAddInvoice?: boolean;
  canAccept?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
  canConvert?: boolean;
  canDelete?: boolean;
};

export default function RowActions({
  onView,
  onEdit,
  onSubmitForApproval,
  onExport,
  onAccept,
  onAddInvoice,
  onReject,
  onCancel,
  onConvert,
  onDelete,
  permissions,
  isLinkedPO,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onSubmitForApproval?: () => void;
  onExport?: () => void;
  onAccept?: () => void;
  onAddInvoice?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
  permissions: Permissions;
  isLinkedPO?: boolean;
}) {
  const t = useTranslations("");

  if (isLinkedPO) {
    return (
      <button
        className="cursor-pointer px-4 py-2 text-secondary-500 hover:bg-primary-50 ty-body-sm flex items-center gap-2"
        onClick={onView}
      >
        <Eye size={20} /> <span>{t("View")}</span>
      </button>
    );
  }

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
      <DropdownMenuContent align="end" className="min-w-[160px] p-0">
        {permissions.canView && (
          <DropdownMenuItem className="p-0" onClick={onView}>
            <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Eye size={20} /> <span>{t("View")}</span>
            </div>
          </DropdownMenuItem>
        )}

        {permissions.canEdit && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onEdit}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <Edit2 size={20} /> <span>{t("Edit")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canApprove && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onSubmitForApproval}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <Send2 size={20} /> <span>{t("Submit for Approval")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canAddInvoice && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onAddInvoice}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <Add size={20} /> <span>{t("Add Invoice")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canExport && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onExport}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <Export size={20} /> <span>{t("Export")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canAccept && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onAccept}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <TickCircle size={20} /> <span>{t("Accept")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canReject && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onReject}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <CloseCircle size={20} /> <span>{t("Reject")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
        {permissions.canConvert && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onConvert}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <RefreshCcw size={20} /> <span>{t("Convert")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canCancel && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onCancel}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <SaveRemove size={20} /> <span>{t("Cancel")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        {permissions.canDelete && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <DropdownMenuItem className="p-0" onClick={onDelete}>
              <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
                <Trash size={20} /> <span>{t("Delete")}</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
