import ReturnsList from "@/components/Dashboard/Inventory/Returns/ReturnsList";

export const metadata = {
  title: "Returns",
  permissions: ["view-transfer-transaction"],
};

export default function Page() {
  return <ReturnsList />;
}
