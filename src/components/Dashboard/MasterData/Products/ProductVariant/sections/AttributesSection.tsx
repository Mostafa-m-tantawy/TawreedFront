"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  disabled?: boolean;
  errors: Record<string, string>;
  useSize: boolean;
  useColor: boolean;
  size: string;
  color: string;
  sizesCatalog: string[];
  colorsCatalog: string[];
  onToggleSize: (v: boolean) => void;
  onToggleColor: (v: boolean) => void;
  onChangeSize: (v: string) => void;
  onChangeColor: (v: string) => void;
  t: any;
  clearError: (k: string) => void;
};

export default function AttributesSection({
  disabled,
  errors,
  useSize,
  useColor,
  size,
  color,
  sizesCatalog,
  colorsCatalog,
  onToggleSize,
  onToggleColor,
  onChangeSize,
  onChangeColor,
  t,
  clearError,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Attributes")}
      </p>

      <div className="space-y-2">
        <Label>{t("Attribute names")}</Label>
        <div className="mt-2 flex items-center gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={useSize}
              onChange={(e) => onToggleSize(e.target.checked)}
            />
            <span>{t("Size")}</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={useColor}
              onChange={(e) => onToggleColor(e.target.checked)}
            />
            <span>{t("Color")}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={useSize ? "" : "opacity-50 pointer-events-none"}>
          <Label>{t("Size")}</Label>
          <Select
            value={size || ""}
            onValueChange={(v) => {
              onChangeSize(v);
              if (errors.size) clearError("size");
            }}
            disabled={!useSize || disabled}
          >
            <SelectTrigger className="mt-4">
              <SelectValue placeholder={t("select an option")} />
            </SelectTrigger>
            <SelectContent>
              {(sizesCatalog.length
                ? sizesCatalog
                : ["Small", "Medium", "Large"]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.size && (
            <p className="mt-1 text-sm text-destructive text-start">
              {errors.size}
            </p>
          )}
        </div>

        <div className={useColor ? "" : "opacity-50 pointer-events-none"}>
          <Label>{t("Color")}</Label>
          <Select
            value={color || ""}
            onValueChange={(v) => {
              onChangeColor(v);
              if (errors.color) clearError("color");
            }}
            disabled={!useColor || disabled}
          >
            <SelectTrigger className="mt-4">
              <SelectValue placeholder={t("select an option")} />
            </SelectTrigger>
            <SelectContent>
              {(colorsCatalog.length
                ? colorsCatalog
                : ["Red", "Blue", "Black"]
              ).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.color && (
            <p className="mt-1 text-sm text-destructive text-start">
              {errors.color}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
