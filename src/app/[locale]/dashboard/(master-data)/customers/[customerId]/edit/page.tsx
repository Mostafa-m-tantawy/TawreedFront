import EditCustomer from "@/components/Dashboard/MasterData/Customers/EditCustomer";

export const metadata = {
  title: "Edit Customer",
  permissions: ["edit-customers"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return <EditCustomer id={Number(customerId)} />;
}
