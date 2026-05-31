"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type POStatusAction = "approve" | "reject" | "cancel";

const STYLES: Record<POStatusAction, { btn: string }> = {
  approve: { btn: "bg-emerald-600 hover:bg-emerald-600/85 text-white" },
  reject: { btn: "bg-red-600 hover:bg-red-600/85 text-white" },
  cancel: { btn: "bg-rose-600 hover:bg-rose-600/85 text-white" },
};

type Props = {
  poCode: string;
  action: POStatusAction;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  trigger?: React.ReactNode;
};

export default function ConfirmStatusDialog({
  poCode,
  action,
  isOpen,
  onOpenChange,
  onConfirm,
  loading = false,
  trigger,
}: Props) {
  const t = useTranslations("purchaseOrder");
  const [open, setOpen] = React.useState(Boolean(isOpen));
  React.useEffect(() => setOpen(Boolean(isOpen)), [isOpen]);

  const titleKey =
    action === "approve"
      ? "approveTitle"
      : action === "cancel"
      ? "cancelTitle"
      : "rejectTitle";
  const bodyKey =
    action === "approve"
      ? "approveConfirm"
      : action === "cancel"
      ? "cancelConfirm"
      : "rejectConfirm";
  const labelKey =
    action === "approve"
      ? "approve"
      : action === "cancel"
      ? "cancelBtn"
      : "reject";
  const loadingKey =
    action === "approve"
      ? "approving"
      : action === "cancel"
      ? "cancelling"
      : "rejecting";

  const handleOpen = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="bg-white p-0 max-h-[95vh] overflow-auto">
        <DialogTitle className="text-lg font-semibold p-4 border-b pr-6">
          {t(titleKey, { poCode })}
        </DialogTitle>
        <DialogDescription className="hidden">
          {t(bodyKey, { poCode })}
        </DialogDescription>

        <div>
          <p className="text-secondary-500 font-medium px-4 text-sm">
            {t(bodyKey, { poCode })}
          </p>

          <div className="mt-4 flex justify-end gap-3 p-4 border-t">
            <Button variant="outline" onClick={() => handleOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              className={cn(STYLES[action].btn)}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? t(loadingKey) : t(labelKey)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
