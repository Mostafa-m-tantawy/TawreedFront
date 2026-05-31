import PurchaseInvoiceDetails from "@/components/Dashboard/Purchase/ShowPurchase/PurchaseInvoiceDetails";

export const metadata = {
  title: "Purchase Invoice",
  permissions: ["view-purchase-invoices"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ purchseId: string }>;
}) {
  const { purchseId } = await params;
  return <PurchaseInvoiceDetails id={Number(purchseId)} />;
}
