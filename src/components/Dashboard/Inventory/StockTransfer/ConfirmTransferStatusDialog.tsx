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
import { cn } from "@/lib/utils";

type Action = "approve" | "reject" | "cancel";

const STYLES: Record<Action, { btn: string }> = {
  approve: { btn: "bg-emerald-600 hover:bg-emerald-600/85 text-white" },
  reject: { btn: "bg-red-600 hover:bg-red-600/85 text-white" },
  cancel: { btn: "bg-rose-600 hover:bg-rose-600/85 text-white" },
};

export default function ConfirmTransferStatusDialog({
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
  action: Action;
  code: string;
  onConfirm: () => void;
}) {
  const t = useTranslations("");

  // Keep your existing label logic but map to PO-style UI pieces.
  const titleText =
    action === "approve"
      ? t("Approve")
      : action === "reject"
      ? t("Reject")
      : t("Cancel");
  const bodyText =
    action === "approve"
      ? t("Are you sure you want to approve transfer {code}?", { code })
      : action === "reject"
      ? t("Are you sure you want to reject transfer {code}?", { code })
      : t("Are you sure you want to cancel transfer {code}?", { code });
  const cancelLabel = t("cancel") ?? t("No");
  const loadingLabel =
    action === "approve"
      ? (t as any)("approving") ?? titleText
      : action === "reject"
      ? (t as any)("rejecting") ?? titleText
      : (t as any)("cancelling") ?? titleText;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Match PO dialog look & feel */}
      <DialogContent className="bg-white p-0 max-h-[95vh] overflow-auto">
        {/* Title bar */}
        <DialogTitle className="text-lg font-semibold p-4 border-b pr-6">
          {/* e.g. "Approve Transfer — ST-1001" */}
          {titleText} {t("Transfer")}
        </DialogTitle>

        {/* Hidden description for a11y (same as PO component) */}
        <DialogDescription className="hidden">{bodyText}</DialogDescription>

        {/* Body + footer */}
        <div>
          <p className="text-secondary-500 font-medium px-4 text-sm">
            {bodyText}
          </p>

          <div className="mt-4 flex justify-end gap-3 p-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              className={cn(STYLES[action].btn)}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? loadingLabel : titleText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
