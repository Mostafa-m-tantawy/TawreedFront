import TransferForm from "@/components/Dashboard/Inventory/StockTransfer/TransferForm/TransferForm";

export const metadata = {
  title: "Create Stock Transfer",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <TransferForm mode="create" />;
}
