import SalesInvoiceForm from "@/components/Dashboard/Sales/SalesInvoices/SalesInvoiceForm/SalesInvoiceForm.mocked";

export const metadata = {
  title: "Create Sales Invoice",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <SalesInvoiceForm mode="create" />;
}
