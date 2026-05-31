import UserForm from "@/components/Dashboard/MasterData/Users/UserForm";

export const metadata = {
  title: "Edit User",
  permissions: ["edit-users"],
};

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserForm mode="edit" userId={Number(userId)} />;
}
