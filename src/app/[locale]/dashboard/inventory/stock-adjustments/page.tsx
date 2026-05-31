import StockAdjustmentsList from "@/components/Dashboard/Inventory/StockAdjustments/StockAdjustmentsList";

export const metadata = {
  title: "Stock Adjustments",
  permissions: ["view-Stock Adjustments"],
};

export default function Page() {
  return <StockAdjustmentsList />;
}
