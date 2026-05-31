import StockAdjustmentDetails from "@/components/Dashboard/Inventory/StockAdjustments/StockAdjustmentDetails";

export const metadata = {
  title: "Stock Adjustment Details",
  permissions: ["view-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ adjustmentId: string }>;
}) {
  const { adjustmentId } = await params;

  return <StockAdjustmentDetails id={Number(adjustmentId)} />;
}
