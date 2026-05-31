import PurchaseOrderForm from "@/components/Dashboard/Purchase/PurchaseForm/PurchaseOrderForm";

export const metadata = {
  title: "Edit Purchase Order",
  permissions: ["edit-purchase-orders"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ purchseId: string }>;
}) {
  const { purchseId } = await params;
  return <PurchaseOrderForm mode="edit" id={Number(purchseId)} />;
}
