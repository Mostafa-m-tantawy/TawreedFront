import DepreciationForm from "@/components/Dashboard/Inventory/Depreciation/DepreciationForm";

export const metadata = {
  title: "Edit Depreciation",
  permissions: ["edit-transfer-transaction"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ depreciationId: string }>;
}) {
  const { depreciationId } = await params;
  return <DepreciationForm mode="edit" id={Number(depreciationId)} />;
}
