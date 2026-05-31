import CreateCustomer from "@/components/Dashboard/MasterData/Customers/CreateCustomer";

export const metadata = {
  title: "Create Customer",
  permissions: ["create-customers"],
};

export default function Page() {
  return <CreateCustomer />;
}
