import WarehouseList from "@/components/Dashboard/MasterData/Warehouse/WarehouseList";

export const metadata = {
  title: "Warehouses",
  permissions: ["view-warehouse"],
};

export default function Page() {
  return <WarehouseList />;
}
