import StockCountForm from "@/components/Dashboard/Inventory/StockCount/StockCountForm";

export const metadata = {
  title: "Create Stock Count",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <StockCountForm mode="create" />;
}
