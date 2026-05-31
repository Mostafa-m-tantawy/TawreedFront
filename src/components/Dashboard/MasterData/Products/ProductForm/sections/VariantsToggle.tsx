"use client";

import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { FormValues } from "../types";

export default function VariantsToggle({
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
    <div className="flex items-center gap-3">
      <span className="text-sm">{t("It has variants")}</span>
      <Switch
        checked={values.has_variants}
        onCheckedChange={(v) => onToggle("has_variants", v)}
        disabled={disabled}
      />
    </div>
  );
}
