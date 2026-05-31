import RolesAndPermissions from "@/components/Dashboard/RolesAndPermissions";

export const metadata = {
  title: "Roles & Permissions",
  permissions: ["view-roles", "show-roles"],
};

export default function RolesAndPermissionsPage() {
  return <RolesAndPermissions />;
}
