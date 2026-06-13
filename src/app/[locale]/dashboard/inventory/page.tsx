import Inventory from "@/components/Dashboard/InventorySettings";

export const metadata = {
  title: "Inventory Data",
  permissions: ["view-transfer-transaction"],
};

export default function InventoryPage() {
  return <Inventory />;
}
