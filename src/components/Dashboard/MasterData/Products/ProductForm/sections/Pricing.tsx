"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscountType, FormValues } from "../types";
import { useTranslations } from "next-intl";

export default function Pricing({
  kind,
  values,
  errors,
  disabled,
  discountTypes,
  onNum,
  onSelect,
  onToggle,
}: {
  kind: "service" | "physical" | "grouped-product";
  values: FormValues;
  errors: Record<string, string>;
  disabled: boolean;
  discountTypes: DiscountType[];
  onNum: (k: keyof FormValues, v: string) => void;
  onSelect: (k: keyof FormValues, v: string) => void;
  onToggle: (k: keyof FormValues, v: boolean) => void;
}) {
  const t = useTranslations("");

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-0">
        <Input
          label={t("Purchase Price")}
          placeholder={t("add your cost to acquire this product")}
          value={values.purchase_price}
          onChange={(e) => onNum("purchase_price", e.target.value)}
          disabled={disabled}
          error={errors.purchase_price}
        />
        <Input
          label={t("Sale Price")}
          placeholder={t("add regular selling price")}
          value={values.sale_price}
          onChange={(e) => onNum("sale_price", e.target.value)}
          disabled={disabled}
          error={errors.sale_price}
        />
        <Input
          label={t("Profit Margin %")}
          placeholder={t("calculated profit Percentage")}
          value={values.profit_margin}
          onChange={(e) => onNum("profit_margin", e.target.value)}
          error={errors.profit_margin}
        />
        <Input
          label={t("Tax1 %")}
          placeholder={t("Tax1 %")}
          value={values.tax_1}
          onChange={(e) => onNum("tax_1", e.target.value)}
          disabled={disabled}
          error={errors.tax_1}
        />
        <Input
          label={t("Tax2 %")}
          placeholder={t("Tax2 %")}
          value={values.tax_2}
          onChange={(e) => onNum("tax_2", e.target.value)}
          disabled={disabled}
          error={errors.tax_2}
        />
        <Input
          label={t("Lowest Sale Price")}
          placeholder={t("minimum allowed selling price")}
          value={values.lowest_sale_price}
          onChange={(e) => onNum("lowest_sale_price", e.target.value)}
          disabled={disabled}
          error={errors.lowest_sale_price}
        />
        <div>
          <Label>{t("Discount Type")}</Label>
          <Select
            value={values.discount_type}
            onValueChange={(v) => onSelect("discount_type", v)}
            disabled={disabled}
          >
            <SelectTrigger className={"mt-4"}>
              <SelectValue placeholder={t("select an option")} />
            </SelectTrigger>
            <SelectContent>
              {discountTypes.map((dt) => (
                <SelectItem key={dt} value={dt}>
                  {dt === "none"
                    ? t("None")
                    : dt === "amount"
                    ? t("Amount")
                    : t("Percent")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          label={t("Discount value")}
          placeholder={t("amount or percentage regular price")}
          value={values.discount_value}
          onChange={(e) => onNum("discount_value", e.target.value)}
          disabled={disabled || values.discount_type === "none"}
          error={errors.discount_value}
        />
      </div>
    </div>
  );
}
