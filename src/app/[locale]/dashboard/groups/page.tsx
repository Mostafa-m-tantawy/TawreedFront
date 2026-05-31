import Groups from "@/components/Dashboard/Groups";

export const metadata = {
  title: "Groups",
  permissions: ["view-customer-groups", "view-supplier-groups"],
};

export default function Page() {
  return <Groups />;
}
