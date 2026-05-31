import PurchaseOrdersList from "@/components/Dashboard/Purchase/PurchaseOrders/PurchaseOrdersList";

export const metadata = {
  title: "Purchase Orders",
  permissions: ["view-purchase-orders"],
};

export default function Page() {
  return <PurchaseOrdersList />;
}
