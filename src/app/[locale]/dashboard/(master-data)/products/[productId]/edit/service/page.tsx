import ProductForm from "@/components/Dashboard/MasterData/Products/ProductForm";

export const metadata = {
  title: "Edit Product",
  permissions: ["edit-products"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <ProductForm mode="edit" productId={Number(productId)} kind="service" />
  );
}
