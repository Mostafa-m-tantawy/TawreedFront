import SalesInvoiceDetails from "@/components/Dashboard/Sales/SalesInvoices/SalesInvoiceDetails/SalesInvoiceDetails";

export const metadata = {
  title: "Sales Invoice Details",
  permissions: ["view-Count-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  return <SalesInvoiceDetails id={Number(invoiceId)} />;
}
