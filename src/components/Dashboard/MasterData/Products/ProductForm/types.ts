export type Props = {
  mode: "create" | "edit";
  productId?: number;
  kind: "service" | "physical" | "grouped-product";
};

export type Status = string;
export type DiscountType = "none" | "amount" | "percent";
export type ProductFlow = "product" | "raw_material" | "finished_good";
export type VariantAttrKey = "size" | "color";

export type Category = { id: number; name: string };

export type MetaRes = {
  statuses?: Status[];
  categories?: Category[];
  discount_types?: DiscountType[];
  product_flows?: ProductFlow[]; // physical only
  taxes?: { id: number; name: string; percent: number }[]; // optional
};

export type ProductAPI = {
  id: number;
  type: "service" | "physical";
  name: string;
  sku: string;
  description?: string | null;
  barcode?: string;
  category_id?: number | null;
  category?: Category | null;
  brand_name?: string | null;
  image?: string | null;
  purchase_price?: number | null;
  sale_price?: number | null;
  profit_margin?: number | null;
  tax_1?: number | null;
  tax_2?: number | null;
  lowest_sale_price?: number | null;
  discount_type?: DiscountType | null;
  discount_value?: number | null;
  status: Status;
  tags?: string[] | null;
  notes?: string | null;
  product_flow?: ProductFlow | null;
  has_variants?: boolean;
  variant_attributes?: VariantAttrKey[] | null;
  track_inventory?: boolean;
  track_expiry?: boolean;
  expiry_date?: string | null; // YYYY-MM-DD
};

export type FormValues = {
  name: string;
  sku: string;
  description: string;
  category_id: number | "";
  brand_name: string;
  image: File | null;

  purchase_price: string;
  sale_price: string;
  profit_margin: string;

  tax_1: string;
  tax_2: string;
  lowest_sale_price: string;

  discount_type: DiscountType;
  discount_value: string;

  product_flow: ProductFlow;
  has_variants: boolean;
  track_inventory: boolean;
  track_expiry: boolean;
  expiry_date: string;

  tags: string;
  status: Status;
  notes: string;

  barcode: string;
};
