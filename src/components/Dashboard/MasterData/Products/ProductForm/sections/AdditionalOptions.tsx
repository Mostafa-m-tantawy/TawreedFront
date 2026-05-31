"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormValues, Status } from "../types";
import { useTranslations } from "next-intl";
import AttributeValuesInput from "@/components/Dashboard/InventorySettings/InventoryFormDialog/AttributeValuesInput";

export default function AdditionalOptions({
  values,
  statuses,
  errors,
  disabled,
  onChangeText,
  onSelectStatus,
}: {
  values: FormValues;
  statuses: Status[];
  errors: Record<string, string>;
  disabled: boolean;
  onChangeText: (k: keyof FormValues, v: string) => void;
  onSelectStatus: (s: Status) => void;
}) {
  const t = useTranslations("");

  // bridge: string <-> string[]
  const tagArray = (values.tags || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleTagsChange = (next: string[]) => {
    onChangeText("tags", next.join(", "));
  };

  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Additional Options")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tags via AttributeValuesInput */}
        <div className={disabled ? "pointer-events-none opacity-60" : ""}>
          <AttributeValuesInput
            label={t("Tags")}
            values={tagArray}
            error={errors.tags}
            onChange={handleTagsChange}
            t={(k) => t(k)}
          />
        </div>

        <div>
          <Label>{t("Status")}</Label>
          <Select
            value={values.status}
            onValueChange={(v) => {
              if (v !== "active" && v !== "inactive") return;
              onSelectStatus(v as Status);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              className={
                "mt-4 " + `${errors.status ? "border-destructive" : ""}`
              }
            >
              <SelectValue placeholder={t("selectStatus")} />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(s === "active" ? "Active" : "in-active")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="mt-1 text-sm text-destructive text-start">
              {errors.status}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>{t("Internal Notes")}</Label>
        <Textarea
          placeholder={t("Notes visible only to staff")}
          value={values.notes}
          onChange={(e) => onChangeText("notes", e.target.value)}
          disabled={disabled}
          error={errors.notes}
        />
      </div>
    </div>
  );
}
