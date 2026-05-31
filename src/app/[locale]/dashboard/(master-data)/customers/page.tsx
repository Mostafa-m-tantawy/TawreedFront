import Customers from "@/components/Dashboard/MasterData/Customers";

export const metadata = { title: "Customers", permissions: ["view-customers"] };

export default function Page() {
  return <Customers />;
}
