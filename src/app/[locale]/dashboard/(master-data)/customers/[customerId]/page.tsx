import ShowMasterDataElement from "@/components/Dashboard/MasterData/CommonMasterDataElements/ShowMasterDataElement";

export const metadata = {
  title: "Customer",
  permissions: ["view-customers"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  return (
    <ShowMasterDataElement
      entity="customer"
      id={Number(customerId)}
      backHref="/dashboard/customers"
    />
  );
}
