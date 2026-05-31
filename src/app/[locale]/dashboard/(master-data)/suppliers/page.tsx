import Suppliers from "@/components/Dashboard/MasterData/Suppliers";

export const metadata = { title: "Suppliers", permissions: ["view-suppliers"] };

export default function Page() {
  return <Suppliers />;
}
