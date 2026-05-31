import DepreciationForm from "@/components/Dashboard/Inventory/Depreciation/DepreciationForm";

export const metadata = {
  title: "Create Depreciation",
  permissions: ["create-transfer-transaction"],
};

export default function Page() {
  return <DepreciationForm mode="create" />;
}
