import ShowWarehouse from "@/components/Dashboard/MasterData/Warehouse/ShowWarehouse/ShowWarehouse";

export const metadata = {
  title: "Warehouse Details",
  permissions: ["view-warehouse"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ warehouseId: string }>;
}) {
  const { warehouseId } = await params;
  return <ShowWarehouse id={Number(warehouseId)} />;
}
