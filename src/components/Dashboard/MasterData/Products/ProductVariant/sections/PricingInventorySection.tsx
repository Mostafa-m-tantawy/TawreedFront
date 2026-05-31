"use client";

import { Input } from "@/components/ui/input";
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
  purchase_price: string;
  sale_price: string;
  profit_margin: string;
  tax_1: string;
  tax_2: string;
  lowest_sale_price: string;
  discount_type: "" | "percent" | "amount";
  discount_value: string;
  onChangeNumber: (
    key:
      | "purchase_price"
      | "sale_price"
      | "profit_margin"
      | "tax_1"
      | "tax_2"
      | "lowest_sale_price"
      | "discount_value",
    v: string
  ) => void;
  onChangeDiscountType: (v: "" | "percent" | "amount") => void;
  t: (k: string, p?: Record<string, unknown>) => string;
};

export default function PricingInventorySection({
  disabled,
  errors,
  purchase_price,
  sale_price,
  profit_margin,
  tax_1,
  tax_2,
  lowest_sale_price,
  discount_type,
  discount_value,
  onChangeNumber,
  onChangeDiscountType,
  t,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 space-y-4">
      <p className="border-b border-neutral-white-300 pb-4 ty-body-md-2 text-[#111827]">
        {t("Pricing")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t("Purchase Price")}
          value={purchase_price}
          onChange={(e) => onChangeNumber("purchase_price", e.target.value)}
          disabled={disabled}
          error={errors.purchase_price}
        />

        <Input
          label={t("Sale Price")}
          value={sale_price}
          onChange={(e) => onChangeNumber("sale_price", e.target.value)}
          disabled={disabled}
          error={errors.sale_price}
        />

        <Input
          label={t("Lowest Sale Price")}
          value={lowest_sale_price}
          onChange={(e) => onChangeNumber("lowest_sale_price", e.target.value)}
          disabled={disabled}
          error={errors.lowest_sale_price}
        />

        <Input
          label={t("Profit Margin")}
          value={profit_margin}
          onChange={(e) => onChangeNumber("profit_margin", e.target.value)}
          disabled={disabled}
          error={errors.profit_margin}
        />

        <Input
          label={t("Tax 1")}
          value={tax_1}
          onChange={(e) => onChangeNumber("tax_1", e.target.value)}
          disabled={disabled}
          error={errors.tax_1}
        />

        <Input
          label={t("Tax 2")}
          value={tax_2}
          onChange={(e) => onChangeNumber("tax_2", e.target.value)}
          disabled={disabled}
          error={errors.tax_2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="ty-body-xs text-[#6B7280]">
            {t("Discount Type")}
          </label>
          <Select
            value={discount_type}
            onValueChange={(v) => onChangeDiscountType(v as any)}
            disabled={disabled}
          >
            <SelectTrigger className="mt-4">
              <SelectValue placeholder={t("Select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("None")}</SelectItem>
              <SelectItem value="percent">{t("Percent")}</SelectItem>
              <SelectItem value="amount">{t("Amount")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          label={t("Discount Value")}
          value={discount_value}
          onChange={(e) => onChangeNumber("discount_value", e.target.value)}
          disabled={disabled}
          error={errors.discount_value}
        />
      </div>
    </div>
  );
}
