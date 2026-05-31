import ShowProduct from "@/components/Dashboard/MasterData/Products/ShowProduct/ShowProduct";

export const metadata = {
  title: "Product Details",
  permissions: ["view-products"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return <ShowProduct id={Number(productId)} />;
}
