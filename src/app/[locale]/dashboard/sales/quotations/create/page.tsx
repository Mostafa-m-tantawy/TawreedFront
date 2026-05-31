import SalesQuotationForm from "@/components/Dashboard/Sales/SalesQuotations/SalesQuotationForm/SalesQuotationForm";

export const metadata = {
  title: "Create Quotation",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <SalesQuotationForm mode="create" />;
}
