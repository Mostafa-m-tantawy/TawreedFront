import DepreciationDetails from "@/components/Dashboard/Inventory/Depreciation/StockDepreciationDetails";

export const metadata = {
  title: "Stock Depreciation",
  permissions: ["view-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ depreciationId: string }>;
}) {
  const { depreciationId } = await params;

  return <DepreciationDetails id={Number(depreciationId)} />;
}
