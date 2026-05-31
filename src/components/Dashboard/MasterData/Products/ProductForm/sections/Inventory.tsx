"use client";

import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { FormValues } from "../types";

export default function Inventory({
  values,
  disabled,
  onToggle,
}: {
  values: FormValues;
  disabled: boolean;
  onToggle: (k: keyof FormValues, v: boolean) => void;
}) {
  const t = useTranslations("");
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Inventory")}
      </p>

      <div className="flex items-center gap-4">
        <div>
          <Switch
            checked={values.track_inventory}
            onCheckedChange={(v) => onToggle("track_inventory", v)}
            disabled={disabled}
          />
        </div>

        <div>
          <p className="ty-body-sm text-[#374151]">{t("Track Inventory")}</p>
          <p className="ty-body-xs text-[#6B7280]">
            {t("Enable stock level tracking for this product")}
          </p>
        </div>
      </div>
    </div>
  );
}
