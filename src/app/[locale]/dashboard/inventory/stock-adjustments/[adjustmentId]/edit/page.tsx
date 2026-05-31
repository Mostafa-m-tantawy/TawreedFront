import AdjustmentForm from "@/components/Dashboard/Inventory/StockAdjustments/AdjustmentForm";

export const metadata = {
  title: "Edit Stock Adjustment",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ adjustmentId: string }>;
}) {
  const { adjustmentId } = await params;
  return <AdjustmentForm mode="edit" id={Number(adjustmentId)} />;
}
