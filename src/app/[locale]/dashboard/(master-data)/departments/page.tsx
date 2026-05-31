import Departments from "@/components/Dashboard/MasterData/Departments";

export const metadata = {
  title: "Departments",
  permissions: ["view-departments"],
};

export default function Page() {
  return <Departments />;
}
