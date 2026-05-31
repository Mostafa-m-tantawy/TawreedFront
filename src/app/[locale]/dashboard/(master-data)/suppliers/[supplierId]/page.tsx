import ShowMasterDataElement from "@/components/Dashboard/MasterData/CommonMasterDataElements/ShowMasterDataElement";

export const metadata = {
  title: "Supplier",
  permissions: ["view-suppliers"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = await params;
  return (
    <ShowMasterDataElement
      entity="supplier"
      id={Number(supplierId)}
      backHref="/dashboard/suppliers"
    />
  );
}
