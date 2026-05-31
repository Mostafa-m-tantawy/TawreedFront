import StockCountsList from "@/components/Dashboard/Inventory/StockCount/StockCountList";

export const metadata = {
  title: "Stock Counts",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <StockCountsList />;
}
