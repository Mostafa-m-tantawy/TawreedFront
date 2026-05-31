import PurchaseInvoiceForm from "@/components/Dashboard/Purchase/PurchaseForm/PurchaseInvoiceForm";

export const metadata = {
  title: "Edit Purchase Invoice",
  permissions: ["edit-purchase-invoices"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ purchseId: string }>;
}) {
  const { purchseId } = await params;
  return <PurchaseInvoiceForm mode="edit" id={Number(purchseId)} />;
}
