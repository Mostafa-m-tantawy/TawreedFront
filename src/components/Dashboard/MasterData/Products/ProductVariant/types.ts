export type Status = "active" | "inactive";
export type DiscountType = "none" | "percent" | "amount";

export type VariantFormState = {
  name: string;
  sku: string;
  barcode: string;
  purchase_price: string;
  sale_price: string;
  profit_margin: string;
  tax_1: string;
  tax_2: string;
  lowest_sale_price: string;
  discount_type: "" | DiscountType;
  discount_value: string;
  status: Status;
  notes: string;
};
