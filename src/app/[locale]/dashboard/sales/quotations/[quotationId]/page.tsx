import SalesQuotationDetails from "@/components/Dashboard/Sales/SalesQuotations/SalesQuotationDetails/SalesQuotationDetails";

export const metadata = {
  title: "Quotation Details",
  permissions: ["view-Count-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const { quotationId } = await params;

  return <SalesQuotationDetails id={Number(quotationId)} />;
}
