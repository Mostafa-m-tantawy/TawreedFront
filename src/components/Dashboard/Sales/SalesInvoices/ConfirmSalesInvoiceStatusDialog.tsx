"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export default function ConfirmSalesInvoiceStatusDialog({
  code,
  action, // "approve" | "reject" | "cancel" | "mark_paid"
  isOpen,
  onOpenChange,
  onConfirm,
  loading,
}: {
  code: string;
  action: "approve" | "reject" | "cancel" | "mark_paid";
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  // Namespace: SalesInvoice
  const t = useTranslations("SalesInvoice");

  const actionLabel =
    action === "approve"
      ? t("button.accept")
      : action === "cancel"
      ? t("button.cancel")
      : action === "reject"
      ? t("button.reject")
      : t("button.markPaid");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { action: actionLabel })}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t("message", { action: actionLabel.toLowerCase(), code })}
        </p>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("button.close")}
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
