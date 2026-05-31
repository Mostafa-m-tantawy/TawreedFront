import ProductForm from "@/components/Dashboard/MasterData/Products/ProductForm";

export const metadata = {
  title: "Create Product",
  permissions: ["create-products"],
};

export default function ServiceProductPage() {
  return <ProductForm mode="create" kind="physical" />;
}
