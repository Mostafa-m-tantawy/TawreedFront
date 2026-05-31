import ShowMasterDataElement from "@/components/Dashboard/MasterData/CommonMasterDataElements/ShowMasterDataElement";

export const metadata = {
  title: "Customer",
  permissions: ["view-users"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <ShowMasterDataElement
      entity="user"
      id={Number(userId)}
      backHref="/dashboard/users"
    />
  );
}
