"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

export type WarehouseFilters = {
  search: string;
  status: "" | "active" | "inactive" | string;
  type: "" | "Product" | "Finished Goods" | "Raw Material" | string;
};

export default function WarehousesFilterDialog(props: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: WarehouseFilters;
  metaData: { types: string[]; statuses: string[] };
  onApply: (f: WarehouseFilters) => void;
}) {
  const t = useTranslations("");

  // local copy of filters (reset to `initial` whenever dialog opens)
  const [local, setLocal] = React.useState<WarehouseFilters>(props.initial);
  React.useEffect(() => {
    if (props.open) setLocal(props.initial);
  }, [props.open, props.initial]);

  const reset = () =>
    setLocal({
      search: "",
      status: "",
      type: "",
    });

  const apply = () => {
    props.onApply(local);
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {t("filters")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Status */}
          <div>
            <Label htmlFor="status">{t("Status")}</Label>
            <Select
              value={local.status}
              onValueChange={(v) =>
                setLocal((p) => ({ ...p, status: v as any }))
              }
              name="status"
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {(props.metaData.statuses ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "active" ? t("Active") : t("in-active")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div>
            <Label>{t("Type")}</Label>
            <Select
              value={local.type}
              onValueChange={(v) => setLocal((p) => ({ ...p, type: v as any }))}
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder={t("selectOption")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {(props.metaData.types ?? []).map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 grid grid-cols-2 mt-8">
          <Button type="button" size="lg" variant="secondary" onClick={reset}>
            {t("reset")}
          </Button>
          <Button type="button" size="lg" onClick={apply}>
            {t("apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
