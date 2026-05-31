import SalesOrdersList from "@/components/Dashboard/Sales/SalesOrders/SalesOrdersList";

export const metadata = {
  title: "Stock Orders",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <SalesOrdersList />;
}
