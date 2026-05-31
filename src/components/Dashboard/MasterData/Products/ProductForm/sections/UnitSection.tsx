// components/products/ProductForm/sections/UnitSection.tsx
"use client";

import { useTranslations } from "next-intl";
import PagedSingleSelect from "../controls/PagedSingleSelect";
import { Label } from "@/components/ui/label";

type PageFetcher = (
  page: number,
  query: string
) => Promise<{
  items: { id: number; name: string }[];
  page: number;
  lastPage: number;
  total: number;
}>;

export default function UnitSection({
  disabled,
  unitId,
  unitName,
  fetchPage,
  onChange,
  error,
}: {
  disabled: boolean;
  unitId: number | "";
  unitName: string;
  fetchPage: PageFetcher;
  onChange: (id: number, name: string) => void;
  error?: string;
}) {
  const t = useTranslations("");

  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Unit")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("measurementUnit")}</Label>
          <PagedSingleSelect
            disabled={disabled}
            value={unitId}
            display={unitName}
            placeholder={t("Search or select unit")}
            fetchPage={fetchPage}
            onChange={onChange}
            t={t}
            error={!!error}
          />
          {error && (
            <p className="mt-1 text-sm text-destructive text-start">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
