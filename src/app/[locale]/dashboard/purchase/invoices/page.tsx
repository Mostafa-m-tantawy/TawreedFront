import PurchaseInvoicesList from "@/components/Dashboard/Purchase/PurchaseInvoices/PurchaseInvoicesList";

export const metadata = {
  title: "Purchase Invoices",
  permissions: ["view-purchase-invoices"],
};

export default function Page() {
  return <PurchaseInvoicesList />;
}
