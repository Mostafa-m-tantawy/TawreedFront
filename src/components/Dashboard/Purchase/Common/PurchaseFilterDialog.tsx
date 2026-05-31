"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export type POFilters = {
  search: string;
  status: string;
};

export default function PurchaseFilterDialog({
  open,
  onOpenChange,
  initial,
  statuses,
  onApply,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: POFilters;
  statuses: Array<string>;
  onApply: (f: POFilters) => void;
}) {
  const t = useTranslations("");
  const [local, setLocal] = React.useState<POFilters>(initial);

  React.useEffect(() => setLocal(initial), [initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Filter")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="ty-body-sm text-neutral-600">{t("Status")}</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={local.status === "" ? "default" : "outline"}
              onClick={() => setLocal((p) => ({ ...p, status: "" }))}
            >
              {t("All Status")}
            </Button>
            {statuses.map((s) => (
              <Button
                key={s}
                variant={local.status === s ? "default" : "outline"}
                onClick={() => setLocal((p) => ({ ...p, status: s }))}
              >
                {t(s)}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={() => {
              onApply(local);
              onOpenChange(false);
            }}
          >
            {t("Apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
