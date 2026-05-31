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
import { Customer } from "@/types/common-master-data";
import { Edit, Eye } from "iconsax-reactjs";

export default function Customers() {
  const router = useRouter();
  const listRef = useRef<MasterDataListHandle>(null);

  const columns: TableColumn<Customer>[] = [
    { key: "name", headerKey: "Customer Name" },
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

  const actions: TableAction<Customer>[] = [
    {
      key: "view",
      labelKey: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row) => router.push(`/dashboard/customers/${row.id}`),
    },
    {
      key: "edit",
      labelKey: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => router.push(`/dashboard/customers/${row.id}/edit`),
      permission: "edit-customers",
    },
  ];

  return (
    <MasterDataList<Customer>
      ref={listRef}
      type="customer"
      titleKey="Customers"
      endpoint="/admin/customers"
      apiSearchKey="name"
      columns={columns}
      image={{
        srcKey: "logo",
        titleKey: "name",
        attachToColumnIndex: 0,
      }}
      status={{
        key: "status",
        translate: true,
        map: (v) => (v === "active" ? "active" : "inactive"),
      }}
      actions={actions}
      createPermission="create-customers"
      deletePermission="delete-customers"
      createHref="/dashboard/customers/create"
      createLabelKey="addCustomer"
      searchPlaceholderKey="search"
      emptyKey="noCustomers"
    />
  );
}
