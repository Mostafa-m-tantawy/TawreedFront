"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { FormValues } from "../types";

export default function Expiry({
  values,
  errors,
  disabled,
  onToggle,
  onChangeText,
}: {
  values: FormValues;
  errors: Record<string, string>;
  disabled: boolean;
  onToggle: (k: keyof FormValues, v: boolean) => void;
  onChangeText: (k: keyof FormValues, v: string) => void;
}) {
  const t = useTranslations("");
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Expiry Date")}
      </p>

      <div className="flex items-center gap-4">
        <div>
          <Switch
            checked={values.track_expiry}
            onCheckedChange={(v) => onToggle("track_expiry", v)}
            disabled={disabled}
          />
        </div>

        <div>
          <p className="ty-body-sm text-[#374151]">{t("Track Expiry Date")}</p>
          <p className="ty-body-xs text-[#6B7280]">
            {t("Enable to track the expiration date")}
          </p>
        </div>
      </div>
    </div>
  );
}
