import StockCountDetails from "@/components/Dashboard/Inventory/StockCount/StockCountDetails";

export const metadata = {
  title: "Stock Count Details",
  permissions: ["view-Count-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ countId: string }>;
}) {
  const { countId } = await params;

  return <StockCountDetails id={Number(countId)} />;
}
