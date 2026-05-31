import PurchaseOrderDetails from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseOrderDetails";

export const metadata = {
  title: "Purchase Order",
  permissions: ["view-purchase-orders"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ purchseId: string }>;
}) {
  const { purchseId } = await params;
  return <PurchaseOrderDetails id={Number(purchseId)} />;
}
