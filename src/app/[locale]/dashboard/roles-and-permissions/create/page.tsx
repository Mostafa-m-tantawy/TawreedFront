import RoleForm from "@/components/Dashboard/RolesAndPermissions/RoleForm";

export const metadata = { title: "Create Role" };
export default function Page() {
  return <RoleForm mode="create" />;
}
