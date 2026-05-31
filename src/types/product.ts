import { Category } from "@/components/Dashboard/MasterData/Products/ProductForm/types";

export type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  category: Category | null;
  type: string;
  flow: string | null;
  sale_price: string | number | null;
  status: string;
};

export type ProductUnit = {
  id: number;
  name: string;
  conversion_factor: number;
} | null;
