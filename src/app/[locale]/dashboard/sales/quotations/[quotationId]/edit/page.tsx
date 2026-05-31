import SalesQuotationForm from "@/components/Dashboard/Sales/SalesQuotations/SalesQuotationForm/SalesQuotationForm";

export const metadata = {
  title: "Edit Quotation",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ quotationId: string }>;
}) {
  const { quotationId } = await params;
  return <SalesQuotationForm mode="edit" id={Number(quotationId)} />;
}
