import { Product } from "@/types/product";

import * as React from "react";
import { MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";
import { Edit2, Eye, Trash } from "iconsax-reactjs";
import ProtectedElement from "@/components/ui/protected-element";
import StatusBadge from "@/components/ui/status-badge";
import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton";

const Skeleton =
  ShadcnSkeleton ??
  (({ className }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-md bg-neutral-200 ${className ?? ""}`}
    />
  ));

function RowActions({
  onEdit,
  onView,
  onDelete,
  t,
}: {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  t: any;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-neutral-100"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[124px] p-0">
        <DropdownMenuItem className="p-0" onClick={onView}>
          <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
            <Eye size={20} /> <span>{t("View")}</span>
          </div>
        </DropdownMenuItem>

        <ProtectedElement permissions={"edit-products"}>
          <DropdownMenuSeparator className="my-0" />
          <DropdownMenuItem className="p-0" onClick={onEdit}>
            <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Edit2 size={20} /> <span>{t("Edit")}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>

        <ProtectedElement permissions={"delete-products"}>
          <DropdownMenuSeparator className="my-0" />
          <DropdownMenuItem className="p-0" onClick={onDelete}>
            <div className="cursor-pointer px-4 py-2 w-full text-secondary-500 bg-neutral-white-50 hover:bg-primary-50 ty-body-md flex items-center gap-2">
              <Trash size={20} />
              <span>{t("Delete")}</span>
            </div>
          </DropdownMenuItem>
        </ProtectedElement>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoadingRow({ stripe }: { stripe: boolean }) {
  return (
    <TableRow
      className="border-0"
      style={{
        borderRadius: 12,
        backgroundColor: stripe ? "#F8FAFC" : "#F4F6FB",
      }}
    >
      <TableCell className="rounded-s-xl">
        <Skeleton className="h-4 w-[60%]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[80px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[120px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[80px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[100px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-[70px]" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-[90px]" />
      </TableCell>
      <TableCell className="rounded-e-xl">
        <Skeleton className="h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

const ProductsTable = ({
  products,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  products: Product[];
  loading?: boolean;
  onView: (u: Product) => void;
  onEdit: (u: Product) => void;
  onDelete: (u: Product) => void;
}) => {
  const t = useTranslations("");

  const showEmpty = !products || products.length === 0;

  return (
    <div className="mt-4 overflow-x-auto">
      <Table
        className="border-separate border-spacing-y-1"
        style={
          loading && products.length !== 0
            ? {
                pointerEvents: "none",
                opacity: 0.5,
              }
            : {}
        }
      >
        <TableHeader className="border-0">
          <TableRow className="border-0">
            <TableHead className="min-w-[180px]">{t("Product")}</TableHead>
            <TableHead>{t("SKU")}</TableHead>
            <TableHead>{t("Category")}</TableHead>
            <TableHead>{t("Type")}</TableHead>
            {/* <TableHead>{t("Product flow")}</TableHead> */}
            <TableHead>{t("barcode")}</TableHead>
            {/* <TableHead>{t("Sale Price")}</TableHead> */}
            <TableHead>{t("Status")}</TableHead>
            <TableHead className="w-10">{t("Actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="ty-body-sm text-neutral-black-800 border-0 text-start">
          {/* Loading state */}
          {loading &&
            showEmpty &&
            Array.from({ length: 6 }).map((_, i) => (
              <LoadingRow key={`s-${i}`} stripe={i % 2 === 0} />
            ))}

          {/* Data rows */}
          {!showEmpty &&
            products?.map((p, idx) => (
              <TableRow
                key={p.id}
                className="border-0 hover:bg-opacity-80 text-start"
                style={{
                  borderRadius: 12,
                  backgroundColor: idx % 2 === 0 ? "#F8FAFC" : "#F4F6FB",
                }}
              >
                <TableCell className="rounded-s-xl text-start">
                  <div>{p.name}</div>
                </TableCell>
                <TableCell>{p.sku || "-"}</TableCell>
                <TableCell>{p.category?.name || "-"}</TableCell>
                <TableCell>{p.type ? t(p.type) : "-"}</TableCell>
                {/* <TableCell>{p.flow}</TableCell> */}
                <TableCell>{p.barcode || "-"}</TableCell>
                {/* <TableCell>{p.sale_price}</TableCell> */}
                <TableCell>
                  <StatusBadge value={p.status} />
                </TableCell>
                <TableCell className="rounded-e-xl">
                  <RowActions
                    onView={() => onView(p)}
                    onEdit={() => onEdit(p)}
                    onDelete={() => onDelete(p)}
                    t={t}
                  />
                </TableCell>
              </TableRow>
            ))}

          {/* Empty state */}
          {showEmpty && !loading && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin opacity-0" />
                  <span>{t("noProducts")}</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
