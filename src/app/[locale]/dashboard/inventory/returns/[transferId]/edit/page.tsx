import TransferForm from "@/components/Dashboard/Inventory/StockTransfer/TransferForm/TransferForm";

export const metadata = {
  title: "Edit Stock Transfer",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ transferId: string }>;
}) {
  const { transferId } = await params;
  return <TransferForm mode="edit" id={Number(transferId)} />;
}
