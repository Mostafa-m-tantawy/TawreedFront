"use client";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function ConfirmStockCountStatusDialog({
  isOpen,
  onOpenChange,
  loading,
  action,
  code,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  loading?: boolean;
  action: "approve" | "reject" | "cancel" | "delete";
  code: string;
  onConfirm: () => void;
}) {
  const t = useTranslations("");

  const title =
    action === "approve"
      ? t("Approve")
      : action === "reject"
      ? t("Reject")
      : action === "delete"
      ? t("Delete")
      : t("Cancel");

  const body =
    action === "approve"
      ? t("Are you sure you want to approve stock count {code}?", { code })
      : action === "reject"
      ? t("Are you sure you want to reject stock count {code}?", { code })
      : action === "delete"
      ? t("Are you sure you want to delete stock count {code}?", { code })
      : t("Are you sure you want to cancel stock count {code}?", { code });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 max-h-[95vh] overflow-auto">
        {/* Title */}
        <DialogTitle className="text-lg font-semibold p-4 border-b pr-6">
          {title} {t("Stock Count")}
        </DialogTitle>
        <DialogDescription className="hidden">{body}</DialogDescription>

        {/* Body */}
        <div>
          <p className="text-secondary-500 font-medium px-4 text-sm">{body}</p>
          <div className="mt-4 flex justify-end gap-3 p-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("Cancel")}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!!loading}
              variant={
                action === "delete" || action === "reject"
                  ? "destructive"
                  : "default"
              }
            >
              {title}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
