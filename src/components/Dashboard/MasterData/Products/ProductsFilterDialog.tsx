"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterMeta = {
  types: string[];
  status: string[];
  category_types: string[];
};

export type ProductFilters = {
  search: string;
  status: string | "";
  type: string | "";
  category_type: string | "";
};

const TYPE_API_TO_UI: Record<string, string> = {
  service: "Service Product",
  physical: "Physical Product",
  "grouped products": "Grouped Products",
};

export default function ProductsFilterDialog({
  open,
  onOpenChange,
  initial,
  onApply,
  metaData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ProductFilters;
  onApply: (f: ProductFilters) => void;
  metaData: FilterMeta;
}) {
  const t = useTranslations("");
  // const isRTL = useLocale() === "ar";

  const [f, setF] = React.useState<ProductFilters>(initial);

  React.useEffect(() => {
    if (open) setF(initial);
  }, [open, initial]);

  const setField = <K extends keyof ProductFilters>(
    k: K,
    v: ProductFilters[K]
  ) => setF((prev) => ({ ...prev, [k]: v }));

  const reset = () =>
    setF({ search: "", status: "", type: "", category_type: "" });

  const apply = () => {
    onApply(f);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-secondary-700 ty-body-xl-2">
              {t("filters")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div>
          <Label>{t("Category Type")}</Label>
          {/* <CategoryTreeSelect
            categories={(metaData.category_types ?? []) as any}
            value={f.category_type ? String(f.category_type) : ""}
            onChange={(v) => setField("category_type", String(v))}
            placeholder={t("selectOption")}
            inputPlaceholder={t("search")}
            emptyLabel={t("noRecords")}
            allowParentSelection
            rtl={isRTL}
            leafOnly
          /> */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Chip
              active={f.category_type === ""}
              onClick={() => setField("category_type", "")}
              label={t("all")}
            />
            {metaData.category_types.map((tp) => (
              <Chip
                key={tp}
                active={f.category_type === tp}
                onClick={() => setField("category_type", tp)}
                label={t(tp)}
              />
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <Label>{t("Type")}</Label>

          <div className="flex flex-wrap gap-2 mt-4">
            <Chip
              active={f.type === ""}
              onClick={() => setField("type", "")}
              label={t("all")}
            />
            {metaData.types.map((tp) => (
              <Chip
                key={tp}
                active={f.type === tp}
                onClick={() => setField("type", tp)}
                label={t(TYPE_API_TO_UI[tp])}
              />
            ))}
          </div>
        </div>

        <div>
          {/* Status */}
          <div>
            <Label htmlFor="status">{t("Status")}</Label>
            <Select
              value={f.status}
              onValueChange={(v) =>
                setField("status", v as "active" | "inactive")
              }
              name="status"
            >
              <SelectTrigger className="mt-4">
                <SelectValue placeholder={t("selectStatus")} />
              </SelectTrigger>
              <SelectContent>
                {metaData.status.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "active" ? t("Active") : t("in-active")}
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

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2",
        active
          ? "border-primary-600 bg-primary-50 text-primary-700"
          : "border-neutral-200"
      )}
    >
      {label}
    </button>
  );
}
