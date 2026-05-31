import SalesOrderForm from "@/components/Dashboard/Sales/SalesOrders/SalesOrderForm/SalesOrderForm";

export const metadata = {
  title: "Edit Sales Order",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <SalesOrderForm mode="edit" id={Number(orderId)} />;
}
