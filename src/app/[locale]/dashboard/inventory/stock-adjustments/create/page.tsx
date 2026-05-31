import AdjustmentForm from "@/components/Dashboard/Inventory/StockAdjustments/AdjustmentForm";

export const metadata = {
  title: "Create Stock Adjustment",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <AdjustmentForm mode="create" />;
}
