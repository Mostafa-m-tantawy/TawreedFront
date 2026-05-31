"use client";

import { Input } from "@/components/ui/input";

type Props = {
  disabled?: boolean;
  errors: Record<string, string>;
  name: string;
  sku: string;
  onChangeName: (v: string) => void;
  onChangeSku: (v: string) => void;
  t: (key: string, params?: Record<string, unknown>) => string;
};

export default function BasicInfoSection({
  disabled,
  errors,
  name,
  sku,
  onChangeName,
  onChangeSku,
  t,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Basic Information")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("Variant Name")}
          placeholder={t("enter name")}
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          disabled={disabled}
          error={errors.name}
        />

        <Input
          label={t("SKU")}
          placeholder={t("enter SKU")}
          value={sku}
          onChange={(e) => onChangeSku(e.target.value)}
          disabled={disabled}
          error={errors.sku}
        />
      </div>
    </div>
  );
}
