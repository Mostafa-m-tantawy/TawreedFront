import RoleForm from "@/components/Dashboard/RolesAndPermissions/RoleForm";

export const metadata = { title: "Edit Role" };
export default async function Page({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;

  return <RoleForm mode="edit" roleId={Number(roleId)} />;
}
