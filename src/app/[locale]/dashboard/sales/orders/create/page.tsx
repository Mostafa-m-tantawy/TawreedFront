import SalesOrderForm from "@/components/Dashboard/Sales/SalesOrders/SalesOrderForm/SalesOrderForm";

export const metadata = {
  title: "Create Stock Count",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <SalesOrderForm mode="create" />;
}
