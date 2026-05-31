import StockTransferDetails from "@/components/Dashboard/Inventory/StockTransfer/StockTransferDetails/StockTransferDetails";

export const metadata = {
  title: "Stock Transfer Details",
  permissions: ["view-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ transferId: string }>;
}) {
  const { transferId } = await params;

  return <StockTransferDetails id={Number(transferId)} />;
}
