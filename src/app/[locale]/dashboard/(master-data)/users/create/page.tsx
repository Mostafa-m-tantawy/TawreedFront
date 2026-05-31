import UserForm from "@/components/Dashboard/MasterData/Users/UserForm";

export const metadata = {
  title: "Create User",
  permissions: ["create-users"],
};

export default function NewUserPage() {
  return <UserForm mode="create" />;
}
