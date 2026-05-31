import SalesInvoiceForm from "@/components/Dashboard/Sales/SalesInvoices/SalesInvoiceForm/SalesInvoiceForm.mocked";

export const metadata = {
  title: "Edit Sales Invoice",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  return <SalesInvoiceForm mode="edit" id={Number(invoiceId)} />;
}
