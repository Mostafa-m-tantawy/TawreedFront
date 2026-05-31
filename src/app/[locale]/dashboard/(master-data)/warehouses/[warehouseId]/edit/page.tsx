import WarehouseForm from "@/components/Dashboard/MasterData/Warehouse/WarehouseForm/WarehouseForm";

export const metadata = {
  title: "Edit Warehouse",
  permissions: ["edit-warehouse"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ warehouseId: string }>;
}) {
  const { warehouseId } = await params;
  return <WarehouseForm mode="edit" warehouseId={Number(warehouseId)} />;
}
