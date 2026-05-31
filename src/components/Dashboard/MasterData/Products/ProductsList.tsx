"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, SearchNormal, AddCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import ProtectedElement from "@/components/ui/protected-element";
import ProductsTable from "./ProductsTable";
import api from "@/lib/api.client";
import ProductsFilterDialog, { ProductFilters } from "./ProductsFilterDialog";
import { Product } from "@/types/product";
import { useCallback, useEffect, useState } from "react";
import Pagination from "@/components/ui/pagination/pagination";
import { useRouter } from "next/navigation";
import ConfirmDeleteDialog from "@/components/ui/delete-dialog";
import { DeleteState } from "@/types/common";
import { toast } from "sonner";
import ImportDialog from "@/components/ui/import-dialog";

// const AddProductMenu = ({ t }: { t: any }) => (
//   <DropdownMenu>
//     <DropdownMenuTrigger asChild>
//       <Button size="md" className="rounded-md font-normal">
//         <span className="mr-1">{t("Add Product")}</span>
//         <ArrowDown2 size={20} />
//       </Button>
//     </DropdownMenuTrigger>
//     <DropdownMenuContent align="end" sideOffset={0} className="min-w-42 p-0">
//       <ProtectedElement permissions={"create-products"}>
//         <DropdownMenuItem className="p-0">
//           <Link
//             className="p-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md"
//             href={"/dashboard/products/create/physical"}
//           >
//             {t("Physical Product")}
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuSeparator className="my-0" />
//         <DropdownMenuItem className="p-0">
//           <Link
//             className="p-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md"
//             href={"/dashboard/products/create/service"}
//           >
//             {t("Service Product")}
//           </Link>
//         </DropdownMenuItem>
//       </ProtectedElement>

//       <ProtectedElement permissions={"create-grouped-products"}>
//         <DropdownMenuSeparator className="my-0" />
//         <DropdownMenuItem className="p-0">
//           <Link
//             className="p-2 text-center w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md"
//             href={"/dashboard/products/create/grouped-product"}
//           >
//             {t("Grouped Product")}
//           </Link>
//         </DropdownMenuItem>
//       </ProtectedElement>
//     </DropdownMenuContent>
//   </DropdownMenu>
// );

const ProductsList = () => {
  const t = useTranslations("");

  const router = useRouter();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    status: "",
    type: "",
    category_type: "",
  });

  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [filterMetaData, setFilterMetaData] = useState({
    types: [],
    status: [],
    category_types: [],
  });

  const [deleteState, setDeleteState] = useState<DeleteState<Product>>({
    open: false,
    loading: false,
    item: null,
  });

  // debounce search from top input
  const [searchDraft, setSearchDraft] = useState("");

  useEffect(() => {
    const h = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchDraft }));
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [searchDraft]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 20,
      };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.category_type) params.category_type = filters.category_type;

      const res = await api.get("/admin/products", { params });
      const data = res?.data?.data ?? [];
      const meta = res?.data?.meta ?? {};

      const mapped: Product[] = data;

      setRows(mapped);
      setLastPage(meta?.last_page ?? page);

      setFilterMetaData({
        types: res?.data?.types ?? [],
        status: res?.data?.status ?? [],
        category_types: res?.data?.category_types ?? [],
      });
    } finally {
      setLoading(false);
    }
  }, [
    filters.search,
    filters.status,
    filters.type,
    filters.category_type,
    page,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const onView = (product: Product) => {
    router.push(`/dashboard/products/${product.id}`);
  };

  const onEdit = (product: Product) => {
    const type =
      product.type === "grouped products" ? "grouped-product" : product.type;

    if (type !== "physical") {
      router.push(`/dashboard/products/${product.id}/edit/${type}`);
    } else {
      router.push(`/dashboard/products/${product.id}/edit`);
    }
  };

  const onDelete = (product: Product) => {
    setDeleteState({ open: true, loading: false, item: product });
  };

  const handleDelete = async () => {
    if (!deleteState.item) return;
    setDeleteState((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/admin/products/${deleteState.item.id}`);
      toast.success(t("productDeleted"));
      setDeleteState((prev) => ({ ...prev, item: null, open: false }));
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("deleteFailed"));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <section className="h-full p-4">
      <div
        className="p-4 bg-white rounded-xl"
        style={{ boxShadow: "0px 1px 0px 0px #0000001A" }}
      >
        <div className="flex justify-between items-center gap-4 flex-wrap py-4 border-b border-neutral-white-300">
          <h2 className="ty-body-xl-2 text-primary-700">{t("Products")}</h2>

          <div className="flex gap-2 flex-wrap">
            <ImportDialog />

            {/* <AddProductMenu t={t} /> */}
            <Link href={"/dashboard/products/create"}>
              <Button size="md" className="rounded-md font-normal">
                <AddCircle size={20} />
                <span className="mr-1">{t("Add Product")}</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          <div className="grid grid-cols-[1fr_105px] gap-4 mb-6">
            <div>
              <Input
                type="text"
                placeholder={t("SearchProducts")}
                className="w-full border-none rounded-full bg-neutral-white-100 placeholder:text-neutral-white-900 h-[44px]"
                leftIcon={<SearchNormal size={16} />}
                value={searchDraft}
                onChange={(e) => {
                  setSearchDraft(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <Button
                variant={"secondary"}
                className="rounded-full shadow-none font-normal w-full h-full bg-neutral-white-100"
                onClick={() => setFilterOpen(true)}
              >
                <Filter size={16} />
                <span>{t("Filter")}</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <ProductsTable
            products={rows}
            loading={loading}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          {/* Simple pager */}
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <ProductsFilterDialog
        metaData={filterMetaData}
        open={filterOpen}
        onOpenChange={setFilterOpen}
        initial={filters}
        onApply={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />

      <ProtectedElement permissions={"delete-products"}>
        <ConfirmDeleteDialog
          preview={deleteState.open}
          onOpenChange={(open) => setDeleteState((prev) => ({ ...prev, open }))}
          itemName={deleteState.item?.name || ""}
          deleteFn={handleDelete}
          isDeleting={deleteState.loading}
        />
      </ProtectedElement>
    </section>
  );
};

export default ProductsList;
