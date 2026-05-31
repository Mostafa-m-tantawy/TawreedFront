import ProductForm from "@/components/Dashboard/MasterData/Products/ProductForm";

export const metadata = {
  title: "Create Physical Product",
  permissions: ["create-products"],
};

export default function Page() {
  return <ProductForm mode="create" kind="physical" />;
}
