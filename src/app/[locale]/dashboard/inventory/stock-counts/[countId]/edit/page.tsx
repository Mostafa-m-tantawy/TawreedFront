import StockCountForm from "@/components/Dashboard/Inventory/StockCount/StockCountForm";

export const metadata = {
  title: "Edit Stock Count",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ countId: string }>;
}) {
  const { countId } = await params;
  return <StockCountForm mode="edit" id={Number(countId)} />;
}
