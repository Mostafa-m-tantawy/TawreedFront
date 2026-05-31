import ProductForm from "@/components/Dashboard/MasterData/Products/ProductForm";

export const metadata = {
  title: "Create Service Product",
  permissions: ["create-products"],
};

export default function Page() {
  return <ProductForm mode="create" kind="service" />;
}
