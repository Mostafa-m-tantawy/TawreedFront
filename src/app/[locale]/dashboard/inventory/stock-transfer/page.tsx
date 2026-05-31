import StockTransferList from "@/components/Dashboard/Inventory/StockTransfer/StockTransferList";

export const metadata = {
  title: "Stock Transfer",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <StockTransferList />;
}
