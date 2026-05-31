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

export default function ConfirmDepreciationStatusDialog({
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

  const titleText =
    action === "approve"
      ? t("Approve")
      : action === "reject"
      ? t("Reject")
      : t("Cancel");

  const bodyText =
    action === "approve"
      ? t("Are you sure you want to approve depreciation {code}?", { code })
      : action === "reject"
      ? t("Are you sure you want to reject depreciation {code}?", { code })
      : t("Are you sure you want to cancel depreciation {code}?", { code });

  const cancelLabel = t("Cancel");
  const loadingLabel =
    action === "approve"
      ? (t as any)("approving") ?? titleText
      : action === "reject"
      ? (t as any)("rejecting") ?? titleText
      : (t as any)("cancelling") ?? titleText;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white p-0 max-h-[95vh] overflow-auto">
        <DialogTitle className="text-lg font-semibold p-4 border-b pr-6">
          {titleText} {t("Depreciation")}
        </DialogTitle>

        <DialogDescription className="hidden">{bodyText}</DialogDescription>

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
              disabled={!!loading}
            >
              {loading ? loadingLabel : titleText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
