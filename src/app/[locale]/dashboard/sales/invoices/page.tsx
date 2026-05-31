import SalesInvoicesList from "@/components/Dashboard/Sales/SalesInvoices/SalesInvoicesList";

export const metadata = {
  title: "Sales Invoices",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <SalesInvoicesList />;
}
