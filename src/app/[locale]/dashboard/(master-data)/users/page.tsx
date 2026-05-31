import Users from "@/components/Dashboard/MasterData/Users";

export const metadata = { title: "Users", permissions: ["view-users"] };

export default function Page() {
  return <Users />;
}
