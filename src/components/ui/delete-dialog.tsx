"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDeleteDialogProps = {
  preview?: boolean;
  itemName: string;
  deleteFn: () => void | Promise<void>;
  isDeleting?: boolean;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  isRemove?: boolean;
};

export default function ConfirmDeleteDialog({
  preview = false,
  itemName,
  deleteFn,
  isDeleting = false,
  trigger,
  onOpenChange,
  isRemove,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations(""); // use your namespace if needed
  const [open, setOpen] = React.useState(preview);

  React.useEffect(() => {
    setOpen(Boolean(preview));
  }, [preview]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const titleKey = isRemove ? "removeTitle" : "deleteTitle";
  const confirmKey = isRemove ? "confirmRemove" : "confirmDelete";
  const primaryKey = isRemove ? "remove" : "delete";
  const primaryLoadingKey = isRemove ? "removing" : "deleting";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="bg-white p-0 max-h-[95vh] overflow-auto">
        <DialogTitle className="text-error-600 text-lg font-semibold p-4 border-b pr-6">
          {t(titleKey, { itemName })}
        </DialogTitle>

        <DialogDescription className="hidden">
          {t(confirmKey, { itemName })}
        </DialogDescription>

        <div>
          <div className="text-secondary-400 font-medium px-4 text-sm">
            {t(confirmKey, { itemName })}
          </div>

          <div className="mt-4 flex justify-end gap-3 p-4 border-t">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {t("cancel")}
            </Button>

            <Button
              className={cn(
                "bg-error-600 hover:bg-error-600 hover:opacity-70",
                isDeleting && "cursor-not-allowed"
              )}
              onClick={deleteFn}
              disabled={isDeleting}
            >
              <span>{isDeleting ? t(primaryLoadingKey) : t(primaryKey)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
