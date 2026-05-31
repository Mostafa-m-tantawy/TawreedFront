import PurchaseOrderForm from "@/components/Dashboard/Purchase/PurchaseForm/PurchaseOrderForm";

export const metadata = {
  title: "Create Purchase Order",
  permissions: ["create-purchase-orders"],
};

export default function Page() {
  return <PurchaseOrderForm mode="create" />;
}
