"use client";

import { useRef } from "react";
import MasterDataList, {
  MasterDataListHandle,
} from "../CommonMasterDataElements/CommonMasterDataList";
import {
  TableAction,
  TableColumn,
} from "../CommonMasterDataElements/CommonMasterDataList/CommonMasterDataTable";
import { useRouter } from "next/navigation";
import { Supplier } from "@/types/common-master-data";
import { Edit, Eye } from "iconsax-reactjs";

export default function SuppliersPage() {
  const router = useRouter();

  const listRef = useRef<MasterDataListHandle>(null);

  const columns: TableColumn<Supplier>[] = [
    { key: "name", headerKey: "Supplier Name" },
    {
      key: "contact",
      headerKey: "Contact Person",
      render: (r) => r.contact_person || "—",
    },
    { key: "phone", headerKey: "Phone Number", render: (r) => r.phone || "—" },
    { key: "email", headerKey: "E-mail", render: (r) => r.email || "—" },
    {
      key: "group",
      headerKey: "group",
      render: (r) => r?.groups?.[0]?.name || "—",
    },
  ];

  const actions: TableAction<Supplier>[] = [
    {
      key: "view",
      labelKey: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => {
        router.push(`/dashboard/suppliers/${row.id}`);
      },
    },
    {
      key: "edit",
      labelKey: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => {
        window.location.href = `/dashboard/suppliers/${row.id}/edit`;
      },
      permission: "edit-suppliers",
    },
  ];

  return (
    <MasterDataList<Supplier>
      ref={listRef}
      type="supplier"
      titleKey="Suppliers"
      endpoint="/admin/suppliers"
      apiSearchKey="name"
      columns={columns}
      image={{ srcKey: "logo", titleKey: "name", attachToColumnIndex: 0 }}
      status={{
        key: "status",
        translate: true,
        map: (v) => (v === "active" ? "active" : "inactive"),
      }}
      actions={actions}
      createPermission="create-suppliers"
      deletePermission="delete-suppliers"
      createHref="/dashboard/suppliers/create"
      createLabelKey="addSupplier"
      searchPlaceholderKey="search"
      emptyKey="noSuppliers"
    />
  );
}
