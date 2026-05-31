import WarehouseForm from "@/components/Dashboard/MasterData/Warehouse/WarehouseForm/WarehouseForm";

export const metadata = {
  title: "Create Warehouse",
  permissions: ["create-warehouse"],
};

export default function Page() {
  return <WarehouseForm mode="create" />;
}
