import QuotationsList from "@/components/Dashboard/Sales/SalesQuotations/QuotationsList";

export const metadata = {
  title: "Sales Quotations",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <QuotationsList />;
}
