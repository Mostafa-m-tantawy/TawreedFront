import EditSupplier from "@/components/Dashboard/MasterData/Suppliers/EditSupplier";

export const metadata = {
  title: "Edit Supplier",
  permissions: ["edit-suppliers"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;
  return <EditSupplier id={Number(supplierId)} />;
}
