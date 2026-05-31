import CreateSupplier from "@/components/Dashboard/MasterData/Suppliers/CreateSupplier";

export const metadata = {
  title: "Create Supplier",
  permissions: ["create-suppliers"],
};

export default function Page() {
  return <CreateSupplier />;
}
