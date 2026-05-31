import ExpiryManagement from "@/components/Dashboard/Inventory/ExpiryManagement";

export const metadata = {
  title: "Expiry Management",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <ExpiryManagement />;
}
