import DepreciationList from "@/components/Dashboard/Inventory/Depreciation/StockDepreciationList";

export const metadata = {
  title: "Depreciation (Write-off)",
  permissions: ["view-Stock Adjustments"],
};

export default function Page() {
  return <DepreciationList />;
}
