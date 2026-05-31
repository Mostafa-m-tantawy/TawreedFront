import ProductVariantForm from "@/components/Dashboard/MasterData/Products/ProductVariant/ProductVariantForm";

export const metadata = {
  title: "Add Product Variant",
  permissions: ["create-product-variants"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <ProductVariantForm
      mode="create"
      productId={Number(productId)}
      backHref={`/dashboard/products/${productId}?tab=variants`}
    />
  );
}
