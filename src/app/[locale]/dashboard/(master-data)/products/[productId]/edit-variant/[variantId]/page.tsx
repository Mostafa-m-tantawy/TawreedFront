import ProductVariantForm from "@/components/Dashboard/MasterData/Products/ProductVariant/ProductVariantForm";

export const metadata = {
  title: "Edit Product Variant",
  permissions: ["edit-product-variants"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string; variantId: string }>;
}) {
  const { productId, variantId } = await params;
  return (
    <ProductVariantForm
      mode="edit"
      productId={Number(productId)}
      variantId={Number(variantId)}
      backHref={`/dashboard/products/${productId}?tab=variants`}
    />
  );
}
