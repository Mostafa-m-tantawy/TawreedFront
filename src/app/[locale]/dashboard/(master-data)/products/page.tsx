import ProductsList from "@/components/Dashboard/MasterData/Products/ProductsList";

export const metadata = { title: "Products", permissions: ["view-products"] };

export default function Page() {
  return <ProductsList />;
}
