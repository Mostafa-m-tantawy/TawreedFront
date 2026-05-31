import PurchaseInvoiceForm from "@/components/Dashboard/Purchase/PurchaseForm/PurchaseInvoiceForm";

export const metadata = {
  title: "Create Purchase Invoice",
  permissions: ["create-purchase-invoices"],
};

export default function Page() {
  return <PurchaseInvoiceForm mode="create" />;
}
