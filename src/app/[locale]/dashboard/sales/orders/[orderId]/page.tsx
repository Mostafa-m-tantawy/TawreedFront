import SalesOrderDetails from "@/components/Dashboard/Sales/SalesOrders/SalesOrderDetails/SalesOrderDetails";

export const metadata = {
  title: "Sales Order Details",
  permissions: ["view-Count-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <SalesOrderDetails id={Number(orderId)} />;
}
